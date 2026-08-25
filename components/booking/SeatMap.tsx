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
    seat.isBooked ||
    seat.isHeld ||
    seat.availability === 'BOOKED' ||
    seat.availability === 'LOCKED' ||
    seat.status === 'BOOKED' ||
    seat.status === 'LOCKED' ||
    (seat.status && seat.status !== 'AVAILABLE' && seat.status !== 'ACTIVE');

  if (seat.seatType === 'DRIVER') {
    return (
      <div className="w-10 h-12 rounded-t-xl rounded-b-md bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500 shadow-xs">
        <RiCarFill size={16} />
        <span className="text-[8px] font-bold uppercase mt-0.5">Driver</span>
      </div>
    );
  }

  if (seat.seatType === 'HELPER') {
    return (
      <div className="w-10 h-12 rounded-t-xl rounded-b-md bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500 shadow-xs">
        <RiUserFill size={16} />
        <span className="text-[8px] font-bold uppercase mt-0.5">Helper</span>
      </div>
    );
  }

  if (seat.seatType === 'BLOCKED') {
    return (
      <div className="w-10 h-12 rounded-t-xl rounded-b-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300">
        <RiSubtractLine size={14} />
      </div>
    );
  }

  // Realistic seat styles (Headrest + Backrest + Bottom Cushion)
  const getStyles = () => {
    if (isUnavailable) {
      return {
        outer: 'bg-slate-200/90 border-slate-300 text-slate-500 cursor-not-allowed pointer-events-none opacity-90 shadow-2xs',
        headrest: 'bg-slate-400/80',
        cushion: 'bg-slate-300',
        badge: 'text-slate-600 font-extrabold',
      };
    }
    if (isSelected) {
      return {
        outer: 'bg-[#E31B23] border-[#C41920] text-white shadow-md scale-105 transition-all ring-2 ring-[#E31B23]/30',
        headrest: 'bg-red-900/60',
        cushion: 'bg-red-800/50',
        badge: 'text-white font-black',
      };
    }
    // Available regular seat
    return {
      outer: 'bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100 hover:border-sky-300 hover:-translate-y-0.5 cursor-pointer shadow-xs',
      headrest: 'bg-sky-200/80',
      cushion: 'bg-sky-100',
      badge: 'text-sky-950 font-bold',
    };
  };

  const style = getStyles();

  return (
    <div
      onClick={() => !isUnavailable && onToggle(seat)}
      className={`relative w-10 h-12 rounded-t-xl rounded-b-md border flex flex-col items-center justify-between p-1 transition-all select-none ${style.outer}`}
      title={
        isUnavailable
          ? seat.isBooked || seat.isHeld
            ? 'Already booked'
            : `Not available (${seat.status})`
          : `Seat ${seat.seatNumber}`
      }
      role="button"
      tabIndex={isUnavailable ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && !isUnavailable && onToggle(seat)}
    >
      {/* Top Headrest Cushion */}
      <div className={`w-7 h-1.5 rounded-full ${style.headrest}`} />

      {/* Seat Number */}
      <span className={`text-[11px] leading-none ${style.badge}`}>
        {seat.seatNumber}
      </span>

      {/* Bottom Seat Cushion */}
      <div className={`w-8 h-2 rounded-xs ${style.cushion}`} />
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

  // Helper to parse row letter and column index (e.g., "A1" -> Row A, Col 1)
  const parseSeatPos = (s: Seat) => {
    const match = s.seatNumber?.match(/^([A-Z]+)(\d+)$/i);
    if (match) {
      return {
        rowKey: match[1].toUpperCase(),
        colNum: parseInt(match[2], 10),
      };
    }
    const rowNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const rIdx = Math.max(0, (s.row ?? 1) - 1);
    return {
      rowKey: rowNames[rIdx] || `R${s.row || 1}`,
      colNum: s.column ?? 1,
    };
  };

  // Group seats by row key (A, B, C, D, E, F, G, H, I, J)
  const rowMap = new Map<string, Seat[]>();
  seats.forEach((seat) => {
    const { rowKey } = parseSeatPos(seat);
    if (!rowMap.has(rowKey)) rowMap.set(rowKey, []);
    rowMap.get(rowKey)!.push(seat);
  });

  const rows = Array.from(rowMap.entries()).sort(([a], [b]) => a.localeCompare(b));

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
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-5 h-6 rounded-t-lg rounded-b-xs bg-sky-50 border border-sky-200 flex flex-col justify-between items-center p-0.5">
            <div className="w-3.5 h-1 rounded-full bg-sky-200" />
            <div className="w-4 h-1 rounded-xs bg-sky-100" />
          </div>
          <span className="text-gray-700 font-bold">Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-6 rounded-t-lg rounded-b-xs bg-[#E31B23] border border-[#C41920] flex flex-col justify-between items-center p-0.5">
            <div className="w-3.5 h-1 rounded-full bg-red-900/60" />
            <div className="w-4 h-1 rounded-xs bg-red-800/50" />
          </div>
          <span className="text-gray-700 font-bold">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-6 rounded-t-lg rounded-b-xs bg-gray-100 border border-gray-200 flex flex-col justify-between items-center p-0.5">
            <div className="w-3.5 h-1 rounded-full bg-gray-300" />
            <div className="w-4 h-1 rounded-xs bg-gray-200" />
          </div>
          <span className="text-gray-700 font-bold">Booked</span>
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
          <div className="space-y-3.5 min-w-max mx-auto" style={{ width: 'fit-content' }}>
            {rows.map(([rowKey, rowSeats]) => {
              const sorted = [...rowSeats].sort((a, b) => parseSeatPos(a).colNum - parseSeatPos(b).colNum);
              const leftSeats = sorted.filter((s) => parseSeatPos(s).colNum <= 2);
              const rightSeats = sorted.filter((s) => parseSeatPos(s).colNum > 2);

              return (
                <div key={rowKey} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-5 shrink-0 text-right font-mono font-bold">{rowKey}</span>
                  {/* Left seats (A1, A2) */}
                  <div className="flex gap-2.5">
                    {leftSeats.map((seat) => (
                      <SeatComponent
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedIds.has(seat.id)}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>

                  {/* Center Aisle */}
                  <div className="w-7 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest px-1">
                    Aisle
                  </div>

                  {/* Right seats (A3, A4) */}
                  <div className="flex gap-2.5">
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
        <div className="mt-4 p-3.5 bg-[#E31B23]/5 rounded-xl border border-[#E31B23]/20 flex items-center justify-between">
          <p className="text-sm font-bold text-[#E31B23]">
            Selected Seats: {selectedSeats.map((s) => s.seatNumber).join(', ')}
          </p>
          <span className="text-xs font-bold text-gray-600 bg-white px-2.5 py-1 rounded-md border border-gray-200">
            {selectedSeats.length} / {maxSeats} max
          </span>
        </div>
      )}
    </div>
  );
}
