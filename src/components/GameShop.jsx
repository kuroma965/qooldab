// 'use client';
// import Image from 'next/image';
// import React, { useEffect, useState, useMemo, useCallback } from 'react';

// // คอมโพเนนต์สำหรับแสดงสถานะการโหลดแบบ Skeleton
// const GameCardSkeleton = () => (
//     <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-purple-800 animate-pulse">
//         <div className="h-48 w-full bg-gray-800"></div>
//         <div className="p-4">
//             <div className="flex items-start justify-between gap-3">
//                 <div className="flex-1">
//                     <div className="h-6 bg-gray-700 rounded mb-2 w-3/4"></div>
//                     <div className="h-4 bg-gray-700 rounded w-1/2"></div>
//                 </div>
//                 <div className="h-6 bg-gray-700 rounded w-16"></div>
//             </div>
//             <div className="mt-3 space-y-2">
//                 <div className="h-4 bg-gray-700 rounded w-full"></div>
//                 <div className="h-4 bg-gray-700 rounded w-2/3"></div>
//             </div>
//             <div className="mt-4 h-10 bg-purple-700 rounded-lg w-full"></div>
//         </div>
//     </div>
// );

// // คอมโพเนนต์หลัก
// export default function GameShop({ initialQuery = '' }) {
//     const [games, setGames] = useState([]);
//     const [filteredGames, setFilteredGames] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [searchTerm, setSearchTerm] = useState(initialQuery);
//     const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialQuery);
//     const [selectedCategory, setSelectedCategory] = useState('All');
//     const [sortBy, setSortBy] = useState('name');
//     const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
//     const [page, setPage] = useState(1);
//     const [hasMore, setHasMore] = useState(true);
//     const [priceRange, setPriceRange] = useState([0, 5000]);
//     const itemsPerPage = 12;

//     // ดีเลย์การค้นหาเพื่อลดการเรียก API ที่ไม่จำเป็น
//     useEffect(() => {
//         const timerId = setTimeout(() => {
//             setDebouncedSearchTerm(searchTerm);
//             setPage(1);
//         }, 500);
//         return () => clearTimeout(timerId);
//     }, [searchTerm]);

//     // ดึงข้อมูลเกม
//     const fetchGames = useCallback(async (search = '', pageNum = 1, append = false) => {
//         try {
//             setLoading(true);
//             setError(null);

//             const params = new URLSearchParams();
//             if (search) params.set('q', search);
//             params.set('page', pageNum);
//             params.set('limit', itemsPerPage);

//             // ในกรณีจริง คุณจะเรียก API endpoint ที่เกี่ยวข้องกับเกม
//             // const res = await fetch(`/api/games?${params.toString()}`, { cache: 'no-store' });

//             // สำหรับตัวอย่างนี้ เราจะจำลองข้อมูลเกม
//             await new Promise(resolve => setTimeout(resolve, 800));

