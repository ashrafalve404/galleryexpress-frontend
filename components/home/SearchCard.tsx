'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiSearch, HiExclamationCircle, HiSwitchHorizontal, HiChevronLeft, HiChevronRight, HiFire } from 'react-icons/hi';
import { RiMapPin2Fill, RiCalendarEventFill, RiBusFill } from 'react-icons/ri';
import { useBookingStore } from '@/lib/store/bookingStore';
import { today, tomorrow, formatDate } from '@/lib/utils/date';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isBefore, isAfter, startOfDay, parseISO } from 'date-fns';

import { Building2 } from 'lucide-react';

export interface LocationOption {
  city: string;
  name: string;
  sub: string;
  type: 'city' | 'counter';
}

export const LOCATION_OPTIONS: LocationOption[] = [
  // Dhaka — city header
  { city: 'Dhaka', name: 'Dhaka', sub: 'All Dhaka Counters', type: 'city' },
  // 20 Dhaka boarding counters (north to south)
  { city: 'Dhaka', name: 'Dhaka - Abdullahpur',      sub: 'Abdullahpur Bus Stop, Uttara',          type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Uttara Azampur',   sub: 'Azampur Bus Stop, Uttara',              type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Uttara Jasimuddin',sub: 'Jasimuddin Road, Uttara',               type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Uttara Airport',   sub: 'Airport Road, Uttara',                  type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Bashundhara',      sub: 'Bashundhara R/A Gate',                  type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Nadda',            sub: 'Nadda Bus Stop, Badda',                 type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Notun Bazar',      sub: 'Notun Bazar Bus Stop, Badda',           type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Uttar Badda',      sub: 'Uttar Badda Bus Stop',                  type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Moddho Badda',     sub: 'Moddho Badda Bus Stop',                 type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Rampura',          sub: 'Rampura Bus Stop, DIT Road',            type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Malibagh',         sub: 'Malibagh Chowdhurypara',                type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Fakirerpool',      sub: 'Fakirerpool Bus Stop, Motijheel',       type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Arambagh',         sub: 'Arambagh Bus Stop, Motijheel',          type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Sayedabad',        sub: 'Sayedabad Bus Terminal, Gate 7',        type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Soniakora',        sub: 'Soniakora Bus Stop, Jatrabari',         type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Matuail',          sub: 'Matuail Bus Stop, Jatrabari',           type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Signboard',        sub: 'Signboard Bus Stop, Demra',             type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Chittagong Road',  sub: 'Chittagong Road, Demra',                type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Kanchpur',         sub: 'Kanchpur Bridge, Dhaka Highway',        type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Madanpur',         sub: 'Madanpur Bus Stop, Dhaka Highway',      type: 'counter' },

  // Chittagong
  { city: 'Chittagong', name: 'Chittagong',             sub: 'All Terminals & Counters',           type: 'city' },
  { city: 'Chittagong', name: 'Chittagong - Dampara',   sub: 'Dampara Bus Terminal, Station Road', type: 'counter' },

  // Cox's Bazar
  { city: "Cox's Bazar", name: "Cox's Bazar",            sub: 'All Terminals & Counters',          type: 'city' },
  { city: "Cox's Bazar", name: "Cox's Bazar - Kolatoli", sub: 'Kolatoli Road, Near Sea Beach',     type: 'counter' },
];

const TRENDING_ROUTES = [
  { from: 'Dhaka', to: "Cox's Bazar" },
  { from: 'Dhaka', to: 'Chittagong' },
  { from: "Cox's Bazar", to: 'Dhaka' },
  { from: 'Chittagong', to: 'Dhaka' },
];

interface CityInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function CityInput({ id, label, placeholder, value, onChange }: CityInputProps) {
  const [open, setOpen] = useState(false);

  const valLower = value.toLowerCase().trim();
  const filtered = LOCATION_OPTIONS.filter((loc) => {
    if (!valLower) return true;
    return (
      loc.name.toLowerCase().includes(valLower) ||
      loc.city.toLowerCase().includes(valLower) ||
      loc.sub.toLowerCase().includes(valLower)
    );
  });

  return (
    <div className="relative flex-1">
      <label htmlFor={id} className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </label>
      <div className="relative">
        <RiMapPin2Fill className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E31B23] text-base pointer-events-none" />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all text-xs sm:text-sm"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in py-1 max-h-64 overflow-y-auto">
          {filtered.map((item) => (
            <button
              key={item.name}
              type="button"
              onMouseDown={() => { onChange(item.name); setOpen(false); }}
              className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 flex items-center justify-between gap-2 transition-colors border-b border-gray-50 last:border-0 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.type === 'counter' ? (
                  <Building2 size={15} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                ) : (
                  <RiMapPin2Fill size={15} className="text-[#E31B23] shrink-0 group-hover:scale-110 transition-transform" />
                )}
                <div className="truncate">
                  <div className="text-xs sm:text-sm font-bold text-[#111111] group-hover:text-[#E31B23] transition-colors truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium truncate">{item.sub}</div>
                </div>
              </div>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                item.type === 'counter' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-[#E31B23]'
              }`}>
                {item.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ProfessionalDatePickerProps {
  value: string;
  onChange: (dateStr: string) => void;
}

function ProfessionalDatePicker({ value, onChange }: ProfessionalDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? parseISO(value) : new Date();
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

  const formattedDisplay = value ? formatDate(value, 'EEE, dd MMM yyyy') : 'Select Date';

  return (
    <div className="relative flex-1" ref={containerRef} suppressHydrationWarning>
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
        Journey Date
      </label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 pl-3 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] font-bold hover:bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all text-xs sm:text-sm text-left group"
      >
        <RiCalendarEventFill className="text-[#E31B23] text-base shrink-0 group-hover:scale-110 transition-transform" />
        <span className="truncate">{formattedDisplay}</span>
      </button>

      {/* Calendar Popover Modal */}
      {open && (
        <div className="absolute top-full left-0 sm:left-0 right-0 sm:right-auto mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] p-3 sm:p-4 w-[280px] xs:w-[300px] sm:w-[310px] mx-auto sm:mx-0 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <HiChevronLeft size={18} />
            </button>
            <span className="font-bold text-gray-900 text-xs sm:text-sm">
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

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((d, idx) => {
              const isPast = isBefore(d, todayStart);
              const maxDate = addDays(todayStart, 7);
              const isBeyond7Days = isAfter(d, maxDate);
              const isSelected = isSameDay(d, selectedDate);
              const isCurrentMonth = isSameMonth(d, currentMonth);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isPast || isBeyond7Days}
                  onClick={() => {
                    onChange(format(d, 'yyyy-MM-dd'));
                    setOpen(false);
                  }}
                  className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all mx-auto ${
                    isSelected
                      ? 'bg-[#E31B23] text-white shadow-md scale-105'
                      : isPast || isBeyond7Days
                      ? 'text-gray-300 cursor-not-allowed opacity-40'
                      : !isCurrentMonth
                      ? 'text-gray-300 hover:bg-gray-50'
                      : 'text-gray-800 hover:bg-[#E31B23]/10 hover:text-[#E31B23]'
                  }`}
                  title={isBeyond7Days ? 'Booking is open up to 7 days in advance' : undefined}
                >
                  {format(d, 'd')}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
            <button
              type="button"
              onClick={() => {
                onChange(today());
                setOpen(false);
              }}
              className="hover:text-[#E31B23] transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(tomorrow());
                setOpen(false);
              }}
              className="hover:text-[#E31B23] transition-colors"
            >
              Tomorrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchCard() {
  const router = useRouter();
  const { from, to, date, setSearch } = useBookingStore();
  const [localFrom, setLocalFrom] = useState(from || 'Dhaka');
  const [localTo, setLocalTo] = useState(to || "Cox's Bazar");
  const [localDate, setLocalDate] = useState(date || '2026-08-25');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!date) {
      setLocalDate(today());
    }
  }, [date]);

  const handleSwap = () => {
    setLocalFrom(localTo);
    setLocalTo(localFrom);
  };

  const handleTrendingClick = (rFrom: string, rTo: string) => {
    setLocalFrom(rFrom);
    setLocalTo(rTo);
    setLocalDate(today());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!localFrom.trim()) { setError('Please select an origin city.'); return; }
    if (!localTo.trim()) { setError('Please select a destination city.'); return; }
    if (localFrom.toLowerCase() === localTo.toLowerCase()) { setError('Origin and destination cannot be the same.'); return; }
    if (!localDate) { setError('Please select a journey date.'); return; }

    setSearch(localFrom.trim(), localTo.trim(), localDate);
    router.push(`/search?from=${encodeURIComponent(localFrom)}&to=${encodeURIComponent(localTo)}&date=${localDate}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 text-left relative z-30">
      {/* Search Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-1">
        <h2 className="text-[#111111] font-black text-sm sm:text-base flex items-center gap-2">
          <RiBusFill className="text-[#E31B23] text-lg" />
          Find Your Bus
        </h2>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        <form onSubmit={handleSearch} className="space-y-3">
          {/* From / Swap / To */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
            <CityInput
              id="from"
              label="Depart From"
              placeholder="e.g. Dhaka"
              value={localFrom}
              onChange={setLocalFrom}
            />

            <button
              type="button"
              onClick={handleSwap}
              className="shrink-0 self-center sm:self-end mb-[1px] w-10 h-[40px] flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 hover:bg-[#E31B23] hover:text-white hover:border-[#E31B23] transition-all group"
              aria-label="Swap cities"
            >
              <HiSwitchHorizontal className="text-gray-600 text-lg group-hover:text-white transition-colors" />
            </button>

            <CityInput
              id="to"
              label="Going To"
              placeholder="e.g. Chittagong"
              value={localTo}
              onChange={setLocalTo}
            />
          </div>

          {/* Date & Date Shortcuts */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <ProfessionalDatePicker
              value={localDate}
              onChange={setLocalDate}
            />

            <div className="flex gap-1.5 shrink-0 pb-[1px]">
              {['Today', 'Tomorrow'].map((label, i) => {
                const d = i === 0 ? today() : tomorrow();
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setLocalDate(d)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      localDate === d
                        ? 'bg-[#E31B23] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="text-rose-600 text-xs font-semibold flex items-center gap-2 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
              <HiExclamationCircle className="text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#E31B23] hover:bg-[#C41920] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.99] text-sm sm:text-base mt-1"
          >
            <HiSearch className="text-base sm:text-lg" />
            Search Buses
          </button>
        </form>

        {/* Trending Searches Section (bdtickets inspired) */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-gray-400 flex items-center gap-1 shrink-0">
            <HiFire className="text-[#E31B23]" /> Trending:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TRENDING_ROUTES.map((r) => (
              <button
                key={`${r.from}-${r.to}`}
                type="button"
                onClick={() => handleTrendingClick(r.from, r.to)}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#E31B23]/10 hover:text-[#E31B23] text-gray-700 font-semibold transition-colors text-[11px]"
              >
                {r.from} → {r.to}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
