'use client';

import { useQuery } from '@tanstack/react-query';
import client from '@/lib/api/client';
import { formatDateTime } from '@/lib/utils/date';

export default function AdminTicketsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/tickets');
      const list = data?.data?.data || data?.data || data?.tickets || (Array.isArray(data) ? data : []);
      return Array.isArray(list) ? list : [];
    },
  });
  const tickets: Record<string, unknown>[] = Array.isArray(data) ? data : [];

  return (
    <div className="min-w-0 max-w-full">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-[#111111]">Tickets Issued</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">{tickets.length} tickets issued</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-xs sm:text-sm min-w-[650px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Ticket No.', 'Booking Ref', 'Passenger', 'Seat', 'Status', 'Issued'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase tracking-wider text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>{[1, 2, 3, 4, 5, 6].map((j) => (<td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-20" /></td>))}</tr>
                ))
              ) : tickets.map((t) => {
                const passenger = t.passenger as Record<string, unknown> | undefined;
                const booking = t.booking as Record<string, unknown> | undefined;
                const bookingPassengers = booking?.passengers as Record<string, unknown>[] | undefined;
                const bookingSeats = (booking?.bookingSeats as Record<string, unknown>[]) || (booking?.seats as Record<string, unknown>[]) || [];

                const passengerName = (passenger?.name as string) || (bookingPassengers?.[0]?.name as string) || 'Passenger';
                const passengerPhone = (passenger?.phone as string) || (bookingPassengers?.[0]?.phone as string) || '';

                const seatNumbers = bookingSeats
                  .map((bs) => (bs.seat as Record<string, unknown>)?.seatNumber || bs.seatNumber)
                  .filter(Boolean)
                  .join(', ');

                const status = (t.status as string) || '--';
                const statusColor = status === 'ACTIVE' || status === 'VALID' || status === 'CONFIRMED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'CANCELLED'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-gray-100 text-gray-700';

                return (
                  <tr key={t.id as string} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#111111]">{t.ticketNumber as string}</td>
                    <td className="px-5 py-4 font-mono text-gray-600 font-semibold">{booking?.bookingRef as string || '--'}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{passengerName}</div>
                      {passengerPhone && <div className="text-xs text-gray-400 font-medium">{passengerPhone}</div>}
                    </td>
                    <td className="px-5 py-4 text-gray-800 font-bold">{seatNumbers || '--'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 font-medium whitespace-nowrap">{t.issuedAt ? formatDateTime(t.issuedAt as string) : '--'}</td>
                  </tr>
                );
              })}
              {!isLoading && tickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm font-medium">No tickets issued yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