//             const mockGames = [
//                 {
//                     id: 1,
//                     name: "Arena of Valor (ROV)",
//                     category: "MOBA",
//                     price: 299,
//                     originalPrice: 399,
//                     image: "https://storage.inskru.com/ideas/covers/1740310804971513218.png",
//                     rating: 4.5,
//                     reviews: 1243,
//                     isPopular: true,
//                     discount: 25
//                 },
//                 {
//                     id: 2,
//                     name: "Free Fire",
//                     category: "Battle Royale",
//                     price: 199,
//                     originalPrice: 299,
//                     image: "https://cdn12.idcgames.com/storage/image/1258/free-new-logo/default.jpg",
//                     rating: 4.2,
//                     reviews: 892,
//                     isPopular: true,
//                     discount: 33
//                 },
//                 {
//                     id: 3,
//                     name: "PUBG Mobile",
//                     category: "Battle Royale",
//                     price: 399,
//                     originalPrice: 499,
//                     image: "https://img.online-station.net/image_content/2020/10/PG_1200_628.jpg",
//                     rating: 4.7,
//                     reviews: 2156,
//                     isPopular: true,
//                     discount: 20
//                 },
//                 {
//                     id: 4,
//                     name: "Roblox",
//                     category: "Sandbox",
//                     price: 0,
//                     originalPrice: 0,
//                     image: "https://static.thairath.co.th/media/dFQROr7oWzulq5Fa6rBstWAQ0C15bPVWu18DTTzU9VR9LxtGtO02E56kX1GR77jHxDl.jpg",
//                     rating: 4.6,
//                     reviews: 1874,
//                     isPopular: false,
//                     discount: 0
//                 },
//                 {
//                     id: 5,
//                     name: "Minecraft",
//                     category: "Sandbox",
//                     price: 899,
//                     originalPrice: 1199,
//                     image: "https://www.minecraft.net/content/dam/games/minecraft/key-art/Games_Subnav_Minecraft-300x465.jpg",
//                     rating: 4.8,
//                     reviews: 3241,
//                     isPopular: true,
//                     discount: 25
//                 },
//                 {
//                     id: 6,
//                     name: "Call of Duty Mobile",
//                     category: "FPS",
//                     price: 299,
//                     originalPrice: 399,
//                     image: "https://cdn-webth.garenanow.com/webth/cdn/codm/mainsite/b711af987f03663823cbde433e669b63.jpg",
//                     rating: 4.4,
//                     reviews: 1567,
//                     isPopular: false,
//                     discount: 25
//                 },
//                 {
//                     id: 7,
//                     name: "Genshin Impact",
//                     category: "RPG",
//                     price: 0,
//                     originalPrice: 0,
//                     image: "https://fastcdn.hoyoverse.com/content-v2/plat/124031/5d2ba4371115d26de4c574b28311aed8_3908500551050520494.jpeg",
//                     rating: 4.5,
//                     reviews: 2341,
//                     isPopular: true,
//                     discount: 0
//                 },
//                 {
//                     id: 8,
//                     name: "Mobile Legends",
//                     category: "MOBA",
//                     price: 199,
//                     originalPrice: 299,
//                     image: "https://cdn.prod.website-files.com/65956e2711516206d2d1258f/67d16acac5515372f3f3af70_MLBB%20rank%20cover-p-1600.webp",
//                     rating: 4.1,
//                     reviews: 987,
//                     isPopular: false,
//                     discount: 33
//                 },
//                 {
//                     id: 9,
//                     name: "Among Us",
//                     category: "Party",
//                     price: 99,
//                     originalPrice: 149,
//                     image: "https://cdn.cloudflare.steamstatic.com/steam/apps/945360/header.jpg",
//                     rating: 4.3,
//                     reviews: 1234,
//                     isPopular: false,
//                     discount: 33
//                 },
//                 {
//                     id: 10,
//                     name: "Fortnite",
//                     category: "Battle Royale",
//                     price: 0,
//                     originalPrice: 0,
//                     image: "https://cdn2.unrealengine.com/14br-consoles-1920x1080-wlogo-1920x1080-432974386.jpg",
//                     rating: 4.6,
//                     reviews: 2987,
//                     isPopular: true,
//                     discount: 0
//                 },
//                 {
//                     id: 11,
//                     name: "League of Legends: Wild Rift",
//                     category: "MOBA",
//                     price: 0,
//                     originalPrice: 0,
//                     image: "https://esportimes.com/wp-content/uploads/2021/09/WR_meta_homepage-esportimes-1-1-1024x535.png",
//                     rating: 4.4,
//                     reviews: 1876,
//                     isPopular: true,
//                     discount: 0
//                 },
//                 {
//                     id: 12,
//                     name: "Clash of Clans",
//                     category: "Strategy",
//                     price: 0,
//                     originalPrice: 0,
//                     image: "https://catholicgamereviews.com/wp-content/uploads/2021/11/CoCloading.jpg",
//                     rating: 4.2,
//                     reviews: 1654,
//                     isPopular: false,
//                     discount: 0
//                 }
//             ];

//             // สุ่มข้อมูลเพื่อจำลองการแบ่งหน้า
//             const startIndex = (pageNum - 1) * itemsPerPage;
//             const endIndex = startIndex + itemsPerPage;
//             const newGames = mockGames.slice(startIndex, endIndex);

//             if (append) {
//                 setGames(prev => [...prev, ...newGames]);
//             } else {
//                 setGames(newGames);
//             }

//             setHasMore(newGames.length === itemsPerPage);
//         } catch (err) {
//             setError(err.message || 'Unknown error');
//             setGames([]);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // โหลดข้อมูลครั้งแรกและเมื่อมีการเปลี่ยนแปลงเงื่อนไขการค้นหา
//     useEffect(() => {
//         fetchGames(debouncedSearchTerm, page, page > 1);
//     }, [debouncedSearchTerm, page, fetchGames]);

