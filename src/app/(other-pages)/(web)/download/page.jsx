'use client' // 1. จำเป็นต้องใส่บรรทัดนี้

import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  return (
    <main className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">ยังไม่เปิดให้บริการ</h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => router.back()} 
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-medium text-white"
          >
            ย้อนกลับ
          </button>
        </div>
      </div>
    </main>
  );
}
