'use client';

import { useState } from 'react';
import { Search, Ticket, ArrowRight, Clock, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getBookingByRef } from '@/lib/api/bookings';
import { formatDateTime, formatTime } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS, ROUTES } from '@/lib/utils/constants';
import type { Booking } from '@/lib/api/bookings';

export default function MyBookingPage() {
  const [ref, setRef] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) { setError('Please enter a booking reference.'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await getBookingByRef(ref.trim().toUpperCase());
      setBooking(data);
    } catch {
      setError('No booking found with this reference. Please check and try again.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const statusClass = booking ? BOOKING_STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-700' : '';
  const statusLabel = booking ? BOOKING_STATUS_LABELS[booking.status] || booking.status : '';

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
                  placeholder="e.g. GX-20240823-XXXX"
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
                {booking.status === 'CONFIRMED' && (
                  <Link
                    href={`/my-booking`}
                    className="flex-1 bg-[#111111] hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
                  >
                    View Ticket
                  </Link>
                )}
                {['CONFIRMED', 'HELD'].includes(booking.status) && (
                  <button className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-500 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-8">
            Can't find your booking? Call us at <a href="tel:+880XXXXXXXX" className="text-[#E31B23]">+880 18XX-XXXXXX</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
