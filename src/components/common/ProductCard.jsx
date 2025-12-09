// components/common/ProductCard.jsx
'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const FireIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path
      fillRule="evenodd"
      d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
      clipRule="evenodd"
    />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

// ✅ ฟังก์ชัน format ตัวเลข: 200000000 -> 200,000,000 (locale TH)
const formatNumber = (value, fallback = 0) => {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n)) return String(fallback);
  return n.toLocaleString('th-TH');
};

export default function ProductCard({ product = {}, index = 0, itemsVisible = true }) {
  const router = useRouter();
  const NEW_MS = 15 * 24 * 60 * 60 * 1000;

  // product.image -> try to show; if error -> show /logo.png (from public) with reduced opacity;
  // if /logo.png also missing, show SVG box fallback.
  const [imgUrl, setImgUrl] = useState(product.image ? String(product.image) : '');
  const [imgErrored, setImgErrored] = useState(false);

  useEffect(() => {
    setImgUrl(product.image ? String(product.image) : '');
    setImgErrored(false);
  }, [product.image]);

  // stock handling
  const stockNum = Number(product.stock ?? product.qty ?? 0);
  const outOfStock = Number.isFinite(stockNum) ? stockNum <= 0 : false;

  const enterClass = itemsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';
  const delayMs = index * 40;
  const isNew = product.created_at ? Date.now() - new Date(product.created_at).getTime() <= NEW_MS : false;
  const disabledCardClasses = outOfStock ? 'opacity-70 filter grayscale' : '';

  const originalPrice = product.originalPrice ?? product.original_price;
  const currentPrice = product.price ?? 0;

  return (
    <div
      className={`rounded-2xl shadow-lg overflow-hidden border border-purple-800 transform transition-all duration-300 ${
        outOfStock ? '' : 'hover:scale-104 hover:shadow-xl'
      } ${enterClass} ${disabledCardClasses}`}
      style={{ transitionDelay: `${delayMs}ms` }}
      aria-hidden={outOfStock ? 'true' : 'false'}
    >
      <div className="relative h-48 w-full bg-gray-800 overflow-hidden">
        {/* ✅ โลโก้เล็กตรงกลางเป็นพื้นหลัง */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="logo fallback"
            width={110}
            height={110}
            className="object-contain opacity-40"
            priority={index < 4}
          />
        </div>

        {/* ✅ รูปสินค้าทับด้านบน ถ้าโหลดพัง -> ซ่อน โลโก้ข้างล่างยังอยู่ */}
        {imgUrl && !imgErrored && (
          <Image
            src={imgUrl}
            alt={product.name || 'product'}
            fill
            className="object-cover"
            onError={() => setImgErrored(true)}
            loading={index < 4 ? 'eager' : 'lazy'}
          />
        )}

        {/* BADGES เหมือนเดิม แต่ให้ลอยอยู่บนสุด */}
        {isNew && !outOfStock && (
          <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            ใหม่
          </div>
        )}

        {outOfStock && (
          <div className="absolute top-3 left-3 bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            สินค้าหมด
          </div>
        )}

        {product.isPopular && (
          <div
            className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${
              outOfStock ? 'bg-yellow-400/40 text-black/60' : 'bg-yellow-500 text-black'
            } z-10`}
            aria-hidden
          >
            <FireIcon /> ยอดนิยม
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-lg font-bold text-white line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{product.category_name ?? product.category ?? ''}</p>

        <div className="flex items-center justify-between mt-3 mb-4">
          <div className="bg-purple-500 px-3 rounded-2xl py-1.5">
            {Number(originalPrice || 0) > Number(currentPrice || 0) && (
              <div className="text-sm text-gray-200 line-through">
                ฿{formatNumber(originalPrice)}
              </div>
            )}
            <div className="text-xl font-bold text-white">
              {Number(currentPrice || 0) === 0 ? 'ฟรี!' : `฿${formatNumber(currentPrice)}`}
            </div>
          </div>

          <div className="text-right text-sm text-gray-300">
            <div>
              เหลือ:{' '}
              <span className="font-semibold text-white">
                {formatNumber(product.stock ?? product.qty ?? 0)}
              </span>{' '}
              ชิ้น
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              if (outOfStock) return;
              router.push(`/products/${product.slug ?? product.id}`);
            }}
            disabled={outOfStock}
            aria-disabled={outOfStock}
            className={`flex-1 ${
              outOfStock
                ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            } font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2`}
            title={outOfStock ? 'สินค้าหมด' : 'สั่งซื้อสินค้า'}
          >
            <CartIcon /> {outOfStock ? 'ไม่สามารถซื้อได้' : 'สั่งซื้อสินค้า'}
          </button>
        </div>

        <div className="text-xs text-center text-gray-300 mt-3">
          <div className="mt-1">
            จำหน่ายแล้ว:{' '}
            <span className="font-semibold text-white">
              {formatNumber(product.sold ?? 0)}
            </span>{' '}
            ชิ้น
          </div>
        </div>
      </div>
    </div>
  );
}
