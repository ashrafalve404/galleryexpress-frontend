'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { formatTime } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';

export default function AdminSchedulesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'schedules', page],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/schedules', { params: { page, limit: 20 } });
      return data;
    },
    staleTime: 30_000,
  });

  const schedules: Record<string, unknown>[] = data?.data || data?.schedules || [];
  const total = data?.total || 0;

  const filtered = schedules.filter((s) =>
    !search ||
    ((s.route as Record<string,unknown>)?.origin as string || '').toLowerCase().includes(search.toLowerCase()) ||
    ((s.route as Record<string,unknown>)?.destination as string || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#111111]">Schedules</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} scheduled trips</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 transition-colors">
            <RefreshCw size={14} />
          </button>
          <button className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Plus size={15} /> Add Schedule
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by route..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Route', 'Coach', 'Departure', 'Arrival', 'Fare', 'Seats Available', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>{[1,2,3,4,5,6,7].map((j) => (<td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-20" /></td>))}</tr>
                ))
              ) : filtered.map((s) => {
                const route = s.route as Record<string, unknown>;
                const coach = s.coach as Record<string, unknown>;
                const status = s.status as string;
                return (
                  <tr key={s.id as string} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-[#111111] whitespace-nowrap">
                      {route?.origin as string} → {route?.destination as string}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{coach?.name as string}</td>
                    <td className="px-5 py-4 font-mono text-[#111111]">{s.departureTime ? formatTime(s.departureTime as string) : '--'}</td>
                    <td className="px-5 py-4 font-mono text-gray-600">{s.arrivalTime ? formatTime(s.arrivalTime as string) : '--'}</td>
                    <td className="px-5 py-4 font-semibold">{formatCurrency((s.fare as Record<string,unknown>)?.basePrice as number || 0)}</td>
                    <td className="px-5 py-4 text-gray-600">{s.availableSeats as number ?? '--'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status === 'ACTIVE' ? 'bg-green-100 text-green-700' : status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No schedules found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-50">
            <span className="text-xs text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg text-sm font-medium">Prev</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 20)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg text-sm font-medium">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
