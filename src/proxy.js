// proxy.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith('/admin');

  // ถ้าต้องการปกป้องทั้ง /admin และ /api/admin
  if (isAdminPage || pathname.startsWith('/api/admin')) {
    // อ่าน token ของ next-auth (ต้องตั้ง NEXTAUTH_SECRET)
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });

    // ถ้าไม่มี token -> ไม่ล็อกอิน
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }

    // ตรวจ role (สมมติ role ถูกฝังใน token.role)
    if (String(token.role || '').toLowerCase() !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }

    // ถ้าผ่าน ก็ allow
  }

  return NextResponse.next();
}

export const config = {
  // ปรับ matcher ตามที่คุณต้องการ
  matcher: ['/admin/:path*', '/api/:path*'],
};
