'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  RiHome5Fill,
  RiBusFill,
  RiNotification3Fill,
} from 'react-icons/ri';
import { BsFillTicketPerforatedFill } from 'react-icons/bs';
import { useLanguageStore } from '@/lib/store/languageStore';
import { useAuthStore } from '@/lib/store/authStore';
import client from '@/lib/api/client';

export function CustomerBottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguageStore();
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

  const { data } = useQuery({
    queryKey: ['userNotifications'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/notifications/my');
      return data;
    },
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const rawNotifications = data?.notifications || [];
  const notifications = rawNotifications.filter((n: any) => !clearedIds.includes(n.id));
  const unreadCount = notifications.filter((n: any) => !readIds.includes(n.id)).length;

  const isHomeActive = pathname === '/';
  const isSearchActive = pathname === '/search';
  const isDashboardActive = pathname === '/dashboard' || pathname === '/my-booking';
  const isNotificationsActive = pathname === '/user-notifications';

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111]/95 backdrop-blur-md border-t border-white/10 flex items-center justify-around py-2 px-2 shadow-2xl">
      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-all ${
          isHomeActive ? 'text-[#E31B23] font-black' : 'text-gray-400 hover:text-white font-bold'
        }`}
      >
        <RiHome5Fill size={20} className={isHomeActive ? 'text-[#E31B23]' : ''} />
        <span className="text-[10px]">{lang === 'BN' ? 'হোম' : 'Home'}</span>
      </Link>

      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-all ${
          isSearchActive ? 'text-[#E31B23] font-black' : 'text-gray-400 hover:text-white font-bold'
        }`}
      >
        <RiBusFill size={20} className={isSearchActive ? 'text-[#E31B23]' : ''} />
        <span className="text-[10px]">{lang === 'BN' ? 'বাস টিকিট' : 'Book Bus'}</span>
      </Link>

      <Link
        href="/dashboard"
        className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-all ${
          isDashboardActive ? 'text-[#E31B23] font-black' : 'text-gray-400 hover:text-white font-bold'
        }`}
      >
        <BsFillTicketPerforatedFill size={20} className={isDashboardActive ? 'text-[#E31B23]' : ''} />
        <span className="text-[10px]">{lang === 'BN' ? 'আমার ট্রিপ' : 'My Trips'}</span>
      </Link>

      <Link
        href="/user-notifications"
        className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-all relative ${
          isNotificationsActive ? 'text-[#E31B23] font-black' : 'text-gray-400 hover:text-white font-bold'
        }`}
      >
        <div className="relative">
          <RiNotification3Fill size={20} className={isNotificationsActive ? 'text-[#E31B23]' : ''} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-0.5 bg-[#E31B23] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-[#111111] animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">{lang === 'BN' ? 'নোটিফিকেশন' : 'Notifications'}</span>
      </Link>
    </nav>
  );
}
