'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuthStore } from '@/lib/store/authStore';
import { ROUTES } from '@/lib/utils/constants';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated) return null;

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
