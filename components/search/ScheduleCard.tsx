'use client';

import { useRouter } from 'next/navigation';
import { RiWindyFill, RiWifiFill, RiFlashlightFill, RiTvFill, RiDropFill, RiStarFill } from 'react-icons/ri';
import { HiChevronRight } from 'react-icons/hi';
import { type Schedule } from '@/lib/api/schedules';
import { useBookingStore } from '@/lib/store/bookingStore';
import { formatTime, getDuration } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { ROUTES } from '@/lib/utils/constants';

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

export function ScheduleCard({ schedule }: ScheduleCardProps) {
  const router = useRouter();
  const setSchedule = useBookingStore((s) => s.setSchedule);

  const departure = schedule.departureTime;
  const arrival = schedule.arrivalTime;
  const duration = getDuration(departure, arrival);
  const price = schedule.fare?.basePrice || 0;
  const seats = schedule.availableSeats ?? 0;
  const coach = schedule.coach;
  const route = schedule.route;
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

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-gray-200 transition-all group">
      {/* Coach name & type */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#111111] text-sm">{coach?.name || 'Gallery Express'}</span>
          {coach?.coachType && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-semibold">
              {coach.coachType}
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
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex justify-between mb-4">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-4 w-12 rounded" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="skeleton h-8 w-20 rounded" />
        <div className="flex-1 skeleton h-px" />
        <div className="skeleton h-8 w-20 rounded" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-6 w-14 rounded-lg" />
        <div className="skeleton h-6 w-14 rounded-lg" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}
