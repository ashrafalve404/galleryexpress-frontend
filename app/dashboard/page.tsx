'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Bus,
  Search,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { RiBusFill, RiTicket2Fill, RiCloseCircleFill, RiCheckboxCircleFill } from 'react-icons/ri';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { useUserBookings } from '@/lib/hooks/useBooking';
import { cancelBooking } from '@/lib/api/bookings';
import { formatDateTime, formatTime, formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS, ROUTES } from '@/lib/utils/constants';
import { useLogout } from '@/lib/hooks/useAuth';
import type { Booking } from '@/lib/api/bookings';
import { toast } from 'sonner';

interface BookingWithTickets extends Booking {
  tickets?: Array<{ ticketNumber: string; status: string }>;
  bookingSeats?: Array<{ seat?: { seatNumber: string; seatType: string } }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: bookings = [], isLoading, refetch } = useUserBookings(mounted && isAuthenticated);

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'confirmed' | 'cancelled'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedCancelBooking, setSelectedCancelBooking] = useState<Booking | null>(null);

  if (!mounted) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-24 pb-12 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#E31B23] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-24 pb-12 bg-gray-50 min-h-screen flex items-center justify-center px-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm max-w-md w-full text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#E31B23]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User size={28} className="text-[#E31B23]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#111111] mb-2">Sign in Required</h1>
            <p className="text-gray-500 text-xs sm:text-sm mb-6 font-medium">
              Please sign in to access your passenger dashboard, view upcoming trips, and manage your tickets.
            </p>
            <Link
              href={ROUTES.LOGIN}
              className="w-full bg-[#E31B23] hover:bg-[#C41920] text-white font-bold py-3.5 rounded-xl block text-center transition-all text-xs sm:text-sm shadow-md"
            >
              Sign In Now
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const allBookings = (bookings as BookingWithTickets[]) || [];
  const confirmedBookings = allBookings.filter((b) => b.status === 'CONFIRMED');
  const cancelledBookings = allBookings.filter((b) => b.status === 'CANCELLED');

  // Find upcoming trip (first confirmed trip scheduled for future or today)
  const now = new Date();
  const upcomingTrip = confirmedBookings.find((b) => {
    if (!b.schedule?.departureDate) return false;
    const depDate = new Date(b.schedule.departureDate);
    return depDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }) || confirmedBookings[0];

  // Filtered list based on active tab
  const filteredBookings = allBookings.filter((b) => {
    if (activeTab === 'confirmed') return b.status === 'CONFIRMED';
    if (activeTab === 'cancelled') return b.status === 'CANCELLED';
    if (activeTab === 'upcoming') return b.status === 'CONFIRMED';
    return true;
  });

  const handleCancelBooking = async () => {
    if (!selectedCancelBooking) return;
    setCancellingId(selectedCancelBooking.id);
    try {
      await cancelBooking(selectedCancelBooking.id, { reason: 'Cancelled via passenger dashboard' });
      toast.success('Booking cancelled successfully.');
      setSelectedCancelBooking(null);
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to cancel booking.';
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewTicket = (b: BookingWithTickets) => {
    const ticketNum = b.tickets?.[0]?.ticketNumber;
    if (ticketNum) {
      router.push(ROUTES.TICKET(ticketNum));
    } else {
      router.push(ROUTES.MY_BOOKING);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 pb-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Header Greeting Banner */}
          <div className="bg-[#111111] text-white rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden shadow-lg">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#E31B23] flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-md shrink-0">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-lg sm:text-2xl font-black text-white truncate">
                      Welcome, {user?.name || 'Passenger'}
                    </h1>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-[#E31B23]" />
                      {user?.phone || '--'}
                    </span>
                    {user?.email && (
                      <span className="text-gray-500 hidden sm:inline">• {user.email}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={ROUTES.HOME}
                  className="w-full sm:w-auto bg-[#E31B23] hover:bg-[#C41920] text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Search size={15} /> Book New Ticket
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#E31B23]/10 text-[#E31B23] flex items-center justify-center shrink-0">
                <RiBusFill size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-black text-[#111111]">{confirmedBookings.length}</div>
                <div className="text-[11px] sm:text-xs text-gray-500 font-semibold truncate">Confirmed Trips</div>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <RiCheckboxCircleFill size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-black text-[#111111]">{allBookings.length}</div>
                <div className="text-[11px] sm:text-xs text-gray-500 font-semibold truncate">Total Bookings</div>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs col-span-2 lg:col-span-1 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <RiCloseCircleFill size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-black text-[#111111]">{cancelledBookings.length}</div>
                <div className="text-[11px] sm:text-xs text-gray-500 font-semibold truncate">Cancelled Journeys</div>
              </div>
            </div>
          </div>

          {/* Featured Live Boarding Pass (Upcoming Trip) */}
          {upcomingTrip && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-red-100 shadow-md p-5 sm:p-6 mb-6 sm:mb-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#E31B23]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E31B23] animate-ping" />
                  Upcoming Journey
                </div>
                <span className="bg-green-100 text-green-800 text-[11px] sm:text-xs font-extrabold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} /> Confirmed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-center">
                {/* Route info */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-[#111111]">
                        {upcomingTrip.schedule ? formatTime(upcomingTrip.schedule.departureTime) : '--'}
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <MapPin size={12} className="text-[#E31B23]" />
                        {upcomingTrip.schedule?.route?.origin || 'Dhaka'}
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2">
                      <div className="flex-1 h-px bg-gray-300" />
                      <Bus size={18} className="text-[#E31B23] shrink-0" />
                      <div className="flex-1 h-px bg-gray-300" />
                    </div>

                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-black text-[#111111]">
                        {upcomingTrip.schedule ? formatTime(upcomingTrip.schedule.arrivalTime) : '--'}
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold text-gray-500 flex items-center gap-1 justify-end">
                        <MapPin size={12} className="text-[#E31B23]" />
                        {upcomingTrip.schedule?.route?.destination || 'Chittagong'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium text-gray-600 bg-white p-3 rounded-xl border border-gray-100">
                    <span className="flex items-center gap-1.5 font-bold text-[#111111]">
                      <Calendar size={13} className="text-[#E31B23]" />
                      {upcomingTrip.schedule?.departureDate
                        ? formatDate(upcomingTrip.schedule.departureDate, 'EEE, dd MMM yyyy')
                        : '--'}
                    </span>
                    <span>• Coach: {upcomingTrip.schedule?.coach?.name || 'Deluxe'}</span>
                    <span>• Ref: <strong className="font-mono text-[#111111]">{upcomingTrip.bookingRef}</strong></span>
                  </div>
                </div>

                {/* View Ticket CTA */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 text-center space-y-3 flex flex-col justify-center">
                  <div className="text-xs text-gray-500 font-semibold">Ready to Board?</div>
                  <button
                    onClick={() => handleViewTicket(upcomingTrip)}
                    className="w-full bg-[#111111] hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
                  >
                    <Ticket size={16} /> View Digital Boarding Pass
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs & History Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#111111]">My Booking History</h2>
              <p className="text-xs text-gray-500 font-medium">Manage and view all your bus reservations.</p>
            </div>

            {/* Filter Tabs (Horizontal scrollable on mobile) */}
            <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-2xs overflow-x-auto scrollbar-hide self-start sm:self-auto max-w-full">
              {[
                { id: 'all', label: 'All Trips' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'confirmed', label: 'Confirmed' },
                { id: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-[#E31B23] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-[#111111]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/4" />
                  <div className="h-10 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center max-w-md mx-auto shadow-2xs">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Ticket size={26} />
              </div>
              <h3 className="font-bold text-gray-800 text-base mb-1">No Bookings Found</h3>
              <p className="text-gray-500 text-xs mb-6 font-medium">
                {activeTab === 'all'
                  ? 'You have not made any bus bookings yet.'
                  : `No ${activeTab} bookings found.`}
              </p>
              <Link
                href={ROUTES.HOME}
                className="bg-[#E31B23] hover:bg-[#C41920] text-white font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 text-xs transition-all shadow-2xs"
              >
                <Search size={14} /> Search Buses
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => {
                const statusClass = BOOKING_STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-700';
                const statusLabel = BOOKING_STATUS_LABELS[b.status] || b.status;

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden hover:shadow-md transition-all"
                  >
                    {/* Status Header Bar */}
                    <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-semibold text-gray-500">Ref:</span>
                        <span className="font-mono font-black text-xs sm:text-sm text-[#111111] truncate">{b.bookingRef}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold shrink-0 ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 items-center">
                        {/* Route & Times */}
                        <div className="md:col-span-2 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="text-lg sm:text-xl font-black text-[#111111]">
                                {b.schedule ? formatTime(b.schedule.departureTime) : '--'}
                              </div>
                              <div className="text-xs font-semibold text-gray-500">{b.schedule?.route?.origin || 'Dhaka'}</div>
                            </div>
                            <div className="flex-1 flex items-center justify-center px-2">
                              <ArrowRight size={16} className="text-[#E31B23]" />
                            </div>
                            <div className="text-right">
                              <div className="text-lg sm:text-xl font-black text-[#111111]">
                                {b.schedule ? formatTime(b.schedule.arrivalTime) : '--'}
                              </div>
                              <div className="text-xs font-semibold text-gray-500">{b.schedule?.route?.destination || 'Chittagong'}</div>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 font-medium flex items-center gap-2 pt-1">
                            <Calendar size={12} className="text-[#E31B23]" />
                            {b.schedule?.departureDate
                              ? formatDate(b.schedule.departureDate, 'EEE, dd MMM yyyy')
                              : '--'}
                          </div>
                        </div>

                        {/* Seats & Amount */}
                        <div className="flex flex-row md:flex-col justify-between items-center md:items-start border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                          <div>
                            <div className="text-xs text-gray-400 font-semibold mb-1">Seats</div>
                            <div className="flex flex-wrap gap-1 mb-1">
                              {(b.bookingSeats || b.seats || []).map((bs: any, idx: number) => (
                                <span key={idx} className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-0.5 rounded-md">
                                  {bs.seat?.seatNumber || bs.seatNumber || 'Seat'}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-[#E31B23]">
                            {formatCurrency(Number(b.finalAmount || b.netAmount) || 0)}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-end pt-2 md:pt-0">
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleViewTicket(b)}
                              className="w-full bg-[#111111] hover:bg-gray-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-98"
                            >
                              <Ticket size={14} /> View Ticket
                            </button>
                          )}
                          {['CONFIRMED', 'HELD'].includes(b.status) && (
                            <button
                              onClick={() => setSelectedCancelBooking(b)}
                              className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-500 font-bold py-2.5 rounded-xl text-xs transition-colors active:scale-98"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {selectedCancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-[#111111] text-base">Cancel Booking?</h3>
                <p className="text-gray-500 text-xs mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-5">
              Are you sure you want to cancel booking{' '}
              <span className="font-mono font-bold text-[#111111]">{selectedCancelBooking.bookingRef}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedCancelBooking(null)}
                disabled={!!cancellingId}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={!!cancellingId}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {cancellingId ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
