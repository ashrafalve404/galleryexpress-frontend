'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { HiMenu, HiX, HiPhone, HiUser, HiLogout, HiViewGrid, HiTicket, HiChevronDown } from 'react-icons/hi';
import { useAuthStore } from '@/lib/store/authStore';
import { useLogout } from '@/lib/hooks/useAuth';
import { ROUTES } from '@/lib/utils/constants';

const navLinks = [
  { href: ROUTES.HOME, label: 'Home' },
  { href: ROUTES.MY_BOOKING, label: 'My Booking' },
  { href: ROUTES.ABOUT, label: 'About Us' },
  { href: ROUTES.CONTACT, label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const logout = useLogout();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        scrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-gray-100/80 shadow-xs'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left section (Mobile Menu Button + Logo) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Mobile menu button (Left side) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>

            {/* Logo */}
            <Link href={ROUTES.HOME} className="flex items-center shrink-0">
              <img
                src="/galleryexplogo.png"
                alt="Gallery Express Limited"
                className="h-[54px] sm:h-[64px] lg:h-[74px] w-auto object-contain py-0.5 transition-transform hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  pathname === link.href
                    ? 'bg-[#E31B23]/10 text-[#E31B23]'
                    : 'text-gray-700 hover:text-[#111111] hover:bg-gray-100/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <a
              href="tel:01826110036"
              className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-[#E31B23] transition-colors"
            >
              <HiPhone className="text-[#E31B23] text-base" />
              <span>Help</span>
            </a>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 lg:px-3.5 lg:py-2 bg-gray-100 hover:bg-gray-200/80 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-[#E31B23] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name || user.email || 'User'}</span>
                  <HiChevronDown className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                    <Link
                      href={ROUTES.DASHBOARD}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#E31B23] transition-colors group"
                    >
                      <HiViewGrid className="text-gray-400 group-hover:text-[#E31B23] transition-colors" />
                      <span>My Dashboard</span>
                    </Link>
                    {isAdmin() && (
                      <Link
                        href={ROUTES.ADMIN}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#E31B23] transition-colors group"
                      >
                        <HiViewGrid className="text-gray-400 group-hover:text-[#E31B23] transition-colors" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <Link
                      href={ROUTES.MY_BOOKING}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#E31B23] transition-colors group"
                    >
                      <HiTicket className="text-gray-400 group-hover:text-[#E31B23] transition-colors" />
                      <span>Find Booking</span>
                    </Link>
                    <hr className="my-1.5 border-gray-100" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors group"
                    >
                      <HiLogout className="text-rose-400 group-hover:text-rose-700 transition-colors" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={ROUTES.LOGIN}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <HiUser className="text-sm sm:text-base" />
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl rounded-b-2xl animate-fade-in-up">
            <div className="py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold mx-2 transition-colors ${
                    pathname === link.href
                      ? 'bg-[#E31B23]/10 text-[#E31B23]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-2 pt-3 border-t border-gray-100 mt-2 space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      href={ROUTES.DASHBOARD}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <HiViewGrid className="text-gray-500" />
                      My Dashboard
                    </Link>
                    {isAdmin() && (
                      <Link
                        href={ROUTES.ADMIN}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <HiViewGrid className="text-gray-500" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <HiLogout />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href={ROUTES.LOGIN}
                    className="flex items-center justify-center gap-2 mx-2 bg-[#E31B23] text-white px-4 py-3 rounded-xl text-sm font-bold shadow-md"
                  >
                    <HiUser className="text-base" />
                    Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