//     // กรองและเรียงลำดับข้อมูลเกม
//     useEffect(() => {
//         let filtered = [...games];

//         // กรองตามหมวดหมู่
//         if (selectedCategory !== 'All') {
//             filtered = filtered.filter(game => game.category === selectedCategory);
//         }

//         // กรองตามช่วงราคา
//         filtered = filtered.filter(game => game.price >= priceRange[0] && game.price <= priceRange[1]);

//         // เรียงลำดับ
//         filtered.sort((a, b) => {
//             if (sortBy === 'name') return a.name.localeCompare(b.name);
//             if (sortBy === 'price-asc') return a.price - b.price;
//             if (sortBy === 'price-desc') return b.price - a.price;
//             if (sortBy === 'rating') return b.rating - a.rating;
//             if (sortBy === 'popular') return b.reviews - a.reviews;
//             return 0;
//         });

//         setFilteredGames(filtered);
//     }, [games, selectedCategory, sortBy, priceRange]);

//     // รายการหมวดหมู่ทั้งหมด
//     const categories = useMemo(() => {
//         const categorySet = new Set(games.map(game => game.category));
//         return ['All', ...Array.from(categorySet).sort()];
//     }, [games]);

//     // ฟังก์ชันค้นหาใหม่
//     const handleSearch = (e) => {
//         e.preventDefault();
//         setDebouncedSearchTerm(searchTerm);
//         setPage(1);
//     };

//     // ฟังก์ชันรีเซ็ต
//     const handleReset = () => {
//         setSearchTerm('');
//         setDebouncedSearchTerm('');
//         setSelectedCategory('All');
//         setSortBy('name');
//         setPriceRange([0, 5000]);
//         setPage(1);
//     };

//     // ฟังก์ชันโหลดเพิ่ม
//     const loadMore = () => {
//         setPage(prev => prev + 1);
//     };

//     // คอมโพเนนต์การ์ดเกม
//     const GameCard = ({ game }) => {
//         const [imgSrc, setImgSrc] = useState(game.image);
//         const [imgError, setImgError] = useState(false);

//         const handleImageError = () => {
//             if (!imgError) {
//                 setImgError(true);
//                 // ใช้รูปภาพสำรองตามประเภทเกม
//                 const fallbackImages = {
//                     "MOBA": "https://images.unsplash.com/photo-1511512578047-d6360b94f7fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
//                     "Battle Royale": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
//                     "Sandbox": "https://images.unsplash.com/photo-1606306496952-c34b1c7f2838?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
//                     "FPS": "https://images.unsplash.com/photo-1593305841036-9de60390c154?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
//                     "RPG": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
//                     "Party": "https://images.unsplash.com/photo-1601828688063-932a274f7a5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
//                     "Strategy": "https://images.unsplash.com/photo-1511512578047-d6360b94f7fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
//                 };

//                 setImgSrc(fallbackImages[game.category] || "https://images.unsplash.com/photo-1511512578047-d6360b94f7fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80");
//             }
//         };

//         return (
//             <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-purple-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
//                 <div className="relative h-48 w-full">
//                     <Image
//                         src={imgSrc}
//                         alt={`${game.name} cover`}
//                         fill
//                         style={{ objectFit: 'cover' }}
//                         className="transition-transform duration-500 hover:scale-105"
//                         onError={handleImageError}
//                         unoptimized={true}
//                     />
//                     {game.discount > 0 && (
//                         <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
//                             ใหม่
//                         </div>
//                     )}
//                     {game.isPopular && (
//                         <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-2 whitespace-nowrap">
//                             {/* flame icon (ไฟ) */}
//                             <svg
//                                 className="w-4 h-4 flex-shrink-0"
//                                 viewBox="0 0 24 24"
//                                 fill="none"
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 aria-hidden="true"
//                                 focusable="false"
//                             >
//                                 <path
//                                     d="M12.8324 21.8013C15.9583 21.1747 20 18.926 20 13.1112C20 7.8196 16.1267 4.29593 13.3415 2.67685C12.7235 2.31757 12 2.79006 12 3.50492V5.3334C12 6.77526 11.3938 9.40711 9.70932 10.5018C8.84932 11.0607 7.92052 10.2242 7.816 9.20388L7.73017 8.36604C7.6304 7.39203 6.63841 6.80075 5.85996 7.3946C4.46147 8.46144 3 10.3296 3 13.1112C3 20.2223 8.28889 22.0001 10.9333 22.0001C11.0871 22.0001 11.2488 21.9955 11.4171 21.9858C10.1113 21.8742 8 21.064 8 18.4442C8 16.3949 9.49507 15.0085 10.631 14.3346C10.9365 14.1533 11.2941 14.3887 11.2941 14.7439V15.3331C11.2941 15.784 11.4685 16.4889 11.8836 16.9714C12.3534 17.5174 13.0429 16.9454 13.0985 16.2273C13.1161 16.0008 13.3439 15.8564 13.5401 15.9711C14.1814 16.3459 15 17.1465 15 18.4442C15 20.4922 13.871 21.4343 12.8324 21.8013Z"
//                                     fill="#ff5900"
//                                 />
//                             </svg>

