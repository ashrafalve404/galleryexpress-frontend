'use client';

import { useState, useEffect, useRef } from 'react';
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
  Building2,
  Search,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { BsFillTicketPerforatedFill } from 'react-icons/bs';
import { RiStarFill, RiWindyFill, RiWifiFill, RiFlashlightFill, RiCalendarEventFill } from 'react-icons/ri';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  startOfDay,
  parseISO,
} from 'date-fns';
import client from '@/lib/api/client';
import { counterAgentApi, type DashboardStats } from '@/lib/api/counterAgent';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { getTranslation } from '@/lib/utils/translations';
import { getScheduleSeats, type Seat } from '@/lib/api/schedules';
import { SeatMap } from '@/components/booking/SeatMap';
import { formatDate, formatTime } from '@/lib/utils/date';
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

interface AgentCalendarPickerProps {
  value: string;
  onChange: (dateStr: string) => void;
  availableDates?: string[];
}

function AgentCalendarPicker({ value, onChange, availableDates = [] }: AgentCalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value && value !== 'ALL' ? parseISO(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const todayStart = startOfDay(new Date());
  const maxDate = addDays(todayStart, 30);

  const formattedDisplay = value === 'ALL' || !value
    ? 'All Departure Dates'
    : formatDate(value, 'EEE, dd MMM yyyy');

  return (
    <div className="relative flex-1" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 border border-gray-200 hover:border-[#E31B23] rounded-xl text-xs font-extrabold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2 truncate">
          <RiCalendarEventFill size={16} className="text-[#E31B23] shrink-0 group-hover:scale-110 transition-transform" />
          <span className="truncate">{formattedDisplay}</span>
        </div>
        {value !== 'ALL' ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange('ALL');
            }}
            className="text-[10px] bg-red-100 hover:bg-red-200 text-[#E31B23] px-2 py-0.5 rounded font-black shrink-0"
            title="Show All Dates"
          >
            Clear
          </span>
        ) : (
          <HiChevronLeft size={16} className="-rotate-90 text-gray-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 sm:right-auto mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] p-4 w-[290px] sm:w-[300px] animate-fade-in-up">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <HiChevronLeft size={18} />
            </button>
            <span className="font-black text-gray-900 text-sm">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <HiChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-gray-400 uppercase">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((d, idx) => {
              const isPast = isBefore(d, todayStart);
              const isBeyond30Days = isAfter(d, maxDate);
              const isSelected = value !== 'ALL' && isSameDay(d, selectedDate);
              const isCurrentMonth = isSameMonth(d, currentMonth);
              const dateStr = format(d, 'yyyy-MM-dd');
              const hasSchedules = availableDates.some((ad) => ad.startsWith(dateStr));

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isPast || isBeyond30Days}
                  onClick={() => {
                    onChange(dateStr);
                    setOpen(false);
                  }}
                  className={`h-8 w-8 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all mx-auto relative ${
                    isSelected
                      ? 'bg-[#E31B23] text-white shadow-md scale-105'
                      : isPast || isBeyond30Days
                      ? 'text-gray-300 cursor-not-allowed opacity-40'
                      : !isCurrentMonth
                      ? 'text-gray-300 hover:bg-gray-50'
                      : 'text-gray-800 hover:bg-[#E31B23]/10 hover:text-[#E31B23]'
                  }`}
                >
                  <span>{format(d, 'd')}</span>
                  {hasSchedules && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-[#E31B23] absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                onChange('ALL');
                setOpen(false);
              }}
              className="text-gray-600 hover:text-[#E31B23] font-bold"
            >
              All Dates
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onChange(format(new Date(), 'yyyy-MM-dd'));
                  setOpen(false);
                }}
                className="text-[#E31B23] font-bold hover:underline"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
                  setOpen(false);
                }}
                className="text-gray-600 hover:text-[#E31B23] font-bold"
              >
                Tomorrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
  const { lang } = useLanguageStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  // Filtering state
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterRoute, setFilterRoute] = useState('ALL');
  const [filterDate, setFilterDate] = useState('ALL');
  const [filterTime, setFilterTime] = useState('ALL');

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

  // Extract unique available dates from schedules
  const uniqueDates = Array.from(new Set(schedules.map((s) => s.departureDate).filter(Boolean)));

  // Filtered schedules list
  const filteredSchedules = schedules.filter((sched) => {
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      const coachName = (sched.coach?.name || '').toLowerCase();
      const coachNo = (sched.coach?.coachNumber || '').toLowerCase();
      const rawCoachType = sched.coach?.coachType;
      const coachType = (typeof rawCoachType === 'object' && rawCoachType !== null ? (rawCoachType as any).name || '' : String(rawCoachType || '')).toLowerCase();
      if (!coachName.includes(q) && !coachNo.includes(q) && !coachType.includes(q)) {
        return false;
      }
    }

    if (filterRoute === 'DHAKA_COX') {
      if (sched.route?.origin !== 'Dhaka' || sched.route?.destination !== "Cox's Bazar") return false;
    } else if (filterRoute === 'COX_DHAKA') {
      if (sched.route?.origin !== "Cox's Bazar" || sched.route?.destination !== 'Dhaka') return false;
    }

    if (filterDate !== 'ALL' && sched.departureDate) {
      const schedDateStr = typeof sched.departureDate === 'string'
        ? sched.departureDate.substring(0, 10)
        : new Date(sched.departureDate).toISOString().substring(0, 10);
      if (schedDateStr !== filterDate && !sched.departureDate.includes(filterDate)) return false;
    }

    if (filterTime !== 'ALL') {
      const timeStr = sched.departureTime || '';
      let hour = parseInt(timeStr.split(':')[0], 10);
      if (timeStr.toUpperCase().includes('PM') && hour < 12) hour += 12;
      if (timeStr.toUpperCase().includes('AM') && hour === 12) hour = 0;

      if (filterTime === 'MORNING' && (hour < 6 || hour >= 12)) return false;
      if (filterTime === 'AFTERNOON' && (hour < 12 || hour >= 18)) return false;
      if (filterTime === 'NIGHT' && (hour < 18 || hour > 23)) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-red-50 text-[#E31B23] border border-red-200 rounded-full text-xs font-black">
            <BsFillTicketPerforatedFill size={16} /> Bulk Balance: {remainingBulk} Tickets
          </div>
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
        ) : !selectedSchedule ? (
          /* STEP 1: BUS SCHEDULE LIST & SEARCH FILTER SUB-PAGE */
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-2">
              <h1 className="text-2xl font-black text-gray-900">Sell Ticket to Passenger</h1>
              <p className="text-xs text-gray-500">
                Step 1: Select a bus schedule to view real-time seat availability and issue passenger tickets.
              </p>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal size={16} className="text-[#E31B23]" /> Search & Filter Bus Schedules
                </span>
                <span className="text-xs font-bold text-gray-500">
                  Showing {filteredSchedules.length} of {schedules.length} bus(es)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Search Bus Name / Coach */}
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder={getTranslation(lang, 'searchBusPlaceholder', 'Search bus name...')}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                  />
                </div>

                {/* Route Filter */}
                <select
                  value={filterRoute}
                  onChange={(e) => setFilterRoute(e.target.value)}
                  className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-extrabold text-gray-800 focus:outline-none focus:border-[#E31B23]"
                >
                  <option value="ALL">{getTranslation(lang, 'allRoutes', 'All Routes (Dhaka ↔ Cox)')}</option>
                  <option value="DHAKA_COX">{getTranslation(lang, 'dhakaToCox', "Dhaka ➔ Cox's Bazar")}</option>
                  <option value="COX_DHAKA">{getTranslation(lang, 'coxToDhaka', "Cox's Bazar ➔ Dhaka")}</option>
                </select>

                {/* Date Filter with Homepage-Style Interactive Calendar Picker */}
                <AgentCalendarPicker
                  value={filterDate}
                  onChange={setFilterDate}
                  availableDates={uniqueDates}
                />

                {/* Shift / Time Filter */}
                <select
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-extrabold text-gray-800 focus:outline-none focus:border-[#E31B23]"
                >
                  <option value="ALL">{getTranslation(lang, 'allDepartureTimes', 'All Departure Times')}</option>
                  <option value="MORNING">{getTranslation(lang, 'morningTime', 'Morning (06:00 AM - 12:00 PM)')}</option>
                  <option value="AFTERNOON">{getTranslation(lang, 'afternoonTime', 'Afternoon (12:00 PM - 06:00 PM)')}</option>
                  <option value="NIGHT">{getTranslation(lang, 'nightTime', 'Night (06:00 PM - 12:00 AM)')}</option>
                </select>
              </div>

              {/* Quick Departure Date Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-3 border-t border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0 pr-1">
                  {getTranslation(lang, 'quickDate', 'Quick Date:')}
                </span>
                <button
                  type="button"
                  onClick={() => setFilterDate('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                    filterDate === 'ALL'
                      ? 'bg-[#E31B23] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getTranslation(lang, 'allDepartureDate', 'All Dates')}
                </button>
                {Array.from({ length: 14 }).map((_, i) => {
                  const d = addDays(new Date(), i);
                  const dateStr = format(d, 'yyyy-MM-dd');
                  const label = i === 0 ? getTranslation(lang, 'today', 'Today') : i === 1 ? getTranslation(lang, 'tomorrow', 'Tomorrow') : format(d, 'EEE, dd MMM');
                  const isSelected = filterDate === dateStr;
                  const hasSchedules = uniqueDates.some((ad) => ad.startsWith(dateStr));

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setFilterDate(dateStr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#E31B23] text-white shadow-xs'
                          : hasSchedules
                          ? 'bg-red-50 text-[#E31B23] border border-red-100 hover:bg-red-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                      }`}
                    >
                      <span>{label}</span>
                      {i === 0 && (
                        <span className={`text-[9px] px-1 rounded uppercase font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-red-100 text-[#E31B23]'}`}>
                          {getTranslation(lang, 'today', 'Today')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule Cards List */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 px-1">
                <Bus size={18} className="text-[#E31B23]" /> {getTranslation(lang, 'availableBusSchedules', 'Available Bus Schedules')} ({filteredSchedules.length})
              </h2>

              {loadingSchedules ? (
                <div className="py-12 bg-white rounded-3xl border border-gray-200/80 flex justify-center items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="w-5 h-5 text-[#E31B23] animate-spin" /> Loading available bus schedules...
                </div>
              ) : filteredSchedules.length === 0 ? (
                <div className="py-12 bg-white rounded-3xl border border-gray-200/80 text-center text-xs text-gray-500 space-y-2">
                  <p className="font-bold text-gray-700">{getTranslation(lang, 'noActiveSchedules', 'No active schedules match your search filters.')}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSearch('');
                      setFilterRoute('ALL');
                      setFilterDate('ALL');
                      setFilterTime('ALL');
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl"
                  >
                    {getTranslation(lang, 'resetFilters', 'Reset Filters')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSchedules.map((sched) => {
                    return (
                      <div
                        key={sched.id}
                        className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-6 transition-all space-y-4 shadow-xs hover:border-gray-300 hover:shadow-md"
                      >
                        {/* Coach Header: Name, Type Tag, Rating */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-black text-gray-900 text-base sm:text-lg">
                              {sched.coach?.name || 'Arabian Express Hino AC 01'}
                            </span>
                            <span className="text-[10px] bg-red-50 text-[#E31B23] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-red-100">
                              {typeof sched.coach?.coachType === 'object' && sched.coach?.coachType !== null
                                ? ((sched.coach.coachType as any).name || 'AC Executive')
                                : (sched.coach?.coachType || 'AC Executive')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80 text-amber-700">
                            <RiStarFill className="text-[#F59E0B] text-sm" />
                            <span className="text-xs font-black">4.8</span>
                          </div>
                        </div>

                        {/* Departure, Duration & Arrival */}
                        <div className="flex items-center justify-between gap-4 py-3 border-y border-gray-100">
                          <div className="text-left">
                            <div className="text-xl sm:text-2xl font-black text-gray-900">
                              {formatTime(sched.departureTime)}
                            </div>
                            <div className="text-xs text-gray-600 font-extrabold mt-0.5">
                              {sched.route?.origin || 'Dhaka'}
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col items-center gap-1">
                            <div className="text-xs text-gray-400 font-bold">8h</div>
                            <div className="relative w-full flex items-center">
                              <div className="flex-1 h-px bg-gray-200" />
                              <div className="mx-2 w-2.5 h-2.5 rounded-full bg-[#E31B23] shrink-0" />
                              <div className="flex-1 h-px bg-gray-200" />
                            </div>
                            <div className="text-xs text-gray-400 font-medium">Non-stop</div>
                          </div>

                          <div className="text-right">
                            <div className="text-xl sm:text-2xl font-black text-gray-900">
                              {formatTime(sched.arrivalTime || '03:00 PM')}
                            </div>
                            <div className="text-xs text-gray-600 font-extrabold mt-0.5">
                              {sched.route?.destination || "Cox's Bazar"}
                            </div>
                          </div>
                        </div>

                        {/* Main Boarding Counter Information */}
                        <div className="flex items-start gap-2 bg-blue-50/70 border border-blue-200/80 rounded-2xl px-4 py-2.5">
                          <Building2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                          <div className="text-xs font-semibold text-blue-900 leading-snug">
                            <span className="font-extrabold">Main Boarding Counter: </span>
                            {sched.route?.origin === 'Dhaka' ? 'Dhaka - Arambagh' : `${sched.route?.origin} Main Counter`}
                            <span className="text-blue-700 font-medium">
                              {' '}
                              · All {sched.route?.origin} Pickup Counters Available
                            </span>
                          </div>
                        </div>

                        {/* Card Footer: Seats Left + Price + Book Button */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 flex-wrap gap-3">
                          <div>
                            <span className="text-sm font-black text-emerald-600">
                              {sched.availableSeatsCount ?? 30} seats left
                            </span>
                            <div className="text-[11px] text-gray-400 font-semibold mt-0.5 flex items-center gap-1">
                              <Calendar size={13} className="text-gray-400" /> {sched.departureDate ? formatDate(sched.departureDate, 'dd MMM yyyy') : 'Today'}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-xl sm:text-2xl font-black text-[#E31B23]">
                                ৳{(sched.fare || 2000).toLocaleString('en-BD')}
                              </div>
                              <div className="text-[11px] text-gray-400 font-medium">per seat</div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectSchedule(sched)}
                              className="px-6 py-3 bg-[#E31B23] hover:bg-[#c9121a] text-white rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md hover:shadow-red-600/20 active:scale-95"
                            >
                              Book <HiChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STEP 2: DEDICATED SEAT MAP & PASSENGER INFORMATION SUB-PAGE */
          <form onSubmit={handleSellTicket} className="space-y-6 animate-fade-in">
            {/* Sub-Page Top Navigation & Selected Bus Summary Banner */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSchedule(null);
                    setSelectedSeats([]);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E31B23] hover:text-[#c9121a] bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition-colors"
                >
                  <ArrowLeft size={15} /> Back to Schedules
                </button>
                <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                  Step 2: Seats & Info
                </span>
              </div>

              {/* Selected Bus Overview Banner - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                <div className="space-y-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-black text-gray-900">
                      {selectedSchedule.coach?.name || 'Arabian Express Hino AC 01'}
                    </span>
                    <span className="text-[10px] bg-red-50 text-[#E31B23] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-red-100">
                      {typeof selectedSchedule.coach?.coachType === 'object' && selectedSchedule.coach?.coachType !== null
                        ? ((selectedSchedule.coach.coachType as any).name || 'AC Executive')
                        : (selectedSchedule.coach?.coachType || 'AC Executive')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-gray-700">
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-gray-200/80 shadow-2xs">
                      {selectedSchedule.route?.origin} ➔ {selectedSchedule.route?.destination}
                    </span>
                    <span className="bg-white text-[#E31B23] px-2.5 py-1 rounded-lg border border-gray-200/80 shadow-2xs inline-flex items-center gap-1">
                      <Calendar size={13} /> {selectedSchedule.departureDate ? formatDate(selectedSchedule.departureDate, 'dd MMM yyyy') : 'Today'}
                    </span>
                    <span className="bg-white text-gray-800 px-2.5 py-1 rounded-lg border border-gray-200/80 shadow-2xs inline-flex items-center gap-1">
                      <Clock size={13} className="text-gray-500" /> {formatTime(selectedSchedule.departureTime)}
                    </span>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-gray-200/60 shrink-0">
                  <span className="text-xs text-gray-500 font-bold sm:hidden">Fare:</span>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-black text-[#E31B23]">
                      ৳{(selectedSchedule.fare || 2000).toLocaleString('en-BD')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold block">per seat</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Map Sub-Page Component */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <BsFillTicketPerforatedFill size={18} className="text-[#E31B23]" /> Live Interactive Seat Map
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Gray seats are already booked by passengers/customers. Click available seats to select.
                  </p>
                </div>
                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl">
                  Selected Seats:{' '}
                  <strong className="text-[#E31B23] font-black">
                    {selectedSeats.map((s) => s.seatNumber).join(', ') || 'None'}
                  </strong>
                </span>
              </div>

              {loadingSeats ? (
                <div className="py-12 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Loader2 className="w-6 h-6 text-[#E31B23] animate-spin" /> Loading seat map layout...
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

            {/* Passenger Information Form */}
            {selectedSeats.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <User size={18} className="text-[#E31B23]" /> Passenger Information
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
                      ৳{((selectedSchedule.fare || 2000) * selectedSeats.length).toLocaleString('en-BD')}
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
                  setSelectedSchedule(null);
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
