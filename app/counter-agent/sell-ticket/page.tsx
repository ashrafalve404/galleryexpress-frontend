'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Bus,
  Calendar,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  Printer,
  Sparkles,
  Clock,
  MapPin,
  Tag,
} from 'lucide-react';
import { BsFillTicketPerforatedFill } from 'react-icons/bs';
import client from '@/lib/api/client';
import { counterAgentApi, type DashboardStats } from '@/lib/api/counterAgent';
import { getScheduleSeats, type Seat } from '@/lib/api/schedules';
import { SeatMap } from '@/components/booking/SeatMap';
import { toast } from 'sonner';

interface ScheduleItem {
  id: string;
  departureTime: string;
  departureDate: string;
  arrivalTime?: string;
  coach: {
    id?: string;
    name?: string;
    coachNumber: string;
    coachType: string;
    totalSeats?: number;
  };
  route: {
    origin: string;
    destination: string;
  };
  fare: number;
  availableSeatsCount?: number;
}

function generateFallbackSeats(bookedSeatNumbers: string[]): Seat[] {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  let rowIdx = 1;
  rows.forEach((r) => {
    [1, 2, 3, 4].forEach((c) => {
      const seatNo = `${r}${c}`;
      const isBooked = bookedSeatNumbers.includes(seatNo);
      seats.push({
        id: seatNo,
        seatNumber: seatNo,
        seatType: 'REGULAR',
        status: isBooked ? 'BOOKED' : 'AVAILABLE',
        availability: isBooked ? 'BOOKED' : 'AVAILABLE',
        isBooked,
        isHeld: false,
        price: 2000,
        row: rowIdx,
        column: c,
      });
    });
    rowIdx++;
  });
  return seats;
}

