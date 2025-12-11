// app/profile/orders/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Package,
  KeyRound,
  List,
  Loader2,
  Clipboard,
  ClipboardCheck,
} from 'lucide-react';

const PAGE_SIZE = 20;

const OrdersPage = () => {
  const { data: session, status } = useSession();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [copiedKey, setCopiedKey] = useState(null); // <- ใช้เก็บ value ของ key ที่เพิ่ง copy

  const fetchOrders = async (pageNumber) => {
    try {
      setLoading(true);
      setLoadError('');

      const res = await fetch(
        `/api/profile/history?page=${pageNumber}&limit=${PAGE_SIZE}`,
        { cache: 'no-store' }
      );

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'โหลดประวัติการซื้อไม่สำเร็จ');
      }

      setOrders(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('load orders error', err);
      setLoadError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders(page);
    }
  }, [status, page]);

  // ตอนนี้รับแค่ value ไม่ต้องมี id
  const handleCopyKey = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(value);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* background effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[420px] h-[420px] bg-purple-900/15 rounded-full blur-[110px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[520px] h-[520px] bg-indigo-900/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* header */}
        <div className="mb-8 md:mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
            <List className="w-5 h-5 text-purple-200" />
          </div>
          <div>
            <h1 className="text-2xl md:3xl font-bold text-white tracking-tight">
              ประวัติการสั่งซื้อของฉัน
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              รายการสั่งซื้อทั้งหมดและสินค้า
            </p>
          </div>
        </div>

        {/* loading / error / empty */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <p className="text-gray-400 text-sm">
                กำลังโหลดประวัติการสั่งซื้อ...
              </p>
            </div>
          </div>
        )}

        {!loading && loadError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-2xl px-4 py-3 mb-4">
            {loadError}
          </div>
        )}

        {!loading && !loadError && orders.length === 0 && (
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl px-6 py-10 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-gray-500" />
            <p className="text-gray-300 font-medium mb-1">
              ยังไม่มีประวัติการสั่งซื้อ
            </p>
            <p className="text-sm text-gray-500">
              เมื่อคุณสั่งซื้อสินค้า รายการจะถูกแสดงในหน้านี้ พร้อมคีย์ / ไฟล์สำหรับดาวน์โหลด
            </p>
          </div>
        )}

        {/* list orders */}
        {!loading && !loadError && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const created = order.created_at
                ? new Date(order.created_at)
                : null;

              const createdText = created
                ? created.toLocaleString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                : '-';

              const totalPrice = Number(order.total_price ?? 0);
              const formattedPrice = totalPrice.toLocaleString('th-TH');

              const qty = Number(order.quantity ?? 0);

              return (
                <div
                  key={order.id}
                  className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
                >
                  {/* top row: product & basic info */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Package className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm sm:text-base text-white">
                            {order.product?.name || 'สินค้าไม่ระบุ'}
                          </p>
                          {order.product?.slug && (
                            <Link
                              href={`/products/${order.product.slug}`}
                              className="text-[11px] text-purple-300 underline underline-offset-4"
                            >
                              ดูหน้าสินค้า
                            </Link>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                        เวลาที่ทำรายการ  {createdText}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs sm:text-sm">
                      <div className="text-gray-400">
                        จำนวน:{' '}
                        <span className="text-gray-100 font-semibold">
                          {qty} ชิ้น
                        </span>
                      </div>
                      <div className="text-gray-400">
                        ยอดรวม:{' '}
                        <span className="text-emerald-300 font-semibold">
                          ฿{formattedPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* divider */}
                  <div className="h-px w-full bg-gray-800/80 my-1" />

                  {/* delivered content: keys / items */}
                  <div className="flex flex-col gap-3">
                    {/* keys: ตอนนี้เป็น array ของ string */}
                    {order.keys && order.keys.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
                          <KeyRound className="w-4 h-4" />
                          <span>คีย์ที่ได้รับ ({order.keys.length})</span>
                        </div>
                        <div className="space-y-1.5">
                          {order.keys.map((keyValue, idx) => (
                            <div
                              key={`${order.id}-key-${idx}`}
                              className="flex items-center justify-between gap-2 rounded-xl bg-gray-950/70 border border-gray-800 px-3 py-2"
                            >
                              <span className="text-xs sm:text-sm text-gray-100 break-all">
                                {keyValue}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyKey(keyValue)}
                                className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs bg-gray-800 hover:bg-gray-700 text-gray-100"
                              >
                                {copiedKey === keyValue ? (
                                  <>
                                    <ClipboardCheck className="w-3 h-3" />
                                    คัดลอกแล้ว
                                  </>
                                ) : (
                                  <>
                                    <Clipboard className="w-3 h-3" />
                                    คัดลอก
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* items: array ของ string เช่นกัน */}
                    {order.items && order.items.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-sky-200">
                          <span className="w-4 h-4 rounded-full border border-sky-400/60 flex items-center justify-center text-[10px]">
                            i
                          </span>
                          <span>ไอเท็มที่ได้รับ ({order.items.length})</span>
                        </div>
                        <ul className="list-disc list-inside text-xs sm:text-sm text-gray-200 space-y-0.5">
                          {order.items.map((value, idx) => (
                            <li
                              key={`${order.id}-item-${idx}`}
                              className="break-all"
                            >
                              {value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!order.keys?.length && !order.items?.length && (
                      <p className="text-xs text-gray-500 italic">
                        ออเดอร์นี้ยังไม่มีคีย์หรือไอเท็มผูกไว้
                        (อาจเป็นสินค้าอย่างอื่น)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* pagination */}
        {!loading && !loadError && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 text-xs sm:text-sm">
            <div className="text-gray-400">
              หน้า {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-900 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800"
              >
                ก่อนหน้า
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-900 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
