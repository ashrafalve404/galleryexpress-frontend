'use client';

import { useQuery } from '@tanstack/react-query';
import { RiTicketFill, RiBankCardFill, RiCalendarEventFill, RiGroupFill, RiBusFill, RiMapPinFill, RiPriceTag3Fill, RiBarChartFill } from 'react-icons/ri';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import Link from 'next/link';
import client from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate, formatTime, formatDateTime } from '@/lib/utils/date';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS, ROUTES } from '@/lib/utils/constants';
import { AdminHeader } from '@/components/layout/AdminHeader';

function StatCard({
  title, value, sub, icon: Icon, color, trend,
}: {
  title: string; value: string; sub?: string; icon: React.ComponentType<{ className?: string }>; color: string; trend?: 'up' | 'down';
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center shadow-xs`}>
          <Icon className="text-white text-xl" />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend === 'up' ? <HiTrendingUp className="text-base" /> : <HiTrendingDown className="text-base" />}
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-[#111111] mb-0.5">{value}</div>
      <div className="text-sm font-medium text-gray-500">{title}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function getAdminBookingAmount(b: Record<string, unknown>): number {
  const raw = Number(b.netAmount) || Number(b.totalAmount) || Number(b.finalAmount) || 0;
  if (raw > 0) return raw;

  const schedule = b.schedule as Record<string, unknown> | undefined;
  const route = schedule?.route as Record<string, unknown> | undefined;
  const destLower = ((route?.destination as string) || '').toLowerCase();
  const routeFallbackFare = destLower.includes('cox')
    ? 2000
    : destLower.includes('chittagong')
    ? 1200
    : 800;

  const seats = (b.bookingSeats as unknown[]) || (b.seats as unknown[]) || (b.passengers as unknown[]) || [];
  const seatCount = seats.length || 1;
  return seatCount * routeFallbackFare;
}

export default function AdminDashboard() {
  const { data: dashData, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      try {
        const { data } = await client.get('/api/v1/admin/reports/dashboard');
        return data?.data || data;
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin', 'bookings', 'recent'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/bookings', { params: { limit: 10 } });
      return data?.data || data?.bookings || [];
    },
    staleTime: 30_000,
  });

  const stats = [
    {
      title: 'Total Bookings',
      value: dashData?.totalBookings ?? '--',
      icon: RiTicketFill,
      color: 'bg-[#E31B23]',
      trend: 'up' as const,
    },
    {
      title: 'Revenue (Month)',
      value: dashData?.monthlyRevenue !== undefined ? formatCurrency(dashData.monthlyRevenue) : '--',
      icon: RiBankCardFill,
      color: 'bg-emerald-500',
      trend: 'up' as const,
    },
    {
      title: 'Active Schedules',
      value: dashData?.activeSchedules ?? '--',
      icon: RiCalendarEventFill,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Passengers',
      value: dashData?.totalPassengers ?? '--',
      icon: RiGroupFill,
      color: 'bg-purple-500',
      trend: 'up' as const,
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Dashboard Overview"
        description="Monitor real-time sales, bookings, agent activities, and pending actions."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          isLoading
            ? <div key={stat.title} className="skeleton h-36 rounded-2xl" />
            : <StatCard key={stat.title} {...stat} value={String(stat.value)} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-[#111111] text-sm">Recent Bookings</h2>
            <Link href={ROUTES.ADMIN_BOOKINGS} className="text-[#E31B23] text-xs font-bold hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {bookingsLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-6 py-4 flex justify-between">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-4 w-20 rounded" />
                </div>
              ))
            ) : (recentBookings || []).slice(0, 10).map((b: Record<string, unknown>) => {
              const schedule = b.schedule as Record<string, unknown> | undefined;
              const travelDate = schedule?.departureDate ? formatDate(schedule.departureDate as string, 'dd MMM yyyy') : null;
              const busTime = schedule?.departureTime ? formatTime(schedule.departureTime as string) : null;

              return (
                <div key={b.id as string} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="text-sm font-mono font-bold text-[#111111]">{b.bookingRef as string}</div>
                    {travelDate && (
                      <div className="text-xs text-gray-700 font-semibold mt-0.5">
                        Journey: {travelDate} {busTime ? `· ${busTime}` : ''}
                      </div>
                    )}
                    <div className="text-[11px] text-gray-400 font-medium">Bought: {b.createdAt ? formatDateTime(b.createdAt as string) : ''}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-800">
                      {formatCurrency(getAdminBookingAmount(b))}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${BOOKING_STATUS_COLORS[b.status as string] || 'bg-gray-100 text-gray-700'}`}>
                      {BOOKING_STATUS_LABELS[b.status as string] || b.status as string}
                    </span>
                  </div>
                </div>
              );
            })}
            {!bookingsLoading && (!recentBookings || recentBookings.length === 0) && (
              <div className="px-6 py-10 text-center text-gray-400 text-sm font-medium">No bookings recorded yet</div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-[#111111] text-sm mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: ROUTES.ADMIN_SCHEDULES, label: 'Add Schedule', icon: RiCalendarEventFill, desc: 'Create new trips' },
              { href: ROUTES.ADMIN_COACHES, label: 'Manage Coaches', icon: RiBusFill, desc: 'Fleet management' },
              { href: ROUTES.ADMIN_ROUTES, label: 'Manage Routes', icon: RiMapPinFill, desc: 'Route configuration' },
              { href: ROUTES.ADMIN_DISCOUNTS, label: 'Add Discount', icon: RiPriceTag3Fill, desc: 'Promo codes' },
              { href: ROUTES.ADMIN_REPORTS, label: 'View Reports', icon: RiBarChartFill, desc: 'Revenue & analytics' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-gray-100 group-hover:bg-[#E31B23]/10 rounded-xl flex items-center justify-center transition-colors">
                  <item.icon className="text-gray-600 group-hover:text-[#E31B23] text-lg transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#111111]">{item.label}</div>
                  <div className="text-xs text-gray-400 font-medium">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
