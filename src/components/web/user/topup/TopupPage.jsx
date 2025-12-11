'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Wallet, Gift, CreditCard } from 'lucide-react';
import ModalDialog from '@/components/common/ModalDialog';

// popup แยกหน้า
import TopupCoupon from './TopupCoupon';

const TopupPage = () => {
  const { update } = useSession(); // เผื่อใช้ในอนาคต

  // popup info ทั่วไป (true money + slip + qr)
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupStatus, setPopupStatus] = useState('info'); // success | error | info

  // popup คูปอง
  const [couponOpen, setCouponOpen] = useState(false);

  const openInfo = (message) => {
    setPopupStatus('info');
    setPopupMessage(message);
    setPopupOpen(true);
  };

  const handleTruemoney = () => {
    openInfo(
      'ช่องทางซองอั่งเปา TrueMoney Wallet ยังไม่เปิดให้ใช้งานในตอนนี้\nกรุณารออัปเดตเวอร์ชันถัดไปนะครับ 🙏'
    );
  };

  const handleSlip = () => {
    openInfo(
      'การเติมเงินด้วยสลิป Mobile Banking ยังไม่เปิดให้ใช้งานในตอนนี้\nกรุณารออัปเดตเวอร์ชันถัดไปนะครับ 🙏'
    );
  };

  const handlePromptpay = () => {
    openInfo(
      'การเติมเงินด้วย QR PromptPay ยังไม่เปิดให้ใช้งานในตอนนี้\nกรุณารออัปเดตเวอร์ชันถัดไปนะครับ 🙏'
    );
  };

  const handleOpenCoupon = () => {
    setCouponOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-950  text-gray-100 font-sans selection:bg-purple-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -right-20 w-[520px] h-[520px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-32 w-[640px] h-[640px] bg-indigo-900/20 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-10 md:py-14">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
            เติมเครดิต
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl">
            เลือกช่องทางการเติมเงินที่คุณต้องการ แล้วดำเนินการตามขั้นตอนที่ระบบแจ้ง
          </p>
        </div>

        {/* Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6 items-stretch">
          {/* Method 1: TrueMoney Wallet */}
          <div className="flex flex-col h-full bg-[#020617]/80 border border-slate-800/90 rounded-3xl px-5 py-6 md:px-6 md:py-7 shadow-[0_18px_45px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-400/40 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-white">
                  ซองอั่งเปา TrueMoney
                </h2>
                <p className="text-[11px] md:text-xs text-gray-400">
                  เติมเครดิตผ่านซองอั่งเปา
                </p>
                <p className="text-[11px] md:text-xs text-yellow-400">
                  (ค่าธรรมเนียม 1.5%)
                </p>
              </div>
            </div>

            <div className="flex-1">
              <div className="text-xs text-gray-400 bg-slate-950/80 border border-dashed border-slate-800 rounded-2xl px-4 py-3 md:px-4 md:py-4">
                <p className="leading-relaxed">
                  ระบบจะสร้างซองอั่งเปาที่ใช้สำหรับเติมเครดิตเข้าในบัญชีของคุณ
                </p>
                <p className="mt-2 text-[11px] text-yellow-300/90">
                  * ยังไม่เปิดให้ใช้งานจริงในตอนนี้
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTruemoney}
              className="mt-5 inline-flex items-center justify-center w-full px-4 py-2.5 rounded-2xl bg-slate-900 text-slate-100 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              เร็ว ๆ นี้
            </button>
          </div>

          {/* Method 2: Mobile Banking Slip */}
          <div className="flex flex-col h-full bg-[#020617]/80 border border-slate-800/90 rounded-3xl px-5 py-6 md:px-6 md:py-7 shadow-[0_18px_45px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-400/40 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-white">
                  Mobile Banking
                </h2>
                <p className="text-[11px] md:text-xs text-gray-400">
                  โอนและอัปโหลดสลิปยืนยัน
                </p>
                <p className="text-[11px] md:text-xs text-green-400">
                  (ค่าธรรมเนียม 0%)
                </p>
              </div>
            </div>

            <div className="flex-1">
              <div className="text-xs text-gray-400 bg-slate-950/80 border border-dashed border-slate-800 rounded-2xl px-4 py-3 md:px-4 md:py-4">
                <p className="leading-relaxed">
                  โอนเข้าบัญชีที่ระบบกำหนดและอัปโหลดสลิปเพื่อให้ระบบตรวจสอบและเติมเครดิตให้
                </p>
                <p className="mt-2 text-[11px] text-yellow-300/90">
                  * ยังไม่เปิดให้ใช้งานจริงในตอนนี้
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSlip}
              className="mt-5 inline-flex items-center justify-center w-full px-4 py-2.5 rounded-2xl bg-slate-900 text-slate-100 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              เร็ว ๆ นี้
            </button>
          </div>

          {/* Method 3: PromptPay QR */}
          <div className="flex flex-col h-full bg-[#020617]/80 border border-slate-800/90 rounded-3xl px-5 py-6 md:px-6 md:py-7 shadow-[0_18px_45px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-white">
                  QR PromptPay
                </h2>
                <p className="text-[11px] md:text-xs text-gray-400">
                  สแกน QR โอนเงิน
                </p>
                <p className="text-[11px] md:text-xs text-green-400">
                  (ค่าธรรมเนียม 0%)
                </p>
              </div>
            </div>

            <div className="flex-1">
              <div className="text-xs text-gray-400 bg-slate-950/80 border border-dashed border-slate-800 rounded-2xl px-4 py-3 md:px-4 md:py-4">
                <p className="leading-relaxed">
                  เปิดแอปธนาคารของคุณ สแกน QR ที่ระบบจะแสดง
                  แล้วรอให้ระบบตรวจสอบและเติมเครดิตให้
                </p>
                <p className="mt-2 text-[11px] text-yellow-300/90">
                  * ยังไม่เปิดให้ใช้งานจริงในตอนนี้
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePromptpay}
              className="mt-5 inline-flex items-center justify-center w-full px-4 py-2.5 rounded-2xl bg-slate-900 text-slate-100 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              เร็ว ๆ นี้
            </button>
          </div>

          {/* Method 4: Coupon */}
          <div className="flex flex-col h-full bg-gradient-to-b from-purple-900/40 via-[#020617]/90 to-[#020617]/95 border border-purple-500/60 rounded-3xl px-5 py-6 md:px-6 md:py-7 shadow-[0_22px_55px_rgba(15,23,42,0.9)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/30 border border-purple-300/70 flex items-center justify-center">
                <Gift className="w-5 h-5 text-purple-50" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-white">
                  กรอกคูปอง
                </h2>
                <p className="text-[11px] md:text-xs text-purple-100/80">
                  กรอกโค้ดคูปองเพื่อรับเครดิต
                </p>
              </div>
            </div>

            <div className="flex-1">
              <div className="text-xs text-purple-50/80 bg-purple-950/60 border border-purple-500/60 rounded-2xl px-4 py-3 md:px-4 md:py-4">
                <p className="leading-relaxed">
                  ใช้คูปองที่ได้รับจากกิจกรรมหรือโปรโมชั่นพิเศษ
                  ระบบจะเพิ่มเครดิตเข้าบัญชีทันทีเมื่อใช้คูปองสำเร็จ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCoupon}
              className="mt-5 inline-flex items-center justify-center w-full px-4 py-2.5 rounded-2xl bg-fuchsia-500 text-white text-sm font-semibold hover:bg-fuchsia-400 transition-colors"
            >
              กรอกโค้ดคูปอง
            </button>
          </div>
        </div>
      </div>

      {/* Popup แจ้งเตือนทั่วไป (TrueMoney / Slip ยังไม่เปิด) */}
      <ModalDialog
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        title="แจ้งเตือน"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-md whitespace-pre-line leading-relaxed text-blue-300">
            {popupMessage}
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setPopupOpen(false)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </ModalDialog>

      {/* Popup เติมด้วยคูปอง */}
      <TopupCoupon open={couponOpen} onClose={() => setCouponOpen(false)} />
    </div>
  );
};

export default TopupPage;
