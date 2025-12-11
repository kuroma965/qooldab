'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import ModalDialog from '@/components/common/ModalDialog';
import PageLoadingOverlay from '@/components/common/PageLoadingOverlay';

const TopupCoupon = ({ open, onClose }) => {
  const { update } = useSession();

  const [couponCode, setCouponCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('info'); // success | error | info

  const handleRedeem = async () => {
    const code = couponCode.trim();

    if (!code) {
      setStatus('error');
      setMessage('กรุณากรอกโค้ดคูปองก่อนทำรายการ');
      return;
    }

    try {
      setRedeeming(true);
      setMessage('');

      const res = await fetch('/api/profile/redeem-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'ไม่สามารถใช้คูปองได้');
        return;
      }

      await update(); // refresh session

      setCouponCode('');
      setStatus('success');
      setMessage(
        data.message ||
          `ใช้คูปองสำเร็จ! เติมเครดิตจำนวน ${data?.data?.creditAmount ?? ''}`
      );
    } catch (err) {
      console.error('redeem coupon error', err);
      setStatus('error');
      setMessage('เกิดข้อผิดพลาด ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setRedeeming(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setStatus('info');
    onClose && onClose();
  };

  return (
    <>
      <PageLoadingOverlay
        open={redeeming}
        label="กำลังตรวจสอบคูปองของคุณ..."
      />
      <ModalDialog
        open={open}
        onClose={handleClose}
        title="เติมเครดิตด้วยคูปอง"
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400">
              โค้ดคูปอง <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="เช่น FREE100, PROMO2025"
              className="w-full px-3 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400/70 transition-all"
            />
            <p className="text-[11px] text-gray-500">
              - 1 คูปองสามารถใช้ได้ตามจำนวนสิทธิ์ที่เจ้าของกำหนด<br />
              - หลังใช้คูปองสำเร็จ ยอดเครดิตของคุณจะถูกอัปเดตทันที
            </p>
          </div>

          {message && (
            <div
              className={`text-sm whitespace-pre-line rounded-lg px-3 py-2 ${
                status === 'success'
                  ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/40'
                  : status === 'error'
                  ? 'bg-red-500/10 text-red-200 border border-red-500/40'
                  : 'bg-blue-500/10 text-blue-200 border border-blue-500/40'
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleRedeem}
              disabled={redeeming}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              {redeeming ? 'กำลังตรวจสอบ...' : 'ใช้คูปอง'}
            </button>
          </div>
        </div>
      </ModalDialog>
    </>
  );
};

export default TopupCoupon;
