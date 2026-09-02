'use client';

import { useState } from 'react';
import { Search, Ticket, ArrowRight, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getBookingByRef, getBooking, cancelBooking } from '@/lib/api/bookings';
import { formatDateTime, formatTime } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS, ROUTES, getOriginDisplayName } from '@/lib/utils/constants';
import type { Booking } from '@/lib/api/bookings';
import { toast } from 'sonner';
import { RiErrorWarningFill } from 'react-icons/ri';
import { useAuthStore } from '@/lib/store/authStore';

interface BookingWithTickets extends Booking {
  tickets?: Array<{ ticketNumber: string; status: string }>;
  counter?: { id: string; name: string; location?: string } | null;
}

function getBookingDisplayAmount(b: BookingWithTickets | null): number {
  if (!b) return 0;
  const raw = Number(b.netAmount) || Number(b.totalAmount) || Number(b.finalAmount) || 0;
  if (raw > 0) return raw;

  const destLower = (b.schedule?.route?.destination || '').toLowerCase();
  const routeFallbackFare = destLower.includes('cox')
    ? 2000
    : destLower.includes('chittagong')
    ? 1200
    : 800;

  const seatCount = b.seats?.length || b.passengers?.length || 1;
  return seatCount * routeFallbackFare;
}

export default function MyBookingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [ref, setRef] = useState('');
  const [booking, setBooking] = useState<BookingWithTickets | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isOwner = Boolean(
    booking && (
      (user?.id && booking.userId === user.id) ||
      (user?.phone && (booking as any).passengers?.some((p: any) => p.phone === user.phone)) ||
      (user?.email && (booking as any).passengers?.some((p: any) => p.email === user.email))
    )
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) { setError('Please enter a booking reference.'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await getBookingByRef(ref.trim().toUpperCase()) as BookingWithTickets;
      // Fetch full detail to get tickets
      try {
        const detail = await getBooking(data.id) as BookingWithTickets;
        setBooking(detail);
      } catch {
        setBooking(data);
      }
    } catch {
      setError('No booking found with this reference. Please check and try again.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = () => {
    const ticketNumber = booking?.tickets?.[0]?.ticketNumber;
    if (!ticketNumber) {
      toast.error('Ticket not found. The booking may not be confirmed yet.');
      return;
    }
    router.push(ROUTES.TICKET(ticketNumber));
  };

  const handleCancelConfirm = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      await cancelBooking(booking.id, { reason: 'Cancelled by passenger' });
      toast.success('Booking cancelled successfully.');
      setShowCancelConfirm(false);
      // Re-fetch to update status
      const detail = await getBooking(booking.id) as BookingWithTickets;
      setBooking(detail);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to cancel booking.';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  const statusClass = booking ? BOOKING_STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-700' : '';
  const statusLabel = booking ? BOOKING_STATUS_LABELS[booking.status] || booking.status : '';
  const ticketNumber = booking?.tickets?.[0]?.ticketNumber;
  const displayAmount = getBookingDisplayAmount(booking);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 pb-10 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Title */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#E31B23]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Ticket size={28} className="text-[#E31B23]" />
            </div>
            <h1 className="text-2xl font-black text-[#111111] mb-2">Find My Booking</h1>
            <p className="text-gray-500 text-sm">Enter your booking reference number to view your ticket.</p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Booking Reference
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="e.g. GE-XXXX-XXXX"
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all uppercase placeholder:normal-case placeholder:font-sans"
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E31B23] disabled:opacity-70 hover:bg-[#C41920] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Search size={15} /> Find Booking</>
              )}
            </button>
          </form>

          {/* Result */}
          {booking && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in-up">
              {/* Status bar */}
              <div className={`px-6 py-3 flex items-center justify-between ${booking.status === 'CONFIRMED' ? 'bg-green-50' : 'bg-gray-50'}`}>
                <span className="text-sm font-semibold text-gray-700">
                  Ref: <span className="font-mono font-black">{booking.bookingRef}</span>
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>

              <div className="px-6 py-5">
                {/* Journey */}
                <div className="flex items-center gap-4 mb-5">
                  <div>
                    <div className="text-xl font-black text-[#111111]">
                      {booking.schedule ? formatTime(booking.schedule.departureTime) : '--'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getOriginDisplayName(booking.schedule?.route?.origin, booking.counter)}
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <ArrowRight size={16} className="text-[#E31B23]" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-[#111111]">
                      {booking.schedule ? formatTime(booking.schedule.arrivalTime) : '--'}
                    </div>
                    <div className="text-xs text-gray-500">{booking.schedule?.route?.destination}</div>
                  </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-400">Passengers</div>
                    <div className="font-medium">{booking.passengers?.length || booking.seats?.length || '--'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Amount</div>
                    <div className="font-bold text-[#E31B23]">{formatCurrency(displayAmount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Booked On</div>
                    <div className="font-medium">{formatDateTime(booking.createdAt)}</div>
                  </div>
                  {ticketNumber && (
                    <div>
                      <div className="text-xs text-gray-400">Ticket No.</div>
                      <div className="font-mono font-bold text-xs text-[#111111]">{ticketNumber}</div>
                    </div>
                  )}
                </div>

                {/* Seats */}
                {booking.seats?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {booking.seats.map((seat, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                        Seat {seat.seatNumber}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              {booking.status === 'CONFIRMED' && ticketNumber && (
                <div className="px-6 pb-5">
                  <button
                    onClick={handleViewTicket}
                    className="w-full bg-[#111111] hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
                  >
                    View Ticket
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-8">
            Can't find your booking? Call us at <a href="tel:01826110036" className="text-[#E31B23]">01826-110036</a>
          </p>
        </div>
      </main>



      <Footer />
    </>
  );
}
