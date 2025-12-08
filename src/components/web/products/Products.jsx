// components/Products.jsx
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/lib/Cats-Prod-Db';
import ProductCard from '@/components/common/ProductCard'; // <-- new

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1511512578047-d6360b94f7fb?auto=format&fit=crop&w=1200&q=80';
const NEW_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

/* Icons (used only by skeleton) */
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

/* Skeleton */
const ProductSkeleton = () => (
  <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-800 animate-pulse">
    <div className="h-48 w-full bg-gray-800" />
    <div className="p-4">
      <div className="h-6 bg-gray-700 rounded mb-2 w-3/4" />
      <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
      <div className="flex justify-between mb-4">
        <div className="h-8 bg-gray-700 rounded w-1/3" />
        <div className="h-8 bg-gray-700 rounded w-1/3" />
      </div>
      <div className="h-10 bg-gray-700 rounded-lg w-full" />
    </div>
  </div>
);

/* Main Products page component */
export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsVisible, setItemsVisible] = useState(false);

  // simple client-side search
  const [q, setQ] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // fetch all products, ensure categories attached
        const res = await fetchProducts({}, { ensureCategories: true });
        if (!mounted) return;
        const all = res.items ?? [];

        // mark top-sold as isPopular (top 4 by sold)
        const sorted = [...all].sort((a, b) => (Number(b.sold || 0) - Number(a.sold || 0)));
        const topIds = new Set(sorted.slice(0, 4).map((p) => Number(p.id)));
        const enriched = (all || []).map((p) => ({ ...p, isPopular: topIds.has(Number(p.id)) }));

        setItems(enriched);
      } catch (err) {
        console.error('load products error', err);
        if (mounted) setError(err?.message || 'Failed to load products');
      } finally {
        if (mounted) {
          setLoading(false);
          // small stagger so items animate in
          setTimeout(() => setItemsVisible(true), 60);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!q) return items;
    const qq = q.trim().toLowerCase();
    return (items || []).filter((p) => {
      return (
        (p.name && String(p.name).toLowerCase().includes(qq)) ||
        (p.category_name && String(p.category_name).toLowerCase().includes(qq)) ||
        (p.category && String(p.category).toLowerCase().includes(qq)) ||
        (p.slug && String(p.slug).toLowerCase().includes(qq))
      );
    });
  }, [items, q]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-950 min-h-screen">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">สินค้าทั้งหมด</h1>
          <p className="text-gray-400">All products</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="ค้นหาสินค้า..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800 text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            aria-label="ค้นหาสินค้า"
          />
          <button
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                const res = await fetchProducts({}, { ensureCategories: true });
                const all = res.items ?? [];
                // reapply isPopular marking
                const sorted = [...all].sort((a, b) => (Number(b.sold || 0) - Number(a.sold || 0)));
                const topIds = new Set(sorted.slice(0, 4).map((p) => Number(p.id)));
                const enriched = (all || []).map((p) => ({ ...p, isPopular: topIds.has(Number(p.id)) }));
                setItems(enriched);
                setQ('');
              } catch (err) {
                console.error(err);
                setError(err?.message || 'Failed to refresh');
              } finally {
                setLoading(false);
              }
            }}
            className="inline-flex items-center px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-sm hover:bg-gray-800/90"
          >
            <svg className='w-5 h-5 mr-1' fill="#ffffff" viewBox="0 0 24.00 24.00" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier"></g><g id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path d="M19.146 4.854l-1.489 1.489A8 8 0 1 0 12 20a8.094 8.094 0 0 0 7.371-4.886 1 1 0 1 0-1.842-.779A6.071 6.071 0 0 1 12 18a6 6 0 1 1 4.243-10.243l-1.39 1.39a.5.5 0 0 0 .354.854H19.5A.5.5 0 0 0 20 9.5V5.207a.5.5 0 0 0-.854-.353z"></path> </g></svg>
            รีเฟรช
          </button>
        </div>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-400">ไม่พบสินค้า</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p, i) => (
              <ProductCard key={p.id ?? i} product={p} index={i} itemsVisible={itemsVisible} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