//                             <span className="leading-none">ยอดนิยม</span>
//                         </div>
//                     )}
//                 </div>

//                 <div className="p-5">
//                     <div className="flex items-start justify-between gap-3 mb-3">
//                         <div>
//                             <h3 className="text-xl font-bold text-white">{game.name}</h3>
//                             <p className="text-sm text-gray-400 flex items-center mt-1">
//                                 <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                                     <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                                 </svg>
//                                 {game.category}
//                             </p>
//                         </div>
//                     </div>

//                     <div className="space-y-2 text-sm text-gray-300 mb-4">

//                         <div className="flex items-center justify-between">
//                             <div>
//                                 {game.originalPrice > game.price && (
//                                     <span className="text-gray-500 line-through text-sm">฿{game.originalPrice}</span>
//                                 )}
//                                 <span className="text-2xl font-bold text-white ml-2">
//                                     {game.price === 0 ? 'ฟรี' : `฿${game.price}`}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="flex gap-2">
//                         <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
//                             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                             </svg>
//                             สั่งซื้อสินค้า
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     // คอมโพเนนต์รายการแบบตาราง
//     const GameListItem = ({ game }) => {
//         const [imgSrc, setImgSrc] = useState(game.image);
//         const [imgError, setImgError] = useState(false);

//         const handleImageError = () => {
//             if (!imgError) {
//                 setImgError(true);
//                 // ใช้รูปภาพสำรองตามประเภทเกม
//                 const fallbackImages = {
//                     "MOBA": "https://images.unsplash.com/photo-1511512578047-d6360b94f7fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
//                     "Battle Royale": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
//                     "Sandbox": "https://images.unsplash.com/photo-1606306496952-c34b1c7f2838?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
//                     "FPS": "https://images.unsplash.com/photo-1593305841036-9de60390c154?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
//                     "RPG": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
//                     "Party": "https://images.unsplash.com/photo-1601828688063-932a274f7a5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
//                     "Strategy": "https://images.unsplash.com/photo-1511512578047-d6360b94f7fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
//                 };

//                 setImgSrc(fallbackImages[game.category] || "https://images.unsplash.com/photo-1511512578047-d6360b94f7fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80");
//             }
//         };

