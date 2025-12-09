// components/ProfileUser.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { signOut, getSession } from 'next-auth/react';
import {
  User2,
  LogOut,
  Pencil,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Mail,
  IdCard,
  Clock,
} from 'lucide-react';

import ModalDialog from '../common/ModalDialog';

export default function ProfileUser({ initialSession = null }) {
  const session = initialSession ?? null;
  const initialUser = session?.user ?? null;

  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialUser?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [imageErrored, setImageErrored] = useState(false);

  useEffect(() => {
    setUser(initialUser);
    setName(initialUser?.name ?? '');
    setImageErrored(false);
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

  const formatCredits = (val) => {
    const n = Number(val ?? 0);
    if (!Number.isFinite(n)) return String(val ?? 0);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  const getUserCredits = (u) => {
    if (!u) return 0;
    const candidates = [
      'credits',
      'credit',
      'balance',
      'wallet',
      'wallet_balance',
      'points',
    ];
    for (const key of candidates) {
      if (u[key] != null) {
        const val = u[key];
        const num = Number(val);
        return Number.isFinite(num) ? num : val;
      }
    }
    return 0;
  };

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = { name: name?.trim() };
      const sessionImage = initialUser?.image;
      if (sessionImage && String(sessionImage).trim() !== '') {
        payload.image = String(sessionImage).trim();
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update');

      setUser(data.user);
      setName(data.user?.name ?? '');
      setEditing(false);
      setSuccessMsg('บันทึกเรียบร้อย');

      try {
        const fresh = await getSession();
        if (fresh?.user) {
          setUser((prev) => ({
            ...prev,
            ...data.user,
            ...fresh.user,
          }));
          setName(fresh.user?.name ?? data.user?.name ?? '');
        }
      } catch (err) {
        console.warn(
          'Failed to refresh client session after profile update',
          err
        );
      }

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

  const renderAvatar = () => {
    const src = user?.image ? String(user.image).trim() : '';
    if (src && !imageErrored) {
      return (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img
          src={src}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-purple-400 shadow-lg"
          onError={() => setImageErrored(true)}
        />
      );
    }

    return (
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center border-2 border-purple-300 shadow-lg">
        <User2 className="w-12 h-12 text-white" />
      </div>
    );
  };

  const rawCredits = getUserCredits(user);
  const creditsLabel = Number.isFinite(Number(rawCredits))
    ? formatCredits(Number(rawCredits))
    : String(rawCredits ?? '');

  return (
    <div className="bg-transparent">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          <User2 className="w-6 h-6 text-purple-300" />
          บัญชีของฉัน
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          ดูข้อมูลผู้ใช้และเครดิตของคุณ ปรับแต่งโปรไฟล์ได้ที่นี่
        </p>
      </div>

      {/* Alerts */}
      <div className="space-y-2 mb-4">
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-300 bg-red-900/25 border border-red-700/70 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 text-sm text-green-300 bg-green-900/20 border border-green-700/60 rounded-xl px-3 py-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Main card */}
      <div className="bg-gray-900/90 rounded-2xl border border-purple-800/70 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* LEFT: Profile panel */}
          <aside className="md:w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-b md:border-b-0 md:border-r border-purple-800/50 p-5 sm:p-6 flex flex-col items-center text-center gap-4">
            <div className="flex flex-col items-center gap-3">
              {renderAvatar()}

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-semibold text-white truncate max-w-[180px]">
                    {user?.name ?? 'ไม่มีชื่อ'}
                  </span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-800 text-[11px] uppercase tracking-wide text-gray-200 border border-gray-700">
                  {user?.role ?? 'user'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
                <div className="inline-flex items-center gap-1">
                  <IdCard className="w-3 h-3" />
                  <span>ID: {user?.id ?? '-'}</span>
                </div>
                {user?.updated_at && (
                  <div className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>อัปเดต: {formatDate(user.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 w-full flex flex-col gap-2">
              <button
                onClick={openEdit}
                className="inline-flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                แก้ไขชื่อโปรไฟล์
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl border border-gray-700 text-sm font-medium text-gray-200 hover:bg-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </div>
          </aside>

          {/* RIGHT: Details */}
          <main className="flex-1 p-5 sm:p-6 md:p-7 space-y-5">
            {/* Credits card */}
            <section className="bg-gradient-to-r from-purple-900/70 via-purple-800/60 to-indigo-800/60 rounded-2xl border border-purple-500/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-black/20 flex items-center justify-center border border-purple-200/40">
                  <CreditCard className="w-5 h-5 text-purple-50" />
                </div>
                <div>
                  <div className="text-xs uppercase text-purple-100/80 tracking-wide">
                    Credits Balance
                  </div>
                  <div className="text-2xl font-semibold text-white mt-0.5">
                    ฿{creditsLabel}
                  </div>
                  <div className="text-xs text-purple-100/80 mt-1">
                    ใช้สำหรับซื้อสินค้า / บริการบน qooldab
                  </div>
                </div>
              </div>
            </section>

            {/* Info list */}
            <section className="bg-gray-900/80 rounded-2xl border border-gray-800 p-4 sm:p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-100 mb-1">
                ข้อมูลผู้ใช้
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">อีเมล</span>
                  </div>
                  <div className="text-gray-100 break-all">
                    {user?.email ?? '-'}
                  </div>
                </div>

                <div className="h-px bg-gray-800/60" />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <div className="flex items-center gap-2 text-gray-400">
                    <User2 className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">ชื่อที่แสดง</span>
                  </div>
                  <div className="text-gray-100">
                    {user?.name ?? 'ไม่มีชื่อ'}
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* ✅ ใช้ common ModalDialog แทน modal ที่เขียนเอง */}
      <ModalDialog
        open={editing}
        onClose={closeEdit}
        title="แก้ไขชื่อโปรไฟล์"
        icon={<Pencil className="w-5 h-5 text-purple-300" />}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">
              ชื่อที่ต้องการให้แสดง
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              maxLength={100}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeEdit}
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 text-sm hover:bg-gray-900 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${saving
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-500'
                }`}
            >
              {saving ? (
                <>
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                'บันทึก'
              )}
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}
