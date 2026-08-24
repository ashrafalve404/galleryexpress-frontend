'use client';

import { useState } from 'react';
import { Search, Ticket, ArrowRight, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getBookingByRef, getBooking, cancelBooking } from '@/lib/api/bookings';
import { formatDateTime, formatTime } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS, ROUTES } from '@/lib/utils/constants';
import type { Booking } from '@/lib/api/bookings';
import { toast } from 'sonner';

interface BookingWithTickets extends Booking {
  tickets?: Array<{ ticketNumber: string; status: string }>;
}

export default function MyBookingPage() {
  const router = useRouter();
  const [ref, setRef] = useState('');
  const [booking, setBooking] = useState<BookingWithTickets | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
                    <div className="text-xs text-gray-500">{booking.schedule?.route?.origin}</div>
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
                    <div className="font-bold text-[#E31B23]">{formatCurrency(booking.finalAmount)}</div>
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
              <div className="px-6 pb-5 flex gap-3">
                {booking.status === 'CONFIRMED' && ticketNumber && (
                  <button
                    onClick={handleViewTicket}
                    className="flex-1 bg-[#111111] hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
                  >
                    View Ticket
                  </button>
                )}
                {['CONFIRMED', 'HELD'].includes(booking.status) && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-500 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-8">
            Can't find your booking? Call us at <a href="tel:01826110036" className="text-[#E31B23]">01826-110036</a>
          </p>
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="font-black text-[#111111] text-base">Cancel Booking?</h2>
                <p className="text-gray-500 text-xs mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to cancel booking <span className="font-mono font-bold">{booking?.bookingRef}</span>?
              Refunds are subject to our cancellation policy.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {cancelling ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
