'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, Loader2 } from 'lucide-react';
import ModalDialog from '@/components/common/ModalDialog';
import { getLatestAnnouncement } from '@/lib/Announcements-Db';

const STORAGE_KEY = 'latest_announcement_dismissed_v1';

export default function AnnouncementCenter({ enabled = true }) {
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // ดึงประกาศล่าสุด 1 อัน
        const latest = await getLatestAnnouncement();

        if (!mounted || !latest) return;

        setAnnouncement(latest);

        // เช็คว่าเคยติ๊ก "ไม่ต้องแสดงอีก" สำหรับประกาศอันนี้หรือยัง
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const data = JSON.parse(raw);
            if (data && data.id === latest.id && data.dontShow) {
              // user เคยบอกว่าไม่ต้องแสดงประกาศนี้แล้ว
              return;
            }
          }
        } catch (e) {
          console.warn('parse localStorage error', e);
        }

        setOpen(true);
      } catch (err) {
        console.error('load latest announcement error', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [enabled]);

  const handleClose = () => {
    // ถ้าติ๊กไม่ต้องแสดงอีก -> จำ id ของประกาศนี้ไว้
    if (announcement && dontShowAgain) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ id: announcement.id, dontShow: true })
        );
      } catch (e) {
        console.warn('set localStorage error', e);
      }
    }
    setOpen(false);
  };

  // ยังโหลดหรือไม่มีประกาศก็ไม่ต้องโชว์อะไร
  if (!announcement || loading) return null;

  return (
    <ModalDialog
      open={open}
      onClose={handleClose}
      size="sm"
      closeOnBackdrop={false} // บังคับให้กดปุ่มปิด/รับทราบอย่างเดียว
      title="ประกาศสำคัญ"
      icon={
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-pink-500 shadow-[0_0_16px_rgba(251,191,36,0.8)]">
          <Megaphone className="h-5 w-5 text-white drop-shadow" />
        </div>
      }
      className="
        bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950
        border-purple-500/70
      "
    >
      <div className="space-y-3">
        {/* Title + badge */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-purple-900/60 text-amber-200 border border-purple-400/70">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.9)]" />
              ประกาศจากระบบ
            </span>
            <span className="text-[11px] sm:text-xs text-gray-300">
              โปรดอ่านให้ครบก่อนทำรายการเพื่อความปลอดภัยของบัญชีคุณ
            </span>
          </div>

          <h4 className="mt-2 text-md font-semibold text-white leading-snug">
            {announcement.title}
          </h4>
        </div>

        {/* Content */}
        <div className="rounded-xl bg-black/30 border border-purple-700/50 p-3 max-h-60 overflow-auto">
          <p className="text-sm text-gray-100 whitespace-pre-line leading-relaxed">
            {announcement.content}
          </p>
        </div>

        {/* Checkbox + ปุ่ม */}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm sm:text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 rounded border-gray-500 bg-gray-900 text-purple-500 focus:ring-purple-500"
            />
            <span>ไม่ต้องแสดงอีก</span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="
              w-full sm:w-auto inline-flex items-center justify-center
              rounded-full px-4 py-2 text-sm font-medium
              bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500
              text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]
              hover:brightness-110 active:scale-95 transition
            "
          >
            รับทราบแล้ว
          </button>
        </div>
      </div>
    </ModalDialog>
  );
}
