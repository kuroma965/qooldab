import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { getServerSession } from "next-auth";
import SessionClientProvider from "./providers/SessionClientProvider"; // <- new client wrapper
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ต้อง export authOptions ในไฟล์ nextauth ของคุณ

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "qooldab",
  description: "",
};

export default async function RootLayout({ children }) {
  // รันบน server — ดึง session จาก next-auth
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* เอา session ที่ได้จาก server มาส่งให้ client wrapper */}
        <SessionClientProvider session={session}>
          <main>{children}</main>
        </SessionClientProvider>
      </body>
    </html>
  );
}
