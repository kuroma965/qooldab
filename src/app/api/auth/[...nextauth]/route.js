// app/api/auth/[...nextauth]/route.js
export const runtime = "nodejs";

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);

function formatCreditsRaw(val) {
  // DB numeric may come as string e.g. "12.50" — normalize to "00.00" style string
  try {
    const n = Number(val ?? 0);
    if (Number.isNaN(n)) return "0.00";
    return n.toFixed(2);
  } catch (e) {
    return "0.00";
  }
}

async function createUser({
  email,
  passwordHash,
  name,
  sign_up = "credentials",
  image = null,
}) {
  const insertObj = {
    email,
    password_hash: passwordHash,
    name: name ?? null,
    sign_up,
    image: image ?? null,
    created_at: new Date(),
    updated_at: new Date(),
    // สมมติว่าคอลัมน์ is_active มี default ที่ DB เป็น true อยู่แล้ว
  };
  try {
    const res = await db.insert(users).values(insertObj).returning();
    if (res && res[0]) return res[0];
    // fallback for drivers that don't return
    await db.insert(users).values(insertObj).run();
    const r = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return r[0];
  } catch (err) {
    throw err;
  }
}

/**
 * ensureUserForGoogle:
 *  - If DB has user with same email and sign_up !== 'google', THROW an Error with message we can detect
 *  - If no user, create with passwordHash = null and sign_up = 'google'
 */
