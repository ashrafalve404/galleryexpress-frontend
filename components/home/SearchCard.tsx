'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiSearch, HiExclamationCircle, HiSwitchHorizontal, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { RiMapPin2Fill, RiCalendarEventFill, RiBusFill, RiBuilding2Fill } from 'react-icons/ri';
import { useBookingStore } from '@/lib/store/bookingStore';
import { today, tomorrow, formatDate } from '@/lib/utils/date';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isBefore, isAfter, startOfDay, parseISO } from 'date-fns';
import { useLanguageStore } from '@/lib/store/languageStore';
import { getTranslation } from '@/lib/utils/translations';

export interface LocationOption {
  city: string;
  name: string;
  nameBn?: string;
  sub: string;
  subBn?: string;
  type: 'city' | 'counter';
}

export const LOCATION_OPTIONS: LocationOption[] = [
  // Dhaka — city header
  { city: 'Dhaka', name: 'Dhaka', nameBn: 'ঢাকা', sub: 'All Dhaka Counters', subBn: 'ঢাকার সকল কাউন্টার', type: 'city' },
  // 20 Dhaka boarding counters (north to south)
  { city: 'Dhaka', name: 'Dhaka - Abdullahpur', nameBn: 'ঢাকা - আবদুল্লাহপুর', sub: 'Abdullahpur Bus Stop, Uttara', subBn: 'আব্দুল্লাহপুর বাস স্টপ, উত্তরা', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Uttara Azampur', nameBn: 'ঢাকা - উত্তরা আজমপুর', sub: 'Azampur Bus Stop, Uttara', subBn: 'আজমপুর বাস স্টপ, উত্তরা', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Uttara Jasimuddin', nameBn: 'ঢাকা - উত্তরা জসীমউদ্দীন', sub: 'Jasimuddin Road, Uttara', subBn: 'জসীমউদ্দীন রোড, উত্তরা', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Uttara Airport', nameBn: 'ঢাকা - উত্তরা বিমানবন্দর', sub: 'Airport Road, Uttara', subBn: 'বিমানবন্দর রোড, উত্তরা', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Bashundhara', nameBn: 'ঢাকা - বসুন্ধরা', sub: 'Bashundhara R/A Gate', subBn: 'বসুন্ধরা আ/এ গেট', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Nadda', nameBn: 'ঢাকা - নদ্দা', sub: 'Nadda Bus Stop, Badda', subBn: 'নদ্দা বাস স্টপ, বাড্ডা', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Notun Bazar', nameBn: 'ঢাকা - নতুন বাজার', sub: 'Notun Bazar Bus Stop, Badda', subBn: 'নতুন বাজার বাস স্টপ, বাড্ডা', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Uttar Badda', nameBn: 'ঢাকা - উত্তর বাড্ডা', sub: 'Uttar Badda Bus Stop', subBn: 'উত্তর বাড্ডা বাস স্টপ', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Moddho Badda', nameBn: 'ঢাকা - মধ্য বাড্ডা', sub: 'Moddho Badda Bus Stop', subBn: 'মধ্য বাড্ডা বাস স্টপ', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Rampura', nameBn: 'ঢাকা - রামপুরা', sub: 'Rampura Bus Stop, DIT Road', subBn: 'রামপুরা বাস স্টপ, ডিআইটি রোড', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Malibagh', nameBn: 'ঢাকা - মালিবাগ', sub: 'Malibagh Chowdhurypara', subBn: 'মালিবাগ চৌধুরীপাড়া', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Fakirerpool', nameBn: 'ঢাকা - ফকিরাপুল', sub: 'Fakirerpool Bus Stop, Motijheel', subBn: 'ফকিরাপুল বাস স্টপ, মতিঝিল', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Arambagh', nameBn: 'ঢাকা - আরামবাগ', sub: 'Arambagh Bus Stop, Motijheel', subBn: 'আরামবাগ বাস স্টপ, মতিঝিল', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Sayedabad', nameBn: 'ঢাকা - সায়েদাবাদ', sub: 'Sayedabad Bus Terminal, Gate 7', subBn: 'সায়েদাবাদ বাস টার্মিনাল, গেট ৭', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Soniakora', nameBn: 'ঢাকা - সোনিয়াখোড়া', sub: 'Soniakora Bus Stop, Jatrabari', subBn: 'সোনিয়াখোড়া বাস স্টপ, যাত্রাবাড়ী', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Matuail', nameBn: 'ঢাকা - মাতুয়াইল', sub: 'Matuail Bus Stop, Jatrabari', subBn: 'মাতুয়াইল বাস স্টপ, যাত্রাবাড়ী', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Signboard', nameBn: 'ঢাকা - সাইনবোর্ড', sub: 'Signboard Bus Stop, Demra', subBn: 'সাইনবোর্ড বাস স্টপ, ডেমরা', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Chittagong Road', nameBn: 'ঢাকা - চট্টগ্রাম রোড', sub: 'Chittagong Road, Demra', subBn: 'চট্টগ্রাম রোড, ডেমরা', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Kanchpur', nameBn: 'ঢাকা - কাঁচপুর', sub: 'Kanchpur Bridge, Dhaka Highway', subBn: 'কাঁচপুর ব্রিজ, ঢাকা হাইওয়ে', type: 'counter' },
  { city: 'Dhaka', name: 'Dhaka - Madanpur', nameBn: 'ঢাকা - মদনপুর', sub: 'Madanpur Bus Stop, Dhaka Highway', subBn: 'মদনপুর বাস স্টপ, ঢাকা হাইওয়ে', type: 'counter' },

  // Chittagong
  { city: 'Chittagong', name: 'Chittagong', nameBn: 'চট্টগ্রাম', sub: 'All Terminals & Counters', subBn: 'সকল টার্মিনাল ও কাউন্টার', type: 'city' },
  { city: 'Chittagong', name: 'Chittagong - Dampara', nameBn: 'চট্টগ্রাম - দামপাড়া', sub: 'Dampara Bus Terminal, Station Road', subBn: 'দামপাড়া বাস টার্মিনাল, স্টেশন রোড', type: 'counter' },
  { city: 'Chittagong', name: 'Chittagong - AK Khan', nameBn: 'চট্টগ্রাম - একে খান', sub: 'AK Khan Bus Stop, Pahartali', subBn: 'একে খান বাস স্টপ, পাহাড়তলী', type: 'counter' },

  // Cox's Bazar
  { city: "Cox's Bazar", name: "Cox's Bazar", nameBn: 'কক্সবাজার', sub: 'All Terminals & Counters', subBn: 'সকল টার্মিনাল ও কাউন্টার', type: 'city' },
  { city: "Cox's Bazar", name: "Cox's Bazar - Kolatoli", nameBn: "কক্সবাজার - কলাতলী", sub: 'Kolatoli Road, Near Sea Beach', subBn: 'কলাতলী রোড, সমুদ্র সৈকতের কাছে', type: 'counter' },
  { city: "Cox's Bazar", name: "Cox's Bazar - Dolphin More", nameBn: 'কক্সবাজার - ডলফিন মোড়', sub: 'Dolphin Circle, Kolatoli', subBn: 'ডলফিন মোড়, কলাতলী', type: 'counter' },
  { city: "Cox's Bazar", name: "Cox's Bazar - Sugandha", nameBn: 'কক্সবাজার - সুগন্ধা', sub: 'Sugandha Point, Sea Beach Road', subBn: 'সুগন্ধা পয়েন্ট, সি বিচ রোড', type: 'counter' },
  { city: "Cox's Bazar", name: "Cox's Bazar - Bus Terminal", nameBn: 'কক্সবাজার - টার্মিনাল', sub: 'Central Bus Terminal, Larpara', subBn: 'কেন্দ্রীয় বাস টার্মিনাল, লারপাড়া', type: 'counter' },
  { city: "Cox's Bazar", name: "Cox's Bazar - Ramu", nameBn: 'কক্সবাজার - রামু', sub: 'Ramu Bypass, Highway', subBn: 'রামু বাইপাস, হাইওয়ে', type: 'counter' },
  { city: "Cox's Bazar", name: "Cox's Bazar - Eidgah", nameBn: 'কক্সবাজার - ঈদগাহ', sub: 'Eidgah Bus Stop, Highway', subBn: 'ঈদগাহ বাস স্টপ, হাইওয়ে', type: 'counter' },
  { city: "Cox's Bazar", name: "Cox's Bazar - Chakaria", nameBn: 'কক্সবাজার - চকরিয়া', sub: 'Chakaria Bus Terminal, Highway', subBn: 'চকরিয়া বাস টার্মিনাল, হাইওয়ে', type: 'counter' },
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
  const { lang } = useLanguageStore();

  const valLower = value.toLowerCase().trim();
  const filtered = LOCATION_OPTIONS.filter((loc) => {
    if (!valLower) return true;
    const nameBn = loc.nameBn || '';
    const subBn = loc.subBn || '';
    return (
      loc.name.toLowerCase().includes(valLower) ||
      loc.city.toLowerCase().includes(valLower) ||
      loc.sub.toLowerCase().includes(valLower) ||
      nameBn.toLowerCase().includes(valLower) ||
      subBn.toLowerCase().includes(valLower)
    );
  });

  return (
    <div className="relative flex-1">
      <label htmlFor={id} className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1">
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
          className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all text-xs sm:text-sm"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in py-1 max-h-64 overflow-y-auto">
          {filtered.map((item) => {
            const displayName = lang === 'BN' && item.nameBn ? item.nameBn : item.name;
            const displaySub = lang === 'BN' && item.subBn ? item.subBn : item.sub;
            const displayType = item.type === 'counter' 
              ? (lang === 'BN' ? 'কাউন্টার' : 'counter')
              : (lang === 'BN' ? 'শহর' : 'city');

            return (
              <button
                key={item.name}
                type="button"
                onMouseDown={() => { onChange(item.name); setOpen(false); }}
                className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 flex items-center justify-between gap-2 transition-colors border-b border-gray-50 last:border-0 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.type === 'counter' ? (
                    <RiBuilding2Fill size={16} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                  ) : (
                    <RiMapPin2Fill size={15} className="text-[#E31B23] shrink-0 group-hover:scale-110 transition-transform" />
                  )}
                  <div className="truncate">
                    <div className="text-xs sm:text-sm font-bold text-[#111111] group-hover:text-[#E31B23] transition-colors truncate">
                      {displayName}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium truncate">{displaySub}</div>
                  </div>
                </div>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                  item.type === 'counter' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-[#E31B23]'
                }`}>
                  {displayType}
                </span>
              </button>
            );
          })}
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
  const { lang } = useLanguageStore();
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

  const formattedDisplay = value 
    ? formatDate(value, 'EEE, dd MMM yyyy') 
    : (lang === 'BN' ? 'তারিখ নির্বাচন করুন' : 'Select Date');

  return (
    <div className="relative flex-1" ref={containerRef} suppressHydrationWarning>
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1">
        {lang === 'BN' ? 'যাত্রার তারিখ' : 'Journey Date'}
      </label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 pl-3 pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] font-bold hover:bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all text-xs sm:text-sm text-left group"
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
            {(lang === 'BN' ? ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']).map((d) => (
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
                  title={isBeyond7Days ? (lang === 'BN' ? 'বুকিং সর্বোচ্চ ৭ দিন আগে উন্মুক্ত থাকে' : 'Booking is open up to 7 days in advance') : undefined}
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
              {lang === 'BN' ? 'আজ' : 'Today'}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(tomorrow());
                setOpen(false);
              }}
              className="hover:text-[#E31B23] transition-colors"
            >
              {lang === 'BN' ? 'আগামীকাল' : 'Tomorrow'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchCard() {
  const router = useRouter();
  const { lang } = useLanguageStore();
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

  const triggerSearch = (nFrom: string, nTo: string, nDate: string) => {
    if (!nFrom.trim() || !nTo.trim() || !nDate) return;
    if (nFrom.toLowerCase() === nTo.toLowerCase()) return;

    setError('');
    setSearch(nFrom.trim(), nTo.trim(), nDate);
    router.push(`/search?from=${encodeURIComponent(nFrom.trim())}&to=${encodeURIComponent(nTo.trim())}&date=${nDate}`);
  };

  const handleDateSelect = (newDateStr: string) => {
    setLocalDate(newDateStr);
    triggerSearch(localFrom, localTo, newDateStr);
  };

  const handleSwap = () => {
    const newFrom = localTo;
    const newTo = localFrom;
    setLocalFrom(newFrom);
    setLocalTo(newTo);
    triggerSearch(newFrom, newTo, localDate);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(localFrom, localTo, localDate);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 text-left relative z-30">
      {/* Search Header */}
      <div className="flex items-center justify-between px-3.5 sm:px-6 pt-3.5 sm:pt-5 pb-0.5 sm:pb-1">
        <h2 className="text-[#111111] font-black text-sm sm:text-base flex items-center gap-2">
          <RiBusFill className="text-[#E31B23] text-lg" />
          {lang === 'BN' ? 'বাস টিকিট খুঁজুন' : 'Find Your Bus'}
        </h2>
      </div>

      <div className="p-3 sm:p-6 space-y-2.5 sm:space-y-4">
        <form onSubmit={handleSearch} className="space-y-2.5 sm:space-y-3">
          {/* From / Swap / To */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-1.5 sm:gap-2">
            <CityInput
              id="from"
              label={lang === 'BN' ? 'যাত্রার স্থান (কোথা থেকে)' : 'Depart From'}
              placeholder={lang === 'BN' ? 'যেমন: ঢাকা' : 'e.g. Dhaka'}
              value={localFrom}
              onChange={setLocalFrom}
            />

            <button
              type="button"
              onClick={handleSwap}
              className="shrink-0 self-center sm:self-end mb-[1px] w-8 h-8 sm:w-10 sm:h-[40px] flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 hover:bg-[#E31B23] hover:text-white hover:border-[#E31B23] transition-all group"
              aria-label="Swap cities"
            >
              <HiSwitchHorizontal className="text-gray-600 text-base sm:text-lg group-hover:text-white transition-colors" />
            </button>

            <CityInput
              id="to"
              label={lang === 'BN' ? 'গন্তব্য স্থান (কোথায় যাবেন)' : 'Going To'}
              placeholder={lang === 'BN' ? 'যেমন: চট্টগ্রাম' : 'e.g. Chittagong'}
              value={localTo}
              onChange={setLocalTo}
            />
          </div>

          {/* Date & Date Shortcuts */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-2.5 sm:gap-3">
            <ProfessionalDatePicker
              value={localDate}
              onChange={handleDateSelect}
            />

            <div className="flex gap-1.5 shrink-0 pb-[1px]">
              {['Today', 'Tomorrow'].map((label, i) => {
                const d = i === 0 ? today() : tomorrow();
                const displayLabel = lang === 'BN' ? (i === 0 ? 'আজ' : 'আগামীকাল') : label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleDateSelect(d)}
                    className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all ${
                      localDate === d
                        ? 'bg-[#E31B23] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {displayLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="text-rose-600 text-xs font-semibold flex items-center gap-2 bg-rose-50 border border-rose-100 p-2 sm:p-2.5 rounded-xl">
              <HiExclamationCircle className="text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#E31B23] hover:bg-[#C41920] text-white font-bold py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.99] text-sm sm:text-base mt-1"
          >
            <HiSearch className="text-base sm:text-lg" />
            {lang === 'BN' ? 'বাস খুঁজুন' : 'Search Buses'}
          </button>
        </form>
      </div>
    </div>
  );
}

