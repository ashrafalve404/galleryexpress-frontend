'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { RiWindyFill, RiWifiFill, RiFlashlightFill, RiTvFill, RiDropFill, RiStarFill } from 'react-icons/ri';
import { HiChevronRight } from 'react-icons/hi';
import { Building2 } from 'lucide-react';
import { type Schedule } from '@/lib/api/schedules';
import { useBookingStore } from '@/lib/store/bookingStore';
import { formatTime, getDuration } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { ROUTES } from '@/lib/utils/constants';
import client from '@/lib/api/client';

interface ScheduleCardProps {
  schedule: Schedule;
}

const AMENITY_MAP: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  AC: { icon: RiWindyFill, label: 'AC' },
  WIFI: { icon: RiWifiFill, label: 'WiFi' },
  CHARGING: { icon: RiFlashlightFill, label: 'Plug' },
  RECLINING: { icon: RiWindyFill, label: 'Reclining' },
  WATER: { icon: RiDropFill, label: 'Water' },
  ENTERTAINMENT: { icon: RiTvFill, label: 'TV' },
};

import { withCompany } from '@/lib/api/client';

export function ScheduleCard({ schedule }: ScheduleCardProps) {
  const router = useRouter();
  const setSchedule = useBookingStore((s) => s.setSchedule);

  // Fetch counters from public endpoint to show boarding counter per origin city
  const { data: countersData } = useQuery({
    queryKey: ['public', 'counters'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/counters', { params: withCompany() });
      return data?.data || (Array.isArray(data) ? data : []);
    },
    staleTime: 5 * 60 * 1000,
  });

  const sAny = schedule as unknown as Record<string, any>;
  const fAny = schedule?.fare as unknown as Record<string, any>;

  const departure = schedule?.departureTime || '';
  const arrival = schedule?.arrivalTime || '';
  const duration = getDuration(departure, arrival);

  const rawPrice =
    fAny?.basePrice ||
    fAny?.baseAmount ||
    fAny?.amount ||
    sAny?.fareAmount ||
    sAny?.price ||
    0;

  const destLower = (schedule?.route?.destination || '').toLowerCase();
  const fallbackPrice = destLower.includes('cox')
    ? 1250
    : destLower.includes('chittagong')
    ? 900
    : destLower.includes('sylhet')
    ? 850
    : destLower.includes('rajshahi')
    ? 750
    : 850;

  const price = rawPrice > 0 ? rawPrice : fallbackPrice;
  const totalCoachSeats = schedule?.coach?.totalSeats || schedule?.coach?._count?.seats || 36;
  const bookedCount = schedule?._count?.bookings || 0;
  const seats = schedule?.availableSeats !== undefined
    ? schedule.availableSeats
    : Math.max(0, totalCoachSeats - bookedCount);
  const coach = schedule?.coach;
  const route = schedule?.route;
  const amenities: string[] = coach?.amenities || [];

  const handleBook = () => {
    setSchedule(schedule.id, {
      departureTime: departure,
      arrivalTime: arrival,
      origin: route?.origin || '',
      destination: route?.destination || '',
      coachName: coach?.name || '',
      fare: price,
    });
    router.push(ROUTES.BOOKING(schedule.id));
  };

  const seatColor = seats === 0 ? 'text-rose-600' : seats <= 5 ? 'text-amber-600' : 'text-emerald-600';

  const coachTypeLabel =
    typeof coach?.coachType === 'object' && coach?.coachType
      ? (coach.coachType as { name?: string }).name
      : typeof coach?.coachType === 'string'
      ? coach.coachType
      : '';

  // Match main counter to route origin city
  const originCity = route?.origin || '';
  const boardingCounter = Array.isArray(countersData)
    ? countersData.find((c: any) =>
        (c.name || '').toLowerCase().includes(originCity.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(originCity.toLowerCase())
      )
    : null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-gray-200 transition-all group">
      {/* Coach name & type */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#111111] text-sm">{coach?.name || 'Gallery Express Limited'}</span>
          {coachTypeLabel && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-semibold">
              {coachTypeLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          <RiStarFill className="text-[#F59E0B] text-sm" />
          <span className="text-xs text-gray-700 font-bold">4.8</span>
        </div>
      </div>

      {/* Time & Duration */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-black text-[#111111]">{formatTime(departure)}</div>
          <div className="text-xs text-gray-500 font-semibold mt-0.5">{route?.origin}</div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="text-xs text-gray-400 font-semibold">{duration}</div>
          <div className="relative w-full flex items-center">
            <div className="flex-1 h-px bg-gray-200" />
            <div className="mx-2 w-2 h-2 rounded-full bg-[#E31B23] shrink-0" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="text-xs text-gray-400 font-medium">{route?.stops?.length ? `${route.stops.length} stop(s)` : 'Non-stop'}</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-black text-[#111111]">{formatTime(arrival)}</div>
          <div className="text-xs text-gray-500 font-semibold mt-0.5">{route?.destination}</div>
        </div>
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {amenities.slice(0, 5).map((a) => {
            const meta = AMENITY_MAP[a];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <span key={a} className="text-xs bg-slate-100/70 text-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                <Icon className="text-slate-500 text-sm" /> {meta.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Boarding Counter */}
      <div className="flex items-start gap-2 mb-4 bg-blue-50/60 border border-blue-100 rounded-xl px-3 py-2">
        <Building2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs font-semibold text-blue-800 leading-snug">
          <span className="font-bold">Main Boarding Counter: </span>
          {boardingCounter
            ? <>{boardingCounter.name}<span className="text-blue-600 font-medium"> · All {originCity} Pickup Counters Available</span></>
            : <span className="text-blue-600">{originCity} Main Terminal</span>
          }
        </div>
      </div>

      {/* Footer: Seats + Price + Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div>
          <span className={`text-sm font-bold ${seatColor}`}>
            {seats === 0 ? 'Sold Out' : `${seats} seats left`}
          </span>
          {seats > 0 && seats <= 10 && (
            <div className="text-xs text-amber-600 font-semibold mt-0.5">Filling fast</div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xl font-black text-[#E31B23]">{formatCurrency(price)}</div>
            <div className="text-[11px] text-gray-400 font-medium">per seat</div>
          </div>
          <button
            onClick={handleBook}
            disabled={seats === 0}
            className="bg-[#E31B23] disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#C41920] text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-1 transition-all hover:shadow-md text-sm active:scale-95"
          >
            {seats === 0 ? 'Full' : 'Book'}
            {seats > 0 && <HiChevronRight className="text-base" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScheduleCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5" suppressHydrationWarning>
      <div className="flex justify-between mb-4" suppressHydrationWarning>
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-4 w-12 rounded" />
      </div>
      <div className="flex items-center gap-4 mb-4" suppressHydrationWarning>
        <div className="skeleton h-8 w-20 rounded" />
        <div className="flex-1 skeleton h-px" />
        <div className="skeleton h-8 w-20 rounded" />
      </div>
      <div className="flex gap-2 mb-4" suppressHydrationWarning>
        <div className="skeleton h-6 w-14 rounded-lg" />
        <div className="skeleton h-6 w-14 rounded-lg" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-50" suppressHydrationWarning>
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}
