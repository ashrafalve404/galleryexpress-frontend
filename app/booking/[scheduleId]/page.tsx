'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Clock, MapPin, Bus, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SeatMap } from '@/components/booking/SeatMap';
import { useSchedule, useScheduleSeats } from '@/lib/hooks/useSchedules';
import { useBookingStore } from '@/lib/store/bookingStore';
import { formatTime, getDuration } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { ROUTES } from '@/lib/utils/constants';
import type { Seat } from '@/lib/api/schedules';

export default function BookingPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const router = useRouter();

  const { data: schedule, isLoading: scheduleLoading, isError: scheduleError } = useSchedule(scheduleId);
  const { data: seats, isLoading: seatsLoading, isError: seatsError, refetch } = useScheduleSeats(scheduleId);

  const { selectedSeats, toggleSeat, setSchedule, setStep } = useBookingStore();
  const storeSchedule = useBookingStore((s) => s.schedule);

  const isLoading = scheduleLoading || seatsLoading;

  const sAny = schedule as unknown as Record<string, any>;
  const fAny = schedule?.fare as unknown as Record<string, any>;

  const rawScheduleFare =
    fAny?.basePrice ||
    fAny?.baseAmount ||
    fAny?.amount ||
    sAny?.fareAmount ||
    sAny?.price ||
    storeSchedule?.fare ||
    0;

  const destLower = (schedule?.route?.destination || storeSchedule?.destination || '').toLowerCase();
  const fallbackFare = destLower.includes('cox')
    ? 1250
    : destLower.includes('chittagong')
    ? 900
    : destLower.includes('sylhet')
    ? 850
    : destLower.includes('rajshahi')
    ? 750
    : 900;

  const effectiveFare = rawScheduleFare > 0 ? rawScheduleFare : fallbackFare;

  const handleToggle = (seat: Seat) => {
    toggleSeat({
      id: seat.id,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      price: seat.price || effectiveFare,
    });
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;
    const targetScheduleId = schedule?.id || scheduleId;
    setSchedule(targetScheduleId, {
      departureTime: schedule?.departureTime || storeSchedule?.departureTime || '08:00',
      arrivalTime: schedule?.arrivalTime || storeSchedule?.arrivalTime || '13:00',
      origin: schedule?.route?.origin || storeSchedule?.origin || 'Dhaka',
      destination: schedule?.route?.destination || storeSchedule?.destination || 'Chittagong',
      coachName: schedule?.coach?.name || storeSchedule?.coachName || 'Gallery Express AC 01',
      fare: effectiveFare,
    });
    setStep('passenger');
    router.push(ROUTES.CHECKOUT_PASSENGER);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-20 min-h-screen bg-gray-50" suppressHydrationWarning>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="skeleton h-6 w-48 rounded mb-8" />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="skeleton h-48 rounded-2xl" />
                <div className="skeleton h-64 rounded-2xl" />
              </div>
              <div className="skeleton h-72 rounded-2xl" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (scheduleError || seatsError) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="font-bold text-gray-800 text-xl mb-2">Failed to load</h2>
            <button onClick={() => refetch()} className="mt-4 bg-[#E31B23] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const fare = effectiveFare;
  const totalAmount = selectedSeats.reduce((sum: number, s: { price?: number }) => sum + (s.price || effectiveFare), 0);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 pb-10 bg-gray-50 min-h-screen" suppressHydrationWarning>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link href={ROUTES.SEARCH} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
              <ArrowLeft size={18} className="text-gray-600" />
            </Link>
            <nav className="flex items-center gap-1 text-sm text-gray-500">
              <span>Search</span>
              <span>/</span>
              <span className="font-medium text-[#111111]">Select Seat</span>
            </nav>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-1 mb-8">
            {['Select Seat', 'Passenger Info', 'Payment', 'Confirmed'].map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`h-1.5 rounded-full flex-1 transition-colors ${i === 0 ? 'bg-[#E31B23]' : 'bg-gray-200'}`} />
                {i < 3 && <div className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-[#E31B23]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: schedule info + seat map */}
            <div className="lg:col-span-2 space-y-6">
              {/* Schedule Info Card */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h2 className="font-bold text-[#111111] mb-4 flex items-center gap-2">
                  <Bus size={16} className="text-[#E31B23]" />
                  {schedule?.coach?.name || 'Gallery Express'}
                </h2>
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-2xl font-black text-[#111111]">
                      {schedule ? formatTime(schedule.departureTime) : '--'}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">{schedule?.route?.origin}</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      {schedule ? getDuration(schedule.departureTime, schedule.arrivalTime) : ''}
                    </div>
                    <div className="h-px bg-gray-200 relative">
                      <div className="absolute inset-y-0 left-0 w-1/2 bg-[#E31B23]" style={{ height: '2px', top: '-0.5px' }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-[#111111]">
                      {schedule ? formatTime(schedule.arrivalTime) : '--'}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">{schedule?.route?.destination}</div>
                  </div>
                </div>
              </div>

              {/* Seat Map */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-[#111111]">Select Your Seat</h2>
                  <span className="text-sm text-gray-500">Up to 4 seats</span>
                </div>
                {seats && seats.length > 0 ? (
                  <SeatMap
                    seats={seats}
                    selectedSeats={selectedSeats.map(s => ({
                      id: s.id,
                      seatNumber: s.seatNumber,
                      seatType: s.seatType as Seat['seatType'],
                      status: 'AVAILABLE' as const,
                      isBooked: false,
                      isHeld: false,
                      price: s.price,
                      row: 0,
                      column: 0,
                    }))}
                    onToggle={handleToggle}
                    maxSeats={4}
                  />
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <Bus size={32} className="mx-auto mb-2" />
                    <p>No seat data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Summary + Continue */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
                <h3 className="font-bold text-[#111111] mb-4">Booking Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin size={14} className="text-[#E31B23] mt-0.5 shrink-0" />
                    <span>{schedule?.route?.origin} → {schedule?.route?.destination}</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <Clock size={14} className="text-[#E31B23] mt-0.5 shrink-0" />
                    <span>
                      {schedule ? formatTime(schedule.departureTime) : '--'}
                      {' → '}
                      {schedule ? formatTime(schedule.arrivalTime) : '--'}
                    </span>
                  </div>
                </div>

                <hr className="my-4" />

                {selectedSeats.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {selectedSeats.map((s) => (
                      <div key={s.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">Seat {s.seatNumber}</span>
                        <span className="font-medium">{formatCurrency(s.price)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-3">No seats selected yet</p>
                )}

                {selectedSeats.length > 0 && (
                  <>
                    <hr className="my-3" />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-[#E31B23]">{formatCurrency(totalAmount)}</span>
                    </div>
                  </>
                )}

                <button
                  onClick={handleContinue}
                  disabled={selectedSeats.length === 0}
                  className="w-full mt-5 bg-[#E31B23] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-[#C41920] text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-md text-sm"
                >
                  {selectedSeats.length === 0
                    ? 'Select a Seat to Continue'
                    : `Continue with ${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