//         return (
//             <div className="bg-gray-900 rounded-lg shadow-sm border border-purple-800 p-4 hover:shadow-md transition-shadow flex items-center gap-4">
//                 <div className="relative h-20 w-28 flex-shrink-0 rounded overflow-hidden">
//                     <Image
//                         src={imgSrc}
//                         alt={`${game.name} cover`}
//                         fill
//                         style={{ objectFit: 'cover' }}
//                         onError={handleImageError}
//                         unoptimized={true}
//                     />
//                     {game.discount > 0 && (
//                         <div className="absolute top-1 left-1 bg-green-600 text-white text-xs font-bold px-1 py-0.5 rounded">
//                             ใหม่
//                         </div>
//                     )}
//                 </div>
//                 <div className="flex-grow">
//                     <h3 className="font-semibold text-white">{game.name}</h3>
//                     <p className="text-sm text-gray-400">{game.category}</p>
//                     <div className="flex items-center mt-1">
//                         <div className="flex text-yellow-400">
//                             {[...Array(5)].map((_, i) => (
//                                 <svg key={i} className={`w-3 h-3 ${i < Math.floor(game.rating) ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
//                                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                                 </svg>
//                             ))}
//                         </div>
//                         <span className="ml-1 text-xs text-gray-400">({game.reviews})</span>
//                     </div>
//                 </div>
//                 <div className="text-right">
//                     {game.originalPrice > game.price && (
//                         <span className="text-gray-500 line-through text-sm">฿{game.originalPrice}</span>
//                     )}
//                     <div className="text-lg font-bold text-white">
//                         {game.price === 0 ? 'ฟรี' : `฿${game.price}`}
//                     </div>
//                 </div>
//                 <div className="flex gap-2">
//                     <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                         </svg>
//                     </button>
//                     <button className="text-gray-400 hover:text-red-500 transition-colors p-2">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                         </svg>
//                     </button>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-950 min-h-screen">
//             <div className="mb-8">
//                 <h1 className="text-3xl font-bold text-white mb-2">ร้านเกม qooldab</h1>
//                 <p className="text-gray-400">ค้นพบเกมส์ออนไลน์ยอดนิยม ROV Freefire PUBG Roblox Minecraft และอื่นๆอีกมากมาย</p>
//             </div>

//             <div className="bg-gray-900 rounded-xl shadow-sm border border-purple-800 p-6 mb-8">
//                 <form onSubmit={handleSearch} className="mb-6">
//                     <div className="flex flex-col lg:flex-row gap-4">
//                         <div className="flex-grow">
//                             <label htmlFor="search" className="sr-only">ค้นหาเกม</label>
//                             <div className="relative">
//                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                     <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                     </svg>
//                                 </div>
//                                 <input
//                                     id="search"
//                                     type="text"
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     placeholder="ค้นหาเกม (เช่น ROV, Minecraft, PUBG)"
//                                     className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 text-white"
//                                 />
//                             </div>
//                         </div>
//                         <div className="flex gap-2">
//                             <button
//                                 type="submit"
//                                 className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
//                             >
//                                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                 </svg>
//                                 ค้นหา
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={handleReset}
//                                 className="px-4 py-3 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
//                             >
//                                 รีเซ็ต
//                             </button>
//                         </div>
//                     </div>
//                 </form>

