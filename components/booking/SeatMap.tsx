'use client';

import { RiCarFill, RiUserFill, RiBusFill, RiSubtractLine } from 'react-icons/ri';
import { type Seat } from '@/lib/api/schedules';

interface SeatProps {
  seat: Seat;
  isSelected: boolean;
  onToggle: (seat: Seat) => void;
}

function SeatComponent({ seat, isSelected, onToggle }: SeatProps) {
  const isUnavailable =
    seat.isBooked || seat.isHeld || seat.status !== 'AVAILABLE' || seat.seatType === 'DRIVER' || seat.seatType === 'HELPER' || seat.seatType === 'BLOCKED';

  const getClassName = () => {
    if (isUnavailable) return 'seat seat-booked cursor-not-allowed';
    if (isSelected) {
      if (seat.seatType === 'LADIES') return 'seat seat-ladies seat-selected';
      if (seat.seatType === 'VIP') return 'seat seat-vip seat-selected';
      return 'seat seat-selected';
    }
    if (seat.seatType === 'LADIES') return 'seat seat-ladies cursor-pointer';
    if (seat.seatType === 'VIP') return 'seat seat-vip cursor-pointer';
    return 'seat seat-available cursor-pointer';
  };

  const renderContent = () => {
    if (seat.seatType === 'DRIVER') return <RiCarFill className="text-gray-400 text-sm mx-auto" />;
    if (seat.seatType === 'HELPER') return <RiUserFill className="text-gray-400 text-sm mx-auto" />;
    if (seat.seatType === 'BLOCKED') return <RiSubtractLine className="text-gray-300 text-xs mx-auto" />;
    return seat.seatNumber;
  };

  return (
    <div
      className={getClassName()}
      onClick={() => !isUnavailable && onToggle(seat)}
      title={
        isUnavailable
          ? seat.isBooked || seat.isHeld
            ? 'Already booked'
            : `Not available (${seat.status})`
          : `Seat ${seat.seatNumber} (${seat.seatType})`
      }
      aria-label={`Seat ${seat.seatNumber}`}
      role="button"
      tabIndex={isUnavailable ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && !isUnavailable && onToggle(seat)}
    >
      {renderContent()}
    </div>
  );
}

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onToggle: (seat: Seat) => void;
  maxSeats?: number;
}

export function SeatMap({ seats, selectedSeats, onToggle, maxSeats = 4 }: SeatMapProps) {
  const selectedIds = new Set(selectedSeats.map((s) => s.id));

  // Group seats by row
  const rowMap = new Map<number, Seat[]>();
  seats.forEach((seat) => {
    const row = seat.row ?? 0;
    if (!rowMap.has(row)) rowMap.set(row, []);
    rowMap.get(row)!.push(seat);
  });

  const rows = Array.from(rowMap.entries()).sort(([a], [b]) => a - b);

  const handleToggle = (seat: Seat) => {
    if (selectedIds.has(seat.id)) {
      onToggle(seat);
    } else if (selectedSeats.length < maxSeats) {
      onToggle(seat);
    }
  };

  return (
    <div className="select-none">
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <div className="seat seat-available w-6 h-6 rounded" style={{ fontSize: '8px' }} />
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="seat seat-selected w-6 h-6 rounded" style={{ fontSize: '8px' }} />
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="seat seat-booked w-6 h-6 rounded" style={{ fontSize: '8px' }} />
          <span className="text-gray-600">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="seat seat-ladies w-6 h-6 rounded" style={{ fontSize: '8px' }} />
          <span className="text-gray-600">Ladies</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="seat seat-vip w-6 h-6 rounded" style={{ fontSize: '8px' }} />
          <span className="text-gray-600">VIP</span>
        </div>
      </div>

      {/* Bus outline */}
      <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs">
        {/* Driver area */}
        <div className="bg-gray-100/80 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-700 font-bold">
            <RiBusFill className="text-[#E31B23] text-base" />
            <span>Driver Cabin</span>
          </div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Front</span>
        </div>

        {/* Seats grid */}
        <div className="p-6 overflow-x-auto">
          <div className="space-y-3 min-w-max mx-auto" style={{ width: 'fit-content' }}>
            {rows.map(([rowNum, rowSeats]) => {
              const sorted = [...rowSeats].sort((a, b) => (a.column ?? 0) - (b.column ?? 0));
              const leftSeats = sorted.filter((s) => (s.column ?? 0) < 2);
              const rightSeats = sorted.filter((s) => (s.column ?? 0) >= 2);

              return (
                <div key={rowNum} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4 shrink-0 text-right font-mono font-semibold">{rowNum}</span>
                  {/* Left seats */}
                  <div className="flex gap-2">
                    {leftSeats.map((seat) => (
                      <SeatComponent
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedIds.has(seat.id)}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                  {/* Aisle */}
                  <div className="w-6" />
                  {/* Right seats */}
                  <div className="flex gap-2">
                    {rightSeats.map((seat) => (
                      <SeatComponent
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedIds.has(seat.id)}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back of bus */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-2">
          <span className="text-[11px] text-gray-400 text-center block font-bold uppercase tracking-wider">Rear</span>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="mt-4 p-3.5 bg-[#E31B23]/5 rounded-xl border border-[#E31B23]/20">
          <p className="text-sm font-bold text-[#E31B23]">
            Selected Seats: {selectedSeats.map((s) => s.seatNumber).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
