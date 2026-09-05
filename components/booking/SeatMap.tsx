'use client';

import { useState } from 'react';
import { RiUserFill, RiBusFill, RiSubtractLine, RiCheckLine, RiSteering2Fill } from 'react-icons/ri';
import { type Seat } from '@/lib/api/schedules';

interface SeatProps {
  seat: Seat;
  displayLabel: string;
  isSelected: boolean;
  onToggle: (seat: Seat) => void;
}

function SeatComponent({ seat, displayLabel, isSelected, onToggle }: SeatProps) {
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
      <div className="w-12 h-14 rounded-t-xl rounded-b-md bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500 shadow-2xs">
        <RiSteering2Fill size={20} className="text-[#E31B23]" />
        <span className="text-[9px] font-black uppercase mt-0.5 tracking-wider">Driver</span>
      </div>
    );
  }

  if (seat.seatType === 'HELPER') {
    return (
      <div className="w-12 h-14 rounded-t-xl rounded-b-md bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500 shadow-2xs">
        <RiUserFill size={18} />
        <span className="text-[9px] font-black uppercase mt-0.5 tracking-wider">Helper</span>
      </div>
    );
  }

  if (seat.seatType === 'BLOCKED') {
    return (
      <div className="w-12 h-14 rounded-t-xl rounded-b-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300">
        <RiSubtractLine size={16} />
      </div>
    );
  }

  // Realistic Bus Seat Style (Headrest + Contoured Seat Backrest + Bottom Cushion)
  const getStyles = () => {
    if (isUnavailable) {
      return {
        outer: 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed pointer-events-none opacity-80 shadow-2xs',
        headrest: 'bg-slate-300',
        cushion: 'bg-slate-200',
        badge: 'text-slate-500 font-extrabold',
      };
    }
    if (isSelected) {
      return {
        outer: 'bg-[#E31B23] border-[#C41920] text-white shadow-md scale-105 transition-all ring-4 ring-[#E31B23]/25 z-10',
        headrest: 'bg-red-950/60',
        cushion: 'bg-red-900/50',
        badge: 'text-white font-black',
      };
    }
    // Available seat
    return {
      outer: 'bg-sky-50/90 border-sky-200 text-sky-900 hover:bg-sky-100 hover:border-sky-400 hover:-translate-y-0.5 cursor-pointer shadow-2xs transition-all',
      headrest: 'bg-sky-200/90',
      cushion: 'bg-sky-100',
      badge: 'text-sky-950 font-black',
    };
  };

  const style = getStyles();

  return (
    <div
      onClick={() => !isUnavailable && onToggle(seat)}
      className={`relative w-12 h-14 rounded-t-2xl rounded-b-lg border-2 flex flex-col items-center justify-between p-1 transition-all select-none ${style.outer}`}
      title={
        isUnavailable
          ? seat.isBooked || seat.isHeld
            ? 'Already booked'
            : `Not available (${seat.status})`
          : `Select Seat ${displayLabel}`
      }
      role="button"
      tabIndex={isUnavailable ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && !isUnavailable && onToggle(seat)}
    >
      {/* Top Headrest Cushion */}
      <div className={`w-8 h-2 rounded-full ${style.headrest}`} />

      {/* Seat Label */}
      <span className={`text-[12px] leading-tight ${style.badge}`}>
        {displayLabel}
      </span>

      {/* Bottom Seat Cushion */}
      <div className={`w-9 h-2.5 rounded-sm ${style.cushion}`} />

      {/* Selected Check Mark Indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#E31B23] flex items-center justify-center shadow-xs border border-[#C41920]">
          <RiCheckLine size={12} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onToggle: (seat: Seat) => void;
  maxSeats?: number;
}

export function SeatMap({ seats, selectedSeats, onToggle, maxSeats = 40 }: SeatMapProps) {
  const [activeDeckTab, setActiveDeckTab] = useState<'LOWER' | 'UPPER'>('LOWER');
  const selectedIds = new Set(selectedSeats.map((s) => s.id));

  // Expected 15 seat layouts for Lower (L1-L15) & Upper (U1-U15)
  const lowerDeckExpected = [
    { label: 'L1', row: 1, col: 1 }, { label: 'L2', row: 1, col: 2 }, { label: 'L3', row: 1, col: 3 },
    { label: 'L4', row: 2, col: 1 }, { label: 'L5', row: 2, col: 2 }, { label: 'L6', row: 2, col: 3 },
    { label: 'L7', row: 3, col: 1 }, { label: 'L8', row: 3, col: 2 }, { label: 'L9', row: 3, col: 3 },
    { label: 'L10', row: 4, col: 1 }, { label: 'L11', row: 4, col: 2 }, { label: 'L12', row: 4, col: 3 },
    { label: 'L13', row: 5, col: 1 }, { label: 'L14', row: 5, col: 2 }, { label: 'L15', row: 5, col: 3 },
  ];

  const upperDeckExpected = [
    { label: 'U1', row: 1, col: 1 }, { label: 'U2', row: 1, col: 2 }, { label: 'U3', row: 1, col: 3 },
    { label: 'U4', row: 2, col: 1 }, { label: 'U5', row: 2, col: 2 }, { label: 'U6', row: 2, col: 3 },
    { label: 'U7', row: 3, col: 1 }, { label: 'U8', row: 3, col: 2 }, { label: 'U9', row: 3, col: 3 },
    { label: 'U10', row: 4, col: 1 }, { label: 'U11', row: 4, col: 2 }, { label: 'U12', row: 4, col: 3 },
    { label: 'U13', row: 5, col: 1 }, { label: 'U14', row: 5, col: 2 }, { label: 'U15', row: 5, col: 3 },
  ];

  // Separate seats into Lower & Upper deck arrays
  const lowerSeatsList: Seat[] = [];
  const upperSeatsList: Seat[] = [];

  seats.forEach((seat, idx) => {
    const num = (seat.seatNumber || '').toUpperCase();
    if (num.startsWith('L') || (seat as any).deck === 'LOWER') {
      lowerSeatsList.push(seat);
    } else if (num.startsWith('U') || (seat as any).deck === 'UPPER') {
      upperSeatsList.push(seat);
    } else {
      // Fallback: assign first 15 to lower deck, next 15 to upper deck
      if (idx < 15) {
        lowerSeatsList.push(seat);
      } else {
        upperSeatsList.push(seat);
      }
    }
  });

  // Map each deck array into 4 rows of 1+2 (Col 1: Left, Col 2&3: Right)
  const mapDeckRows = (expectedList: Array<{ label: string; row: number; col: number }>, seatList: Seat[]) => {
    const seatMapByLabel = new Map<string, Seat>();
    seatList.forEach((s) => {
      if (s.seatNumber) seatMapByLabel.set(s.seatNumber.toUpperCase(), s);
    });

    const rowsMap = new Map<number, Array<{ expected: { label: string; row: number; col: number }; seat: Seat }>>();

    expectedList.forEach((exp, idx) => {
      let seat = seatMapByLabel.get(exp.label);
      if (!seat && seatList[idx]) {
        seat = seatList[idx];
      }
      // Create fallback dummy seat object if missing
      if (!seat) {
        seat = {
          id: `virtual-${exp.label}`,
          coachId: '',
          seatNumber: exp.label,
          row: exp.row,
          column: exp.col,
          seatType: 'REGULAR' as any,
          status: 'AVAILABLE' as any,
        } as unknown as Seat;
      }

      if (!rowsMap.has(exp.row)) rowsMap.set(exp.row, []);
      rowsMap.get(exp.row)!.push({ expected: exp, seat });
    });

    return Array.from(rowsMap.entries()).sort(([r1], [r2]) => r1 - r2);
  };

  const lowerRows = mapDeckRows(lowerDeckExpected, lowerSeatsList);
  const upperRows = mapDeckRows(upperDeckExpected, upperSeatsList);

  const handleToggle = (seat: Seat) => {
    onToggle(seat);
  };

  const lowerSelectedCount = selectedSeats.filter((s) => (s.seatNumber || '').toUpperCase().startsWith('L')).length;
  const upperSelectedCount = selectedSeats.filter((s) => (s.seatNumber || '').toUpperCase().startsWith('U')).length;

  const renderSingleDeckView = (deckTitle: string, rows: typeof lowerRows) => (
    <div className="border-2 border-gray-200 rounded-3xl overflow-hidden bg-white shadow-xs">
      {/* Bus Front Header & Driver Cabin */}
      <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-800 font-extrabold">
          <RiBusFill className="text-[#E31B23] text-lg" />
          <span>{deckTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[#E31B23] shadow-2xs">
            <RiSteering2Fill size={18} />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Driver</span>
        </div>
      </div>

      {/* Windshield Glass Accent */}
      <div className="h-1.5 bg-gradient-to-r from-sky-400/30 via-sky-300/50 to-sky-400/30 border-b border-sky-100" />

      {/* 1+2 Seat Matrix Grid */}
      <div className="px-4 py-6 sm:px-6 bg-slate-50/50 space-y-3.5">
        {rows.map(([rowNum, items]) => {
          const leftCol = items.find((i) => i.expected.col === 1);
          const rightCols = items.filter((i) => i.expected.col === 2 || i.expected.col === 3);

          return (
            <div key={rowNum} className="flex items-center justify-center gap-2 sm:gap-3 max-w-[250px] mx-auto">
              {/* Left Column (Single Seat) */}
              <div className="w-10 sm:w-11 flex justify-center shrink-0">
                {leftCol ? (
                  <SeatComponent
                    seat={leftCol.seat}
                    displayLabel={leftCol.expected.label}
                    isSelected={selectedIds.has(leftCol.seat.id)}
                    onToggle={handleToggle}
                  />
                ) : (
                  <div className="w-10 sm:w-11 h-14" />
                )}
              </div>

              {/* Center Aisle Space */}
              <div className="flex-1 flex items-center justify-center min-w-[24px]">
                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest select-none">
                  Aisle
                </span>
              </div>

              {/* Right Column (Double Seats) */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {rightCols.map((item) => (
                  <SeatComponent
                    key={item.expected.label}
                    seat={item.seat}
                    displayLabel={item.expected.label}
                    isSelected={selectedIds.has(item.seat.id)}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Mobile Deck Tabs Header */}
      <div className="lg:hidden flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200/80">
        <button
          type="button"
          onClick={() => setActiveDeckTab('LOWER')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeDeckTab === 'LOWER'
              ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Lower Deck</span>
          {lowerSelectedCount > 0 && (
            <span className="px-2 py-0.5 bg-[#E31B23] text-white text-[10px] rounded-full">
              {lowerSelectedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveDeckTab('UPPER')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeDeckTab === 'UPPER'
              ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Upper Deck</span>
          {upperSelectedCount > 0 && (
            <span className="px-2 py-0.5 bg-[#E31B23] text-white text-[10px] rounded-full">
              {upperSelectedCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Single Active Deck Display */}
      <div className="lg:hidden">
        {activeDeckTab === 'LOWER'
          ? renderSingleDeckView('Lower Deck (15 Seats)', lowerRows)
          : renderSingleDeckView('Upper Deck (15 Seats)', upperRows)}
      </div>

      {/* Desktop Side-by-Side Deck View */}
      <div className="hidden lg:grid grid-cols-2 gap-6">
        {renderSingleDeckView('Lower Deck (15 Seats)', lowerRows)}
        {renderSingleDeckView('Upper Deck (15 Seats)', upperRows)}
      </div>

      {/* Selection Summary Bar */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-[#E31B23]/5 rounded-2xl border-2 border-[#E31B23]/20 flex items-center justify-between animate-fade-in-up">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Selected Seats</span>
            <p className="text-base font-black text-[#E31B23] mt-0.5">
              {selectedSeats.map((s) => s.seatNumber).join(', ')}
            </p>
          </div>
          <span className="text-xs font-black text-gray-800 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
            {selectedSeats.length} seat(s) selected
          </span>
        </div>
      )}
    </div>
  );
}
