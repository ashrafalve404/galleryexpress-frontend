'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  RiDashboardFill,
  RiTicket2Fill,
  RiStackFill,
  RiStore3Fill,
  RiPercentFill,
  RiFileTextFill,
  RiUser3Fill,
  RiShareForwardFill,
  RiSettings4Fill,
  RiAddCircleFill,
  RiLogoutBoxRFill,
  RiMenu3Fill,
  RiCloseFill,
  RiArrowRightSLine,
  RiShieldCheckFill,
} from 'react-icons/ri';
import { BsFillTicketPerforatedFill } from 'react-icons/bs';
import { Loader2, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { useLanguageStore } from '@/lib/store/languageStore';
import { getTranslation, TranslationKey } from '@/lib/utils/translations';

export default function CounterAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isCounterAgent, user, clearAuth } = useAuthStore();
  const { lang } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = pathname === '/counter-agent/login' || pathname === '/counter-agent/register';

  useEffect(() => {
    if (!mounted) return;

    if (isAuthPage) {
      if (isAuthenticated && isCounterAgent()) {
        router.replace('/counter-agent/dashboard');
      }
      return;
    }

    if (!isAuthenticated || !isCounterAgent()) {
      router.replace('/counter-agent/login');
    }
  }, [mounted, isAuthPage, isAuthenticated, isCounterAgent, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    router.push('/counter-agent/login');
  };

  // Don't apply protection/sidebar layout to auth pages (login & register)
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Loading state
  if (!mounted || !isAuthenticated || !isCounterAgent()) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-sans gap-3">
        <Loader2 className="w-10 h-10 text-[#E31B23] animate-spin" />
        <p className="text-sm font-semibold text-gray-600">Verifying Agent Portal Access...</p>
      </div>
    );
  }

  const navItems = [
    { label: getTranslation(lang, 'dashboard', 'Dashboard'), href: '/counter-agent/dashboard', icon: RiDashboardFill },
    { label: getTranslation(lang, 'myTicket', 'My Ticket'), href: '/counter-agent/sold-tickets', icon: BsFillTicketPerforatedFill },
    { label: getTranslation(lang, 'myBulkTicket', 'My Bulk Ticket'), href: '/counter-agent/buy-bulk', icon: RiStackFill },
    { label: getTranslation(lang, 'myCounter', 'My Counter'), href: '/counter-agent/select-counter', icon: RiStore3Fill },
    { label: getTranslation(lang, 'commission', 'Commission'), href: '/counter-agent/commissions', icon: RiPercentFill },
    { label: getTranslation(lang, 'statement', 'Statement'), href: '/counter-agent/statements', icon: RiFileTextFill },
    { label: getTranslation(lang, 'myProfile', 'My Profile'), href: '/counter-agent/profile', icon: RiUser3Fill },
    { label: getTranslation(lang, 'referral', 'Referral'), href: '/counter-agent/referrals', icon: RiShareForwardFill, badge: getTranslation(lang, 'earn', 'Earn') },
    { label: getTranslation(lang, 'setting', 'Setting'), href: '/counter-agent/settings', icon: RiSettings4Fill },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#111111] text-white flex-col justify-between border-r border-white/10 sticky top-0 h-screen shrink-0 z-30 overflow-y-auto">
        <div>
          {/* Sidebar Header Logo & Status */}
          <div className="p-5 border-b border-white/10 space-y-3">
            <Link href="/" className="block hover:opacity-95 transition-opacity" title="Go to Public Website">
              <div className="bg-white py-2 px-3.5 rounded-2xl shadow-sm border border-white/20 flex items-center justify-center">
                <img
                  src="/ticketdrkrlogo.png"
                  alt="Ticket Dorkar"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </Link>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-gray-300 tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23]" />
                {getTranslation(lang, 'agentPortal', 'Agent Portal')}
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {getTranslation(lang, 'active', 'Active')}
              </div>
            </div>
          </div>

          {/* Quick Action: Sell Ticket Button */}
          <div className="px-3 pt-3 pb-1.5">
            <Link
              href="/counter-agent/sell-ticket"
              className="w-full bg-[#E31B23] hover:bg-[#c9121a] text-white font-black text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 group uppercase tracking-wider"
            >
              <RiAddCircleFill size={18} className="group-hover:rotate-90 transition-transform duration-200" />
              <span>{getTranslation(lang, 'sellNewTicket', 'SELL NEW TICKET')}</span>
            </Link>
          </div>

          {/* Sequential Navigation Links */}
          <nav className="px-3 py-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/counter-agent/profile' && pathname === '/counter-agent/kyc');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${
                    isActive
                      ? 'bg-[#E31B23] text-white shadow-md'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                    <span className={lang === 'EN' ? 'uppercase tracking-wider' : ''}>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User & Logout */}
        <div className="p-4 border-t border-white/10 bg-[#161616] space-y-3">
          {/* Language Switcher Toggle */}
          <div className="flex items-center justify-between px-1 pb-1 border-b border-white/10">
            <span className="text-[11px] font-extrabold text-gray-300 uppercase">LANGUAGE / ভাষা</span>
            <LanguageToggle variant="dark" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <Link
              href="/counter-agent/profile"
              className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
                <RiUser3Fill size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-white truncate">
                  {user?.name || 'Agent User'}
                </div>
                <div className="text-[10px] text-gray-400 truncate">
                  {user?.email || 'Agent Profile'}
                </div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title={getTranslation(lang, 'logout', 'Logout')}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-[#E31B23] text-red-400 hover:text-white transition-all shrink-0 border border-red-500/20 shadow-2xs"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#111111] text-white px-4 py-3 border-b border-white/10 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all active:scale-95"
            aria-label="Open Navigation Drawer"
          >
            <RiMenu3Fill size={20} />
          </button>
          <span className="text-xs font-black text-white tracking-wide uppercase">
            {getTranslation(lang, 'agentPortal', 'Agent Portal')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {getTranslation(lang, 'active', 'Active')}
        </div>
      </header>

      {/* Mobile Side Drawer (Sliding Left-to-Right) */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" suppressHydrationWarning>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-[280px] max-w-[85vw] bg-[#111111] text-white h-full flex flex-col justify-between shadow-2xl z-10 border-r border-white/10">
            {/* Top scrollable section */}
            <div className="flex-1 overflow-y-auto">
              {/* Drawer Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#111111] z-10">
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="bg-white p-1.5 rounded-xl hover:opacity-90 transition-opacity block"
                    title="Go to Public Website"
                  >
                    <img
                      src="/ticketdrkrlogo.png"
                      alt="Ticket Dorkar"
                      className="h-6 w-auto object-contain"
                    />
                  </Link>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase">
                      {getTranslation(lang, 'agentPortal', 'Agent Portal')}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {getTranslation(lang, 'active', 'Active')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 bg-white/10 rounded-xl text-gray-300 hover:text-white"
                >
                  <RiCloseFill size={18} />
                </button>
              </div>

              {/* Drawer Quick Action */}
              <div className="p-3 border-b border-white/10">
                <Link
                  href="/counter-agent/sell-ticket"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-full bg-[#E31B23] hover:bg-[#c9121a] text-white font-black text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 uppercase tracking-wider"
                >
                  <RiAddCircleFill size={18} /> {getTranslation(lang, 'sellNewTicket', 'SELL NEW TICKET')}
                </Link>
              </div>

              {/* Sequential Navigation Items */}
              <nav className="px-3 py-2 space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${
                        isActive
                          ? 'bg-[#E31B23] text-white shadow-md'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                        <span className={lang === 'EN' ? 'uppercase tracking-wider' : ''}>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">
                          {item.badge}
                        </span>
                      ) : (
                        <RiArrowRightSLine size={18} className="opacity-40" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer User & Sign Out */}
            <div className="p-4 border-t border-white/10 bg-[#161616] space-y-3 shrink-0">
              {/* Language Switcher Toggle */}
              <div className="flex items-center justify-between px-1 pb-1 border-b border-white/10">
                <span className="text-[11px] font-extrabold text-gray-300">Language / ভাষা</span>
                <LanguageToggle variant="dark" />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                    <RiUser3Fill size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {user?.name || getTranslation(lang, 'agentUser', 'Agent User')}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      {user?.email || ''}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#c9121a] text-white text-xs font-bold shadow-xs transition-all"
              >
                <LogOut className="w-4 h-4" /> {getTranslation(lang, 'signOut', 'Sign Out')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Area */}
      <div className="flex-1 min-w-0 flex flex-col justify-between overflow-x-hidden pb-20 md:pb-0">
        <div className="flex-1">{children}</div>

        {/* Global Agent Portal Footer */}
        <footer className="bg-[#111111] text-gray-400 text-xs py-4 px-6 text-center border-t border-white/10 mt-auto hidden md:block">
          &copy; {new Date().getFullYear()} Ticket Dorkar Limited. {lang === 'BN' ? 'কাউন্টার এজেন্ট পোর্টাল।' : 'Counter Agent Portal.'}
        </footer>
      </div>

      {/* Mobile App Native Bottom Navigation Bar (4 Normal Options with Premium Filled Icons) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111] border-t border-white/10 flex items-center justify-around py-2 px-2 shadow-2xl backdrop-blur-md">
        {[
          { label: getTranslation(lang, 'dashboard', 'Dashboard'), href: '/counter-agent/dashboard', icon: RiDashboardFill },
          { label: getTranslation(lang, 'sellTicket', 'Sell Ticket'), href: '/counter-agent/sell-ticket', icon: RiAddCircleFill },
          { label: getTranslation(lang, 'myTicket', 'My Ticket'), href: '/counter-agent/sold-tickets', icon: BsFillTicketPerforatedFill },
          { label: getTranslation(lang, 'myBulkTicket', 'Bulk Ticket'), href: '/counter-agent/buy-bulk', icon: RiStackFill },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-[#E31B23] font-black'
                  : 'text-gray-400 hover:text-white font-semibold'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-[#E31B23]/15' : 'bg-transparent'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#E31B23]' : 'text-gray-400'} />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
