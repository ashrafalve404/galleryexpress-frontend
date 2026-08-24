'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { adminDeleteBooking } from '@/lib/api/bookings';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/date';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '@/lib/utils/constants';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';

export default function AdminBookingsPage() {
  const { isAdmin } = useAuthStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; ref: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await adminDeleteBooking(deleteTarget.id);
      toast.success(`Booking ${deleteTarget.ref} deleted permanently.`);
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete booking.';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

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
          <table className="w-full text-xs sm:text-sm min-w-[750px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Ref #', 'Passenger', 'Route', 'Amount', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
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
                    <td className="px-5 py-4 whitespace-nowrap">
                      {isAdmin() && (
                        <button
                          onClick={() => setDeleteTarget({ id: b.id as string, ref: b.bookingRef as string })}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors flex items-center gap-1 font-bold text-xs"
                          title="Delete Booking"
                        >
                          <Trash2 size={15} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!isLoading && bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm font-medium">
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-[#111111] text-base">Delete Booking?</h3>
                <p className="text-gray-500 text-xs mt-0.5">Permanent system deletion</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-5">
              Are you sure you want to permanently delete booking{' '}
              <span className="font-mono font-bold text-[#111111]">{deleteTarget.ref}</span>? All associated tickets and seat allocations will be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={!!deletingId}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!!deletingId}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deletingId ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Delete Forever'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