//                 <div className="border-t border-gray-800 pt-4">
//                     <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//                         <div className="flex flex-wrap gap-4">
//                             <div className="flex items-center gap-2">
//                                 <label htmlFor="category-filter" className="text-sm font-semibold text-white">หมวดหมู่:</label>
//                                 <select
//                                     id="category-filter"
//                                     value={selectedCategory}
//                                     onChange={(e) => setSelectedCategory(e.target.value)}
//                                     className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-white"
//                                 >
//                                     {categories.map(category => (
//                                         <option key={category} value={category}>{category}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="flex items-center gap-2">
//                                 <label htmlFor="sort-by" className="text-sm font-semibold text-white">เรียงตาม:</label>
//                                 <select
//                                     id="sort-by"
//                                     value={sortBy}
//                                     onChange={(e) => setSortBy(e.target.value)}
//                                     className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-white"
//                                 >
//                                     <option value="name">ชื่อเกม</option>
//                                     <option value="price-asc">ราคา: ต่ำ-สูง</option>
//                                     <option value="price-desc">ราคา: สูง-ต่ำ</option>
//                                     <option value="rating">คะแนนสูงสุด</option>
//                                     <option value="popular">ยอดนิยม</option>
//                                 </select>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-lg">
//                             <button
//                                 onClick={() => setViewMode('grid')}
//                                 className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700' : ''} text-gray-300`}
//                                 aria-label="Grid view"
//                             >
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
//                                 </svg>
//                             </button>
//                             <button
//                                 onClick={() => setViewMode('list')}
//                                 className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700' : ''} text-gray-300`}
//                                 aria-label="List view"
//                             >
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                                 </svg>
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {error && (
//                 <div className="bg-red-900 bg-opacity-50 border-l-4 border-red-500 p-4 mb-6">
//                     <div className="flex">
//                         <div className="flex-shrink-0">
//                             <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
//                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                             </svg>
//                         </div>
//                         <div className="ml-3">
//                             <p className="text-sm text-red-300">Error: {error}</p>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {!loading && !error && filteredGames.length === 0 && (
//                 <div className="text-center py-16 bg-gray-900 rounded-xl shadow-sm border border-purple-800">
//                     <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <h3 className="mt-2 text-lg font-medium text-white">ไม่พบเกมที่ค้นหา</h3>
//                     <p className="mt-1 text-gray-400">ลองปรับเปลี่ยนเงื่อนไขการค้นหาของคุณ</p>
//                 </div>
//             )}

//             {viewMode === 'grid' ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                     {loading && filteredGames.length === 0 ? (
//                         // แสดง skeleton cards ขณะโหลดครั้งแรก
//                         Array.from({ length: 8 }).map((_, i) => <GameCardSkeleton key={i} />)
//                     ) : (
//                         <>
//                             {filteredGames.map((game) => (
//                                 <GameCard key={game.id} game={game} />
//                             ))}
//                             {loading && (
//                                 // แสดง skeleton cards ขณะโหลดเพิ่ม
//                                 Array.from({ length: 4 }).map((_, i) => <GameCardSkeleton key={`loading-${i}`} />)
//                             )}
//                         </>
//                     )}
//                 </div>
//             ) : (
//                 <div className="space-y-4">
//                     {loading && filteredGames.length === 0 ? (
//                         // แสดง skeleton list items ขณะโหลดครั้งแรก
//                         Array.from({ length: 8 }).map((_, i) => (
//                             <div key={i} className="bg-gray-900 rounded-lg shadow-sm border border-purple-800 p-4 animate-pulse">
//                                 <div className="flex items-center gap-4">
//                                     <div className="h-20 w-28 bg-gray-800 rounded"></div>
//                                     <div className="flex-grow">
//                                         <div className="h-5 bg-gray-800 rounded w-1/4 mb-2"></div>
//                                         <div className="h-4 bg-gray-800 rounded w-1/5"></div>
//                                     </div>
//                                     <div className="h-4 bg-gray-800 rounded w-1/6"></div>
//                                     <div className="h-4 bg-gray-800 rounded w-1/5"></div>
//                                     <div className="h-6 bg-gray-800 rounded w-12"></div>
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <>
//                             {filteredGames.map((game) => (
//                                 <GameListItem key={game.id} game={game} />
//                             ))}
//                             {loading && (
//                                 // แสดง skeleton list items ขณะโหลดเพิ่ม
//                                 Array.from({ length: 4 }).map((_, i) => (
//                                     <div key={`loading-${i}`} className="bg-gray-900 rounded-lg shadow-sm border border-purple-800 p-4 animate-pulse">
//                                         <div className="flex items-center gap-4">
//                                             <div className="h-20 w-28 bg-gray-800 rounded"></div>
//                                             <div className="flex-grow">
//                                                 <div className="h-5 bg-gray-800 rounded w-1/4 mb-2"></div>
//                                                 <div className="h-4 bg-gray-800 rounded w-1/5"></div>
//                                             </div>
//                                             <div className="h-4 bg-gray-800 rounded w-1/6"></div>
//                                             <div className="h-4 bg-gray-800 rounded w-1/5"></div>
//                                             <div className="h-6 bg-gray-800 rounded w-12"></div>
//                                         </div>
//                                     </div>
//                                 ))
//                             )}
//                         </>
//                     )}
//                 </div>
//             )}

//             {!loading && !error && filteredGames.length > 0 && hasMore && (
//                 <div className="mt-8 text-center">
//                     <button
//                         onClick={loadMore}
//                         className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//                     >
//                         โหลดเพิ่ม
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }


// components/GameShop.jsx
'use client';
import Image from 'next/image';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Skeleton
const GameCardSkeleton = () => (
  <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-purple-800 animate-pulse">
    <div className="h-48 w-full bg-gray-800"></div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="h-6 bg-gray-700 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-700 rounded w-16"></div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
      <div className="mt-4 h-10 bg-purple-700 rounded-lg w-full"></div>
    </div>
  </div>
);

// Filter modal
const FilterModal = ({ isOpen, onClose, categories, selectedCategory, setSelectedCategory, sortBy, setSortBy, priceRange, setPriceRange }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">ตัวกรอง</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
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
                // category may be string or object { id, name, slug }
                <option key={c.id ?? c.slug ?? c} value={c.slug ?? c.name ?? c}>
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
  const [filteredGames, setFilteredGames] = useState([]);
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topSoldIds, setTopSoldIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
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

  // fetch categories + top sold + recommended once on mount
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

        // fetch many products (limit 100) to determine top-sold & recommended
        const manyRes = await fetch(`${API_PRODUCTS}?limit=100`, { cache: 'no-store' });
        if (manyRes.ok) {
          const manyJson = await manyRes.json().catch(() => null);
          const manyItems = manyJson?.items ?? (Array.isArray(manyJson) ? manyJson : []);
          if (mounted) {
            // top sold ids
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

      const url = `${API_PRODUCTS}?${params.toString()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || `Failed to load products (${res.status})`);
      }
      const json = await res.json();
      // normalize: { items, total } or array
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

  // call fetch when deps change
  useEffect(() => {
    fetchGames(debouncedSearchTerm, page, page > 1);
  }, [debouncedSearchTerm, page, fetchGames]);

  // compute filteredGames (category, price, sort, mark new/popular)
  useEffect(() => {
    let items = [...games];

    // apply category filter client-side if API doesn't support it
    if (selectedCategory && selectedCategory !== 'All') {
      items = items.filter(it => {
        const catVal = (it.category ?? it.category_id ?? '').toString();
        // compare with either slug or name; here try both
        return String(it.category || it.category_name || it.category_id || '').toLowerCase() === String(selectedCategory).toLowerCase()
          || String(it.slug || '').toLowerCase() === String(selectedCategory).toLowerCase();
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

    // mark isNew and isPopular
    const now = Date.now();
    const freshtime = 15 * 24 * 60 * 60 * 1000;
    items = items.map(it => ({
      ...it,
      isNew: it.created_at ? (now - new Date(it.created_at).getTime()) <= freshtime : false,
      isPopular: topSoldIds.includes(Number(it.id)),
    }));

    setFilteredGames(items);
  }, [games, selectedCategory, sortBy, priceRange, topSoldIds]);

  const loadMore = () => setPage(p => p + 1);

  // helper components for cards
  const GameCard = ({ game }) => {
    const [imgSrc, setImgSrc] = useState(game.image || '');
    const [imgErr, setImgErr] = useState(false);

    useEffect(() => { setImgSrc(game.image || ''); setImgErr(false); }, [game.image]);

    const onErr = () => {
      if (!imgErr) {
        setImgErr(true);
        setImgSrc('https://images.unsplash.com/photo-1511512578047-d6360b94f7fb?auto=format&fit=crop&w=900&q=80');
      }
    };

    return (
      <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-purple-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative h-48 w-full">
          <Image src={imgSrc || ''} alt={game.name} fill style={{ objectFit: 'cover' }} onError={onErr} unoptimized={true} />
          {game.isNew && <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">ใหม่</div>}
          {game.isPopular && <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-md shadow-sm">ยอดนิยม</div>}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-xl font-bold text-white truncate">{game.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{game.category ?? ''}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-300 mb-4">
            <div className="flex items-center justify-between">
              <div>
                {Number(game.originalPrice || 0) > Number(game.price || 0) && (
                  <span className="text-gray-500 line-through text-sm">฿{game.originalPrice}</span>
                )}
                <span className="text-2xl font-bold text-white ml-2">{Number(game.price || 0) === 0 ? 'ฟรี' : `฿${game.price}`}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              สั่งซื้อสินค้า
            </button>
          </div>
        </div>
      </div>
    );
  };

  const GameListItem = ({ game }) => {
    const [imgSrc, setImgSrc] = useState(game.image || '');
    const [imgErr, setImgErr] = useState(false);
    useEffect(() => { setImgSrc(game.image || ''); setImgErr(false); }, [game.image]);
    const onErr = () => { if (!imgErr) { setImgErr(true); setImgSrc('https://images.unsplash.com/photo-1511512578047-d6360b94f7fb?auto=format&fit=crop&w=900&q=80'); } };

    return (
      <div className="bg-gray-900 rounded-lg shadow-sm border border-purple-800 p-4 hover:shadow-md transition-shadow flex items-center gap-4">
        <div className="relative h-20 w-28 flex-shrink-0 rounded overflow-hidden">
          <Image src={imgSrc || ''} alt={game.name} fill style={{ objectFit: 'cover' }} onError={onErr} unoptimized={true} />
          {game.isNew && <div className="absolute top-1 left-1 bg-green-600 text-white text-xs font-bold px-1 py-0.5 rounded">ใหม่</div>}
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-white">{game.name}</h3>
          <p className="text-sm text-gray-400">{game.category}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{Number(game.price || 0) === 0 ? 'ฟรี' : `฿${game.price}`}</div>
        </div>
      </div>
    );
  };

  // quick categories list up to 4
  const quickCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories.slice(0, 4);
  }, [categories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-950 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">ร้านเกม qooldab</h1>
        <p className="text-gray-400">ค้นพบเกมส์ออนไลน์ยอดนิยม ROV Freefire PUBG Roblox Minecraft และอื่นๆอีกมากมาย</p>
      </div>

      {/* Recommended */}
      {recommendedGames.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">สินค้าแนะนำ</h2>
            <button onClick={() => router.push('/products')} className="text-purple-400 hover:text-purple-300 text-sm font-medium">ดูทั้งหมด</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {recommendedGames.map(g => (
              <div key={g.id} className="bg-gray-900 rounded-lg overflow-hidden border border-purple-800 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-24 w-full">
                  <Image src={g.image || ''} alt={g.name} fill style={{ objectFit: 'cover' }} unoptimized={true} />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-white text-sm truncate">{g.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-bold text-purple-400">{Number(g.price || 0) === 0 ? 'ฟรี' : `฿${g.price}`}</span>
                    <button className="text-purple-400 hover:text-purple-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">หมวดหมู่</h2>
          <button onClick={() => router.push('/categories')} className="text-purple-400 hover:text-purple-300 text-sm font-medium">ดูทั้งหมด</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', ...quickCategories.map(c => (c.name ?? c))].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All' ? 'All' : (cat.slug ?? cat.name ?? cat))}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === (cat.slug ?? cat.name ?? cat) || (cat === 'All' && selectedCategory === 'All') ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              {typeof cat === 'string' ? cat : (cat.name ?? cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-gray-900 rounded-xl shadow-sm border border-purple-800 p-4 mb-8">
        <div className="flex gap-2">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเกม (เช่น ROV, Minecraft, PUBG)"
              className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-white"
            />
          </div>

          <button onClick={() => setShowFilterModal(true)} className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            <span className="ml-2">ตัวกรอง</span>
          </button>
        </div>
      </div>

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />

      {/* View toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-lg">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700' : ''} text-gray-300`} aria-label="Grid view">🔲</button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700' : ''} text-gray-300`} aria-label="List view">≡</button>
        </div>
      </div>

      {/* Errors / empty */}
      {error && <div className="bg-red-900 bg-opacity-50 border-l-4 border-red-500 p-4 mb-6 text-red-300">Error: {error}</div>}

      {!loading && !error && filteredGames.length === 0 && (
        <div className="text-center py-16 bg-gray-900 rounded-xl shadow-sm border border-purple-800">
          <h3 className="mt-2 text-lg font-medium text-white">ไม่พบเกมที่ค้นหา</h3>
          <p className="mt-1 text-gray-400">ลองปรับเปลี่ยนเงื่อนไขการค้นหาของคุณ</p>
        </div>
      )}

      {/* List / Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading && filteredGames.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => <GameCardSkeleton key={i} />)
          ) : (
            <>
              {filteredGames.map(g => <GameCard key={g.id} game={g} />)}
              {loading && Array.from({ length: 4 }).map((_, i) => <GameCardSkeleton key={`l-${i}`} />)}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {loading && filteredGames.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-lg shadow-sm border border-purple-800 p-4 animate-pulse" />
            ))
          ) : (
            <>
              {filteredGames.map(g => <GameListItem key={g.id} game={g} />)}
              {loading && Array.from({ length: 4 }).map((_, i) => <div key={`l2-${i}`} className="bg-gray-900 rounded-lg shadow-sm border border-purple-800 p-4 animate-pulse" />)}
            </>
          )}
        </div>
      )}

      {/* Load more */}
      {!loading && !error && filteredGames.length > 0 && hasMore && (
        <div className="mt-8 text-center">
          <button onClick={loadMore} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">โหลดเพิ่ม</button>
        </div>
      )}
    </div>
  );
}
