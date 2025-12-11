// components/Categories.jsx
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCategoriesList } from '@/lib/Cats-Prod-Db';
import { RefreshCw, Search } from 'lucide-react';

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1511512578047-d6360b94f7fb?auto=format&fit=crop&w=1200&q=80';

const CategorySkeleton = () => (
  <div className="relative group w-full overflow-hidden rounded-xl aspect-[3.3/1] animate-pulse">
    <div className="h-full w-full bg-gray-800 rounded-xl" />
    <div className="absolute left-4 bottom-4">
      <div className="h-8 bg-gray-700 rounded w-32 mb-2" />
    </div>
  </div>
);

/* Category card used in grid */
function CategoryCard({ category, index, onOpen }) {
  const img =
    category.image ??
    category.cover ??
    category.banner ??
    PLACEHOLDER_IMG;
  const name =
    category.name ?? category.title ?? category.slug ?? 'หมวดหมู่';
  const slug =
    category.slug ??
    (category.id
      ? String(category.id)
      : encodeURIComponent(String(name)));

  const delayMs = index * 60;

  return (
    <div
      className="transform transition-all duration-200 opacity-100 translate-y-0"
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <button
        onClick={() => onOpen(slug)}
        className="relative group w-full aspect-[3.3/1] rounded-xl overflow-hidden shadow-sm bg-gray-800 hover:scale-103 transform transition-transform duration-200"
        aria-label={`Open category ${name}`}
      >
        <div className="relative h-full w-full">
          <Image
            src={img}
            alt={name}
            fill
            style={{ objectFit: 'cover' }} // ไม่บี้รูป แค่ครอปส่วนเกิน
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute left-4 bottom-4">
            <div className="text-white text-lg font-extrabold drop-shadow-md line-clamp-1 text-start">
              {name}
            </div>
            {category.description && (
              <div className="text-xs text-gray-300 mt-1 max-w-xs line-clamp-1">
                {category.description}
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-transparent group-hover:bg-purple-600/10 transition-colors duration-200" />
        </div>
      </button>
    </div>
  );
}

export default function CategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // client-side search
  const [filter, setFilter] = useState('');

  // fetch all categories (no pagination)
  const loadCategories = async (opts = { forceReload: false }) => {
    try {
      setLoading(true);
      setError(null);
      const cats = await getCategoriesList({
        forceReload: !!opts.forceReload,
      });
      setCategories(cats ?? []);
    } catch (err) {
      console.error('loadCategories error', err);
      setError(err?.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadCategories({ forceReload: false });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const openCategory = (slug) => {
    router.push(`/categories/${slug}`);
  };

  const filtered = useMemo(() => {
    if (!filter) return categories;
    const q = filter.trim().toLowerCase();
    return (categories || []).filter((c) => {
      return (
        (c.name && String(c.name).toLowerCase().includes(q)) ||
        (c.slug && String(c.slug).toLowerCase().includes(q)) ||
        (c.description &&
          String(c.description).toLowerCase().includes(q))
      );
    });
  }, [categories, filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-950 min-h-screen">
      {/* header + search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6">
        {/* ซ้าย: Title */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            หมวดหมู่ทั้งหมด
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            All categories
          </p>
        </div>

        {/* ขวา: search + refresh (มือถือจะซ้อนเป็นสองแถว) */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* search box with lucide Search icon */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาหมวดหมู่..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-900 text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition"
              aria-label="ค้นหาหมวดหมู่"
            />
          </div>

          {/* refresh button with Lucide RefreshCw */}
          <button
            onClick={() => loadCategories({ forceReload: true })}
            title="Refresh categories"
            className="inline-flex justify-center items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 text-sm rounded-lg text-gray-100 hover:bg-gray-800 hover:border-purple-500 hover:text-white transition-colors duration-200 w-full sm:w-auto"
            aria-label="รีเฟรชหมวดหมู่"
          >
            <RefreshCw className="w-4 h-4" />
            รีเฟรช
          </button>
        </div>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategorySkeleton key={`sk-${i}`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-400">ไม่พบหมวดหมู่</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
            {filtered.map((c, i) => (
              <CategoryCard
                key={c.id ?? c.slug ?? i}
                category={c}
                index={i}
                onOpen={openCategory}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
