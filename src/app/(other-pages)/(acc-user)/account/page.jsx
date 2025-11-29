// app/account/page.js  (หรือปรับ path ให้ตรงกับของคุณ)
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ต้อง export authOptions ที่ไฟล์ nextauth ของคุณ
import SignOutButton from "@/components/SignOutButton";

export default async function Page() {
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">บัญชีของฉัน</h1>

      {!session ? (
        <div className="bg-gray-800 p-6 rounded-lg text-gray-200">
          <p className="mb-3">คุณยังไม่ได้เข้าสู่ระบบ</p>
          <div className="flex gap-3">
            <Link href="/login" className="px-4 py-2 bg-purple-600 rounded text-white">เข้าสู่ระบบ</Link>
            <Link href="/signup" className="px-4 py-2 border border-gray-700 rounded text-gray-200">สมัครสมาชิก</Link>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg text-gray-100">
          <div className="flex items-center gap-4">
            {session.user?.image ? (
              <img src={session.user.image} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold">{session.user?.name ?? "ไม่มีชื่อ"}</h2>
              <p className="text-sm text-gray-300">{session.user?.email}</p>
              {session.user?.id && <p className="text-xs text-gray-400 mt-1">id: {session.user.id}</p>}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-300">
              สถานะเซสชัน: <span className="font-medium text-gray-100">{session ? "ล็อกอินแล้ว" : "ไม่ล็อกอิน"}</span>
            </p>

            <div className="flex gap-3">
              <Link href="/account/edit" className="px-4 py-2 bg-purple-600 rounded text-white">แก้ไขโปรไฟล์</Link>

              {/* ปุ่มออกจากระบบ เป็น client component ที่เราแยกไว้ */}
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
