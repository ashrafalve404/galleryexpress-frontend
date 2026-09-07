'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Ticket,
  Users,
  Calendar,
  Globe,
  Store,
  MapPin,
} from 'lucide-react';
import client from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils/currency';
import { useLanguageStore } from '@/lib/store/languageStore';

interface RoutePerformance {
  routeId: string;
  origin: string;
  destination: string;
  totalSchedules: number;
  totalBookings: number;
  totalRevenue: number;
}

export default function AdminReportsPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';

  // 1. Dashboard Reports Summary
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['admin', 'reports', 'dashboard'],
    queryFn: async () => {
      try {
        const { data } = await client.get('/api/v1/admin/reports/dashboard');
        return data?.data || data;
      } catch {
        return null;
      }
    },
  });

  // 2. Route Performance Breakdown
  const { data: routeData, isLoading: isRouteLoading } = useQuery<RoutePerformance[]>({
    queryKey: ['admin', 'reports', 'route-performance'],
    queryFn: async () => {
      try {
        const { data } = await client.get('/api/v1/admin/reports/route-performance');
        return data?.data || (Array.isArray(data) ? data : []);
      } catch {
        return [];
      }
    },
  });

  const totalRevenue = summary?.totalRevenue || 0;
  const monthlyRevenue = summary?.monthlyRevenue || 0;
  const todayRevenue = summary?.todayRevenue || 0;
  const totalBookings = summary?.totalBookings || 0;
  const confirmedBookings = summary?.confirmedBookings || 0;
  const totalPassengers = summary?.totalPassengers || 0;
  const onlineBookings = summary?.onlineBookings || 0;
  const counterBookings = summary?.counterBookings || 0;

  const totalChannelBookings = Math.max(1, onlineBookings + counterBookings);
  const onlinePct = Math.round((onlineBookings / totalChannelBookings) * 100);
  const counterPct = Math.round((counterBookings / totalChannelBookings) * 100);

  const routes = Array.isArray(routeData) ? routeData : [];
  const maxRouteRevenue = Math.max(1, ...routes.map((r) => r.totalRevenue || 0));

  const stats = [
    {
      label: isBn ? 'সর্বমোট আয়' : 'Total Revenue',
      value: formatCurrency(totalRevenue),
      subtext: isBn ? 'সর্বমোট আদায়কৃত রাজস্ব' : 'Lifetime confirmed earnings',
      icon: CreditCard,
      color: 'bg-emerald-500',
    },
    {
      label: isBn ? 'চলতি মাসের আয়' : 'Monthly Revenue',
      value: formatCurrency(monthlyRevenue),
      subtext: isBn ? 'চলতি মাসের মোট রাজস্ব' : 'This calendar month',
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
    {
      label: isBn ? 'আজকের আয়' : "Today's Revenue",
      value: formatCurrency(todayRevenue),
      subtext: isBn ? 'আজকের বিক্রয় হিসাব' : "Today's confirmed bookings",
      icon: Calendar,
      color: 'bg-indigo-500',
    },
    {
      label: isBn ? 'কনফার্মড বুকিং' : 'Confirmed Bookings',
      value: confirmedBookings.toLocaleString('en-BD'),
      subtext: isBn ? `মোট ${totalBookings}টি বুকিংয়ের মধ্যে` : `Out of ${totalBookings} total bookings`,
      icon: Ticket,
      color: 'bg-[#E31B23]',
    },
    {
      label: isBn ? 'মোট যাত্রী' : 'Total Passengers',
      value: totalPassengers.toLocaleString('en-BD'),
      subtext: isBn ? 'পরিবহনকৃত নিবন্ধিত যাত্রী' : 'Passengers booked',
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
          {isBn ? 'রিপোর্ট ও আয় বিশ্লেষণ' : 'Reports & Revenue Analytics'}
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          {isBn
            ? 'গ্যালারি এক্সপ্রেস / টিকিট দরকার প্ল্যাটফর্মের রিয়েল-টাইম আয় ও পারফরম্যান্স বিশ্লেষণ'
            : 'Real-time financial performance, booking channels, and route analytics.'}
        </p>
      </div>

      {/* 5 Key Stat Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {stats.map((stat) =>
          isSummaryLoading ? (
            <div key={stat.label} className="skeleton h-32 rounded-2xl" />
          ) : (
            <div
              key={stat.label}
              className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  {stat.label}
                </span>
                <div className={`w-10 h-10 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-xs`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-gray-400 mt-1">
                  {stat.subtext}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Channel Breakdown & Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Channel Distribution */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-[#111111] flex items-center gap-2">
                <BarChart3 size={20} className="text-[#E31B23]" />
                {isBn ? 'বিক্রয় চ্যানেল ডিস্ট্রিবিউশন' : 'Booking Source Breakdown'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isBn ? 'অনলাইন বুকিং বনাম কাউন্টার এজেন্ট বিক্রয়ের তুলনা' : 'Comparison between online web/app bookings and counter ticket sales.'}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Online Channel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-gray-800">
                  <Globe size={16} className="text-sky-500" />
                  {isBn ? 'অনলাইন ওয়েবসাইট বুকিং' : 'Online Public Website'}
                </span>
                <span className="text-sky-600 font-extrabold">{onlineBookings} {isBn ? 'টি বুকিং' : 'bookings'} ({onlinePct}%)</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5 border border-gray-200">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${onlinePct}%` }}
                />
              </div>
            </div>

            {/* Counter Channel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-gray-800">
                  <Store size={16} className="text-purple-500" />
                  {isBn ? 'কাউন্টার এজেন্ট টিকেট বিক্রি' : 'Counter Agent Portal'}
                </span>
                <span className="text-purple-600 font-extrabold">{counterBookings} {isBn ? 'টি বুকিং' : 'bookings'} ({counterPct}%)</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5 border border-gray-200">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${counterPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary Highlights */}
        <div className="bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#222222] text-white rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#E31B23]/20 border border-[#E31B23]/40 px-3 py-1 rounded-full text-xs font-extrabold text-[#E31B23]">
              {isBn ? 'লাইভ রিভিনিউ ডাটা' : 'Live Financial Summary'}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {isBn ? 'টিকিট দরকার মোট রাজস্ব ও আয় চিত্র' : 'Platform Revenue Performance'}
            </h2>

            <div className="space-y-3 pt-2 text-xs sm:text-sm text-gray-300">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2.5">
                <span>{isBn ? 'মোট কনফার্মড আয়:' : 'Total Confirmed Earnings:'}</span>
                <strong className="text-emerald-400 font-black text-base sm:text-lg">{formatCurrency(totalRevenue)}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-2.5">
                <span>{isBn ? 'চলতি মাসের মোট আয়:' : 'This Month Revenue:'}</span>
                <strong className="text-blue-400 font-black text-base">{formatCurrency(monthlyRevenue)}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>{isBn ? 'আজকের বিক্রিত আয়:' : "Today's Total Sales:"}</span>
                <strong className="text-amber-400 font-black text-base">{formatCurrency(todayRevenue)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Performance Analytics Table & Visual Chart */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#111111] flex items-center gap-2">
              <MapPin size={22} className="text-[#E31B23]" />
              {isBn ? 'রুট ভিত্তিক রাজস্ব ও বুকিং পারফরম্যান্স' : 'Route Revenue & Booking Performance'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isBn ? 'প্রতিটি রুটের মোট তৈরি শিডিউল, বুকিং সংখ্যা এবং আয়ের বিশ্লেষণ' : 'Real-time revenue, booking counts, and schedule breakdown per active corridor route.'}
            </p>
          </div>
        </div>

        {isRouteLoading ? (
          <div className="p-12 text-center text-gray-400 font-semibold text-sm animate-pulse">
            {isBn ? 'রুট পারফরম্যান্স ডাটা লোড হচ্ছে...' : 'Loading route performance analytics...'}
          </div>
        ) : routes.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold">
              {isBn ? 'কোনো সক্রিয় রুট পারফরম্যান্স ডাটা পাওয়া যায়নি।' : 'No active route performance data found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6">{isBn ? 'রুট' : 'Route'}</th>
                  <th className="py-4 px-4 text-center">{isBn ? 'মোট শিডিউল' : 'Schedules'}</th>
                  <th className="py-4 px-4 text-center">{isBn ? 'মোট বুকিং' : 'Bookings'}</th>
                  <th className="py-4 px-6 text-right">{isBn ? 'মোট আয় (রাজস্ব)' : 'Revenue Generated'}</th>
                  <th className="py-4 px-6 w-48">{isBn ? 'রাজস্ব অনুপাত' : 'Revenue Share'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {routes.map((r) => {
                  const pct = Math.round(((r.totalRevenue || 0) / maxRouteRevenue) * 100);
                  return (
                    <tr key={r.routeId || `${r.origin}-${r.destination}`} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-gray-900 flex items-center gap-2">
                        <MapPin size={16} className="text-[#E31B23]" />
                        <span>{r.origin} ➔ {r.destination}</span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-gray-600">
                        {r.totalSchedules}
                      </td>
                      <td className="py-4 px-4 text-center font-black text-gray-900">
                        {r.totalBookings}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-emerald-600 text-sm sm:text-base">
                        {formatCurrency(r.totalRevenue || 0)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-gray-200">
                            <div
                              className="bg-[#E31B23] h-full rounded-full transition-all duration-700"
                              style={{ width: `${Math.max(5, pct)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 block text-right">
                            {pct}% {isBn ? 'সর্বোচ্চ স্কেল' : 'of max route'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
