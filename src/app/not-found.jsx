// app/not-found.js
import Link from 'next/link';

export default function NotFound() {
  const year = new Date().getFullYear();

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-3xl w-full text-center">
        <div className="inline-flex items-center justify-center h-32 w-32 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 mx-auto mb-6 shadow-lg">
          <svg className="h-16 w-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 19a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4" />
            <circle cx="12" cy="17" r="1" />
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">หน้าไม่พบ (404)</h1>
        <p className="text-gray-300 mb-6">
          ขอโทษด้วย — หน้านี้ไม่มีอยู่จริงหรือถูกย้ายไปแล้ว
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-md font-medium shadow">
            กลับหน้าแรก
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>ถ้าคุณคิดว่าเป็นข้อผิดพลาด โปรด <Link href="/contact" className="text-white underline">ติดต่อเรา</Link> หรือลองค้นหาจากเมนูด้านบน</p>
        </div>

        <div className="mt-10 text-sm text-gray-600/60">
          <p>© {year}{' '}Qooldab. All Rights Reserved.</p>
        </div>
      </div>
    </main>
  );
}
