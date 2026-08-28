'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentGetIssuedTickets } from '@/lib/api/agent';
import { RiTicket2Fill, RiPrinterFill, RiQrCodeFill } from 'react-icons/ri';
import { QRCodeSVG } from 'qrcode.react';

export default function AgentIssuedTicketsPage() {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const { data: bookings, isLoading } = useQuery<any[]>({
    queryKey: ['agent-issued-tickets'],
    queryFn: agentGetIssuedTickets,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#111111]">Sold Tickets History</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">
          History of all tickets sold to passengers from your ticket packages.
        </p>
      </div>

      {isLoading ? (
        <div className="text-xs font-semibold text-gray-400 py-10 text-center">Loading sold tickets...</div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
          <RiTicket2Fill size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-[#111111] text-base mb-1">No Sold Tickets Yet</h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">
            You haven't sold any tickets to passengers yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-gray-700">
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="p-3">
                      <div className="font-black text-[#111111]">{b.bookingRef}</div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        Package #{b.bulkOrderId?.slice(0, 8)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[#111111]">
                        {b.passengers?.[0]?.name || 'Passenger'}
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">{b.passengers?.[0]?.phone}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[#111111]">
                        {b.schedule?.route?.origin} → {b.schedule?.route?.destination}
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">
                        {b.schedule?.departureDate?.slice(0, 10)} @ {b.schedule?.departureTime}
                      </div>
                    </td>
                    <td className="p-3 font-black text-[#E31B23]">
                      Seats: {b.bookingSeats?.map((s: any) => s.seat?.seatNumber).join(', ')}
                    </td>
                    <td className="p-3 font-bold text-[#111111]">
                      ৳{Number(b.netAmount).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="inline-flex items-center gap-1.5 bg-[#111111] hover:bg-[#E31B23] text-white px-3.5 py-2 rounded-xl text-[11px] font-bold transition-colors shadow-xs"
                      >
                        <RiQrCodeFill size={14} />
                        View / Print Pass
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Pass Print Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-100 shadow-2xl space-y-5 animate-fade-in-up">
            <div className="text-center pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#E31B23] text-white flex items-center justify-center font-black mx-auto mb-2 shadow-md">
                GE
              </div>
              <h2 className="text-lg font-black text-[#111111]">Boarding Pass Ticket</h2>
              <div className="text-xs font-bold text-gray-500">Ref: {selectedBooking.bookingRef}</div>
            </div>

            <div className="flex justify-center py-2">
              <QRCodeSVG value={selectedBooking.bookingRef} size={130} level="M" />
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Passenger:</span>
                <strong className="text-[#111111]">{selectedBooking.passengers?.[0]?.name}</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phone:</span>
                <strong className="text-[#111111]">{selectedBooking.passengers?.[0]?.phone}</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Route:</span>
                <strong className="text-[#111111]">{selectedBooking.schedule?.route?.origin} → {selectedBooking.schedule?.route?.destination}</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Travel Date:</span>
                <strong className="text-[#111111]">{selectedBooking.schedule?.departureDate?.slice(0, 10)} @ {selectedBooking.schedule?.departureTime}</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Seat(s):</span>
                <strong className="text-[#E31B23]">{selectedBooking.bookingSeats?.map((s: any) => s.seat?.seatNumber).join(', ')}</strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-[#E31B23] text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-[#C41920] shadow-md"
              >
                <RiPrinterFill size={16} /> Print Boarding Pass
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
