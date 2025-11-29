// components/SignOutButton.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setLoading(true);
    try {
      // signOut จะล้าง cookie/session ของ next-auth
      await signOut({ redirect: false });
      // เปลี่ยนหน้าเอง (ไม่ใช้ redirect ของ next-auth)
      router.push('/');
    } catch (err) {
      console.error('Sign out failed', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={`px-4 py-2 rounded ${loading ? 'bg-gray-600 cursor-wait text-gray-300' : 'bg-red-600 text-white'}`}
    >
      {loading ? 'กำลังออก...' : 'ออกจากระบบ'}
    </button>
  );
}
