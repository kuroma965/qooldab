'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import {
  Menu,
  X,
  User2,
  ChevronDown,
  Home,
  Grid2X2,
  Layers,
  Download,
  LayoutDashboard,
  LogIn,
  UserPlus,
  ShoppingBag,
  Clock3,
  Coins, // 🆕 เติมเครดิต icon
} from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const isAdmin = session?.user?.role === 'admin';

  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // เปลี่ยนหน้าแล้วปิดเมนูมือถือ
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => setIsMenuOpen((s) => !s);
  const toggleUserMenu = () => setIsUserMenuOpen((s) => !s);

  async function logout() {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (err) {
      console.error('Sign out error', err);
    }
  }

  const formatCredits = (val) => {
    const n = Number(val ?? 0);
    if (!Number.isFinite(n)) return String(val ?? 0);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  const rawCredits =
    session?.user?.credits != null ? String(session.user.credits) : '0.00';
  const creditsLabel = Number.isFinite(Number(rawCredits))
    ? formatCredits(Number(rawCredits))
    : String(rawCredits ?? '');

  const desktopLinkBase =
    'px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2';

  const mobileLinkBase =
    'block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2';

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between h-16">
          {/* left: logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-lg overflow-hidden mr-2 flex items-center justify-center bg-gray-900">
                <Image
                  src="/logo.png"
                  alt="Qooldab Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-white font-bold text-xl">qooldab</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className={`${desktopLinkBase} ${
                pathname === '/'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:bg-purple-800 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>หน้าหลัก</span>
            </Link>

            <Link
              href="/products"
              className={`${desktopLinkBase} ${
                pathname === '/products'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:bg-purple-800 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>สินค้าทั้งหมด</span>
            </Link>

            <Link
              href="/categories"
              className={`${desktopLinkBase} ${
                pathname === '/categories'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:bg-purple-800 hover:text-white'
              }`}
            >
              <Grid2X2 className="w-4 h-4" />
              <span>หมวดหมู่</span>
            </Link>

            <Link
              href="/download"
              className={`${desktopLinkBase} ${
                pathname === '/download'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:bg-purple-800 hover:text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 bg-gray-500 text-white hover:opacity-90"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}

            {/* Right side: auth section */}
            <div className="hidden md:flex items-center space-x-2 ml-6">
              {!isAuthenticated && !isLoading && (
                <>
                  <Link
                    href="/signup"
                    className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 text-gray-300 hover:bg-purple-800 hover:text-white"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>สมัครสมาชิก</span>
                  </Link>

                  <Link
                    href="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 bg-purple-600 text-white hover:opacity-90"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>เข้าสู่ระบบ</span>
                  </Link>
                </>
              )}

              {isLoading && (
                <div className="px-3 py-2 text-sm text-gray-300">
                  กำลังโหลด...
                </div>
              )}

              {isAuthenticated && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-2 px-2 py-1 rounded-full text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors"
                    aria-haspopup="true"
                    aria-expanded={isUserMenuOpen}
                  >
                    <span className="sr-only">Open user menu</span>

                    {/* credits pill */}
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full bg-gray-900 text-sm font-medium text-gray-200 border border-gray-700"
                      title={`Credits: ${creditsLabel}`}
                    >
                      ฿{creditsLabel}
                    </span>

                    {/* user icon + dropdown chevron */}
                    <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                      <User2 className="h-5 w-5 text-gray-200" />
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* dropdown */}
                  <div
                    className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 transform transition-all duration-150 ease-out ${
                      isUserMenuOpen
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  >
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User2 className="w-4 h-4" />
                        <span>ดูโปรไฟล์</span>
                      </Link>
                      <Link
                        href="/profile/history"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Clock3 className="w-4 h-4" />
                        <span>ประวัติการสั่งซื้อ</span>
                      </Link>

                      {/* 🆕 เติมเครดิต (desktop dropdown) */}
                      <Link
                        href="/profile/topup"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Coins className="w-4 h-4" />
                        <span>เติมเครดิต</span>
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <X className="w-4 h-4" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: credits + burger */}
          <div className="md:hidden flex items-center gap-3">
            {isAuthenticated && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-full bg-gray-900 text-sm font-medium text-gray-200 border border-gray-700"
                title={`Credits: ${creditsLabel}`}
              >
                ฿{creditsLabel}
              </span>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-purple-800 focus:outline-none transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with animation */}
      <div
        className={`
          md:hidden bg-black bg-opacity-95 overflow-hidden transform origin-top transition-all duration-200
          ${isMenuOpen ? 'max-h-[500px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95 pointer-events-none'}
        `}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/"
            className={`${mobileLinkBase} text-white hover:bg-purple-800`}
          >
            <Home className="w-5 h-5" />
            <span>หน้าหลัก</span>
          </Link>
          <Link
            href="/products"
            className={`${mobileLinkBase} text-gray-300 hover:bg-purple-800 hover:text-white`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>สินค้าทั้งหมด</span>
          </Link>
          <Link
            href="/categories"
            className={`${mobileLinkBase} text-gray-300 hover:bg-purple-800 hover:text-white`}
          >
            <Grid2X2 className="w-5 h-5" />
            <span>หมวดหมู่</span>
          </Link>
          <Link
            href="/download"
            className={`${mobileLinkBase} text-gray-300 hover:bg-purple-800 hover:text-white`}
          >
            <Download className="w-5 h-5" />
            <span>ดาวน์โหลด</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={`${mobileLinkBase} bg-red-600 text-white hover:opacity-90`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Admin Panel</span>
            </Link>
          )}

          {!isAuthenticated && !isLoading && (
            <>
              <Link
                href="/signup"
                className={`${mobileLinkBase} text-gray-300 hover:bg-purple-800 hover:text-white`}
              >
                <UserPlus className="w-5 h-5" />
                <span>สมัครสมาชิก</span>
              </Link>
              <Link
                href="/login"
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-purple-600 text-white hover:opacity-90 flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>เข้าสู่ระบบ</span>
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Link
                href="/profile"
                className={`${mobileLinkBase} text-gray-300 hover:bg-purple-800 hover:text-white`}
              >
                <User2 className="w-5 h-5" />
                <span>บัญชีของฉัน</span>
              </Link>
              <Link
                href="/profile/history"
                className={`${mobileLinkBase} text-gray-300 hover:bg-purple-800 hover:text-white`}
              >
                <Clock3 className="w-5 h-5" />
                <span>ประวัติการสั่งซื้อ</span>
              </Link>

              {/* 🆕 เติมเครดิตในเมนูมือถือ */}
              <Link
                href="/profile/topup"
                className={`${mobileLinkBase} text-gray-300 hover:bg-purple-800 hover:text-white`}
              >
                <Coins className="w-5 h-5" />
                <span>เติมเครดิต</span>
              </Link>

              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-purple-800 hover:text-white flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                <span>ออกจากระบบ</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
