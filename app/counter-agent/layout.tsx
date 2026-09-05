'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  RiDashboardFill,
  RiStore3Fill,
  RiWallet3Fill,
  RiUser3Fill,
  RiLogoutBoxRFill,
  RiMenu3Fill,
  RiCloseFill,
  RiArrowRightSLine,
  RiShieldCheckFill,
} from 'react-icons/ri';
import { Loader2, LogOut } from 'lucide-react';
import { BsFillTicketPerforatedFill } from 'react-icons/bs';
import { useAuthStore } from '@/lib/store/authStore';

export default function CounterAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isCounterAgent, user, clearAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage = pathname === '/counter-agent/login';

  useEffect(() => {
    if (!mounted) return;

    if (isLoginPage) {
      if (isAuthenticated && isCounterAgent()) {
        router.replace('/counter-agent/dashboard');
      }
      return;
    }

    if (!isAuthenticated || !isCounterAgent()) {
      router.replace('/counter-agent/login');
    }
  }, [mounted, isLoginPage, isAuthenticated, isCounterAgent, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    router.push('/counter-agent/login');
  };

  // Don't apply protection/sidebar layout to the login page
  if (isLoginPage) {
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
    {
      label: 'Dashboard',
      href: '/counter-agent/dashboard',
      icon: RiDashboardFill,
      shortLabel: 'Dashboard',
    },
    {
      label: 'Sell Ticket',
      href: '/counter-agent/sell-ticket',
      icon: BsFillTicketPerforatedFill,
      shortLabel: 'Sell Ticket',
    },
    {
      label: 'My Sold Tickets',
      href: '/counter-agent/sold-tickets',
      icon: BsFillTicketPerforatedFill,
      shortLabel: 'Sold Tickets',
    },
    {
      label: 'My Bulk Orders',
      href: '/counter-agent/buy-bulk',
      icon: BsFillTicketPerforatedFill,
      shortLabel: 'Bulk Orders',
    },
    {
      label: 'KYC Verification',
      href: '/counter-agent/kyc',
      icon: RiShieldCheckFill,
      shortLabel: 'KYC',
    },
    {
      label: 'Select Counter',
      href: '/counter-agent/select-counter',
      icon: RiStore3Fill,
      shortLabel: 'Counter',
    },
    {
      label: 'Commissions',
      href: '/counter-agent/commissions',
      icon: RiWallet3Fill,
      shortLabel: 'Commissions',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#111111] text-white flex-col justify-between border-r border-white/10 sticky top-0 h-screen shrink-0 z-30">
        <div>
          {/* Sidebar Header Logo */}
          <div className="p-5 border-b border-white/10 flex flex-col items-start gap-2.5">
            <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
              <div className="bg-white py-2 px-3.5 rounded-xl shadow-sm border border-white/20 flex items-center justify-center">
                <img
                  src="/ticketdrkrlogo.png"
                  alt="Ticket Dorkar"
                  className="h-9 w-auto object-contain"
                />
              </div>
            </Link>
            <div>
              <span className="bg-[#E31B23] text-white text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-md inline-block shadow-xs">
                Counter Agent Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#E31B23] text-white shadow-md'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User & Logout */}
        <div className="p-4 border-t border-white/10 bg-[#161616]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
                <RiUser3Fill size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-white truncate">
                  {user?.name || 'Agent User'}
                </div>
                <div className="text-[10px] text-gray-400 truncate">
                  {user?.email || ''}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-[#E31B23] text-red-400 hover:text-white transition-all shrink-0 flex items-center gap-1.5 border border-red-500/20 shadow-2xs"
            >
              <LogOut size={15} />
              <span className="text-xs font-bold">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header with Menu Button */}
      <header className="md:hidden bg-[#111111] text-white p-4 border-b border-white/10 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all"
            aria-label="Open Navigation Drawer"
          >
            <RiMenu3Fill size={22} />
          </button>

          <span className="text-sm font-black text-white tracking-wide">
            Agent Portal
          </span>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-[#E31B23] text-red-400 hover:text-white transition-all flex items-center gap-1.5 border border-red-500/20 shadow-2xs"
        >
          <LogOut size={15} />
          <span className="text-xs font-bold">Logout</span>
        </button>
      </header>

      {/* Mobile Side Drawer (Sliding Left-to-Right) */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" suppressHydrationWarning>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Container (Sliding in from Left) */}
          <div className="relative w-[280px] max-w-[85vw] bg-[#111111] text-white h-full flex flex-col justify-between shadow-2xl z-10 border-r border-white/10 overflow-y-auto animate-slide-in-left">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-white p-1.5 rounded-lg">
                    <img
                      src="/ticketdrkrlogo.png"
                      alt="Ticket Dorkar"
                      className="h-6 w-auto object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-200">
                    Agent Portal
                  </span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 bg-white/10 rounded-lg text-gray-300 hover:text-white"
                >
                  <RiCloseFill size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#E31B23] text-white shadow-md'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                        <span>{item.label}</span>
                      </div>
                      <RiArrowRightSLine size={18} className="opacity-50" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer User & Sign Out */}
            <div className="p-4 border-t border-white/10 bg-[#161616]">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                    <RiUser3Fill size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {user?.name || 'Agent User'}
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
                <LogOut size={16} /> Sign Out
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
          &copy; {new Date().getFullYear()} Ticket Dorkar Limited. Counter Agent Portal.
        </footer>
      </div>

      {/* Mobile App Native Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111] border-t border-white/10 flex items-center justify-around py-2 px-2 shadow-2xl backdrop-blur-md">
        {navItems
          .filter((item) =>
            [
              '/counter-agent/dashboard',
              '/counter-agent/sell-ticket',
              '/counter-agent/buy-bulk',
              '/counter-agent/sold-tickets',
              '/counter-agent/commissions',
            ].includes(item.href)
          )
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isMiddleBuyBulk = item.href === '/counter-agent/buy-bulk';

            if (isMiddleBuyBulk) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 -mt-4"
                >
                  <div className="w-12 h-12 rounded-full bg-[#E31B23] text-white flex items-center justify-center shadow-md border-2 border-[#111111] transition-transform active:scale-95">
                    <Icon size={24} />
                  </div>
                  <span className="text-[10px] font-black text-white tracking-tight">{item.shortLabel}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#E31B23] font-black'
                    : 'text-gray-400 hover:text-white font-medium'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    isActive ? 'bg-[#E31B23]/15' : 'bg-transparent'
                  }`}
                >
                  <Icon size={22} className={isActive ? 'text-[#E31B23]' : 'text-gray-400'} />
                </div>
                <span className="text-[10px] tracking-tight">{item.shortLabel}</span>
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
