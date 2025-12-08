// app/signup/page.js
import SignupForm from '@/components/login/SignupForm';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold">สมัครสมาชิก qooldab</h1>
          <p className="text-gray-400 mt-2">สร้างบัญชีเพื่อซื้อเกมและจัดการโปรไฟล์ของคุณ</p>
        </div>

        <SignupForm redirectTo="/profile" />
      </div>
    </main>
  );
}
