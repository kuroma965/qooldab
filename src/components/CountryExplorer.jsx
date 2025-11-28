// src/components/CountryExplorer.jsx
'use client';
import Image from 'next/image';
import React, { useEffect, useState, useMemo, useCallback } from 'react';

// คอมโพเนนต์สำหรับแสดงสถานะการโหลดแบบ Skeleton
const CountryCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
        <div className="h-40 w-full bg-gray-200"></div>
        <div className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
        </div>
    </div>
);

// คอมโพเนนต์หลัก
export default function CountryExplorer({ initialQuery = '' }) {
    const [countries, setCountries] = useState([]);
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialQuery);
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const itemsPerPage = 12;

    // ดีเลย์การค้นหาเพื่อลดการเรียก API ที่ไม่จำเป็น
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    // ดึงข้อมูลประเทศ
    const fetchCountries = useCallback(async (search = '', pageNum = 1, append = false) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (search) params.set('q', search);
            params.set('page', pageNum);
            params.set('limit', itemsPerPage);

            const res = await fetch(`/api/country?${params.toString()}`, { cache: 'no-store' });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || `HTTP ${res.status}`);
            }

            const data = await res.json();
            const newCountries = Array.isArray(data) ? data : [data];

            if (append) {
                setCountries(prev => [...prev, ...newCountries]);
            } else {
                setCountries(newCountries);
            }

            setHasMore(newCountries.length === itemsPerPage);
        } catch (err) {
            setError(err.message || 'Unknown error');
            setCountries([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // โหลดข้อมูลครั้งแรกและเมื่อมีการเปลี่ยนแปลงเงื่อนไขการค้นหา
    useEffect(() => {
        fetchCountries(debouncedSearchTerm, page, page > 1);
    }, [debouncedSearchTerm, page, fetchCountries]);

    // กรองและเรียงลำดับข้อมูลประเทศ
    useEffect(() => {
        let filtered = [...countries];

        // กรองตามภูมิภาค
        if (selectedRegion !== 'All') {
            filtered = filtered.filter(country => country.region === selectedRegion);
        }

        // เรียงลำดับ
        filtered.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'population') return b.population - a.population;
            if (sortBy === 'capital') return a.capital.localeCompare(b.capital);
            return 0;
        });

        setFilteredCountries(filtered);
    }, [countries, selectedRegion, sortBy]);

    // รายการภูมิภาคทั้งหมด
    const regions = useMemo(() => {
        const regionSet = new Set(countries.map(country => country.region));
        return ['All', ...Array.from(regionSet).sort()];
    }, [countries]);

    // ฟังก์ชันค้นหาใหม่
    const handleSearch = (e) => {
        e.preventDefault();
        setDebouncedSearchTerm(searchTerm);
        setPage(1);
    };

    // ฟังก์ชันรีเซ็ต
    const handleReset = () => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setSelectedRegion('All');
        setSortBy('name');
        setPage(1);
    };

    // ฟังก์ชันโหลดเพิ่ม
    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    // คอมโพเนนต์การ์ดประเทศ
    const CountryCard = ({ country }) => (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-48 w-full">
                <Image
                    src={country.flag}
                    alt={`${country.name} flag`}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2 py-1 rounded-md shadow-sm">
                    {country.code}
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{country.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {country.capital}
                        </p>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                        <span className="font-medium mr-2">Region:</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{country.region}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-medium mr-2">Population:</span>
                        <span>{country.population.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                        View Details
                    </button>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );

    // คอมโพเนนต์รายการแบบตาราง
    const CountryListItem = ({ country }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="relative h-16 w-24 flex-shrink-0 rounded overflow-hidden">
                <Image
                    src={country.flag}
                    alt={`${country.name} flag`}
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div className="flex-grow">
                <h3 className="font-semibold text-gray-800">{country.name}</h3>
                <p className="text-sm text-gray-500">{country.capital}</p>
            </div>
            <div className="text-sm text-gray-600">
                <span className="font-medium">Region:</span> {country.region}
            </div>
            <div className="text-sm text-gray-600">
                <span className="font-medium">Population:</span> {country.population.toLocaleString()}
            </div>
            <div className="text-sm font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                {country.code}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Country Explorer</h1>
                <p className="text-gray-600">Discover information about countries around the world</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-grow">
                            <label htmlFor="search" className="sr-only">Search countries</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, capital or code (e.g. TH)"
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600 text-gray-900"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </form>

                <div className="border-t border-gray-200 pt-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <label htmlFor="region-filter" className="text-sm font-semibold text-gray-800">Region:</label>
                                <select
                                    id="region-filter"
                                    value={selectedRegion}
                                    onChange={(e) => setSelectedRegion(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white text-gray-800 shadow-sm"
                                >
                                    {regions.map(region => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <label htmlFor="sort-by" className="text-sm font-semibold text-gray-800">Sort by:</label>
                                <select
                                    id="sort-by"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white text-gray-800 shadow-sm"
                                >
                                    <option value="name">Name</option>
                                    <option value="population">Population</option>
                                    <option value="capital">Capital</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''} text-gray-700`}
                                aria-label="Grid view"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''} text-gray-700`}
                                aria-label="List view"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">Error: {error}</p>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && filteredCountries.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No countries found</h3>
                    <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
            )}

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading && filteredCountries.length === 0 ? (
                        // แสดง skeleton cards ขณะโหลดครั้งแรก
                        Array.from({ length: 8 }).map((_, i) => <CountryCardSkeleton key={i} />)
                    ) : (
                        <>
                            {filteredCountries.map((country) => (
                                <CountryCard key={country.code} country={country} />
                            ))}
                            {loading && (
                                // แสดง skeleton cards ขณะโหลดเพิ่ม
                                Array.from({ length: 4 }).map((_, i) => <CountryCardSkeleton key={`loading-${i}`} />)
                            )}
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {loading && filteredCountries.length === 0 ? (
                        // แสดง skeleton list items ขณะโหลดครั้งแรก
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-24 bg-gray-200 rounded"></div>
                                    <div className="flex-grow">
                                        <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            {filteredCountries.map((country) => (
                                <CountryListItem key={country.code} country={country} />
                            ))}
                            {loading && (
                                // แสดง skeleton list items ขณะโหลดเพิ่ม
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={`loading-${i}`} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-24 bg-gray-200 rounded"></div>
                                            <div className="flex-grow">
                                                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                                            </div>
                                            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                                            <div className="h-6 bg-gray-200 rounded w-12"></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            )}

            {!loading && !error && filteredCountries.length > 0 && hasMore && (
                <div className="mt-8 text-center">
                    <button
                        onClick={loadMore}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}