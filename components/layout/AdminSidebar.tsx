'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Ticket, Bus, MapPin, Calendar, BadgeDollarSign,
  Tag, Building2, Users, BarChart3, Settings, ChevronLeft, ChevronRight,
  FileText, Image as ImageIcon, LogOut, Menu, X, Globe, ExternalLink, Mail, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useLogout } from '@/lib/hooks/useAuth';
import { ROUTES } from '@/lib/utils/constants';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: ROUTES.ADMIN, label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: ROUTES.ADMIN_BOOKINGS, label: 'Bookings', icon: Ticket },
      { href: ROUTES.ADMIN_TICKETS, label: 'Tickets', icon: FileText },
      { href: ROUTES.ADMIN_SCHEDULES, label: 'Schedules', icon: Calendar },
      { href: ROUTES.ADMIN_COACHES, label: 'Coaches', icon: Bus },
      { href: ROUTES.ADMIN_ROUTES, label: 'Routes', icon: MapPin },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { href: ROUTES.ADMIN_FARES, label: 'Fares', icon: BadgeDollarSign },
      { href: ROUTES.ADMIN_DISCOUNTS, label: 'Discounts', icon: Tag },
      { href: ROUTES.ADMIN_OFFERS, label: 'Offer Posters', icon: Sparkles },
      { href: ROUTES.ADMIN_COUNTERS, label: 'Counters', icon: Building2 },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: ROUTES.ADMIN_MESSAGES, label: 'Messages', icon: Mail },
      { href: ROUTES.ADMIN_USERS, label: 'Users', icon: Users },
      { href: ROUTES.ADMIN_REPORTS, label: 'Reports', icon: BarChart3 },
      { href: ROUTES.ADMIN_CMS, label: 'CMS Pages', icon: FileText },
      { href: ROUTES.ADMIN_SLIDERS, label: 'Sliders', icon: ImageIcon },
      { href: ROUTES.ADMIN_SETTINGS, label: 'Settings', icon: Settings },
    ],
  },
];

function NavItem({ href, label, icon: Icon, exact, collapsed, onClick }: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; exact?: boolean; collapsed: boolean; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? 'bg-[#E31B23] text-white shadow-sm font-semibold'
          : 'text-gray-600 hover:text-[#111111] hover:bg-gray-100'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <Icon size={17} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();
  const logout = useLogout();
  const pathname = usePathname();

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Logo -> Points directly to Public Site (/) */}
      <div className={`flex items-center px-4 py-4 border-b border-gray-100 ${collapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
        {(!collapsed || isMobile) && (
          <Link href={ROUTES.HOME} title="Go to Public Website" className="flex items-center group">
            <img
              src="/galleryexplogo.png"
              alt="Gallery Express Public Site"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        )}
        {collapsed && !isMobile && (
          <Link href={ROUTES.HOME} title="Go to Public Website" className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src="/favicon-96x96.png"
              alt="GE"
              className="w-full h-full object-cover"
            />
          </Link>
        )}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
      </div>

      {/* Quick link to Public Site */}
      <div className="px-3 pt-3">
        <Link
          href={ROUTES.HOME}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all ${collapsed && !isMobile ? 'justify-center' : 'justify-between'}`}
          title="Visit Public Website"
        >
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-[#E31B23] shrink-0" />
            {(!collapsed || isMobile) && <span>Public Website</span>}
          </div>
          {(!collapsed || isMobile) && <ExternalLink size={13} className="text-gray-400" />}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {(!collapsed || isMobile) && (
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  collapsed={collapsed && !isMobile}
                  onClick={isMobile ? () => setMobileOpen(false) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100">
        {(!collapsed || isMobile) && user && (
          <div className="bg-gray-50 rounded-xl p-3 mb-2">
            <div className="font-bold text-[#111111] text-xs truncate">{user.name || user.email || 'Admin'}</div>
            <div className="text-[10px] text-gray-400 font-medium truncate">{user.role}</div>
          </div>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors ${collapsed && !isMobile ? 'justify-center' : ''}`}
          title={collapsed && !isMobile ? 'Logout' : undefined}
        >
          <LogOut size={16} />
          {(!collapsed || isMobile) && 'Logout'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-white border-r border-gray-100 z-40 transition-all duration-300 ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Sticky Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>
          <Link href={ROUTES.HOME} title="Go to Public Website" className="flex items-center">
            <img src="/galleryexplogo.png" alt="Gallery Express Public Site" className="h-7 w-auto object-contain" />
          </Link>
        </div>
        <Link
          href={ROUTES.HOME}
          className="text-xs bg-[#E31B23]/10 text-[#E31B23] hover:bg-[#E31B23]/20 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-colors"
        >
          <Globe size={13} /> Public Site
        </Link>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-2xl flex flex-col animate-fade-in-up">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 z-10"
              aria-label="Close Navigation Menu"
            >
              <X size={16} />
            </button>
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
