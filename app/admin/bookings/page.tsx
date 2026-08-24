'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, Plus, Filter, RefreshCw } from 'lucide-react';
import client from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/date';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '@/lib/utils/constants';

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'bookings', { page, status: statusFilter }],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/bookings', {
        params: { page, limit: 20, status: statusFilter || undefined },
      });
      return data;
    },
    staleTime: 30_000,
  });

  const bookings: Record<string, unknown>[] = data?.data || data?.bookings || [];
  const total = data?.total || 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#111111]">Bookings</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total bookings</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by booking ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20"
        >
          <option value="">All Status</option>
          {Object.entries(BOOKING_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Reference</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Route</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Seats</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="skeleton h-4 rounded" style={{ width: `${60 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : bookings.filter((b) =>
                !search || String(b.bookingRef).toLowerCase().includes(search.toLowerCase())
              ).map((b) => (
                <tr key={b.id as string} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-[#111111] text-xs">{b.bookingRef as string}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {(b.schedule as Record<string, unknown>)?.route ? (
                      <span>
                        {((b.schedule as Record<string, unknown>).route as Record<string, unknown>).origin as string}
                        {' → '}
                        {((b.schedule as Record<string, unknown>).route as Record<string, unknown>).destination as string}
                      </span>
                    ) : '--'}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {Array.isArray(b.seats) ? b.seats.length : '--'}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-700">
                    {formatCurrency(b.finalAmount as number)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_COLORS[b.status as string] || 'bg-gray-100 text-gray-700'}`}>
                      {BOOKING_STATUS_LABELS[b.status as string] || b.status as string}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {b.createdAt ? formatDateTime(b.createdAt as string) : '--'}
                  </td>
                </tr>
              ))}
              {!isLoading && bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-gray-400 text-sm">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-50">
            <span className="text-xs text-gray-500">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
                Prev
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 20)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
