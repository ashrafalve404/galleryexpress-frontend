'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { HiMenu, HiX, HiChevronDown } from 'react-icons/hi';
import { 
  RiHome5Fill, 
  RiTicket2Fill, 
  RiInformationFill, 
  RiPhoneFill, 
  RiUserStarFill, 
  RiQuestionAnswerFill, 
  RiLayoutGridFill, 
  RiShieldUserFill, 
  RiLogoutBoxRFill, 
  RiUser3Fill,
  RiMenu3Fill
} from 'react-icons/ri';
import { BsFillTicketPerforatedFill } from 'react-icons/bs';
import { useAuthStore } from '@/lib/store/authStore';
import { useLogout } from '@/lib/hooks/useAuth';
import { ROUTES } from '@/lib/utils/constants';
import { UserNotificationBell } from './UserNotificationBell';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { useLanguageStore } from '@/lib/store/languageStore';
import { getTranslation, TranslationKey } from '@/lib/utils/translations';

const rawNavLinks: { href: string; key: TranslationKey; defaultLabel: string; icon: any }[] = [
  { href: ROUTES.HOME, key: 'home', defaultLabel: 'Home', icon: RiHome5Fill },
  { href: ROUTES.MY_BOOKING, key: 'myBooking', defaultLabel: 'My Booking', icon: BsFillTicketPerforatedFill },
  { href: ROUTES.ABOUT, key: 'aboutUs', defaultLabel: 'About Us', icon: RiInformationFill },
  { href: ROUTES.CONTACT, key: 'contact', defaultLabel: 'Contact', icon: RiPhoneFill },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, isCounterAgent } = useAuthStore();
  const logout = useLogout();

  const { lang } = useLanguageStore();
  const navLinks = rawNavLinks.map(item => ({
    ...item,
    label: getTranslation(lang, item.key, item.defaultLabel)
  }));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  return (
    <>
      <header
        suppressHydrationWarning
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
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Open Navigation Drawer"
              >
                <RiMenu3Fill size={22} />
              </button>

              {/* Logo */}
              <Link href={ROUTES.HOME} className="flex items-center shrink-0 py-1">
                <img
                  src="/ticketdrkrlogo.png"
                  alt="Ticket Dorkar"
                  className="h-12 sm:h-[60px] lg:h-[66px] w-auto object-contain transition-transform hover:scale-105"
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
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Language Switcher */}
              <LanguageToggle />

              <a
                href="tel:01826110036"
                className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-[#E31B23] transition-colors"
              >
                <RiPhoneFill className="text-[#E31B23] text-base" />
                <span>{getTranslation(lang, 'help', 'Help')}</span>
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
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-fade-in z-[9999]">
                      <Link
                        href={isCounterAgent() ? '/counter-agent/dashboard' : ROUTES.DASHBOARD}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#E31B23] transition-colors group"
                      >
                        <RiLayoutGridFill className="text-gray-400 group-hover:text-[#E31B23] transition-colors" />
                        <span>{isCounterAgent() ? getTranslation(lang, 'agentDashboard', 'Agent Dashboard') : getTranslation(lang, 'myDashboard', 'My Dashboard')}</span>
                      </Link>
                      {isAdmin() && (
                        <Link
                          href={ROUTES.ADMIN}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#E31B23] transition-colors group"
                        >
                          <RiShieldUserFill className="text-gray-400 group-hover:text-[#E31B23] transition-colors" />
                          <span>{getTranslation(lang, 'adminPanel', 'Admin Panel')}</span>
                        </Link>
                      )}
                      <Link
                        href={ROUTES.MY_BOOKING}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#E31B23] transition-colors group"
                      >
                        <BsFillTicketPerforatedFill className="text-gray-400 group-hover:text-[#E31B23] transition-colors" />
                        <span>{getTranslation(lang, 'myBooking', 'My Booking')}</span>
                      </Link>
                      <hr className="my-1.5 border-gray-100" />
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors group"
                      >
                        <RiLogoutBoxRFill className="text-rose-400 group-hover:text-rose-700 transition-colors" />
                        <span>{getTranslation(lang, 'logout', 'Logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={ROUTES.LOGIN}
                  className="flex items-center gap-1.5 sm:gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  <RiUser3Fill className="text-sm sm:text-base" />
                  {getTranslation(lang, 'signIn', 'Sign In')}
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Side Drawer Overlay & Panel */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" suppressHydrationWarning>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Side Drawer Panel */}
          <div className="relative w-[300px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-slide-in-left">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <Link href={ROUTES.HOME} onClick={() => setMenuOpen(false)} className="flex items-center">
                <img
                  src="/ticketdrkrlogo.png"
                  alt="Ticket Dorkar"
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 transition-colors"
                aria-label="Close menu"
              >
                <HiX size={22} />
              </button>
            </div>

            {/* User Profile Card inside Drawer (if logged in) */}
            {isAuthenticated && user && (
              <div className="p-4 mx-3 my-3 bg-[#E31B23]/5 border border-[#E31B23]/15 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E31B23] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-gray-900 text-sm truncate">{user.name || 'Valued Passenger'}</div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
              </div>
            )}

            {/* Nav Links in Serial */}
            <div className="px-3 py-4 flex-1 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#E31B23] text-white'
                        : 'text-gray-700 hover:bg-gray-100/80 hover:text-[#E31B23]'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#E31B23] transition-colors'} />
                    <span>{label}</span>
                  </Link>
                );
              })}

              {/* Account/Admin Links */}
              {isAuthenticated && user && (
                <>
                  <Link
                    href={isCounterAgent() ? '/counter-agent/dashboard' : ROUTES.DASHBOARD}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100/80 hover:text-[#E31B23]"
                  >
                    <RiLayoutGridFill size={20} className="text-gray-400 group-hover:text-[#E31B23] transition-colors" />
                    <span>{isCounterAgent() ? 'Agent Dashboard' : 'My Dashboard'}</span>
                  </Link>
                  {isAdmin() && (
                    <Link
                      href={ROUTES.ADMIN}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100/80 hover:text-[#E31B23]"
                    >
                      <RiShieldUserFill size={20} className="text-gray-400 group-hover:text-[#E31B23] transition-colors" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50"
                  >
                    <RiLogoutBoxRFill size={20} className="text-rose-600" />
                    <span>Logout</span>
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <div className="pt-2">
                  <Link
                    href={ROUTES.LOGIN}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition-all"
                  >
                    <RiUser3Fill size={18} />
                    <span>Sign In / Register</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Drawer Footer (Support & Help) */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <a
                href="tel:01826110036"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 shadow-xs hover:border-[#E31B23] transition-colors"
              >
                <RiPhoneFill size={16} className="text-[#E31B23]" />
                <span>Customer Support: 01826-110036</span>
              </a>
              <div className="text-center text-[10px] text-gray-400 mt-2">
                © {new Date().getFullYear()} Ticket Dorkar Limited
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

