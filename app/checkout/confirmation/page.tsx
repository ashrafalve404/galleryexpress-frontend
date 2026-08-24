'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Download, Ticket, Share2, Home } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useBookingStore } from '@/lib/store/bookingStore';
import { formatCurrency } from '@/lib/utils/currency';
import { formatTime } from '@/lib/utils/date';
import { ROUTES } from '@/lib/utils/constants';

export default function ConfirmationPage() {
  const router = useRouter();
  const { bookingRef, ticketNumber, schedule, selectedSeats, passengers, getFinalAmount, reset } = useBookingStore();

  useEffect(() => {
    if (!bookingRef) {
      router.replace(ROUTES.HOME);
    }
  }, [bookingRef, router]);

  const handleNewBooking = () => {
    reset();
    router.push(ROUTES.HOME);
  };

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 pb-10 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Success header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={44} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-black text-[#111111] mb-2">Booking Confirmed</h1>
            <p className="text-gray-500 text-sm">Your tickets have been issued. Have a safe journey!</p>
          </div>

          {/* Booking card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-6">
            {/* Top red band */}
            <div className="bg-[#E31B23] px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-80">Booking Reference</div>
                  <div className="font-black text-xl tracking-widest">{bookingRef}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80">Status</div>
                  <div className="font-bold text-sm bg-green-500 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    CONFIRMED
                  </div>
                </div>
              </div>
            </div>

            {/* Journey info */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="text-center">
                  <div className="text-xl font-black text-[#111111]">
                    {schedule ? formatTime(schedule.departureTime) : '--'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{schedule?.origin}</div>
                </div>
                <div className="flex-1 flex items-center justify-center gap-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[#E31B23] font-bold text-xs">→</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-[#111111]">
                    {schedule ? formatTime(schedule.arrivalTime) : '--'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{schedule?.destination}</div>
                </div>
              </div>

              {/* Passengers & Seats */}
              <div className="space-y-2 mb-4">
                {selectedSeats.map((seat, i) => (
                  <div key={seat.id} className="flex items-center justify-between text-sm">
                    <div className="text-gray-700">
                      <span className="font-medium">{passengers[i]?.name || 'Passenger'}</span>
                      <span className="text-gray-400 ml-2">· Seat {seat.seatNumber}</span>
                    </div>
                    <span className="text-gray-600 font-medium">{formatCurrency(seat.price)}</span>
                  </div>
                ))}
              </div>

              <hr className="mb-4" />

              <div className="flex justify-between font-bold">
                <span>Total Paid</span>
                <span className="text-[#E31B23]">{formatCurrency(getFinalAmount())}</span>
              </div>
            </div>

            {/* Dashed divider (ticket tear line) */}
            <div className="flex items-center px-4">
              <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 -ml-6" />
              <div className="flex-1 border-t border-dashed border-gray-200" />
              <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 -mr-6" />
            </div>

            {/* Ticket number */}
            {ticketNumber && (
              <div className="px-6 py-4 bg-gray-50">
                <div className="text-xs text-gray-400 mb-1">Ticket Number</div>
                <div className="font-mono font-bold text-[#111111]">{ticketNumber}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {ticketNumber && (
              <Link
                href={ROUTES.TICKET(ticketNumber)}
                className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-gray-800 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                <Ticket size={15} />
                View Ticket
              </Link>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              <Download size={15} />
              Print Ticket
            </button>
            <button
              onClick={handleNewBooking}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              <Home size={15} />
              New Booking
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            Questions? Contact us at{' '}
            <a href="tel:+880XXXXXXXX" className="text-[#E31B23]">+880 18XX-XXXXXX</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
