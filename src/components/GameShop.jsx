// components/GameShop.jsx
'use client';
import Image from 'next/image';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Skeleton card
const GameCardSkeleton = () => (
    <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-purple-800 animate-pulse">
        <div className="h-48 w-full bg-gray-800" />
        <div className="p-4">
            <div className="h-6 bg-gray-700 rounded mb-2 w-3/4" />
            <div className="h-4 bg-gray-700 rounded w-1/2" />
            <div className="mt-4 h-10 bg-purple-700 rounded-lg w-full" />
        </div>
    </div>
);

// Filter Modal (unchanged)
const FilterModal = ({ isOpen, onClose, categories, selectedCategory, setSelectedCategory, sortBy, setSortBy, priceRange, setPriceRange }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">ตัวกรอง</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">หมวดหมู่</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        >
                            <option value="All">All</option>
                            {categories.map((c) => (
                                <option key={c.id ?? c.slug ?? c.name ?? c} value={c.slug ?? c.name ?? c}>
                                    {c.name ?? c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">เรียงตาม</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        >
                            <option value="name">ชื่อเกม</option>
                            <option value="price-asc">ราคา: ต่ำ-สูง</option>
                            <option value="price-desc">ราคา: สูง-ต่ำ</option>
                            <option value="rating">คะแนนสูงสุด</option>
                            <option value="sold">ยอดขาย</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">ช่วงราคา</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Number(e.target.value || 0), priceRange[1]])}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                placeholder="ต่ำสุด"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="number"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value || 0)])}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                                placeholder="สูงสุด"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        ใช้ตัวกรอง
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function GameShop({ initialQuery = '' }) {
    const router = useRouter();
    const API_PRODUCTS = '/api/admin/products';
    const API_CATEGORIES = '/api/admin/categories';
    const ITEMS_PER_PAGE = 12;

    const [games, setGames] = useState([]);
    const [recommendedGames, setRecommendedGames] = useState([]);
    const [categories, setCategories] = useState([]);
    const [topSoldIds, setTopSoldIds] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialQuery);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('name');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [showFilterModal, setShowFilterModal] = useState(false);

    // debounce search
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // load categories and a product sample to determine recommended/top-sold
    useEffect(() => {
        let mounted = true;
        async function loadMeta() {
            try {
                // categories
                const cRes = await fetch(`${API_CATEGORIES}?limit=50`, { cache: 'no-store' });
                if (cRes.ok) {
                    const cJson = await cRes.json().catch(() => null);
                    const cItems = Array.isArray(cJson) ? cJson : cJson?.items ?? [];
                    if (mounted) setCategories(cItems);
                }

                // fetch sample products to compute top sold / recommended
                const manyRes = await fetch(`${API_PRODUCTS}?limit=200`, { cache: 'no-store' });
                if (manyRes.ok) {
                    const manyJson = await manyRes.json().catch(() => null);
                    const manyItems = manyJson?.items ?? (Array.isArray(manyJson) ? manyJson : []);
                    if (mounted) {
                        const sortedBySold = [...manyItems].sort((a, b) => (Number(b.sold || 0) - Number(a.sold || 0)));
                        setTopSoldIds(sortedBySold.slice(0, 4).map(i => Number(i.id)));
                        setRecommendedGames(sortedBySold.slice(0, 8));
                    }
                }
            } catch (err) {
                console.error('loadMeta error', err);
            }
        }
        loadMeta();
        return () => { mounted = false; };
    }, []);

    // fetch products (paged)
    const fetchGames = useCallback(async (search = '', pageNum = 1, append = false) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (search) params.set('q', search);
            params.set('page', String(pageNum));
            params.set('limit', String(ITEMS_PER_PAGE));

            const res = await fetch(`${API_PRODUCTS}?${params.toString()}`, { cache: 'no-store' });
            if (!res.ok) {
                const j = await res.json().catch(() => null);
                throw new Error(j?.error || `Failed to load products (${res.status})`);
            }
            const json = await res.json();
            const items = json?.items ?? (Array.isArray(json) ? json : []);
            const tot = json?.total ?? (Array.isArray(json) ? items.length : 0);

            if (append) setGames(prev => [...prev, ...items]);
            else setGames(items);

            setTotal(tot);
            setHasMore((pageNum * ITEMS_PER_PAGE) < tot);
        } catch (err) {
            console.error('fetchGames error', err);
            setError(err.message || 'Unknown error');
            if (!append) setGames([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // load when search/page change
    useEffect(() => {
        fetchGames(debouncedSearchTerm, page, page > 1);
    }, [debouncedSearchTerm, page, fetchGames]);

    // Build filtered product list
    const filteredGames = useMemo(() => {
        let items = [...games];

        // category filter (try slug/name/id)
        if (selectedCategory && selectedCategory !== 'All') {
            const sel = String(selectedCategory).toLowerCase();
            items = items.filter(it => {
                const catName = (it.category_name ?? it.category ?? '').toString().toLowerCase();
                const catSlug = (it.category_slug ?? it.category ?? '').toString().toLowerCase();
                const catId = it.category_id != null ? String(it.category_id) : '';
                return catName === sel || catSlug === sel || catId === sel;
            });
        }

        // price
        items = items.filter(g => (Number(g.price || 0) >= Number(priceRange[0] || 0)) && (Number(g.price || 0) <= Number(priceRange[1] || 0)));

        // sort
        if (sortBy === 'name') items.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
        if (sortBy === 'price-asc') items.sort((a, b) => (Number(a.price || 0) - Number(b.price || 0)));
        if (sortBy === 'price-desc') items.sort((a, b) => (Number(b.price || 0) - Number(a.price || 0)));
        if (sortBy === 'rating') items.sort((a, b) => (Number(b.rating || 0) - Number(a.rating || 0)));
        if (sortBy === 'sold') items.sort((a, b) => (Number(b.sold || 0) - Number(a.sold || 0)));

        // mark isNew / isPopular (new: created_at within 15 days; popular: in topSoldIds)
        const now = Date.now();
        const freshtime = 15 * 24 * 60 * 60 * 1000;
        items = items.map(it => ({
            ...it,
            isNew: it.created_at ? (now - new Date(it.created_at).getTime()) <= freshtime : false,
            isPopular: topSoldIds.includes(Number(it.id)),
        }));

        return items;
    }, [games, selectedCategory, sortBy, priceRange, topSoldIds]);

    // recommended filtered by search/filters too
    const recommendedFiltered = useMemo(() => {
        let items = [...recommendedGames];
        const q = (debouncedSearchTerm || '').trim().toLowerCase();
        if (q) {
            items = items.filter(it => String(it.name || '').toLowerCase().includes(q) || String(it.category || '').toLowerCase().includes(q));
        }
        if (selectedCategory && selectedCategory !== 'All') {
            const sel = String(selectedCategory).toLowerCase();
            items = items.filter(it => {
                const catName = (it.category_name ?? it.category ?? '').toString().toLowerCase();
                const catSlug = (it.category_slug ?? it.category ?? '').toString().toLowerCase();
                const catId = it.category_id != null ? String(it.category_id) : '';
                return catName === sel || catSlug === sel || catId === sel;
            });
        }
        items = items.filter(g => (Number(g.price || 0) >= Number(priceRange[0] || 0)) && (Number(g.price || 0) <= Number(priceRange[1] || 0)));
        if (sortBy === 'name') items.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
        if (sortBy === 'price-asc') items.sort((a, b) => (Number(a.price || 0) - Number(b.price || 0)));
        if (sortBy === 'price-desc') items.sort((a, b) => (Number(b.price || 0) - Number(a.price || 0)));
        if (sortBy === 'rating') items.sort((a, b) => (Number(b.rating || 0) - Number(a.rating || 0)));
        if (sortBy === 'sold') items.sort((a, b) => (Number(b.sold || 0) - Number(a.sold || 0)));
        const now = Date.now();
        const freshtime = 15 * 24 * 60 * 60 * 1000;
        items = items.map(it => ({
            ...it,
            isNew: it.created_at ? (now - new Date(it.created_at).getTime()) <= freshtime : false,
            isPopular: topSoldIds.includes(Number(it.id)),
        }));
        return items;
    }, [recommendedGames, debouncedSearchTerm, selectedCategory, priceRange, sortBy, topSoldIds]);

    const loadMore = () => setPage(p => p + 1);

    // Large Game card like your screenshot
    const GameCard = ({ game }) => {
        const [imgSrc, setImgSrc] = useState(game.image || '');
        const [imgErr, setImgErr] = useState(false);

        useEffect(() => { setImgSrc(game.image || ''); setImgErr(false); }, [game.image]);

        const onErr = () => {
            if (!imgErr) {
                setImgErr(true);
                setImgSrc('https://images.unsplash.com/photo-1511512578047-d6360b94f7fb?auto=format&fit=crop&w=1200&q=80');
            }
        };

        return (
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl shadow-lg overflow-hidden border border-purple-800">
                <div className="relative h-44 w-full">
                    <Image src={imgSrc || ''} alt={game.name} fill style={{ objectFit: 'cover' }} onError={onErr} unoptimized={true} className="rounded-t-2xl" />
                    {game.isNew && <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">ใหม่</div>}
                    {game.isPopular && <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-md shadow-sm">ยอดนิยม</div>}
                </div>

                <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2">{game.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{game.category ?? ''}</p>

                    <div className="mb-4">
                        {Number(game.originalPrice || 0) > Number(game.price || 0) && (
                            <div className="text-sm text-gray-500 line-through">฿{game.originalPrice}</div>
                        )}
                        <div className="text-2xl font-bold text-white">{Number(game.price || 0) === 0 ? 'ฟรี' : `฿${game.price}`}</div>
                    </div>

                    <button
                        onClick={() => router.push(`/products/${game.slug ?? game.id}`)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                        สั่งซื้อสินค้า
                    </button>
                </div>
            </div>
        );
    };

    // Category banner tile (click redirects to /categories/<slug-or-id-or-encoded>)
    const CategoryTile = ({ c }) => {
        const img = c.image || c.cover || 'https://images.unsplash.com/photo-1511512578047-d6360b94f7fb?auto=format&fit=crop&w=1200&q=80';
        const name = c.name || c.title || c.slug || 'หมวดหมู่';
        const slug = c.slug ?? (c.id ? String(c.id) : encodeURIComponent(String(c.name ?? c)));
        return (
            <button
                onClick={() => router.push(`/categories/${slug}`)}
                className="relative group block w-full overflow-hidden rounded-xl"
                aria-label={`Open category ${name}`}
            >
                <div className="relative h-44 w-full bg-gray-800 rounded-xl">
                    <Image src={img} alt={name} fill style={{ objectFit: 'cover' }} unoptimized={true} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/80 transition-colors" />
                    <div className="absolute left-4 bottom-4">
                        <div className="text-white text-2xl font-extrabold drop-shadow-md">{name}</div>
                    </div>
                </div>
            </button>
        );
    };

    // quick categories (up to 4)
    const quickCategories = useMemo(() => (categories || []).slice(0, 4), [categories]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-950 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">ร้านเกม qooldab</h1>
                <p className="text-gray-400">ค้นพบเกมส์ออนไลน์ยอดนิยม ROV Freefire PUBG Roblox Minecraft และอื่นๆอีกมากมาย</p>
            </div>

            {/* Categories: show 2 per row on desktop (lg) */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">หมวดหมู่</h2>
                    <button onClick={() => router.push('/categories')} className="text-purple-400 hover:text-purple-300 text-sm font-medium">เลือกดูทั้งหมด</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {quickCategories.map(c => <CategoryTile key={c.id ?? c.slug ?? c.name} c={c} />)}
                </div>
            </div>

            {/* Recommended (4 per row on desktop) */}
            {recommendedFiltered.length > 0 && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">สินค้าแนะนำ</h2>
                        <button onClick={() => router.push('/products')} className="text-purple-400 hover:text-purple-300 text-sm font-medium">ดูทั้งหมด</button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {recommendedFiltered.slice(0, 8).map(g => <GameCard key={g.id} game={g} />)}
                    </div>
                </div>
            )}

        </div>
    );
}
