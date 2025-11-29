'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm({ redirectTo = '/account' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingSignin, setLoadingSignin] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  // simple email validator
  function validateEmail(e) {
    return /\S+@\S+\.\S+/.test(e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const cleanedEmail = String(email || '').trim().toLowerCase();
    if (!validateEmail(cleanedEmail)) {
      setError('อีเมลไม่ถูกต้อง');
      return;
    }
    if (!password) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    setLoadingSignin(true);

    try {
      // dynamic import so bundle size is smaller and SSR safe
      const nextAuth = await import('next-auth/react').catch(() => null);

      if (!nextAuth || typeof nextAuth.signIn !== 'function') {
        setError('Auth client ไม่พร้อมใช้งาน — ตรวจสอบการติดตั้ง next-auth');
        return;
      }

      // Use redirect: false to receive result object and show errors
      const res = await nextAuth.signIn('credentials', {
        redirect: false,
        email: cleanedEmail,
        password,
      });

      // In dev you can inspect res in console if needed:
      // console.log('signIn res:', res);

      if (res?.error) {
        // NextAuth returns error message from authorize() when redirect: false
        setError(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
      } else {
        // success: NextAuth sets cookie; redirect to protected page
        router.push(redirectTo);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoadingSignin(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoadingGoogle(true);

    try {
      const nextAuth = await import('next-auth/react').catch(() => null);
      if (!nextAuth || typeof nextAuth.signIn !== 'function') {
        setError('Social login ยังไม่ถูกตั้งค่าในโปรเจกต์นี้');
        setLoadingGoogle(false);
        return;
      }

      // This redirects browser to Google. callbackUrl will bring user back.
      await nextAuth.signIn('google', { callbackUrl: redirectTo });

      // usually redirect happens and code below won't run
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('เข้าสู่ระบบด้วย Google เกิดข้อผิดพลาด');
      setLoadingGoogle(false);
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
        <div className="mb-4 px-4 py-2 bg-red-600/20 border border-red-600 text-red-200 rounded" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" aria-disabled={loadingSignin || loadingGoogle}>
        <label className="block">
          <span className="text-sm text-gray-300">อีเมล</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-white px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-purple-600 outline-none"
            placeholder="you@example.com"
            disabled={loadingSignin || loadingGoogle}
            aria-invalid={!validateEmail(email)}
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
            disabled={loadingSignin || loadingGoogle}
          />
        </label>

        <div className="flex items-center justify-between">
          <Link href="/login/forgot" className="text-sm text-gray-400 hover:text-white">ลืมรหัสผ่าน?</Link>
          <button
            type="submit"
            disabled={loadingSignin || loadingGoogle}
            className={`inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow ${loadingSignin ? 'opacity-80 cursor-wait' : ''}`}
            aria-busy={loadingSignin}
          >
            {loadingSignin ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.25" fill="none" />
                  <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>กำลังเข้า...</span>
              </>
            ) : (
              'เข้าสู่ระบบ'
            )}
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
          disabled={loadingGoogle || loadingSignin}
          className={`w-full flex items-center justify-center gap-3 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 hover:bg-gray-800 transition ${loadingGoogle ? 'opacity-80 cursor-wait' : ''}`}
          aria-busy={loadingGoogle}
        >
          {loadingGoogle ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.25" fill="none" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>กำลังเชื่อมต่อ...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path fill="#EA4335" d="M12 11.5v2.8h4.1c-.2 1.2-1 3.2-4.1 3.2-2.5 0-4.6-2-4.6-4.6S9.5 8.5 12 8.5c1.4 0 2.3.6 2.8 1l1.9-1.8C15.5 6 13.9 5.2 12 5.2 7.6 5.2 4 8.8 4 13.2S7.6 21.2 12 21.2c5 0 8.2-3.6 8.2-8.7 0-.6-.1-1.1-.2-1.6H12z"/>
              </svg>
              <span>เข้าสู่ระบบด้วย Google</span>
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-400 text-center">
        ยังไม่มีบัญชี? <Link href="/signup" className="text-white underline">สมัครสมาชิก</Link>
      </p>
    </div>
  );
}
