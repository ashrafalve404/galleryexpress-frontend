'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuthStore } from '@/lib/store/authStore';
import { ROUTES } from '@/lib/utils/constants';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if authenticated from store or localStorage
    const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;
    const isUserAdmin = isAdmin();

    if ((!isAuthenticated && !hasToken) || !isUserAdmin) {
      router.replace(ROUTES.LOGIN);
    }
  }, [mounted, isAuthenticated, isAdmin, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#E31B23] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;
  if ((!isAuthenticated && !hasToken) || !isAdmin()) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50" suppressHydrationWarning>
      <AdminSidebar />
      <main className="flex-1 min-w-0 lg:ml-60 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
