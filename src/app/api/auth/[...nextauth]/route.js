// app/api/auth/[...nextauth]/route.js
export const runtime = "nodejs";

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { db } from "@/db/db";      // ปรับ path ถ้าจำเป็น
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);
const SECRET_SIGNUP_GOOGLE = process.env.SECRET_SIGNUP_GOOGLE || "";
const IS_DEV = process.env.NODE_ENV !== "production";

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function createUser({ email, passwordHash, name, sign_up = "credentials" }) {
  const insertObj = {
    email,
    password_hash: passwordHash,
    name: name ?? null,
    sign_up,
    created_at: new Date(),
    updated_at: new Date(),
  };
  try {
    const res = await db.insert(users).values(insertObj).returning();
    // some drivers return array, some return undefined; normalize
    if (res && res[0]) return res[0];
    // fallback
    await db.insert(users).values(insertObj).run();
    const r = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return r[0];
  } catch (err) {
    // fallback path already attempted above, rethrow
    throw err;
  }
}

/**
 * Ensure user exists for given google email. If not, create derived password user.
 * Returns user row.
 */
async function ensureUserForGoogle(email, name) {
  const normalized = String(email).trim().toLowerCase();
  const rows = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  if (rows.length) return rows[0];

  if (!SECRET_SIGNUP_GOOGLE) throw new Error("SECRET_SIGNUP_GOOGLE not configured");

  const derived = sha256Hex(normalized + SECRET_SIGNUP_GOOGLE);
  const hashed = await bcrypt.hash(derived, BCRYPT_ROUNDS);
  const created = await createUser({ email: normalized, passwordHash: hashed, name, sign_up: "google" });
  return created;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },       // optional for signup
        action: { label: "action", type: "text" },   // 'signup' or undefined
      },
      /**
       * authorize runs for both login and signup (depending on credentials.action)
       * - For signup: we create user (if not exists) then return user object to sign them in immediately.
       * - For login: we verify password and return user.
       */
      async authorize(credentials) {
        try {
          if (!credentials?.email) return null;
          const email = String(credentials.email).trim().toLowerCase();

          // Normalize action detection
          const actionRaw = credentials.action ?? "";
          const action = String(actionRaw).toLowerCase();
          const isSignup = action === "signup" || action === "register";

          // check existing user
          const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
          const existing = rows[0];

          if (isSignup) {
            // signup flow
            if (existing) {
              // already exists -> prevent duplicate
              throw new Error("Email already in use");
            }
            // validate password presence
            if (!credentials?.password || String(credentials.password).length < 6) {
              throw new Error("Password required (min 6 chars)");
            }
            // create bcrypt hash
            const hashed = await bcrypt.hash(String(credentials.password), BCRYPT_ROUNDS);
            const created = await createUser({ email, passwordHash: hashed, name: credentials.name ?? null, sign_up: "credentials" });
            if (!created) throw new Error("Failed to create user");
            // return object that becomes `user` in jwt callback
            return { id: String(created.id), name: created.name ?? null, email: created.email };
          } else {
            // login flow
            if (!existing) {
              throw new Error("Invalid credentials");
            }

            // If this account was created via Google, tell the user to use Google sign-in
            if (existing.sign_up && String(existing.sign_up).toLowerCase() === "google") {
              // This error will be passed back to the client (when using signIn(..., { redirect:false }))
              throw new Error("บัญชีนี้สมัครผ่าน Google กรุณาเข้าสู่ระบบด้วย Google");
            }

            if (!credentials?.password) {
              throw new Error("Password required");
            }
            const ok = await bcrypt.compare(String(credentials.password), existing.password_hash);
            if (!ok) throw new Error("Invalid credentials");
            return { id: String(existing.id), name: existing.name ?? null, email: existing.email };
          }
        } catch (err) {
          // NextAuth expects null on failure; throwing with message will be returned as error string if using redirect:false
          console.error("Credentials authorize error:", err?.message ?? err);
          throw err;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // Use JWT sessions (stateless). NextAuth stores session in signed cookie.
  session: { strategy: "jwt" },

  callbacks: {
    // Called during OAuth sign-in (Google). Ensure user exists in users table.
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          const googleEmail = profile?.email || user?.email;
          if (!googleEmail) {
            console.warn("Google signIn: no email in profile");
            return false;
          }

          // Ensure user row exists (create if missing)
          const dbUser = await ensureUserForGoogle(googleEmail, profile?.name ?? user?.name);
          if (!dbUser) {
            console.error("ensureUserForGoogle failed to return a user row");
            return false;
          }

          // Attach DB id to the `user` object so jwt callback can use it
          // NextAuth will pass this `user` into jwt() on first sign in
          user.id = String(dbUser.id);
          user.name = user.name ?? dbUser.name ?? null;
          user.email = user.email ?? dbUser.email;
        }
        return true;
      } catch (err) {
        console.error("signIn callback error:", err);
        return false;
      }
    },

    // Build JWT payload
    async jwt({ token, user, account }) {
      // first signin includes `user`
      if (user) {
        if (user.id) token.id = String(user.id);
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
      }
      // token persists afterwards
      return token;
    },

    // What client receives via useSession/getSession
    async session({ session, token }) {
      if (token) {
        session.user = session.user || {};
        if (token.id) session.user.id = token.id;
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },

  // secrets
  secret: process.env.NEXTAUTH_SECRET,
  debug: IS_DEV,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
