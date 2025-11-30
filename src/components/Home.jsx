// components/Home.jsx
'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchProducts, getCategoriesList } from '@/lib/Cats-Prod-Db';

const ITEMS_PER_PAGE = 12;
const NEW_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

// SVG Icons

const FireIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
    </svg>
);

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

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
    <div className="relative group w-full overflow-hidden rounded-xl h-44 animate-pulse">
        <div className="h-full w-full bg-gray-800 rounded-xl" />
        <div className="absolute left-4 bottom-4">
            <div className="h-8 bg-gray-700 rounded w-32 mb-2" />
        </div>
    </div>
);

export default function GameShop() {
    const router = useRouter();

    // states
    const [games, setGames] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [categories, setCategories] = useState([]);
    const [topSoldIds, setTopSoldIds] = useState([]);

    const [loading, setLoading] = useState(false);
    const [metaLoading, setMetaLoading] = useState(false);
    const [error, setError] = useState(null);

    // animation trigger for items
    const [itemsVisible, setItemsVisible] = useState(false);

    // load categories + recommended/top-sold (meta)
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setMetaLoading(true);
                const cats = await getCategoriesList({ forceReload: false });
                if (!mounted) return;
                setCategories(cats);

                // Fetch a sample (limit 200) to compute top-sold & recommended
                const sample = await fetchProducts({ limit: 200 }, { ensureCategories: true });
                if (!mounted) return;
                const all = sample.items ?? [];
                const sorted = [...all].sort((a, b) => (Number(b.sold || 0) - Number(a.sold || 0)));
                setTopSoldIds(sorted.slice(0, 4).map(i => Number(i.id)));
                setRecommended(sorted.slice(0, 8));
            } catch (err) {
                console.error('meta load error', err);
            } finally {
                if (mounted) setMetaLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, []);

    // load products (paged) using lib.fetchProducts
    const loadProducts = useCallback(async (opts = {}) => {
        const { pageNum = 1, append = false } = opts;
        try {
            setLoading(true);
            setError(null);
            const params = {
                page: pageNum,
                limit: ITEMS_PER_PAGE,
            };

            const res = await fetchProducts(params, { ensureCategories: true });
            const items = res.items ?? [];
            if (append) setGames(prev => [...prev, ...items]);
            else setGames(items);
            // enable animation after load
            setTimeout(() => setItemsVisible(true), 50);
        } catch (err) {
            console.error('loadProducts error', err);
            setError(err.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    // call loadProducts on mount
    useEffect(() => {
        setItemsVisible(false);
        loadProducts({ pageNum: 1 });
    }, [loadProducts]);

    // attach isNew / isPopular
    const processedGames = useMemo(() => {
        const now = Date.now();
        return (games || []).map(it => ({
            ...it,
            isNew: it.created_at ? ((now - new Date(it.created_at).getTime()) <= NEW_MS) : false,
            isPopular: topSoldIds.includes(Number(it.id)),
        }));
    }, [games, topSoldIds]);

    // recommended filtered with isNew/isPopular
    const recommendedFiltered = useMemo(() => {
        const now = Date.now();
        return (recommended || []).map(it => ({
            ...it,
            isNew: it.created_at ? ((now - new Date(it.created_at).getTime()) <= NEW_MS) : false,
            isPopular: topSoldIds.includes(Number(it.id))
        }));
    }, [recommended, topSoldIds]);

    // quick categories up to 4
    const quickCats = useMemo(() => (categories || []).slice(0, 4), [categories]);

    // UI subcomponents
    const CategoryTile = ({ c, index }) => {
        const img = c.image ?? null;
        const name = c.name ?? c.title ?? c.slug ?? 'หมวดหมู่';
        const slug = c.slug ?? (c.id ? String(c.id) : encodeURIComponent(String(name)));

        // animation classes
        const enterClass = itemsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6';
        const delayMs = index * 100;

        return (
            <div
                className={`transform transition-all duration-700 ${enterClass}`}
                style={{ transitionDelay: `${delayMs}ms` }}
            >
                <button
                    onClick={() => router.push(`/categories/${slug}`)}
                    className="relative group w-full overflow-hidden rounded-xl h-44 transition-transform duration-250 hover:scale-102"
                    aria-label={`Open category ${name}`}
                >
                    <div className="relative h-full w-full bg-gray-800 rounded-xl overflow-hidden">
                        <Image src={img} alt={name} fill style={{ objectFit: 'cover' }} unoptimized />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute left-4 bottom-4 text-left">
                            <div className="text-white text-2xl font-extrabold drop-shadow-md">{name}</div>
                        </div>
                        <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                </button>
            </div>
        );
    };

    const ProductCard = ({ product, index }) => {
        const [img, setImg] = useState(product.image || '');
        const [err, setErr] = useState(false);

        useEffect(() => { setImg(product.image || ''); setErr(false); }, [product.image]);

        const onImgErr = () => { if (!err) { setErr(true) } };

        // animation classes
        const enterClass = itemsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6';
        const delayMs = index * 60;

        return (
            <div
                className={`bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl shadow-lg overflow-hidden border border-purple-800 transform transition-all duration-300 hover:scale-102 hover:shadow-xl ${enterClass}`}
                style={{ transitionDelay: `${delayMs}ms` }}
            >
                <div className="relative h-44 w-full">
                    <Image src={img} alt={product.name} fill style={{ objectFit: 'cover' }} onError={onImgErr} unoptimized />
                    {product.isNew && (
                        <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md animate-pulse">
                            ใหม่
                        </div>
                    )}
                    {product.isPopular && (
                        <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                            <FireIcon />
                            ยอดนิยม
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <h3 className="text-lg font-bold text-white line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{product.category_name ?? product.category ?? ''}</p>

                    <div className="flex items-center justify-between mt-3 mb-4">
                        <div>
                            {Number(product.originalPrice || product.original_price || 0) > Number(product.price || 0) && (
                                <div className="text-sm text-gray-500 line-through">฿{product.originalPrice ?? product.original_price}</div>
                            )}
                            <div className="text-2xl font-bold text-white">
                                {Number(product.price || 0) === 0 ? 'ฟรี' : `฿${product.price}`}
                            </div>
                        </div>

                        <div className="text-right text-xs text-gray-300">
                            <div>คงเหลือ: <span className="font-semibold text-white">{product.stock ?? product.qty ?? 0}</span></div>
                            <div className="mt-1">จำหน่ายแล้ว: <span className="font-semibold text-white">{product.sold ?? 0}</span></div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push(`/products/${product.slug ?? product.id}`)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 transform"
                        >
                            <CartIcon />
                            สั่งซื้อสินค้า
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-950 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-1">ร้าน qooldab</h1>
                <p className="text-gray-400">ค้นพบสินค้าออนไลน์ยอดนิยม ROV Freefire PUBG Roblox และอื่นๆอีกมากมาย</p>
            </div>

            {/* Categories (2 per row on desktop) */}
            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-white">หมวดหมู่</h1>
                        <h2 className="text-sm text-gray-400">Category Recommended</h2>
                    </div>
                    <button
                        onClick={() => router.push('/categories')}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors duration-300"
                    >
                        เลือกดูทั้งหมด
                        <ArrowRightIcon />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {metaLoading ? (
                        // Show skeleton when loading categories
                        Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={`cat-skel-${i}`} />)
                    ) : quickCats.length === 0 ? (
                        <div className="text-gray-400 col-span-2">ยังไม่มีหมวดหมู่</div>
                    ) : (
                        quickCats.map((c, i) => <CategoryTile key={c.id ?? c.slug ?? c.name} c={c} index={i} />)
                    )}
                </div>
            </section>

            {/* Recommended area (4 per row on desktop) */}
            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">สินค้าแนะนำ</h2>
                        <h2 className="text-sm text-gray-400">Product Recommended</h2>
                    </div>
                    <button
                        onClick={() => router.push('/products')}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors duration-300"
                    >
                        ดูทั้งหมด
                        <ArrowRightIcon />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {loading ? (
                        // Show skeleton when loading products
                        Array.from({ length: 8 }).map((_, i) => <GameCardSkeleton key={`prod-skel-${i}`} />)
                    ) : recommendedFiltered.length > 0 ? (
                        recommendedFiltered.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
                    ) : (
                        <div className="text-gray-400 col-span-4">ไม่พบสินค้าที่แนะนำ</div>
                    )}
                </div>
            </section>
        </div>
    );
}