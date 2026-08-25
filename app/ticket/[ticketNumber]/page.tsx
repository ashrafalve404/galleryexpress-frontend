'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Printer, ArrowLeft, CheckCircle2, XCircle, Bus, MapPin, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getTicket } from '@/lib/api/tickets';
import { formatDateTime, formatTime } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { ROUTES } from '@/lib/utils/constants';
import { QRCodeSVG } from 'qrcode.react';

export default function TicketPage() {
  const { ticketNumber } = useParams<{ ticketNumber: string }>();

  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ['ticket', ticketNumber],
    queryFn: () => getTicket(ticketNumber),
    enabled: !!ticketNumber,
    retry: 1,
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#E31B23] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading ticket...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (isError || !ticket) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="font-bold text-gray-800 text-xl mb-2">Ticket Not Found</h2>
            <p className="text-gray-500 text-sm mb-4">
              We couldn&apos;t find this ticket. Please check the ticket number.
            </p>
            <Link href={ROUTES.MY_BOOKING} className="text-[#E31B23] text-sm font-semibold">
              Look Up Booking
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const booking = ticket.booking;
  const schedule = booking?.schedule;
  const seats = booking?.bookingSeats || [];

  const destLower = (schedule?.route?.destination || '').toLowerCase();
  const routeFallbackFare = destLower.includes('cox')
    ? 1250
    : destLower.includes('chittagong')
    ? 900
    : destLower.includes('sylhet')
    ? 850
    : 900;

  const rawAmount = Number(booking.netAmount) || Number(booking.totalAmount) || Number(booking.finalAmount) || 0;
  const seatCount = seats.length || 1;
  const displayAmount = rawAmount > 0 ? rawAmount : seatCount * routeFallbackFare;

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 pb-10 bg-gray-50 min-h-screen">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back & Print */}
          <div className="flex items-center justify-between mb-6">
            <Link href={ROUTES.MY_BOOKING} className="flex items-center gap-2 text-gray-600 hover:text-[#111111] text-sm">
              <ArrowLeft size={16} />
              Back
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-xs font-medium"
            >
              <Printer size={13} /> Print
            </button>
          </div>

          {/* Ticket Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100" id="ticket-card">

            {/* Red Header */}
            <div className="bg-[#E31B23] px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white rounded-xl px-3 py-1.5 shadow-sm">
                  <img
                    src="/galleryexplogo.png"
                    alt="Gallery Express"
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <div className="flex items-center gap-1.5 bg-green-400 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                  <CheckCircle2 size={11} />
                  CONFIRMED
                </div>
              </div>
              <div className="text-white/70 text-xs mb-0.5">Ticket No.</div>
              <div className="text-white font-black text-lg tracking-widest font-mono">{ticket.ticketNumber}</div>
            </div>

            {/* Journey */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-4 mb-5">
                <div>
                  <div className="text-2xl font-black text-[#111111]">
                    {schedule ? formatTime(schedule.departureTime) : '--'}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {schedule?.route?.origin || '--'}
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <Bus size={18} className="text-[#E31B23] mx-auto" />
                  <div className="text-[10px] text-gray-400 mt-1">{schedule?.coach?.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#111111]">
                    {schedule ? formatTime(schedule.arrivalTime) : '--'}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-0.5">
                    <MapPin size={10} />
                    {schedule?.route?.destination || '--'}
                  </div>
                </div>
              </div>

              {/* Travel date */}
              {schedule?.departureDate && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                  <Calendar size={12} />
                  {new Date(schedule.departureDate).toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
              )}

              {/* Passengers & Seats */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {seats.length > 0 ? seats.map((bs, i) => {
                  const seatAmt = Number((bs as any).amount) || (displayAmount / seatCount);
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-gray-400" />
                        <span className="font-medium text-[#111111]">
                          {bs.passenger?.name || ticket.passenger?.name || 'Passenger'}
                        </span>
                      </div>
                      <span className="text-gray-500 text-xs font-medium bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                        Seat {bs.seat?.seatNumber} · {formatCurrency(seatAmt)}
                      </span>
                    </div>
                  );
                }) : (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-gray-400" />
                      <span className="font-medium text-[#111111]">{ticket.passenger?.name || 'Passenger'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Booking details */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Booking Ref</span>
                  <span className="font-bold text-[#111111] font-mono">{booking.bookingRef}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Issued</span>
                  <span className="font-medium text-gray-700">{ticket.issuedAt ? formatDateTime(ticket.issuedAt) : '--'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-bold text-[#E31B23]">{formatCurrency(displayAmount)}</span>
                </div>
              </div>
            </div>

            {/* Tear line */}
            <div className="flex items-center px-4">
              <div className="w-6 h-6 rounded-full bg-gray-50 -ml-6 border border-gray-100" />
              <div className="flex-1 border-t border-dashed border-gray-200" />
              <div className="w-6 h-6 rounded-full bg-gray-50 -mr-6 border border-gray-100" />
            </div>

            {/* QR Code area */}
            <div className="px-6 py-5 bg-gray-50 text-center">
              <p className="text-xs text-gray-500 font-medium mb-3">Show this QR code at boarding</p>
              <div className="w-36 h-36 bg-white border-2 border-gray-200 rounded-2xl mx-auto flex items-center justify-center p-3 shadow-xs">
                <QRCodeSVG
                  value={ticket.ticketNumber || booking.bookingRef}
                  size={120}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2.5 font-mono font-bold">{ticket.ticketNumber}</p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Present this ticket (digital or printed) at boarding. Keep your booking reference safe.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
