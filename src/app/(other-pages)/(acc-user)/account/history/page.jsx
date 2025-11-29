import Link from 'next/link';

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">ยังไม่เปิดให้บริการ</h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Link href="/" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-medium">
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </main>
  );
}
