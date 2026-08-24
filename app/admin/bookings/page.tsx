'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/date';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '@/lib/utils/constants';

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'bookings', page, statusFilter],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/bookings', {
        params: {
          page,
          limit: 20,
          status: statusFilter || undefined,
        },
      });
      const resData = data?.data || data;
      return resData;
    },
  });

  const rawList = data?.data || data?.bookings || (Array.isArray(data) ? data : []);
  const bookings: Record<string, unknown>[] = (Array.isArray(rawList) ? rawList : []).filter((b: Record<string, unknown>) =>
    !search || (b.bookingRef as string || '').toLowerCase().includes(search.toLowerCase())
  );
  const total = data?.total || bookings.length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">Bookings</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">{total} total bookings recorded</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 transition-colors shadow-xs w-full sm:w-auto"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 font-medium"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20"
        >
          <option value="">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="HELD">Held</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* Smooth Horizontally Scrollable Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Ref #', 'Passenger', 'Route', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : bookings.map((b) => {
                const passengers = (b.passengers as Record<string, unknown>[]) || [];
                const schedule = b.schedule as Record<string, unknown>;
                const route = schedule?.route as Record<string, unknown>;
                const firstPassenger = passengers[0];

                return (
                  <tr key={b.id as string} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#111111] text-xs">
                      {b.bookingRef as string}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{firstPassenger?.name as string || '--'}</div>
                      <div className="text-xs text-gray-400 font-medium">{firstPassenger?.phone as string || '--'}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium whitespace-nowrap">
                      {route ? `${route.origin} → ${route.destination}` : '--'}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#E31B23]">
                      {formatCurrency(b.finalAmount as number || 0)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${BOOKING_STATUS_COLORS[b.status as string] || 'bg-gray-100 text-gray-700'}`}>
                        {BOOKING_STATUS_LABELS[b.status as string] || b.status as string}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs font-medium whitespace-nowrap">
                      {b.createdAt ? formatDateTime(b.createdAt as string) : '--'}
                    </td>
                  </tr>
                );
              })}
              {!isLoading && bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm font-medium">
                    No bookings found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-medium">
          <span>Showing page {page} of {Math.ceil(total / 20) || 1}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl text-xs font-bold transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl text-xs font-bold transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
