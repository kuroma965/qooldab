'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // จะเก็บข้อมูล user เมื่อล็อกอินแล้ว (หรือ null)
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef();

  useEffect(() => {
    // ตัวอย่าง: เช็ก session จาก API ของคุณ
    // ปรับ endpoint ให้ตรงกับระบบจริง (NextAuth, Supabase, Clerk, custom)
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? data); // ขึ้นกับโครงของ response
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('fetchSession error', err);
        setUser(null);
      }
    }

    fetchSession();
  }, []);

  // ปิด dropdown ถ้าคลิกนอก
  useEffect(() => {
    function onDocClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const logout = async () => {
    try {
      // ปรับ endpoint ให้ตรงกับระบบคุณ
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setUser(null);
        setIsUserMenuOpen(false);
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-2">
                QD
              </div>
              <span className="text-white font-bold text-xl">qooldab</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-purple-800 hover:text-white'}`}>
              หน้าแรก
            </Link>
            <Link href="/games" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/games' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-purple-800 hover:text-white'}`}>
              เกมทั้งหมด
            </Link>
            <Link href="/categories" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/categories' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-purple-800 hover:text-white'}`}>
              หมวดหมู่
            </Link>
            <Link href="/promotions" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/promotions' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-purple-800 hover:text-white'}`}>
              โปรโมชั่น
            </Link>

            <Link href="/cart" className="relative p-1 text-gray-300 hover:text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </Link>

            <div className='hidden md:flex items-center space-x-2 ml-6'>
              {/* หากยังไม่ล็อกอิน: แสดง Signup + Login */}
              {!user && (
                <>
                  <Link href="/signup" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-purple-800 hover:text-white">
                    สมัครสมาชิก
                  </Link>
                  <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:opacity-90">
                    เข้าสู่ระบบ
                  </Link>
                </>
              )}

              {/* ถ้าล็อกอิน: แสดงไอคอนผู้ใช้ + dropdown */}
              {user && (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={toggleUserMenu} className="flex items-center p-1 rounded-full text-gray-300 hover:text-white focus:outline-none">
                    {/* ถ้ามี avatar ใช้ Image หรือ <img> แทน */}
                    <span className="sr-only">Open user menu</span>
                    <svg className="h-8 w-8 rounded-full bg-gray-800 p-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">ดูโปรไฟล์</Link>
                        <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">ออกจากระบบ</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-purple-800 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black bg-opacity-95">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-800">หน้าแรก</Link>
            <Link href="/games" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-purple-800 hover:text-white">เกมทั้งหมด</Link>
            <Link href="/categories" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-purple-800 hover:text-white">หมวดหมู่</Link>
            <Link href="/promotions" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-purple-800 hover:text-white">โปรโมชั่น</Link>
            <Link href="/cart" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-purple-800 hover:text-white">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              ตะกร้าสินค้า
            </Link>

            {!user && (
              <>
                <Link href="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-purple-800 hover:text-white">สมัครสมาชิก</Link>
                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium bg-purple-600 text-white hover:opacity-90">เข้าสู่ระบบ</Link>
              </>
            )}

            {user && (
              <>
                <Link href="/account" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-purple-800 hover:text-white">บัญชีของฉัน</Link>
                <button onClick={logout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-purple-800 hover:text-white">ออกจากระบบ</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
