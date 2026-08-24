'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Ticket, Bus, MapPin, Calendar, BadgeDollarSign,
  Tag, Building2, Users, BarChart3, Settings, ChevronLeft, ChevronRight,
  FileText, Image as ImageIcon, LogOut, Menu, X,
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
      { href: ROUTES.ADMIN_COUNTERS, label: 'Counters', icon: Building2 },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: ROUTES.ADMIN_USERS, label: 'Users', icon: Users },
      { href: ROUTES.ADMIN_REPORTS, label: 'Reports', icon: BarChart3 },
      { href: ROUTES.ADMIN_CMS, label: 'CMS Pages', icon: FileText },
      { href: ROUTES.ADMIN_SLIDERS, label: 'Sliders', icon: ImageIcon },
      { href: ROUTES.ADMIN_SETTINGS, label: 'Settings', icon: Settings },
    ],
  },
];

function NavItem({ href, label, icon: Icon, exact, collapsed }: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; exact?: boolean; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? 'bg-[#E31B23] text-white shadow-sm'
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

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center px-4 py-5 border-b border-gray-100 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <Link href={ROUTES.ADMIN} className="flex items-center">
            <img
              src="/galleryexplogo.png"
              alt="Gallery Express Admin"
              className="h-9 w-auto object-contain"
            />
          </Link>
        )}
        {collapsed && (
          <Link href={ROUTES.ADMIN} className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src="/favicon-96x96.png"
              alt="GE"
              className="w-full h-full object-cover"
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <ChevronRight size={15} className="text-gray-500" /> : <ChevronLeft size={15} className="text-gray-500" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.href} {...item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className={`p-3 border-t border-gray-100 ${collapsed ? '' : ''}`}>
        {!collapsed && user && (
          <div className="bg-gray-50 rounded-xl p-3 mb-2">
            <div className="font-semibold text-[#111111] text-sm truncate">{user.name}</div>
            <div className="text-xs text-gray-400 truncate">{user.role}</div>
          </div>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={15} />
          {!collapsed && 'Logout'}
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
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-md border border-gray-100"
        >
          <Menu size={18} className="text-gray-600" />
        </button>

        {mobileOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} />
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-2xl">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={16} />
              </button>
              {SidebarContent}
            </aside>
          </>
        )}
      </div>
    </>
  );
}
