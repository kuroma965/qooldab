'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '@/lib/Cats-Prod-Db';
import ProductCard from '@/components/common/ProductCard';

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

export default function CategoryProducts({ slug }) {
  const [items, setItems] = useState([]);
  const [itemsVisible, setItemsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!slug) return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // ดึงทุก product มาก่อน (เหมือนหน้า all products)
        const res = await fetchProducts({}, { ensureCategories: true });
        const all = res.items ?? [];

        // mark isPopular จากยอดขาย (top 4)
        const sorted = [...all].sort(
          (a, b) => Number(b.sold || 0) - Number(a.sold || 0)
        );
        const topIds = new Set(sorted.slice(0, 4).map(p => Number(p.id)));
        const enriched = (all || []).map(p => ({
          ...p,
          isPopular: topIds.has(Number(p.id)),
        }));

        // filter ตาม slug ของหมวด
        const slugLower = String(slug).toLowerCase();
        const onlyThisCategory = enriched.filter(p => {
          const catSlug =
            (p.category_slug && String(p.category_slug)) ||
            (p.category && typeof p.category === 'object' && p.category.slug);

          if (catSlug && String(catSlug).toLowerCase() === slugLower) {
            return true;
          }

          // fallback: เทียบกับชื่อ ถ้า backend ไม่มี slug ติดมา
          const catName =
            p.category_name ||
            (typeof p.category === 'string'
              ? p.category
              : p.category?.name ?? null);

          if (catName && String(catName).toLowerCase() === slugLower) {
            return true;
          }

          return false;
        });

        if (!mounted) return;
        setItems(onlyThisCategory);
        setTimeout(() => mounted && setItemsVisible(true), 60);
      } catch (err) {
        console.error('load category products error', err);
        if (mounted) setError(err?.message || 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const filtered = useMemo(() => {
    if (!q) return items;
    const qq = q.trim().toLowerCase();
    return (items || []).filter(p => {
      return (
        (p.name && String(p.name).toLowerCase().includes(qq)) ||
        (p.category_name &&
          String(p.category_name).toLowerCase().includes(qq)) ||
        (p.slug && String(p.slug).toLowerCase().includes(qq))
      );
    });
  }, [items, q]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-950 min-h-screen">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            สินค้าในหมวด: {slug}
          </h1>
          <p className="text-gray-400">Products in this category</p>
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
          <div className="text-gray-400">ไม่พบสินค้าในหมวดนี้</div>
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
