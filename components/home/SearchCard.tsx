'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiSearch, HiExclamationCircle, HiSwitchHorizontal } from 'react-icons/hi';
import { RiMapPin2Fill, RiCalendarEventFill } from 'react-icons/ri';
import { useBookingStore } from '@/lib/store/bookingStore';
import { today, tomorrow } from '@/lib/utils/date';

const POPULAR_CITIES = [
  'Dhaka',
  'Chittagong',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  "Cox's Bazar",
  'Comilla',
  'Mymensingh',
  'Barishal',
  'Rangpur',
  'Jessore',
  'Bogra',
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
  const filtered = POPULAR_CITIES.filter((c) =>
    c.toLowerCase().includes(value.toLowerCase()) && c !== value
  );

  return (
    <div className="relative flex-1">
      <label htmlFor={id} className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="relative">
        <RiMapPin2Fill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E31B23] text-lg pointer-events-none" />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all text-sm"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in py-1">
          {filtered.slice(0, 6).map((city) => (
            <button
              key={city}
              type="button"
              onMouseDown={() => { onChange(city); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#E31B23]/5 hover:text-[#E31B23] flex items-center gap-2 font-medium transition-colors"
            >
              <RiMapPin2Fill className="text-gray-400 text-base" />
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SearchCard() {
  const router = useRouter();
  const { from, to, date, setSearch } = useBookingStore();
  const [localFrom, setLocalFrom] = useState(from || '');
  const [localTo, setLocalTo] = useState(to || '');
  const [localDate, setLocalDate] = useState(date || today());
  const [error, setError] = useState('');

  const handleSwap = () => {
    setLocalFrom(localTo);
    setLocalTo(localFrom);
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
    <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 w-full max-w-3xl mx-auto border border-gray-100">
      <h2 className="text-[#111111] font-black text-lg mb-6 flex items-center gap-2">
        Find Your Bus
      </h2>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* From / Swap / To */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
          <CityInput
            id="from"
            label="From"
            placeholder="e.g. Dhaka"
            value={localFrom}
            onChange={setLocalFrom}
          />

          <button
            type="button"
            onClick={handleSwap}
            className="shrink-0 self-center sm:self-end mb-[1px] w-11 h-[48px] flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 hover:bg-[#E31B23] hover:text-white hover:border-[#E31B23] transition-all group"
            aria-label="Swap cities"
          >
            <HiSwitchHorizontal className="text-gray-600 text-xl group-hover:text-white transition-colors" />
          </button>

          <CityInput
            id="to"
            label="To"
            placeholder="e.g. Chittagong"
            value={localTo}
            onChange={setLocalTo}
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="travel-date" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            Journey Date
          </label>
          <div className="relative">
            <RiCalendarEventFill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E31B23] text-lg pointer-events-none" />
            <input
              id="travel-date"
              type="date"
              value={localDate}
              min={today()}
              onChange={(e) => setLocalDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all text-sm"
            />
          </div>
        </div>

        {/* Quick date shortcuts */}
        <div className="flex gap-2 pt-1">
          {['Today', 'Tomorrow'].map((label, i) => {
            const d = i === 0 ? today() : tomorrow();
            return (
              <button
                key={label}
                type="button"
                onClick={() => setLocalDate(d)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  localDate === d
                    ? 'bg-[#E31B23] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="text-rose-600 text-xs font-semibold flex items-center gap-2 bg-rose-50 border border-rose-100 p-3 rounded-xl">
            <HiExclamationCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-[#E31B23] hover:bg-[#C41920] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-base"
        >
          <HiSearch className="text-lg" />
          Search Buses
        </button>
      </form>
    </div>
  );
}
