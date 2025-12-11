// components/Product.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchProducts } from '@/lib/Cats-Prod-Db';
import { createOrder } from '@/lib/Orders-Db';
import { Minus, Plus } from 'lucide-react';
import ModalDialog from '@/components/common/ModalDialog';
import PageLoadingOverlay from '@/components/common/PageLoadingOverlay';
import { useSession } from 'next-auth/react';


const ProductDetailPage = ({ slug }) => {
  const { update } = useSession();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);

  // popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupStatus, setPopupStatus] = useState('success'); // success | error

  // ✅ state สำหรับจัดการรูปสินค้า + fallback logo (เหมือนโค้ด ProductCard)
  const [imgUrl, setImgUrl] = useState('');
  const [imgErrored, setImgErrored] = useState(false);

  // โหลด product จาก slug
  useEffect(() => {
    if (!slug) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const res = await fetchProducts({}, { ensureCategories: true });
        const all = res.items || [];
        const targetSlug = String(slug).toLowerCase();
        const item = all.find(
          (p) => p.slug && String(p.slug).toLowerCase() === targetSlug
        );

        if (!mounted) return;

        if (!item) {
          setLoadError('ไม่พบสินค้า');
        } else {
          setProduct(item);
          setQty(1);
        }
      } catch (err) {
        console.error('load product error', err);
        if (mounted)
          setLoadError(err.message || 'โหลดข้อมูลสินค้าไม่สำเร็จ');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // 🔹 บังคับเลื่อนกลับขึ้นบนสุดทุกครั้งที่เข้า
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    return () => {
      mounted = false;
    };
  }, [slug]);

  // ✅ sync imgUrl กับ product.image ทุกครั้งที่เปลี่ยน
  useEffect(() => {
    if (product && product.image) {
      setImgUrl(String(product.image));
    } else {
      setImgUrl('');
    }
    setImgErrored(false);
  }, [product && product.image]);

  const handleQtyChange = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    let v = Math.floor(n);
    if (v < 1) v = 1;

    if (product && product.stock != null && product.stock > 0) {
      if (v > product.stock) v = product.stock;
    }
    setQty(v);
  };

  const handleBuy = async () => {
    if (!product || !product.id) return;
    if (qty <= 0) return;

    try {
      setBuying(true);
      setPopupOpen(false);

      const res = await createOrder({
        productId: product.id,
        quantity: qty,
      });

      // ✅ สั่งซื้อสำเร็จ → ให้ next-auth ดึง session ใหม่จาก DB (เครดิตจะอัปเดต)
      await update();

      setProduct((prev) =>
        prev
          ? {
            ...prev,
            stock: prev.stock != null ? prev.stock - qty : prev.stock,
            sold: (prev.sold ?? 0) + qty,
          }
          : prev
      );

      setPopupStatus('success');
      setPopupMessage(
        res?.message || `ซื้อสำเร็จ! ใบสั่งซื้อ #${res?.order?.id ?? ''}`
      );
      setPopupOpen(true);
    } catch (err) {
      console.error('buy error', err);
      setPopupStatus('error');
      setPopupMessage(err.message || 'ไม่สามารถทำรายการซื้อได้');
      setPopupOpen(true);
    } finally {
      setBuying(false);
    }
  };

  const disabled =
    buying ||
    loading ||
    !product ||
    (product && product.stock != null && product.stock <= 0);

  // --- UI Loading / Error ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-400 animate-pulse">
            กำลังโหลดข้อมูลสินค้า...
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-900/50 rounded-2xl border border-gray-800">
          <div className="text-red-400 text-lg font-semibold mb-2">
            ข้อผิดพลาด
          </div>
          <div className="text-gray-400">
            {loadError || 'ไม่พบสินค้าที่คุณต้องการ'}
          </div>
        </div>
      </div>
    );
  }

  const { name, description, price, category_name, stock, sold } = product;

  const unitPrice = Number(price ?? 0);
  const formattedPrice = unitPrice.toLocaleString('th-TH');
  const totalPrice = unitPrice * qty;
  const formattedTotal = totalPrice.toLocaleString('th-TH');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-purple-500/30">
      {/* ✅ Overlay ตอนกำลังสั่งซื้อ */}
      <PageLoadingOverlay
        open={buying}
        label="กำลังทำรายการซื้อของคุณ..."
      />

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Layout Grid: แบ่งเป็น 12 ส่วน */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* --- ฝั่งซ้าย (Desktop): รูปภาพ + รายละเอียด --- */}
          <div className="w-full lg:col-span-8 space-y-8">
            {/* 1. รูปภาพสินค้า + logo fallback แบบ ProductCard */}
            <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl ring-1 ring-white/5">
              {/* ✅ โลโก้ตรงกลางเป็นพื้นหลังตลอดเวลา */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="logo fallback"
                  width={200}
                  height={200}
                  className="object-contain opacity-40"
                  priority
                />
              </div>

              {/* ✅ รูปสินค้าทับด้านบน ถ้าโหลดพัง -> ซ่อน (จะเห็นแต่โลโก้) */}
              {imgUrl && !imgErrored && (
                <Image
                  src={imgUrl}
                  alt={name}
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                  onError={() => setImgErrored(true)}
                />
              )}
            </div>

            {/* 2. Description (แสดงเฉพาะในจอ Desktop) */}
            {description && (
              <div className="hidden lg:block bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white mb-4">
                  รายละเอียดสินค้า
                </h2>
                <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed whitespace-pre-line">
                  {description}
                </div>
              </div>
            )}
          </div>

          {/* --- ฝั่งขวา (Desktop): ข้อมูลการซื้อ --- */}
          <div className="w-full lg:col-span-4 lg:sticky lg:top-24 h-fit flex flex-col gap-6">
            {/* Header Info */}
            <div>
              {category_name && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-3">
                  {category_name}
                </span>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
                {name}
              </h1>
            </div>

            {/* Price & Stock Card */}
            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-sm shadow-lg">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">ราคาต่อชิ้น</p>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">
                    ฿{formattedPrice}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">สถานะสินค้า</div>
                  {stock != null && stock > 0 ? (
                    <div className="inline-flex items-center gap-1.5 text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      พร้อมจำหน่าย ({stock})
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-red-400 text-sm font-medium bg-red-400/10 px-2 py-1 rounded-md">
                      สินค้าหมด
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-gray-800 my-4" />

              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>ยอดขายแล้ว</span>
                <span className="text-gray-200 font-semibold">
                  {sold ?? 0} ชิ้น
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-4">
              <div className="flex flex-col gap-4">
                {/* Quantity Control */}
                <div className="flex items-center justify-between bg-gray-950 rounded-xl p-1.5 border border-gray-800 w-full">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(qty - 1)}
                    disabled={qty <= 1 || disabled}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30 disabled:hover:bg-gray-800 transition-colors active:scale-95"
                  >
                    <Minus size={20} />
                  </button>

                  <div className="flex-1 px-2">
                    <input
                      type="number"
                      min={1}
                      max={stock != null && stock > 0 ? stock : undefined}
                      value={qty}
                      onChange={(e) => handleQtyChange(e.target.value)}
                      className="w-full text-center bg-transparent outline-none border-none text-lg font-semibold text-white [appearance:textfield] 
                 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQtyChange(qty + 1)}
                    disabled={disabled || (stock != null && qty >= stock)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30 disabled:hover:bg-gray-800 transition-colors active:scale-95"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Total Price & Buy Button */}
                <button
                  type="button"
                  onClick={handleBuy}
                  disabled={disabled}
                  className="group relative w-full overflow-hidden rounded-xl bg-purple-600 p-4 transition-all hover:bg-purple-500 disabled:bg-gray-800 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <span className="font-semibold text-white/90 group-disabled:text-gray-500 whitespace-nowrap">
                      {buying ? 'กำลังดำเนินการ...' : 'สั่งซื้อทันที'}
                    </span>
                    {!buying && (
                      <span className="font-bold text-white text-lg group-disabled:text-gray-500 whitespace-nowrap">
                        ฿{formattedTotal}
                      </span>
                    )}
                  </div>
                  {!disabled && (
                    <div className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  )}
                </button>
              </div>
            </div>

            {/* Description (Mobile) */}
            {description && (
              <div className="block lg:hidden mt-4 prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed whitespace-pre-line px-1">
                <h2 className="text-lg font-semibold text-white mb-2">
                  รายละเอียด
                </h2>
                {description}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup Notification – ใช้ ModalDialog กลาง */}
      <ModalDialog
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupStatus === 'success' ? 'เรียบร้อย!' : 'เกิดข้อผิดพลาด'}
        size="sm"
      >
        <div className="space-y-4">
          <p
            className={`text-md whitespace-pre-line leading-relaxed ${popupStatus === 'success' ? 'text-emerald-300' : 'text-red-300'
              }`}
          >
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
    </div>
  );
};

export default ProductDetailPage;
