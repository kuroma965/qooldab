// components/AccountUser.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { signOut, getSession } from 'next-auth/react';

export default function AccountUser({ initialSession = null }) {
  // Use only session passed from server (initialSession)
  const session = initialSession ?? null;
  const initialUser = session?.user ?? null;

  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialUser?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // sync when initialSession changes (server -> client hydration)
  useEffect(() => {
    setUser(initialUser);
    setName(initialUser?.name ?? '');
  }, [initialUser]);

  const formatDate = (iso) => {
    try {
      if (!iso) return '';
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return String(iso);
    }
  };

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = { name: name?.trim() };

      // include image only if the initial session had one
      const sessionImage = initialUser?.image;
      if (sessionImage && String(sessionImage).trim() !== '') {
        payload.image = String(sessionImage).trim();
      }

      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update');

      // API returns updated user object (safe fields). Update local UI immediately.
      setUser(data.user);
      setName(data.user?.name ?? '');
      setEditing(false);
      setSuccessMsg('บันทึกเรียบร้อย');

      // Refresh NextAuth client session so other parts of app (useSession/getSession) reflect latest DB values.
      // getSession() fetches /api/auth/session and updates the client-side session cache.
      try {
        const fresh = await getSession();
        if (fresh?.user) {
          // prefer values from fresh session (if available), otherwise keep API response
          setUser((prev) => ({
            ...prev,
            ...data.user,
            ...fresh.user,
          }));
          setName(fresh.user?.name ?? data.user?.name ?? '');
        }
      } catch (err) {
        // non-fatal: if session refresh fails, we've already updated UI from API response
        console.warn('Failed to refresh client session after profile update', err);
      }

      // clear message after short time
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function openEdit() {
    setEditing(true);
    setSuccessMsg('');
    setError('');
  }
  function closeEdit() {
    setEditing(false);
    setName(user?.name ?? '');
    setError('');
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-md border border-purple-800">
      <h1 className="text-2xl font-bold text-white mb-4">บัญชีของฉัน</h1>

      {error && <div className="mb-3 text-sm text-red-300">{error}</div>}

      <div className="flex gap-6 items-center">
        <div>
          {user?.image ? (
            <img src={user.image} alt="avatar" className="w-24 h-24 rounded-full object-cover border-2 border-purple-700" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">{user?.name ?? 'ไม่มีชื่อ'}</h2>
            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-200 rounded">{user?.role ?? 'user'}</span>
          </div>
          <p className="text-sm text-gray-300 mt-1">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-2">id: {user?.id}</p>
          {/* show updated_at from session or API response */}
          {user?.updated_at && (
            <p className="text-xs text-gray-400 mt-1">แก้ไขล่าสุด: <span className="text-gray-200">{formatDate(user.updated_at)}</span></p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={openEdit} className="px-4 py-2 bg-purple-600 text-white rounded hover:opacity-90">
            แก้ไขชื่อ
          </button>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="px-4 py-2 border border-gray-700 rounded text-gray-200 hover:bg-gray-900">
            ออกจากระบบ
          </button>
        </div>
      </div>

      {successMsg && <div className="mt-4 text-sm text-green-300">{successMsg}</div>}

      {/* Modal edit (name only) */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeEdit} />
          <form onSubmit={handleSave} className="relative bg-gray-900 w-full max-w-md rounded-lg p-6 z-10 border border-purple-800">
            <h3 className="text-lg font-semibold text-white mb-2">แก้ไขชื่อ</h3>

            <label className="text-sm text-gray-300">ชื่อ</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 mb-3 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              maxLength={100}
            />

            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeEdit} className="px-4 py-2 rounded border border-gray-700 text-gray-200">
                ยกเลิก
              </button>
              <button type="submit" disabled={saving} className={`px-4 py-2 rounded ${saving ? 'bg-gray-600 text-gray-300' : 'bg-purple-600 text-white'}`}>
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
