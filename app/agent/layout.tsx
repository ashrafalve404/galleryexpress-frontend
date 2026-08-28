'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import {
  RiLayoutGridFill,
  RiShoppingBag3Fill,
  RiTicket2Fill,
  RiCoupon3Fill,
  RiLogoutBoxRLine,
  RiBuilding2Fill,
  RiMenuLine,
  RiCloseLine,
  RiShieldCheckFill,
  RiBusFill,
} from 'react-icons/ri';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || pathname === '/agent/login') return;
    const ALLOWED_ROLES = ['COUNTER_AGENT', 'COUNTER_MANAGER', 'ADMIN', 'SUPER_ADMIN'];
    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      router.push('/agent/login');
    }
  }, [mounted, user, pathname, router]);

  if (pathname === '/agent/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    clearAuth();
    router.push('/agent/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/agent/dashboard', icon: RiLayoutGridFill },
    { label: 'Buy Ticket Packages', href: '/agent/buy-bulk', icon: RiShoppingBag3Fill },
    { label: 'My Ticket Packages', href: '/agent/my-quotas', icon: RiCoupon3Fill },
    { label: 'Sell Passenger Ticket', href: '/agent/issue-ticket', icon: RiTicket2Fill },
    { label: 'Sold Tickets', href: '/agent/issued-tickets', icon: RiTicket2Fill },
    { label: 'Verify Account (NID)', href: '/agent/verification', icon: RiShieldCheckFill },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col md:flex-row">
      {/* Mobile Top Header Bar with 3-Bar Hamburger Icon */}
      <div className="md:hidden bg-[#111111] border-b border-gray-800 px-4 py-3.5 flex items-center justify-between text-white sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E31B23] text-white flex items-center justify-center font-black shadow-md">
            <RiBusFill size={18} />
          </div>
          <div>
            <div className="font-black text-xs text-white">Gallery Express</div>
            <div className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">
              Agent: {user?.name || 'Counter Agent'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-[#E31B23] transition-colors"
          aria-label="Toggle Agent Menu"
        >
          {mobileMenuOpen ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
        </button>
      </div>

      {/* Backdrop Overlay for Mobile */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Desktop + Mobile Drawer) */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 w-64 bg-[#111111] text-white shrink-0 flex flex-col justify-between p-4 md:p-6 border-r border-gray-800 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E31B23] text-white flex items-center justify-center font-black shrink-0 shadow-md">
                <RiBusFill size={22} />
              </div>
              <div>
                <div className="font-extrabold text-sm text-white">Gallery Express</div>
                <div className="text-[11px] text-gray-400 font-medium truncate max-w-[140px]">
                  Agent: {user?.name || 'Counter Agent'}
                </div>
              </div>
            </div>

            {/* Mobile Close Button inside Drawer */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-gray-400 hover:text-white p-1"
            >
              <RiCloseLine size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-[#E31B23] text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-6 border-t border-gray-800 space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E31B23]/20 text-[#E31B23] flex items-center justify-center shrink-0">
              <RiBuilding2Fill size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {user?.name || 'Authorized Agent'}
              </div>
              <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                Counter Agent
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-[#E31B23] text-gray-300 hover:text-white transition-all text-xs font-bold"
          >
            <RiLogoutBoxRLine size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 min-w-0 overflow-y-auto">
        {children}
      </main>

      {/* App-Like Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111] border-t border-gray-800 px-1 py-2 flex items-center justify-around">
        {[
          { label: 'Dashboard', href: '/agent/dashboard', icon: RiLayoutGridFill },
          { label: 'Buy Packages', href: '/agent/buy-bulk', icon: RiShoppingBag3Fill },
          { label: 'My Packages', href: '/agent/my-quotas', icon: RiCoupon3Fill },
          { label: 'Sell Ticket', href: '/agent/issue-ticket', icon: RiTicket2Fill },
          { label: 'Verify NID', href: '/agent/verification', icon: RiShieldCheckFill },
        ].map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all ${
                active ? 'text-[#E31B23] font-black' : 'text-gray-400 font-semibold hover:text-white'
              }`}
            >
              <Icon size={20} className={active ? 'scale-110 transition-transform' : ''} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
