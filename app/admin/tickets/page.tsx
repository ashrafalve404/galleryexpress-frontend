'use client';

import { useQuery } from '@tanstack/react-query';
import client from '@/lib/api/client';
import { formatDateTime } from '@/lib/utils/date';

export default function AdminTicketsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/tickets');
      return data?.data || data || [];
    },
  });
  const tickets: Record<string, unknown>[] = Array.isArray(data) ? data : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#111111]">Tickets</h1>
        <p className="text-gray-500 text-sm mt-0.5">{tickets.length} tickets issued</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Ticket No.', 'Booking Ref', 'Passenger', 'Seat', 'Status', 'Issued'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1,2,3,4,5].map((i) => (
                  <tr key={i}>{[1,2,3,4,5,6].map((j) => (<td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-20" /></td>))}</tr>
                ))
              ) : tickets.map((t) => {
                const booking = t.booking as Record<string, unknown> | undefined;
                const passengers = booking?.passengers as Record<string, unknown>[] | undefined;
                const seats = booking?.seats as Record<string, unknown>[] | undefined;
                return (
                  <tr key={t.id as string} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono font-bold text-[#111111] text-xs">{t.ticketNumber as string}</td>
                    <td className="px-5 py-4 font-mono text-gray-600 text-xs">{booking?.bookingRef as string || '--'}</td>
                    <td className="px-5 py-4 text-gray-700">{passengers?.[0]?.name as string || '--'}</td>
                    <td className="px-5 py-4 text-gray-600">{seats?.[0]?.seatNumber as string || '--'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'VALID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {t.status as string || '--'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{t.issuedAt ? formatDateTime(t.issuedAt as string) : '--'}</td>
                  </tr>
                );
              })}
              {!isLoading && tickets.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No tickets yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
