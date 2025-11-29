'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Props:
 *  - redirectTo: path to redirect after success
 *  - loadingMode: 'button' | 'page'  (default 'button')
 */
export default function SignupForm({ redirectTo = '/account', loadingMode = 'button' }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isPageLoading = loadingMode === 'page' && (loadingSignup || loadingGoogle);

  function validateEmail(e) {
    return /\S+@\S+\.\S+/.test(e);
  }

  // --- ใช้ NextAuth signIn สำหรับ signup (action: 'signup') ---
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) return setError('กรุณากรอกชื่อ');
    if (!validateEmail(email)) return setError('อีเมลไม่ถูกต้อง');
    if (password.length < 8) return setError('รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร');
    if (password !== confirmPw) return setError('รหัสผ่านกับการยืนยันไม่ตรงกัน');

    setLoadingSignup(true);

    try {
      // dynamic import เพื่อหลีกเลี่ยงปัญหา SSR / bundle ใหญ่
      const nextAuth = await import('next-auth/react').catch(() => null);
      if (!nextAuth || typeof nextAuth.signIn !== 'function') {
        setError('Auth client ไม่พร้อมใช้งาน');
        return;
      }

      // เรียก credentials provider ของ NextAuth เพื่อ "signup"
      const signRes = await nextAuth.signIn('credentials', {
        redirect: false,
        action: 'signup',                  // แจ้ง authorize ให้สร้าง user
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // debug: console.log(signRes)
      // signRes shape (redirect:false): { error, status, ok, url }
      if (signRes?.error) {
        setError(signRes.error);
        return;
      }

      // สำเร็จ -> NextAuth จะเซ็ต cookie session ให้
      setSuccessMsg('สมัครเรียบร้อย! กำลังเข้าสู่ระบบ...');
      setTimeout(() => router.push(redirectTo), 700);
    } catch (err) {
      console.error('Signup error:', err);
      setError('เกิดข้อผิดพลาดในการสมัคร');
    } finally {
      setLoadingSignup(false);
    }
  }

  // --- Google signin (NextAuth handles redirect) ---
  async function handleGoogleSignIn() {
    setError('');
    setSuccessMsg('');
    setLoadingGoogle(true);

    try {
      const nextAuth = await import('next-auth/react').catch(() => null);
      if (!nextAuth || typeof nextAuth.signIn !== 'function') {
        setError('Social login ยังไม่ถูกตั้งค่าในโปรเจกต์นี้');
        return;
      }

      // redirect ไป Google; callbackUrl จะพากลับไป redirectTo
      await nextAuth.signIn('google', { callbackUrl: redirectTo });
      // ถ้าถูก redirect จะไม่มาถึงบรรทัดถัดไป
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('เข้าสู่ระบบด้วย Google เกิดข้อผิดพลาด');
    } finally {
      // ถ้าไม่ถูก redirect จริง ๆ ให้ปิด loader
      setLoadingGoogle(false);
    }
  }

  return (
    <div className="relative">
      {/* Page-level loading overlay (ถ้าเลือกโหมด 'page') */}
      {isPageLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="text-white text-center">
            <div className="mb-3 animate-spin rounded-full h-10 w-10 border-4 border-white/30 border-t-white"></div>
            <div>กำลังดำเนินการ...</div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-2xl p-6 shadow-xl relative z-10">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold mb-2">QD</div>
          <h2 className="text-2xl font-extrabold text-white">สมัครสมาชิก</h2>
          <p className="text-sm text-gray-400 mt-1">สร้างบัญชีเพื่อเริ่มเล่นและซื้อเกม</p>
        </div>

        {error && <div className="mb-4 px-4 py-2 bg-red-600/20 border border-red-600 text-red-200 rounded">{error}</div>}
        {successMsg && <div className="mb-4 px-4 py-2 bg-green-600/20 border border-green-600 text-green-200 rounded">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-300">ชื่อผู้ใช้</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-white px-3 py-2"
              placeholder="ชื่อผู้ใช้"
              required
              disabled={loadingMode === 'button' ? loadingSignup : !!isPageLoading}
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-300">อีเมล</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-white px-3 py-2"
              placeholder="you@example.com"
              required
              disabled={loadingMode === 'button' ? loadingSignup : !!isPageLoading}
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-300">รหัสผ่าน</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-white px-3 py-2"
              placeholder="••••••••"
              required
              disabled={loadingMode === 'button' ? loadingSignup : !!isPageLoading}
            />
            <span className="text-xs text-gray-500 mt-1 block">ความยาวขั้นต่ำ 8 ตัวอักษร</span>
          </label>

          <label className="block">
            <span className="text-sm text-gray-300">ยืนยันรหัสผ่าน</span>
            <input
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              type="password"
              className="mt-1 block w-full rounded-lg bg-gray-900 border border-gray-700 text-white px-3 py-2"
              placeholder="••••••••"
              required
              disabled={loadingMode === 'button' ? loadingSignup : !!isPageLoading}
            />
          </label>

          <button
            type="submit"
            disabled={loadingMode === 'button' ? loadingSignup : !!isPageLoading}
            className={`w-full ${loadingMode === 'button' && loadingSignup ? 'opacity-80 cursor-wait' : ''} bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg`}
            aria-busy={loadingMode === 'button' ? loadingSignup : !!isPageLoading}
          >
            {loadingMode === 'button' && loadingSignup ? 'กำลังส่ง...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-black px-2 text-gray-400">หรือสมัครด้วย</span></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loadingMode === 'button' ? loadingGoogle : !!isPageLoading}
          className={`w-full flex items-center justify-center gap-3 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 hover:bg-gray-800 ${loadingMode === 'button' && loadingGoogle ? 'opacity-80 cursor-wait' : ''}`}
          aria-busy={loadingMode === 'button' ? loadingGoogle : !!isPageLoading}
        >
          {/* spinner next to text when button-loading */}
          {loadingMode === 'button' && loadingGoogle ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.25" fill="none"/><path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden><path fill="#EA4335" d="M12 11.5v2.8h4.1c-.2 1.2-1 3.2-4.1 3.2-2.5 0-4.6-2-4.6-4.6S9.5 8.5 12 8.5c1.4 0 2.3.6 2.8 1l1.9-1.8C15.5 6 13.9 5.2 12 5.2 7.6 5.2 4 8.8 4 13.2S7.6 21.2 12 21.2c5 0 8.2-3.6 8.2-8.7 0-.6-.1-1.1-.2-1.6H12z"/></svg>
          )}

          <span>{loadingMode === 'button' && loadingGoogle ? 'กำลังเชื่อมต่อ...' : 'สมัคร/เข้าสู่ระบบด้วย Google'}</span>
        </button>

        <p className="mt-4 text-sm text-gray-400 text-center">
          มีบัญชีแล้ว? <Link href="/login" className="text-white underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}
