'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import PageLoadingOverlay from '@/components/common/PageLoadingOverlay';

export default function LoginForm({ redirectTo = '/profile' }) {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loadingSignin, setLoadingSignin] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  // 👇 สำหรับ animation
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Map error keys to user-friendly messages
  const ERROR_MESSAGES = {
    not_google: 'อีเมลนี้ไม่ได้สมัครผ่าน Google — กรุณาเข้าสู่ระบบด้วยรหัสผ่าน',
    google_no_email: 'ไม่สามารถอ่านอีเมลจาก Google ได้',
    Invalid_credentials: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    INACTIVE_ACCOUNT: 'บัญชีนี้ถูกระงับการใช้งาน',
  };

  // ✅ เวลาเข้าหน้านี้ให้เลื่อนขึ้นบนสุด + trigger intro animation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
    // delay นิดนึงให้ browser วาง layout ก่อนแล้วค่อยเล่นอนิเมะ
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const e = params.get('error');
    if (!e) return;
    const friendly =
      ERROR_MESSAGES[e] ?? ERROR_MESSAGES[decodeURIComponent(e)] ?? null;
    if (friendly) setError(friendly);
    else {
      try {
        const decoded = decodeURIComponent(e);
        setError(
          decoded.length > 200 ? decoded.slice(0, 200) + '...' : decoded,
        );
      } catch {
        setError(e);
      }
    }
  }, [params]);

  function validateEmail(e) {
    return /\S+@\S+\.\S+/.test(e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const cleanedEmail = String(email || '').trim().toLowerCase();
    if (!validateEmail(cleanedEmail)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }
    if (!password) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    setLoadingSignin(true);

    try {
      const nextAuth = await import('next-auth/react').catch(() => null);

      if (!nextAuth || typeof nextAuth.signIn !== 'function') {
        setError('Auth client ไม่พร้อมใช้งาน');
        setLoadingSignin(false);
        return;
      }

      const res = await nextAuth.signIn('credentials', {
        redirect: false,
        email: cleanedEmail,
        password,
      });

      if (res?.error) {
        const raw = res.error;
        const friendly =
          ERROR_MESSAGES[raw] ??
          ERROR_MESSAGES[decodeURIComponent(raw)] ??
          null;
        setError(friendly || raw);
      } else {
        // ✅ เล่น outro ก่อน แล้วค่อย redirect
        setLeaving(true);
        setTimeout(() => {
          router.push(redirectTo);
        }, 250);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      // ให้ loading ยัง true ระหว่าง outro+redirect จะได้ไม่สลับ state ไปมา
      setTimeout(() => setLoadingSignin(false), 250);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoadingGoogle(true);

    try {
      const nextAuth = await import('next-auth/react').catch(() => null);
      if (!nextAuth || typeof nextAuth.signIn !== 'function') {
        setError('Social login ยังไม่พร้อมใช้งาน');
        setLoadingGoogle(false);
        return;
      }

      // ✅ outro ก่อน redirect ไป Google
      setLeaving(true);
      setTimeout(() => {
        nextAuth.signIn('google', { callbackUrl: redirectTo });
      }, 200);
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ Google');
      setLoadingGoogle(false);
      setLeaving(false);
    }
  }

  const inputBaseClass =
    'block w-full rounded-xl bg-gray-900/50 border border-gray-700/50 text-white px-3 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-500';
  const isDisabled = loadingSignin || loadingGoogle;

  // ✅ คำนวณ class สำหรับ animation ของ card
  const cardStateClass = leaving
    ? 'opacity-0 translate-y-4 scale-95'
    : mounted
    ? 'opacity-100 translate-y-0 scale-100'
    : 'opacity-0 translate-y-4 scale-95';

  return (
    <div className="relative flex items-center justify-center min-h-[600px] p-4">
      {/* Loading Overlay */}
      <PageLoadingOverlay
        open={loadingSignin || loadingGoogle}
        label={
          loadingSignin
            ? 'กำลังตรวจสอบข้อมูลเข้าสู่ระบบ...'
            : loadingGoogle
            ? 'กำลังเชื่อมต่อ Google...'
            : 'กำลังโหลด...'
        }
      />

      {/* Main Card */}
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
            เข้าสู่ระบบ
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            เข้าสู่ระบบเพื่อใช้งาน Qooldab
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
            <span className="text-sm leading-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">
              อีเมล
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBaseClass}
                placeholder="you@example.com"
                disabled={isDisabled}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-gray-300">
                รหัสผ่าน
              </label>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputBaseClass} pr-10`}
                placeholder="••••••••"
                disabled={isDisabled}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isDisabled}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/30 transition-all duration-200 active:scale-[0.98] ${
              isDisabled ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loadingSignin ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
            <span>{loadingSignin ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
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

        {/* Google Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isDisabled}
          className={`w-full flex items-center justify-center gap-3 bg-white/5 border border-gray-700/50 rounded-xl px-3 py-3 text-sm font-medium text-gray-200 hover:bg-white/10 transition-all duration-200 active:scale-[0.98] ${
            isDisabled ? 'opacity-70 cursor-not-allowed' : ''
          }`}
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
          <span>{loadingGoogle ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบด้วย Google'}</span>
        </button>

        <p className="mt-8 text-sm text-gray-400 text-center">
          ยังไม่มีบัญชี?{' '}
          <Link
            href="/signup"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            สมัครสมาชิกที่นี่
          </Link>
        </p>
      </div>
    </div>
  );
}
