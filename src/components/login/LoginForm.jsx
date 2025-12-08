'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm({ redirectTo = '/profile' }) {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingSignin, setLoadingSignin] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  // map error keys to user-friendly messages
  const ERROR_MESSAGES = {
    not_google: 'อีเมลนี้ไม่ได้สมัครผ่าน Google — กรุณาเข้าสู่ระบบด้วยอีเมล/รหัสผ่าน',
    google_no_email: 'ไม่สามารถอ่านอีเมลจาก Google ได้ โปรดลองอีกครั้ง หรือใช้วิธีการเข้าสู่ระบบอื่น',
    Invalid_credentials: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    INACTIVE_ACCOUNT: 'บัญชีนี้ไม่สามารถใช้งานได้',
    // ถ้ามีข้อความอื่น ๆ ที่ NextAuth ส่งเป็น plain text เราจะแสดง decodeURIComponent
  };

  // read ?error= on mount (so Google redirect or nextauth error shows)
  useEffect(() => {
    const e = params.get('error');
    if (!e) return;
    // try friendly mapping first, else decode
    const friendly = ERROR_MESSAGES[e] ?? ERROR_MESSAGES[decodeURIComponent(e)] ?? null;
    if (friendly) setError(friendly);
    else {
      // fallback: show raw but decoded (and keep it short)
      try {
        const decoded = decodeURIComponent(e);
        setError(decoded.length > 200 ? decoded.slice(0, 200) + '...' : decoded);
      } catch {
        setError(e);
      }
    }
  }, [params]);

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

      // NextAuth send back error string when redirect:false
      if (res?.error) {
        // try to decode and map to friendly message
        const raw = res.error;
        const friendly = ERROR_MESSAGES[raw] ?? ERROR_MESSAGES[decodeURIComponent(raw)] ?? null;
        if (friendly) setError(friendly);
        else setError(raw);
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
              <svg className='h-5 w-5' xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
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
