'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bell, Ticket, Building2, Mail, ExternalLink, CheckCircle2, ChevronRight, RefreshCw, X } from 'lucide-react';
import { getAdminNotifications, type AdminNotification } from '@/lib/api/notifications';
import { formatDateTime } from '@/lib/utils/date';
import { ROUTES } from '@/lib/utils/constants';

interface AdminHeaderProps {
  title?: string;
  description?: string;
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: getAdminNotifications,
    refetchInterval: 15000, // Auto-refresh notifications every 15s
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryIcon = (category: AdminNotification['category']) => {
    switch (category) {
      case 'USER_PAYMENT':
        return <Ticket size={16} className="text-[#E31B23]" />;
      case 'AGENT_BULK':
        return <Building2 size={16} className="text-amber-600" />;
      case 'MESSAGE':
        return <Mail size={16} className="text-blue-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
      <div>
        {title && <h1 className="text-xl sm:text-2xl font-black text-[#111111]">{title}</h1>}
        {description && <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">{description}</p>}
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Notification Bell Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all shadow-2xs group"
            title="Notifications"
          >
            <Bell size={20} className="group-hover:scale-105 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#E31B23] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Quick Notification Dropdown Popup */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden animate-fade-in">
              {/* Dropdown Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[#E31B23]" />
                  <span className="font-bold text-gray-900 text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-[#E31B23] rounded-full text-[10px] font-extrabold">
                      {unreadCount} pending
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => refetch()}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs">
                    <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                    <span>No pending notifications!</span>
                  </div>
                ) : (
                  notifications.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      onClick={() => setDropdownOpen(false)}
                      className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors group block"
                    >
                      <div className="p-2 rounded-xl bg-gray-100 group-hover:bg-white border border-gray-200/80 shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#E31B23] transition-colors truncate">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-tight mb-1">
                          {item.body}
                        </p>
                        <span className="text-[9px] text-gray-400 font-semibold block">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                <Link
                  href={ROUTES.ADMIN_NOTIFICATIONS}
                  onClick={() => setDropdownOpen(false)}
                  className="text-xs font-bold text-[#E31B23] hover:underline inline-flex items-center gap-1"
                >
                  View All Notifications Center <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