async function ensureUserForGoogle(email, name, picture = null) {
  const normalized = String(email).trim().toLowerCase();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);
  if (rows.length) {
    const existing = rows[0];

    // NEW: ถ้า user ถูกปิดการใช้งาน ห้าม login ด้วย Google
    if (existing.is_active === false) {
      throw new Error("INACTIVE_ACCOUNT");
    }

    // If user exists but was NOT created via google, block sign-in via google
    if (existing.sign_up && String(existing.sign_up).toLowerCase() !== "google") {
      // Throw an error with a clear message we can check in signIn
      throw new Error("NOT_GOOGLE_SIGNUP"); // short machine message
    }
    return existing;
  }

  // create user with null password (google signups)
  const created = await createUser({
    email: normalized,
    passwordHash: null,
    name,
    sign_up: "google",
    image: picture ?? null,
  });
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
        name: { label: "Name", type: "text" }, // optional for signup
        action: { label: "action", type: "text" }, // 'signup' or undefined
        cfToken: { label: "cfToken", type: "text" }, // 👈 จาก Cloudflare Turnstile
      },
      /**
       * authorize runs for both login and signup (depending on credentials.action)
       */
      async authorize(credentials) {
        try {
          // 0) ตรวจ Turnstile ก่อนทุกอย่าง
          const cfToken = credentials?.cfToken;

          if (!cfToken) {
            // ไม่มี token = ยังไม่ยืนยันจาก Cloudflare
            throw new Error("MISSING_TURNSTILE_TOKEN");
          }

          const verifyRes = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                secret: process.env.TURNSTILE_SECRET_KEY,
                response: cfToken,
                // ถ้าอยากส่ง IP ไปด้วย: remoteip: req.ip (ใน app router ต้องหาวิธีดึงเอง)
              }),
            }
          );

          const verifyData = await verifyRes.json();

          if (!verifyData.success) {
            console.error("Turnstile failed", verifyData);
            throw new Error("BOT_DETECTED");
          }

          // 1) ผ่าน Turnstile แล้ว ค่อยทำ auth ตามปกติ
          if (!credentials?.email) return null;
          const email = String(credentials.email).trim().toLowerCase();

          // Normalize action detection
          const actionRaw = credentials.action ?? "";
          const action = String(actionRaw).toLowerCase();
          const isSignup = action === "signup" || action === "register";

          // check existing user
          const rows = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
          const existing = rows[0];

          if (isSignup) {
            // ===== signup flow =====
            if (existing) {
              throw new Error("Email already in use");
            }
            if (
              !credentials?.password ||
              String(credentials.password).length < 8
            ) {
              throw new Error("Password required (min 8 chars)");
            }

            const hashed = await bcrypt.hash(
              String(credentials.password),
              BCRYPT_ROUNDS
            );

            const created = await createUser({
              email,
              passwordHash: hashed,
              name: credentials.name ?? null,
              sign_up: "credentials",
            });
            if (!created) throw new Error("Failed to create user");

            return {
              id: String(created.id),
              name: created.name ?? null,
              email: created.email,
              role: created.role ?? "user",
              image: created.image ?? null,
              updated_at: created.updated_at
                ? new Date(created.updated_at).toISOString()
                : undefined,
              credits: formatCreditsRaw(created.credits),
            };
          } else {
            // ===== login flow =====
            if (!existing) {
              throw new Error("Invalid_credentials");
            }

            // ถ้าบัญชีถูกปิดการใช้งาน
            if (existing.is_active === false) {
              throw new Error("INACTIVE_ACCOUNT");
            }

            // ถ้าสมัครด้วย Google ห้ามใช้ password login
            if (
              existing.sign_up &&
              String(existing.sign_up).toLowerCase() === "google"
            ) {
              throw new Error(
                "อีเมลนี้สมัครผ่าน Google กรุณาเข้าสู่ระบบด้วย Google"
              );
            }

            if (!credentials?.password) {
              throw new Error("Password required");
            }

            const ok = await bcrypt.compare(
              String(credentials.password),
              existing.password_hash
            );
            if (!ok) throw new Error("Invalid_credentials");

            return {
              id: String(existing.id),
              name: existing.name ?? null,
              email: existing.email,
              role: existing.role ?? "user",
              image: existing.image ?? null,
              updated_at: existing.updated_at
                ? new Date(existing.updated_at).toISOString()
                : undefined,
              credits: formatCreditsRaw(existing.credits),
            };
          }
        } catch (err) {
          console.error("Credentials authorize error:", err?.message ?? err);
          throw err;
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // Put pages at top-level so NextAuth knows where to redirect on errors
  pages: {
    signIn: "/login",
    error: "/login", // NextAuth will redirect to /login?error=... when we return a URL or throw
  },

  // Use JWT sessions (stateless). NextAuth stores session in signed cookie.
  session: { strategy: "jwt" },

  callbacks: {
    // Called during OAuth sign-in (Google). Ensure user exists in users table.
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          const googleEmail = profile?.email || user?.email;
          if (!googleEmail) {
            // return error page
            return `/login?error=${encodeURIComponent("google_no_email")}`;
          }

          // Try to ensure the DB user exists. ensureUserForGoogle throws:
          // - "NOT_GOOGLE_SIGNUP" ถ้ามี user เดิมแต่สมัครด้วยวิธีอื่น
          // - "INACTIVE_ACCOUNT" ถ้า user ถูกปิดการใช้งาน
          try {
            const dbUser = await ensureUserForGoogle(
              googleEmail,
              profile?.name ?? user?.name,
              profile?.picture ?? null
            );

            // (กัน double-check ไว้ด้วย เผื่อมีใช้ ensureUserForGoogle ที่อื่น)
            if (dbUser.is_active === false) {
              return `/login?error=${encodeURIComponent("inactive")}`;
            }

            // success: attach DB values (prefer DB)
            user.id = String(dbUser.id);
            user.name = dbUser.name ?? null;
            user.email = dbUser.email;
            user.role = dbUser.role ?? "user";
            user.image = profile?.picture ?? null;
            user.updated_at = dbUser.updated_at
              ? new Date(dbUser.updated_at).toISOString()
              : undefined;
            user.credits = formatCreditsRaw(dbUser.credits); // <- add credits

            return true; // allow sign in
          } catch (err) {
            const msg = String(err?.message ?? "");

            if (msg === "NOT_GOOGLE_SIGNUP") {
              // redirect user to login page with friendly error code
              return `/login?error=${encodeURIComponent("not_google")}`;
            }

            if (msg === "INACTIVE_ACCOUNT") {
              // redirect ด้วย error code inactive
              return `/login?error=${encodeURIComponent("inactive")}`;
            }

            // other errors -> surface as generic nextauth error (will go to pages.error)
            console.error("ensureUserForGoogle error:", err);
            throw err;
          }
        }
        return true;
      } catch (err) {
        console.error("signIn callback error:", err?.message ?? err);
        // If we throw, NextAuth will redirect to pages.error (we set it to /login)
        throw err;
      }
    },

    // Build JWT payload
    async jwt({ token, user, account }) {
      // first signin includes `user`
      if (user) {
        if (user.id) token.id = String(user.id);
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (user.role) token.role = user.role;
        if (user.image) token.image = user.image;
        // keep updated_at as ISO string if present
        if (user.updated_at) token.updated_at = String(user.updated_at);
        // credits (string like "12.50")
        if (typeof user.credits !== "undefined") token.credits = String(user.credits);
      }
      return token;
    },

    // What client receives via useSession/getSession
    async session({ session, token }) {
      session.user = session.user || {};
      if (token?.id) session.user.id = token.id;
      if (token?.email) session.user.email = token.email;
      if (token?.name) session.user.name = token.name;
      if (token?.role) session.user.role = token.role;
      if (token?.image) session.user.image = token.image;
      if (token?.updated_at) session.user.updated_at = token.updated_at;

      // include credits from token if present (token.credits is string with 2 decimals)
      if (typeof token?.credits !== "undefined") {
        session.user.credits = String(token.credits);
      } else {
        session.user.credits = "0.00";
      }

      // try to refresh from DB (optional) — update credits from DB if possible
      try {
        if (token?.id) {
          const uid = Number(token.id);
          const rows = await db
            .select()
            .from(users)
            .where(eq(users.id, uid))
            .limit(1);
          const dbUser = rows[0] ?? null;
          if (dbUser) {
            session.user.name = dbUser.name ?? session.user.name;
            session.user.email = dbUser.email ?? session.user.email;
            if (Object.prototype.hasOwnProperty.call(dbUser, "image")) {
              session.user.image = dbUser.image ?? null;
            }
            session.user.role = dbUser.role ?? session.user.role;
            session.user.updated_at = dbUser.updated_at
              ? new Date(dbUser.updated_at).toISOString()
              : session.user.updated_at;

            // update credits from DB (ensure formatted)
            session.user.credits = formatCreditsRaw(dbUser.credits);
          }
        }
      } catch (err) {
        console.error("session callback: failed to read user from DB:", err);
      }

      return session;
    },
  },

  // secrets
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
