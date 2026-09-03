'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  RiNotification3Fill,
  RiCheckboxCircleFill,
  RiTimeFill,
  RiCloseCircleFill,
  RiTicket2Fill,
  RiRefreshFill,
  RiArrowRightSFill,
  RiCheckDoubleFill,
  RiDeleteBin6Fill,
} from 'react-icons/ri';
import client from '@/lib/api/client';
import { formatDateTime } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/authStore';

export interface UserNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  createdAt: string;
  read: boolean;
}

export function UserNotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [readIds, setReadIds] = useState<string[]>([]);
  const [clearedIds, setClearedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedRead = localStorage.getItem('user_read_notifications');
      if (storedRead) setReadIds(JSON.parse(storedRead));
      const storedCleared = localStorage.getItem('user_cleared_notifications');
      if (storedCleared) setClearedIds(JSON.parse(storedCleared));
    } catch {
      // ignore
    }
  }, []);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['userNotifications'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/notifications/my');
      return data;
    },
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const rawNotifications: UserNotification[] = data?.notifications || [];
  const notifications = rawNotifications.filter((n) => !clearedIds.includes(n.id));

  const markAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds((prev) => Array.from(new Set([...prev, ...allIds])));
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_read_notifications', JSON.stringify(Array.from(new Set([...readIds, ...allIds]))));
    }
  };

  const clearAllNotifications = () => {
    const allIds = rawNotifications.map((n) => n.id);
    setClearedIds(allIds);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_cleared_notifications', JSON.stringify(allIds));
    }
  };

  const markOneRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_read_notifications', JSON.stringify(updated));
      }
    }
  };

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const getItemIcon = (type: string) => {
    if (type === 'TICKET_CONFIRMED') return <RiCheckboxCircleFill size={18} className="text-emerald-600" />;
    if (type === 'PAYMENT_PENDING') return <RiTimeFill size={18} className="text-amber-600" />;
    if (type === 'BOOKING_CANCELLED') return <RiCloseCircleFill size={18} className="text-rose-600" />;
    return <RiTicket2Fill size={18} className="text-[#E31B23]" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2 sm:p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all shadow-2xs group flex items-center justify-center"
        title="My Notifications"
      >
        <RiNotification3Fill size={19} className="group-hover:scale-105 transition-transform text-gray-500 hover:text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#E31B23] text-white text-[9px] font-black w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="fixed inset-x-4 top-24 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-84 bg-white rounded-2xl border border-gray-200/80 shadow-2xl z-[9999] overflow-hidden animate-fade-in text-gray-900">
          {/* Header */}
          <div className="p-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <RiNotification3Fill size={16} className="text-[#E31B23]" />
              <span className="font-bold text-gray-900 text-xs sm:text-sm">Ticket Alerts</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-[#E31B23] rounded-full text-[9px] font-black">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-1 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors text-[11px] font-bold flex items-center gap-1"
                  title="Mark all as read"
                >
                  <RiCheckDoubleFill size={14} className="text-emerald-600" />
                  <span className="hidden sm:inline">Read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors text-[11px] font-bold flex items-center gap-1"
                  title="Clear all notifications"
                >
                  <RiDeleteBin6Fill size={14} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              <button
                onClick={() => refetch()}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
                title="Refresh"
              >
                <RiRefreshFill size={14} className={isFetching ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setDropdownOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <RiCloseCircleFill size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs">
                <RiCheckboxCircleFill size={26} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                <span>No active notifications</span>
              </div>
            ) : (
              notifications.map((item) => {
                const isRead = readIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-3 flex items-start gap-2.5 transition-colors group ${
                      isRead ? 'bg-white hover:bg-slate-50' : 'bg-red-50/20 hover:bg-red-50/40'
                    }`}
                  >
                    <div className="p-1.5 rounded-xl bg-gray-100 group-hover:bg-white border border-gray-200/80 shrink-0 mt-0.5">
                      {getItemIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <Link
                          href={item.link}
                          onClick={() => {
                            markOneRead(item.id);
                            setDropdownOpen(false);
                          }}
                          className="text-xs font-bold text-gray-900 group-hover:text-[#E31B23] transition-colors truncate"
                        >
                          {item.title}
                        </Link>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#E31B23] shrink-0" title="Unread" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-tight mt-0.5">
                        {item.body}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-gray-400 font-semibold">
                          {formatDateTime(item.createdAt)}
                        </span>
                        {!isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markOneRead(item.id);
                            }}
                            className="text-[10px] font-bold text-gray-400 hover:text-emerald-600 transition-colors flex items-center gap-0.5"
                          >
                            <RiCheckDoubleFill size={13} /> Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs font-bold">
            <Link
              href="/user-notifications"
              onClick={() => setDropdownOpen(false)}
              className="text-gray-700 hover:text-[#E31B23] transition-colors flex items-center gap-1"
            >
              All Notifications ({notifications.length})
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setDropdownOpen(false)}
              className="text-[#E31B23] hover:underline flex items-center gap-1"
            >
              My Bookings <RiArrowRightSFill size={15} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
