// components/Home.jsx
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchProducts, getCategoriesList } from '@/lib/Cats-Prod-Db';
import { getAnnouncements } from '@/lib/Announcements-Db';
import ProductCard from '@/components/common/ProductCard';
import { ArrowRight } from 'lucide-react';

const NEW_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

// --- Skeletons ---
const GameCardSkeleton = () => (
  <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-800 animate-pulse">
    <div className="h-44 w-full bg-gray-800" />
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

const CategorySkeleton = () => (
  <div className="relative group w-full overflow-hidden rounded-xl aspect-[3.3/1] animate-pulse">
    <div className="h-full w-full bg-gray-800 rounded-xl" />
    <div className="absolute left-4 bottom-4">
      <div className="h-8 bg-gray-700 rounded w-32 mb-2" />
    </div>
  </div>
);

// --- Component ---
export default function Home() {
  const router = useRouter();

  // meta states
  const [recommended, setRecommended] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topSoldIds, setTopSoldIds] = useState([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  // animation trigger for items
  const [itemsVisible, setItemsVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setMetaLoading(true);
        setMetaError(null);

        const [cats, sample, anns] = await Promise.all([
          getCategoriesList({ forceReload: false }),
          fetchProducts(),
          getAnnouncements({ forceReload: false, limit: 5 }).catch(() => []),
        ]);

        if (!mounted) return;

        setCategories(cats ?? []);

        const all = sample.items ?? [];
        const sorted = [...all].sort(
          (a, b) => Number(b.sold || 0) - Number(a.sold || 0)
        );

        setTopSoldIds(sorted.slice(0, 4).map((i) => Number(i.id)));
        setRecommended(sorted.slice(0, 8));

        setAnnouncements(Array.isArray(anns) ? anns : []);
      } catch (err) {
        console.error('meta load error', err);
        if (mounted)
          setMetaError(err.message || 'เกิดข้อผิดพลาดขณะโหลดข้อมูล');
      } finally {
        if (mounted) {
          setMetaLoading(false);
          setTimeout(() => setItemsVisible(true), 60);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // annotate recommended items with isNew/isPopular
  const recommendedFiltered = useMemo(() => {
    const now = Date.now();
    return (recommended || []).map((it) => ({
      ...it,
      category_name: it.category_name ?? it.category ?? null,
      isNew: it.created_at
        ? now - new Date(it.created_at).getTime() <= NEW_MS
        : false,
      isPopular: topSoldIds.includes(Number(it.id)),
    }));
  }, [recommended, topSoldIds]);

  const quickCats = useMemo(
    () => (categories || []).slice(0, 4),
    [categories]
  );

  const CategoryTile = ({ c, index }) => {
    const img = c.image ?? c.cover;
    const name = c.name ?? c.title ?? c.slug ?? 'หมวดหมู่';
    const slug =
      c.slug ?? (c.id ? String(c.id) : encodeURIComponent(String(name)));

    const enterClass = itemsVisible
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-4';
    const delayMs = index * 100;

    return (
      <div
        className={`transform transition-all duration-200 ${enterClass}`}
        style={{ transitionDelay: `${delayMs}ms` }}
      >
        <button
          onClick={() => router.push(`/categories/${slug}`)}
          className="relative group w-full aspect-[3.3/1] overflow-hidden rounded-xl hover:scale-103 transform transition-transform duration-200"
          aria-label={`Open category ${name}`}
        >
          <div className="relative h-full w-full bg-gray-800 rounded-xl overflow-hidden">
            <Image
              src={img}
              alt={name}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute left-4 bottom-4 text-left">
              <div className="text-white text-2xl font-extrabold drop-shadow-md">
                {name}
              </div>
            </div>
            <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-950 min-h-screen">
      <div className="relative mb-6 px-2">
        <div className="absolute left-45 -top-10 w-48 h-48 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            <span className="mr-3 bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              Qooldab
            </span>
            Store
          </h1>
          <p className="text-lg text-gray-400 font-light leading-relaxed max-w-2xl">
            ค้นพบสินค้าออนไลน์ยอดนิยม
            <span className="mx-2 font-medium text-purple-200">
              ROV · Freefire · PUBG · Roblox
            </span>
            และอื่นๆ อีกมากมาย
          </p>
          <div className="mt-5 h-1.5 w-70 md:w-160 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
        </div>
      </div>

      {/* Categories */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1 h-6 bg-purple-500 rounded-full" />
              <h1 className="text-2xl font-bold text-white tracking-wide">หมวดหมู่</h1>
            </div>
            <h2 className="text-sm text-gray-400 pl-3">Category Recommended</h2>
          </div>
          <button
            onClick={() => router.push('/categories')}
            className="group text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-all duration-200 hover:gap-2 px-3 py-1.5 rounded-full hover:bg-purple-900/20"
          >
            เลือกดูทั้งหมด <ArrowRight className="h-4 w-4 group-hover:text-white" />
          </button>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {metaLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <CategorySkeleton key={`cat-skel-${i}`} />
            ))
          ) : quickCats.length === 0 ? (
            <div className="text-gray-400 col-span-2 py-10 text-center border border-dashed border-gray-800 rounded-xl">ยังไม่มีหมวดหมู่</div>
          ) : (
            quickCats.map((c, i) => (
              <CategoryTile key={c.id ?? c.slug ?? i} c={c} index={i} />
            ))
          )}
        </div>
      </section>

      {/* Recommended */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1 h-6 bg-purple-500 rounded-full" />
              <h2 className="text-2xl font-bold text-white tracking-wide">สินค้าแนะนำ</h2>
            </div>
            <h2 className="text-sm text-gray-400 pl-3">Product Recommended</h2>
          </div>
          <button
            onClick={() => router.push('/products')}
            className="group text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-all duration-200 hover:gap-2 px-3 py-1.5 rounded-full hover:bg-purple-900/20"
          >
            ดูทั้งหมด <ArrowRight className="h-4 w-4 group-hover:text-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {metaLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <GameCardSkeleton key={`prod-skel-${i}`} />
            ))
          ) : recommendedFiltered.length > 0 ? (
            recommendedFiltered
              .slice(0, 8)
              .map((p, i) => (
                <ProductCard
                  key={p.id ?? i}
                  product={p}
                  index={i}
                  itemsVisible={itemsVisible}
                />
              ))
          ) : (
            <div className="text-gray-400 col-span-4 py-10 text-center border border-dashed border-gray-800 rounded-xl">
              ไม่พบสินค้าที่แนะนำ
            </div>
          )}
        </div>
      </section>

      {metaError && (
        <div className="text-red-400 mt-4">ข้อผิดพลาด: {metaError}</div>
      )}
    </div>
  );
}