// middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // ตัวช่วย: ตรวจว่า request เป็น API หรือไม่
  const isApi = pathname.startsWith('/api/admin');
  const isAdminPage = pathname.startsWith('/admin');

  // ถ้าต้องการปกป้องทั้ง /admin และ /api/admin
  if (isAdminPage || pathname.startsWith('/api')) {
    // อ่าน token ของ next-auth (ต้องตั้ง NEXTAUTH_SECRET)
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });

    // ถ้าไม่มี token -> ไม่ล็อกอิน
    if (!token) {
      if (isApi) {
        return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
      } else {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', 'unauthenticated');
        return NextResponse.redirect(url);
      }
    }

    // ตรวจ role (สมมติ role ถูกฝังใน token.role)
    if (String(token.role || '').toLowerCase() !== 'admin') {
      if (isApi) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
      } else {
        const url = req.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('error', 'not_admin');
        return NextResponse.redirect(url);
      }
    }

    // ถ้าผ่าน ก็ allow
  }

  return NextResponse.next();
}

export const config = {
  // ปรับ matcher ตามที่คุณต้องการ
  matcher: ['/admin/:path*', '/api/:path*'],
};
