'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, CreditCard, Ticket } from 'lucide-react';
import client from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils/currency';

export default function AdminReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reports', 'dashboard'],
    queryFn: async () => {
      try {
        const { data } = await client.get('/api/v1/admin/reports/dashboard');
        return data?.data || data;
      } catch { return null; }
    },
  });

  const stats = [
    { label: 'Total Revenue', value: data?.totalRevenue ? formatCurrency(data.totalRevenue) : '৳0', icon: CreditCard, color: 'bg-emerald-500' },
    { label: 'Monthly Revenue', value: data?.monthlyRevenue ? formatCurrency(data.monthlyRevenue) : '৳0', icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'Total Bookings', value: data?.totalBookings ?? 0, icon: Ticket, color: 'bg-[#E31B23]' },
    { label: 'Confirmed', value: data?.confirmedBookings ?? 0, icon: BarChart3, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#111111]">Reports</h1>
        <p className="text-gray-500 text-sm mt-0.5">Business performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          isLoading ? (
            <div key={stat.label} className="skeleton h-32 rounded-2xl" />
          ) : (
            <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <div className="text-2xl font-black text-[#111111] mb-0.5">{String(stat.value)}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          )
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <BarChart3 size={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="font-bold text-gray-700 mb-2">Revenue Chart</h2>
        <p className="text-gray-400 text-sm">Detailed revenue charts will be displayed here. Connect to the reports API endpoint for full analytics.</p>
      </div>
    </div>
  );
}
