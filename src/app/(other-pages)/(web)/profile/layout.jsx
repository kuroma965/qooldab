// app/(other-pages)/layout.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // ต้อง export authOptions ในไฟล์ nextauth
import { redirect } from 'next/navigation';

export default async function OtherPagesLayout({ children }) {
  // ตรวจ session ฝั่ง server
  const session = await getServerSession(authOptions);

  // ถ้าไม่มี session -> redirect ไปหน้า login
  // (ถ้าต้องการ ส่ง callbackUrl ให้กลับมาหลัง login เพิ่ม ?callbackUrl=... ได้)
  if (!session) {
    // ถ้าต้องการให้กลับมาที่ path ปัจจุบันหลัง login:
    // redirect(`/login?callbackUrl=${encodeURIComponent('/')}`); // ตัวอย่าง (แก้ '/' เป็น path จริงได้)
    redirect('/login');
  }

  // ถ้ามี session ให้เรนเดอร์ layout ตามปกติ
  return (
    <>
      <main>{children}</main>
    </>
  );
}
