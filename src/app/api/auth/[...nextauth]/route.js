// // app/api/auth/[...nextauth]/route.js
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// // ถ้าจะใช้ provider OAuth เช่น GitHub:
// // import GitHubProvider from "next-auth/providers/github";

// import { db } from "@/db/db";         // ตัวอย่าง: Drizzle pool export
// import { users } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { verify } from "bcryptjs";   // หรือ bcryptjs

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         // ค้น user จาก DB (Drizzle example)
//         const [user] = await db.select().from(users).where(eq(users.email, credentials.email));
//         if (!user) return null;

//         // ตรวจรหัสผ่าน
//         const isValid = await verify(credentials.password, user.password_hash);
//         if (!isValid) return null;

//         // คืน object user ที่ NextAuth จะเก็บใน session/JWT
//         return { id: String(user.id), name: user.name, email: user.email };
//       }
//     }),

//     // ตัวอย่าง OAuth provider (ถ้าต้องการ)
//     // GitHubProvider({ clientId: process.env.GH_ID, clientSecret: process.env.GH_SECRET }),
//   ],

//   session: {
//     strategy: "jwt", // หรือ "database" (ถ้าใช้ adapter)
//   },

//   callbacks: {
//     async jwt({ token, user }) {
//       // เมื่อ login ครั้งแรก จะมี `user` ให้เราเพิ่มเข้า token
//       if (user) {
//         token.id = user.id;
//         token.name = user.name;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       // ส่งข้อมูลเพิ่มเติมกลับไปยัง client session
//       session.user.id = token.id;
//       session.user.name = token.name;
//       return session;
//     },
//   },

//   // ต้องตั้ง secret สำหรับการ sign JWT / cookies
//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
