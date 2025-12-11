// components/Products.jsx
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/lib/Cats-Prod-Db';
import ProductCard from '@/components/common/ProductCard';
import { RefreshCw, Search } from 'lucide-react';

const NEW_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

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

export default function ProductsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsVisible, setItemsVisible] = useState(false);

  const [q, setQ] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchProducts({}, { ensureCategories: true });
        if (!mounted) return;
        const all = res.items ?? [];

        // top-sold → isPopular
        const sorted = [...all].sort(
          (a, b) => Number(b.sold || 0) - Number(a.sold || 0),
        );
        const topIds = new Set(sorted.slice(0, 4).map((p) => Number(p.id)));
        const enriched = (all || []).map((p) => ({
          ...p,
          isPopular: topIds.has(Number(p.id)),
        }));

        setItems(enriched);
      } catch (err) {
        console.error('load products error', err);
        if (mounted) setError(err?.message || 'Failed to load products');
      } finally {
        if (mounted) {
          setLoading(false);
          setTimeout(() => setItemsVisible(true), 60);
        }
      }
    })();
    return () => {
      mounted = false;
    };
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
      {/* header + search */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        {/* Left: Title */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            สินค้าทั้งหมด
          </h1>
          <p className="text-gray-400 text-sm md:text-base">All products</p>
        </div>

        {/* Right: search + refresh */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* search box with lucide Search icon */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-900 text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
              aria-label="ค้นหาสินค้า"
            />
          </div>

          {/* refresh button with lucide RefreshCw */}
          <button
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                const res = await fetchProducts({}, { ensureCategories: true });
                const all = res.items ?? [];
                const sorted = [...all].sort(
                  (a, b) => Number(b.sold || 0) - Number(a.sold || 0),
                );
                const topIds = new Set(
                  sorted.slice(0, 4).map((p) => Number(p.id)),
                );
                const enriched = (all || []).map((p) => ({
                  ...p,
                  isPopular: topIds.has(Number(p.id)),
                }));
                setItems(enriched);
                setQ('');
              } catch (err) {
                console.error(err);
                setError(err?.message || 'Failed to refresh');
              } finally {
                setLoading(false);
              }
            }}
            className="inline-flex justify-center items-center px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 text-sm text-gray-100 hover:bg-gray-800 hover:border-purple-500 hover:text-white transition-colors duration-200 w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            รีเฟรช
          </button>
        </div>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-400">ไม่พบสินค้า</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id ?? i}
                product={p}
                index={i}
                itemsVisible={itemsVisible}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
