'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  RiNotification3Fill,
  RiCheckboxCircleFill,
  RiTimeFill,
  RiCloseCircleFill,
  RiTicket2Fill,
  RiRefreshLine,
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiCheckDoubleLine,
  RiDeleteBin6Fill,
} from 'react-icons/ri';
import client from '@/lib/api/client';
import { formatDateTime } from '@/lib/utils/date';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import type { UserNotification } from '@/components/layout/UserNotificationBell';
import { toast } from 'sonner';

export default function UserNotificationsPage() {
  const { isAuthenticated } = useAuthStore();
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

  const { data, refetch, isLoading, isFetching } = useQuery({
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
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    localStorage.setItem('user_read_notifications', JSON.stringify(updated));
    toast.success('All notifications marked as read.');
  };

  const clearAllNotifications = () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    const allIds = rawNotifications.map((n) => n.id);
    setClearedIds(allIds);
    localStorage.setItem('user_cleared_notifications', JSON.stringify(allIds));
    toast.success('All notifications cleared.');
  };

  const markOneRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem('user_read_notifications', JSON.stringify(updated));
    }
  };

  const getItemIcon = (type: string) => {
    if (type === 'TICKET_CONFIRMED') return <RiCheckboxCircleFill size={22} className="text-emerald-600" />;
    if (type === 'PAYMENT_PENDING') return <RiTimeFill size={22} className="text-amber-600" />;
    if (type === 'BOOKING_CANCELLED') return <RiCloseCircleFill size={22} className="text-rose-600" />;
    return <RiTicket2Fill size={22} className="text-[#E31B23]" />;
  };

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-20 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#E31B23] transition-colors mb-2"
              >
                <RiArrowLeftLine size={15} /> Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                <RiNotification3Fill size={30} className="text-[#E31B23]" /> Notification Center
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                View all system alerts, ticket confirmation updates, and payment status notifications.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => refetch()}
                className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <RiRefreshLine size={15} className={isFetching ? 'animate-spin' : ''} /> Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <RiCheckDoubleLine size={15} /> Mark Read ({unreadCount})
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <RiDeleteBin6Fill size={15} /> Clear All
                </button>
              )}
            </div>
          </div>

          {/* Notifications List Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-gray-400 text-sm font-semibold">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <RiCheckboxCircleFill size={40} className="mx-auto mb-3 text-emerald-500 opacity-60" />
                <h3 className="text-base font-bold text-gray-800">All notifications cleared!</h3>
                <p className="text-xs text-gray-400 mt-1">No ticket or payment notifications to display.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((item) => {
                  const isRead = readIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                        isRead ? 'bg-white hover:bg-gray-50/60' : 'bg-red-50/30 hover:bg-red-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="p-2.5 rounded-2xl bg-gray-100 border border-gray-200/80 shrink-0 mt-0.5">
                          {getItemIcon(item.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-gray-900">
                              {item.title}
                            </h3>
                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#E31B23] inline-block shrink-0" />
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                            {item.body}
                          </p>
                          <span className="text-[10px] sm:text-xs text-gray-400 font-semibold block mt-2">
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-center">
                        {!isRead && (
                          <button
                            onClick={() => markOneRead(item.id)}
                            className="p-2 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                            title="Mark as read"
                          >
                            <RiCheckDoubleLine size={16} />
                          </button>
                        )}
                        <Link
                          href={item.link}
                          onClick={() => markOneRead(item.id)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-[#E31B23] hover:text-white text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                        >
                          View <RiArrowRightSLine size={15} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