export default function CounterAgentSellTicketPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  // Form State
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [scheduleSeats, setScheduleSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');

  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<{
    bookingRef: string;
    bookingId: string;
    remainingBulkQuantity: number;
  } | null>(null);

  // Load Agent Stats & active schedules
  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await counterAgentApi.getDashboardStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load agent stats:', err);
      } finally {
        setLoading(false);
      }

      try {
        const schedList = await counterAgentApi.getActiveSchedules();
        if (Array.isArray(schedList) && schedList.length > 0) {
          setSchedules(schedList);
        } else {
          const fallbackRes = await client.get('/api/v1/schedules/search', { params: { limit: 50 } });
          const list = fallbackRes.data?.data?.data || fallbackRes.data?.data || fallbackRes.data || [];
          setSchedules(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error('Failed to load agent schedules:', err);
        try {
          const fallbackRes = await client.get('/api/v1/schedules/search', { params: { limit: 50 } });
          const list = fallbackRes.data?.data?.data || fallbackRes.data?.data || fallbackRes.data || [];
          setSchedules(Array.isArray(list) ? list : []);
        } catch {
          setSchedules([]);
        }
      } finally {
        setLoadingSchedules(false);
      }
    }
    loadData();
  }, []);

  // When schedule selected, fetch full seat map layout and booked seats
  const handleSelectSchedule = async (sched: ScheduleItem) => {
    setSelectedSchedule(sched);
    setSelectedSeats([]);
    setLoadingSeats(true);

    try {
      const fetchedSeats = await getScheduleSeats(sched.id);
      if (Array.isArray(fetchedSeats) && fetchedSeats.length > 0) {
        setScheduleSeats(fetchedSeats);
      } else {
        const res = await client.get(`/api/v1/schedules/${sched.id}/seats`);
        const data = res.data?.data || res.data;
        const booked = data?.bookedSeats || data?.unavailableSeats || [];
        setScheduleSeats(generateFallbackSeats(Array.isArray(booked) ? booked : []));
      }
    } catch (err) {
      console.error('Failed to load schedule seats:', err);
      setScheduleSeats(generateFallbackSeats([]));
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleToggleSeat = (seat: Seat) => {
    const isSelected = selectedSeats.some((s) => s.id === seat.id || s.seatNumber === seat.seatNumber);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id && s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= (stats?.totalTicketsRemaining || 1)) {
        toast.error(`You only have ${stats?.totalTicketsRemaining || 0} bulk ticket(s) remaining.`);
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleSellTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) {
      toast.error('Please select a bus schedule first.');
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat.');
      return;
    }
    if (!passengerName.trim() || !passengerPhone.trim()) {
      toast.error('Please enter passenger full name and mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await counterAgentApi.sellTicket({
        scheduleId: selectedSchedule.id,
        seatNumbers: selectedSeats.map((s) => s.seatNumber),
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        passengerEmail: passengerEmail.trim() || undefined,
        gender,
      });

      setSuccessBooking({
        bookingRef: res.bookingRef,
        bookingId: res.bookingId,
        remainingBulkQuantity: res.remainingBulkQuantity,
      });

      toast.success(res.message || 'Ticket issued successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to sell ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
      </div>
    );
  }

  const remainingBulk = stats?.totalTicketsRemaining || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/counter-agent/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-xs"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-red-50 text-[#E31B23] border border-red-200 rounded-full text-xs font-black">
            <BsFillTicketPerforatedFill size={16} /> Bulk Balance: {remainingBulk} Tickets
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-2">
          <h1 className="text-2xl font-black text-gray-900">Sell Ticket to Passenger</h1>
          <p className="text-xs text-gray-500">
            Issue passenger tickets directly from your active bulk ticket package. Passenger pays you cash directly.
          </p>
        </div>

        {remainingBulk <= 0 ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-3xl text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <h3 className="text-lg font-bold">No Bulk Tickets Remaining</h3>
            <p className="text-xs max-w-md mx-auto">
              You do not have any active bulk ticket balance remaining. Please purchase a bulk ticket package to sell tickets.
            </p>
            <Link
              href="/counter-agent/buy-bulk"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#c9121a] text-white font-bold text-xs rounded-xl shadow-md"
            >
              <BsFillTicketPerforatedFill size={16} /> Buy Bulk Tickets
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSellTicket} className="space-y-6">
            {/* Step 1: Choose Bus Schedule */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Bus size={18} className="text-[#E31B23]" /> 1. Select Preferred Bus Schedule
              </h2>

              {loadingSchedules ? (
                <div className="py-8 flex justify-center items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="w-5 h-5 text-[#E31B23] animate-spin" /> Loading schedules...
                </div>
              ) : schedules.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">No active schedules available right now.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedules.map((sched) => {
                    const isSelected = selectedSchedule?.id === sched.id;
                    const dateDisplay = sched.departureDate
                      ? new Date(sched.departureDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Today';

                    return (
                      <div
                        key={sched.id}
                        onClick={() => handleSelectSchedule(sched)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                          isSelected
                            ? 'bg-[#111827] text-white border-[#111827] shadow-lg scale-[1.02] ring-2 ring-[#E31B23]'
                            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-900 shadow-2xs'
                        }`}
                      >
                        {/* Header Badges */}
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-red-50 text-[#E31B23]'
                            }`}
                          >
                            {sched.coach?.coachType || 'AC Deluxe'}
                          </span>
                          <span className={`text-xs font-black ${isSelected ? 'text-emerald-400' : 'text-[#E31B23]'}`}>
                            ৳{sched.fare || 2000} / seat
                          </span>
                        </div>

                        {/* Route Origin -> Destination */}
                        <div>
                          <p className="text-sm font-extrabold truncate flex items-center gap-1.5">
                            <MapPin size={14} className={isSelected ? 'text-red-400' : 'text-[#E31B23]'} />
                            {sched.route?.origin} ➔ {sched.route?.destination}
                          </p>
                          <p className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-600'} font-semibold mt-0.5`}>
                            {sched.coach?.name || `Coach ${sched.coach?.coachNumber || ''}`}
                          </p>
                        </div>

                        {/* Date and Departure Time */}
                        <div
                          className={`text-xs font-semibold flex items-center justify-between pt-1 border-t ${
                            isSelected ? 'border-white/10 text-gray-300' : 'border-gray-100 text-gray-500'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <Calendar size={13} /> {dateDisplay}
                          </span>
                          <span className="flex items-center gap-1 font-bold">
                            <Clock size={13} /> {sched.departureTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Select Seat(s) using official SeatMap component */}
            {selectedSchedule && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <BsFillTicketPerforatedFill size={18} className="text-[#E31B23]" /> 2. Select Seat(s)
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Gray seats are already booked by passengers/customers. Click available seats to select.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl">
                    Selected: <strong className="text-[#E31B23] font-black">{selectedSeats.map((s) => s.seatNumber).join(', ') || 'None'}</strong>
                  </span>
                </div>

                {loadingSeats ? (
                  <div className="py-12 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Loader2 className="w-6 h-6 text-[#E31B23] animate-spin" /> Loading interactive bus layout...
                  </div>
                ) : (
                  <div className="max-w-xl mx-auto py-2">
                    <SeatMap
                      seats={scheduleSeats}
                      selectedSeats={selectedSeats}
                      onToggle={handleToggleSeat}
                      maxSeats={stats?.totalTicketsRemaining || 10}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Passenger Details */}
            {selectedSeats.length > 0 && selectedSchedule && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 animate-fade-in">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <User size={18} className="text-[#E31B23]" /> 3. Enter Passenger Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Passenger Full Name *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="e.g. Rahim Uddin"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Passenger Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="e.g. 01700000000"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="e.g. passenger@gmail.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e: any) => setGender(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4">
                  <div>
                    <span className="text-xs text-red-700 font-medium block">Total Seats Selected:</span>
                    <strong className="text-lg font-black text-gray-900">
                      {selectedSeats.length} Ticket(s) ({selectedSeats.map((s) => s.seatNumber).join(', ')})
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 font-medium block">Total Cash Collected:</span>
                    <span className="text-xl font-black text-[#E31B23]">
                      ৳{(selectedSchedule.fare || 2000) * selectedSeats.length}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#E31B23] hover:bg-[#c9121a] text-white font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Issuing Ticket...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} /> Sell & Issue Ticket ({selectedSeats.length} Seats)
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Ticket Success Confirmation Modal */}
      {successBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle size={36} />
            </div>

            <div>
              <h3 className="text-xl font-black text-gray-900">Ticket Issued Successfully!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Booking Reference: <strong className="text-gray-900 font-black">{successBooking.bookingRef}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Remaining Bulk Tickets: <strong className="text-[#E31B23] font-black">{successBooking.remainingBulkQuantity}</strong>
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href={`/ticket/${successBooking.bookingRef}`}
                target="_blank"
                className="w-full py-3 bg-[#111111] hover:bg-black text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Print Boarding Pass / Ticket
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccessBooking(null);
                  setSelectedSeats([]);
                  setPassengerName('');
                  setPassengerPhone('');
                  setPassengerEmail('');
                }}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
              >
                Issue Another Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
