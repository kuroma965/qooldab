'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import PageLoadingOverlay from '@/components/common/PageLoadingOverlay';
import { Turnstile } from '@marsidev/react-turnstile';

export default function SignupForm({
  redirectTo = '/profile',
  loadingMode="page"
}) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [cfToken, setCfToken] = useState('');

  // ใช้ตัวเดียวคุมทั้ง 2 ช่อง
  const [showPassword, setShowPassword] = useState(false);

  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // สำหรับ animation
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isPageLoading = loadingMode === 'page' && (loadingSignup || loadingGoogle);
  const isDisabled = loadingSignup || loadingGoogle || isPageLoading;

  // เข้าเพจแล้วเลื่อนขึ้นบนสุด + trigger intro animation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  function validateEmail(e) {
    return /\S+@\S+\.\S+/.test(e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) return setError('กรุณากรอกชื่อ');
    if (!validateEmail(email)) return setError('อีเมลไม่ถูกต้อง');
    if (password.length < 8)
      return setError('รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร');
    if (password !== confirmPw)
      return setError('รหัสผ่านกับการยืนยันไม่ตรงกัน');
    if (!cfToken) {
     return setError('โปรดยืนยันว่าคุณไม่ใช่บอท ก่อนสมัครสมาชิก');
   }

    setLoadingSignup(true);

    try {
      const nextAuth = await import('next-auth/react').catch(() => null);
      if (!nextAuth || typeof nextAuth.signIn !== 'function') {
        setError('Auth client ไม่พร้อมใช้งาน');
        return;
      }

      const signRes = await nextAuth.signIn('credentials', {
        redirect: false,
        action: 'signup',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        cfToken,
      });

      if (signRes?.error) {
        setError(signRes.error);
        return;
      }

      setSuccessMsg('สมัครเรียบร้อย! กำลังเข้าสู่ระบบ...');
      // เล่น outro animation แล้วค่อย redirect
      setLeaving(true);
      setTimeout(() => router.push(redirectTo), 700);
    } catch (err) {
      console.error('Signup error:', err);
      setError('เกิดข้อผิดพลาดในการสมัคร');
    } finally {
      // ปล่อยให้ loading แสดงระหว่างกำลัง transition นิดนึง
      setTimeout(() => setLoadingSignup(false), 700);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setSuccessMsg('');
    setLoadingGoogle(true);

    try {
      const nextAuth = await import('next-auth/react').catch(() => null);
      if (!nextAuth || typeof nextAuth.signIn !== 'function') {
        setError('Social login ยังไม่ถูกตั้งค่าในโปรเจกต์นี้');
        setLoadingGoogle(false);
        return;
      }

      // เล่น outro นิดนึงก่อน redirect ไป Google
      setLeaving(true);
      setTimeout(() => {
        nextAuth.signIn('google', { callbackUrl: redirectTo });
      }, 250);
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('เข้าสู่ระบบด้วย Google เกิดข้อผิดพลาด');
      setLoadingGoogle(false);
      setLeaving(false);
    }
  }

  const inputBaseClass =
    'block w-full rounded-xl bg-gray-900/50 border border-gray-700/50 text-white px-3 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-500';

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  // class สำหรับ animation ของ card
  const cardStateClass = leaving
    ? 'opacity-0 translate-y-4 scale-95'
    : mounted
    ? 'opacity-100 translate-y-0 scale-100'
    : 'opacity-0 translate-y-4 scale-95';

  return (
    <div className="relative flex items-center justify-center min-h-[600px] p-4">
      {/* ใช้ overlay กลาง */}
      <PageLoadingOverlay
        open={isPageLoading}
        label={
          loadingSignup
            ? 'กำลังสร้างบัญชี...'
            : loadingGoogle
            ? 'กำลังเชื่อมต่อ Google...'
            : 'กำลังดำเนินการ...'
        }
      />

      {/* Main Card + animation */}
      <div
        className={`w-full max-w-md bg-gradient-to-b from-gray-900 to-black border border-gray-800/80 rounded-2xl p-8 shadow-[0_0_40px_-10px_rgba(124,58,237,0.2)] relative z-10 backdrop-blur-xl transform transition-all duration-500 ease-out ${cardStateClass}`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 mb-4">
            <Image
              src="/logo.png"
              alt="Qooldab Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
            สมัครสมาชิก
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            สร้างบัญชีเพื่อเข้าใช้งาน Qooldab
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/30 text-green-300 rounded-xl">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ชื่อผู้ใช้ */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">
              ชื่อผู้ใช้
            </label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputBaseClass}
                placeholder="ชื่อผู้ใช้ของคุณ"
                required
                disabled={isDisabled}
              />
            </div>
          </div>

          {/* อีเมล */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">
              อีเมล
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className={inputBaseClass}
                placeholder="you@example.com"
                required
                disabled={isDisabled}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">
              รหัสผ่าน
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                className={`${inputBaseClass} pr-10`}
                placeholder="••••••••"
                required
                disabled={isDisabled}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isDisabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <span className="text-xs text-gray-500 mt-1 block ml-1">
              ความยาวขั้นต่ำ 8 ตัวอักษร
            </span>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">
              ยืนยันรหัสผ่าน
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                className={`${inputBaseClass} pr-10`}
                placeholder="••••••••"
                required
                disabled={isDisabled}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isDisabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Cloudflare Turnstile */}
            <div className="mt-3 text-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCfToken(token)}
                onExpire={() => setCfToken('')}
                onError={() => setCfToken('')}
                options={{
                  theme: 'dark',
                }}
              />
              {!cfToken && (
                <p className="mt-1 text-[11px] text-gray-500">
                  โปรดยืนยันว่าคุณไม่ใช่บอท ก่อนเข้าสู่ระบบ
                </p>
              )}
            </div>
          </div>

          {/* ปุ่มสมัคร */}
          <button
            type="submit"
            disabled={isDisabled}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-900/30 transition-all duration-200 active:scale-[0.98] ${
              isDisabled ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            aria-busy={loadingSignup}
          >
            {loadingSignup && <Loader2 className="h-5 w-5 animate-spin" />}
            <span>{loadingSignup ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black/80 backdrop-blur px-3 text-gray-500 font-medium">
              หรือ
            </span>
          </div>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isDisabled}
          className={`w-full flex items-center justify-center gap-3 bg-white/5 border border-gray-700/50 rounded-xl px-3 py-3 text-sm font-medium text-gray-200 hover:bg-white/10 transition-all duration-200 active:scale-[0.98] ${
            isDisabled ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          aria-busy={loadingGoogle}
        >
          {loadingGoogle ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
          )}
          <span>
            {loadingGoogle ? 'กำลังเชื่อมต่อ...' : 'ดำเนินการต่อด้วย Google'}
          </span>
        </button>

        <p className="mt-8 text-sm text-gray-400 text-center">
          มีบัญชีอยู่แล้ว?{' '}
          <Link
            href="/login"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            เข้าสู่ระบบที่นี่
          </Link>
        </p>
      </div>
    </div>
  );
}
