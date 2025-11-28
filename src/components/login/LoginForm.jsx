'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm({ redirectTo = '/account' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // พยายามใช้ next-auth ถ้ามี
      const nextAuth = await import('next-auth/react').catch(() => null);

      if (nextAuth && typeof nextAuth.signIn === 'function') {
        const res = await nextAuth.signIn('credentials', {
          redirect: false,
          email,
          password,
        });
        if (res?.error) {
          setError(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
        } else {
          router.push(redirectTo);
        }
      } else {
        // fallback: เรียก API ของคุณเอง
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) router.push(redirectTo);
        else {
          const data = await res.json().catch(() => ({}));
          setError(data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
        }
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);
    try {
      const nextAuth = await import('next-auth/react').catch(() => null);
      if (nextAuth && typeof nextAuth.signIn === 'function') {
        // NextAuth: เปิดหน้าล็อกอินของ Google
        await nextAuth.signIn('google', { callbackUrl: redirectTo });
      } else {
        setError('Social login ยังไม่ถูกตั้งค่าในโปรเจกต์นี้');
      }
    } catch (err) {
      console.error(err);
      setError('เข้าสู่ระบบด้วย Google เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-2xl p-6 shadow-2xl">
      <div className="text-center mb-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold mb-3">
          QD
        </div>
        <h2 className="text-2xl font-extrabold text-white">ยินดีต้อนรับกลับ</h2>
        <p className="text-sm text-gray-400 mt-1">เข้าสู่ระบบเพื่อจัดการบัญชีและซื้อเกม</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-600/20 border border-red-600 text-red-200 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-300">อีเมล</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-white px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-purple-600 outline-none"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-300">รหัสผ่าน</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-white px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-purple-600 outline-none"
            placeholder="••••••••"
          />
        </label>

        <div className="flex items-center justify-between">
          <Link href="/login/forgot" className="text-sm text-gray-400 hover:text-white">ลืมรหัสผ่าน?</Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
          >
            {loading ? 'กำลังเข้า...' : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-black/0 px-3 text-gray-400">หรือเข้าสู่ระบบด้วย</span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 hover:bg-gray-800 transition"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
            <path fill="#EA4335" d="M12 11.5v2.8h4.1c-.2 1.2-1 3.2-4.1 3.2-2.5 0-4.6-2-4.6-4.6S9.5 8.5 12 8.5c1.4 0 2.3.6 2.8 1l1.9-1.8C15.5 6 13.9 5.2 12 5.2 7.6 5.2 4 8.8 4 13.2S7.6 21.2 12 21.2c5 0 8.2-3.6 8.2-8.7 0-.6-.1-1.1-.2-1.6H12z"/>
          </svg>
          {loading ? 'กำลัง...' : 'เข้าสู่ระบบด้วย Google'}
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-400 text-center">
        ยังไม่มีบัญชี? <Link href="/signup" className="text-white underline">สมัครสมาชิก</Link>
      </p>
    </div>
  );
}
