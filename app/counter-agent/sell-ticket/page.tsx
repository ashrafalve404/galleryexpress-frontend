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
} from 'lucide-react';
import { BsFillTicketPerforatedFill } from 'react-icons/bs';
import client from '@/lib/api/client';
import { counterAgentApi, type DashboardStats } from '@/lib/api/counterAgent';
import { toast } from 'sonner';

interface ScheduleItem {
  id: string;
  departureTime: string;
  departureDate: string;
  coach: {
    coachNumber: string;
    coachType: string;
  };
  route: {
    origin: string;
    destination: string;
  };
  fare: number;
  availableSeatsCount?: number;
}

export default function CounterAgentSellTicketPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  // Form State
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
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

  // Load Agent Stats to verify Bulk Ticket balance
  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await counterAgentApi.getDashboardStats();
        setStats(statsData);

        // Fetch available schedules for Dhaka <-> Cox's Bazar
        const schedRes = await client.get('/api/v1/schedules', { params: { limit: 50 } });
        const list = schedRes.data?.data?.data || schedRes.data?.data || schedRes.data || [];
        setSchedules(Array.isArray(list) ? list : []);
      } catch (e: any) {
        toast.error('Failed to load portal data.');
      } finally {
        setLoading(false);
        setLoadingSchedules(false);
      }
    }
    loadData();
  }, []);

  // When schedule selected, fetch booked seats
  const handleSelectSchedule = async (sched: ScheduleItem) => {
    setSelectedSchedule(sched);
    setSelectedSeats([]);
    try {
      const res = await client.get(`/api/v1/schedules/${sched.id}/seats`);
      const data = res.data?.data || res.data;
      const booked = data?.bookedSeats || data?.unavailableSeats || [];
      setBookedSeats(Array.isArray(booked) ? booked : []);
    } catch {
      setBookedSeats([]);
    }
  };

  const toggleSeat = (seatNo: string) => {
    if (bookedSeats.includes(seatNo)) return;
    if (selectedSeats.includes(seatNo)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNo));
    } else {
      if (selectedSeats.length >= (stats?.totalTicketsRemaining || 1)) {
        toast.error(`You only have ${stats?.totalTicketsRemaining || 0} bulk ticket(s) remaining.`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatNo]);
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
        seatNumbers: selectedSeats,
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

  // Grid seat numbers A1..J4
  const seatGrid = [
    ['A1', 'A2', 'A3', 'A4'],
    ['B1', 'B2', 'B3', 'B4'],
    ['C1', 'C2', 'C3', 'C4'],
    ['D1', 'D2', 'D3', 'D4'],
    ['E1', 'E2', 'E3', 'E4'],
    ['F1', 'F2', 'F3', 'F4'],
    ['G1', 'G2', 'G3', 'G4'],
    ['H1', 'H2', 'H3', 'H4'],
  ];

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
          <div className="inline-flex items-center gap-2 bg-[#E31B23]/10 text-[#E31B23] px-4 py-2 rounded-xl text-xs font-extrabold border border-[#E31B23]/20">
            <BsFillTicketPerforatedFill size={16} /> Bulk Balance: {remainingBulk} Tickets
          </div>
        </div>

        {/* Title */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
          <h1 className="text-2xl font-black text-gray-900">Sell Ticket to Passenger</h1>
          <p className="text-xs text-gray-500 mt-1">
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
                <div className="py-8 text-center text-xs text-gray-400">Loading schedules...</div>
              ) : schedules.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">No active schedules available right now.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {schedules.map((sched) => {
                    const isSelected = selectedSchedule?.id === sched.id;
                    return (
                      <div
                        key={sched.id}
                        onClick={() => handleSelectSchedule(sched)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#111827] text-white border-[#111827] shadow-md scale-[1.01]'
                            : 'bg-gray-50 hover:bg-gray-100/80 border-gray-200 text-gray-900'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${isSelected ? 'bg-white/20 text-white' : 'bg-red-50 text-[#E31B23]'}`}>
                            {sched.coach?.coachType || 'AC'}
                          </span>
                          <span className="text-xs font-bold">৳{sched.fare || 2000}</span>
                        </div>
                        <p className="text-xs font-extrabold truncate mb-1">
                          {sched.route?.origin} ➔ {sched.route?.destination}
                        </p>
                        <div className={`text-[11px] font-medium flex items-center gap-1.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                          <Calendar size={13} /> {sched.departureTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Select Seat(s) */}
            {selectedSchedule && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <BsFillTicketPerforatedFill size={18} className="text-[#E31B23]" /> 2. Select Seat(s)
                  </h2>
                  <span className="text-xs font-bold text-gray-500">
                    Selected: <strong className="text-[#E31B23]">{selectedSeats.join(', ') || 'None'}</strong>
                  </span>
                </div>

                {/* Seat Map Legend */}
                <div className="flex items-center justify-center gap-6 py-2 bg-gray-50 rounded-xl text-xs font-medium text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-400" /> Available
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#E31B23]" /> Selected
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-gray-300 border border-gray-400" /> Booked
                  </div>
                </div>

                {/* Interactive Seat Grid */}
                <div className="max-w-xs mx-auto p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                  {seatGrid.map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-4 gap-2">
                      {row.map((seatNo) => {
                        const isBooked = bookedSeats.includes(seatNo);
                        const isSelected = selectedSeats.includes(seatNo);
                        return (
                          <button
                            key={seatNo}
                            type="button"
                            disabled={isBooked}
                            onClick={() => toggleSeat(seatNo)}
                            className={`py-2 text-xs font-extrabold rounded-lg transition-all border ${
                              isBooked
                                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#E31B23] text-white border-[#E31B23] shadow-xs'
                                : 'bg-white hover:bg-emerald-50 text-gray-800 border-gray-300 hover:border-emerald-500'
                            }`}
                          >
                            {seatNo}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Passenger Details */}
            {selectedSeats.length > 0 && (
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
                        placeholder="017XXXXXXXX"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Passenger Email (Optional)
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="passenger@example.com"
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

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Will deduct <strong className="text-gray-900 font-bold">{selectedSeats.length} ticket(s)</strong> from your bulk balance.
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3.5 bg-[#E31B23] hover:bg-[#c9121a] text-white font-extrabold text-sm rounded-xl shadow-md flex items-center gap-2 disabled:opacity-60 transition-all active:scale-95"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    Sell & Issue Ticket
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Success Modal */}
      {successBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle size={30} />
            </div>
            <h3 className="text-xl font-black text-gray-900">Ticket Issued Successfully!</h3>
            <p className="text-xs text-gray-500">
              Booking Ref: <strong className="text-gray-900 font-bold tracking-wider">{successBooking.bookingRef}</strong>
            </p>
            <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
              Remaining Bulk Tickets: <strong className="text-[#E31B23] font-black">{successBooking.remainingBulkQuantity}</strong>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSuccessBooking(null);
                  setSelectedSchedule(null);
                  setSelectedSeats([]);
                  setPassengerName('');
                  setPassengerPhone('');
                }}
                className="flex-1 py-3 bg-[#111827] text-white text-xs font-extrabold rounded-xl"
              >
                Issue Another Ticket
              </button>
              <Link
                href="/counter-agent/dashboard"
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
