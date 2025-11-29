// app/login/page.js
import LoginForm from '@/components/login/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold">เข้าสู่ระบบ qooldab</h1>
          <p className="text-gray-400 mt-2">เข้าสู่ระบบเพื่อจัดการบัญชีและซื้อเกม</p>
        </div>

        <LoginForm redirectTo="/account" />
      </div>
    </main>
  );
}
