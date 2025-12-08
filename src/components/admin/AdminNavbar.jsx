// components/admin/AdminNavbar.jsx
'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function AdminNavbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const isAdmin = String(session?.user?.role || '').toLowerCase() === 'admin';

  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef();

  useEffect(() => {
    function onDocClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => setIsMenuOpen((s) => !s);
  const toggleUserMenu = () => setIsUserMenuOpen((s) => !s);

  async function logout() {
    try {
      await signOut({ redirect: false });
      router.push('/'); // กลับไปหน้า user หลัง sign out
    } catch (err) {
      console.error('Sign out error', err);
    }
  }

  // same user svg as in main Navbar
  const UserSvg = ({ className = 'h-8 w-8', title = 'User' }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      role="img"
    >
      <title>{title}</title>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
  );

  // helper to mark active like main navbar
  const linkClass = (active) =>
    `px-3 py-2 rounded-md text-sm font-medium ${active ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-purple-800 hover:text-white'}`;

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin" className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-2">
                QD
              </div>
              <span className="text-white font-bold text-xl">qooldab</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/admin" className={linkClass(pathname === '/admin')}>
              แดชบอร์ด
            </Link>

            <Link href="/admin/products" className={linkClass(pathname.startsWith('/admin/products'))}>
              จัดการสินค้า
            </Link>

            <Link href="/admin/categories" className={linkClass(pathname.startsWith('/admin/categories'))}>
              จัดการหมวดหมู่
            </Link>

            <Link href="/admin/promotions" className={linkClass(pathname.startsWith('/admin/promotions'))}>
              จัดการโปรแกรม
            </Link>

            {/* ปุ่มกลับไปหน้าเว็บไซต์ — เป็นภาษาอังกฤษตามคำขอ */}
            <Link href="/" className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-gray-500 text-white hover:opacity-90">
              Back to site
            </Link>

            <div className="hidden md:flex items-center space-x-2 ml-6">
              {!isAuthenticated && !isLoading && (
                <>
                  <Link href="/admin/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-purple-800 hover:text-white">
                    สมัครสมาชิก
                  </Link>

                  <Link href="/admin/login" className="px-3 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:opacity-90">
                    เข้าสู่ระบบ
                  </Link>
                </>
              )}

              {isLoading && <div className="px-3 py-2 text-sm text-gray-300">กำลังโหลด...</div>}

              {isAuthenticated && (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={toggleUserMenu} className="flex items-center p-1 rounded-full text-gray-300 hover:text-white focus:outline-none" aria-haspopup="true" aria-expanded={isUserMenuOpen}>
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                      <UserSvg className="h-5 w-5 text-gray-200" />
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          ดูโปรไฟล์
                        </Link>
                        <Link href="/profile/history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          ประวัติการสั่งซื้อ
                        </Link>
                        {isAdmin && (
                          <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Back to site
                          </Link>
                        )}
                        <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                          ออกจากระบบ
                        </button>
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
            <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-800">หน้าแรก</Link>
            <Link href="/admin/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-purple-800 hover:text-white">สินค้าทั้งหมด</Link>
            <Link href="/admin/categories" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-purple-800 hover:text-white">หมวดหมู่</Link>
            <Link href="/admin/promotions" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-purple-800 hover:text-white">โปรโมชั่น</Link>

            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium bg-purple-600 text-white">Back to site</Link>

            {isAuthenticated && (
              <>
                <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-purple-800 hover:text-white">บัญชีของฉัน</Link>
                <Link href="/profile/history" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-purple-800 hover:text-white">ประวัติการสั่งซื้อ</Link>
                <button onClick={logout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-purple-800 hover:text-white">ออกจากระบบ</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
