import { useState } from 'react';
import { RiUserFill, RiBusFill, RiSubtractLine, RiCheckLine, RiSteering2Fill } from 'react-icons/ri';
import { FaMale, FaFemale } from 'react-icons/fa';
import { type Seat } from '@/lib/api/schedules';
import { useLanguageStore } from '@/lib/store/languageStore';

interface SeatProps {
  seat: Seat;
  displayLabel: string;
  isSelected: boolean;
  onToggle: (seat: Seat) => void;
  isBn?: boolean;
}

function SeatComponent({ seat, displayLabel, isSelected, onToggle, isBn }: SeatProps) {
  const isUnavailable =
    seat.isBooked ||
    seat.isHeld ||
    seat.availability === 'BOOKED' ||
    seat.availability === 'LOCKED' ||
    seat.status === 'BOOKED' ||
    seat.status === 'LOCKED' ||
    (seat.status && seat.status !== 'AVAILABLE' && seat.status !== 'ACTIVE');

  const bookedGender = (seat as any)?.bookedGender || (seat as any)?.gender || null;

  if (seat.seatType === 'DRIVER') {
    return (
      <div className="w-12 h-14 rounded-t-xl rounded-b-md bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500 shadow-2xs">
        <RiSteering2Fill size={20} className="text-[#E31B23]" />
        <span className="text-[9px] font-black uppercase mt-0.5 tracking-wider">{isBn ? 'ড্রাইভার' : 'Driver'}</span>
      </div>
    );
  }

  if (seat.seatType === 'HELPER') {
    return (
      <div className="w-12 h-14 rounded-t-xl rounded-b-md bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500 shadow-2xs">
        <RiUserFill size={18} />
        <span className="text-[9px] font-black uppercase mt-0.5 tracking-wider">{isBn ? 'সহকারী' : 'Helper'}</span>
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
      if (bookedGender === 'MALE') {
        return {
          outer: 'bg-indigo-100/90 border-indigo-400 text-indigo-950 cursor-not-allowed pointer-events-none opacity-90 shadow-2xs',
          headrest: 'bg-indigo-300',
          cushion: 'bg-indigo-200',
          badge: 'text-indigo-950 font-black',
          GenderIcon: FaMale,
          genderClass: 'bg-indigo-600 text-white',
          tooltip: isBn ? 'পুরুষের বুকড (Male Booked)' : 'Male Booked',
        };
      }
      if (bookedGender === 'FEMALE') {
        return {
          outer: 'bg-pink-100/90 border-pink-400 text-pink-950 cursor-not-allowed pointer-events-none opacity-90 shadow-2xs',
          headrest: 'bg-pink-300',
          cushion: 'bg-pink-200',
          badge: 'text-pink-950 font-black',
          GenderIcon: FaFemale,
          genderClass: 'bg-pink-600 text-white',
          tooltip: isBn ? 'মহিলার বুকড (Female Booked)' : 'Female Booked',
        };
      }
      return {
        outer: 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed pointer-events-none opacity-80 shadow-2xs',
        headrest: 'bg-slate-300',
        cushion: 'bg-slate-200',
        badge: 'text-slate-500 font-extrabold',
        GenderIcon: null,
        genderClass: '',
        tooltip: seat.isBooked || seat.isHeld
          ? (isBn ? 'ইতিমধ্যে বুক করা হয়েছে' : 'Already booked')
          : (isBn ? `উপলব্ধ নয় (${seat.status})` : `Not available (${seat.status})`),
      };
    }
    if (isSelected) {
      return {
        outer: 'bg-[#E31B23] border-[#C41920] text-white shadow-md scale-105 transition-all ring-4 ring-[#E31B23]/25 z-10',
        headrest: 'bg-red-950/60',
        cushion: 'bg-red-900/50',
        badge: 'text-white font-black',
        GenderIcon: null,
        genderClass: '',
        tooltip: isBn ? `নির্বাচিত আসন ${displayLabel}` : `Selected Seat ${displayLabel}`,
      };
    }
    // Available seat
    return {
      outer: 'bg-sky-50/90 border-sky-200 text-sky-900 hover:bg-sky-100 hover:border-sky-400 hover:-translate-y-0.5 cursor-pointer shadow-2xs transition-all',
      headrest: 'bg-sky-200/90',
      cushion: 'bg-sky-100',
      badge: 'text-sky-950 font-black',
      GenderIcon: null,
      genderClass: '',
      tooltip: isBn ? `সিট নির্বাচন করুন ${displayLabel}` : `Select Seat ${displayLabel}`,
    };
  };

  const style = getStyles();

  return (
    <div
      onClick={() => !isUnavailable && onToggle(seat)}
      className={`relative w-12 h-14 rounded-t-2xl rounded-b-lg border-2 flex flex-col items-center justify-between p-1 transition-all select-none ${style.outer}`}
      title={style.tooltip}
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

      {/* Gender Indicator Badge (FaMale for Male, FaFemale for Female) */}
      {style.GenderIcon && (
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shadow-xs border border-white ${style.genderClass}`}>
          <style.GenderIcon size={9} />
        </div>
      )}

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
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';
  const [activeDeckTab, setActiveDeckTab] = useState<'LOWER' | 'UPPER'>('LOWER');
  const selectedIds = new Set(selectedSeats.map((s) => s.id));

  // 1. Detect Layout Mode:
  // - 'SLEEPER': Has L/U prefix seats or deck LOWER/UPPER
  // - 'VIP_2X1': Max column is 3, seat labels A1-J3
  // - 'CHAIR_2X2': Standard 2+2 layout (A1-J4)
  const isSleeper = seats.some(
    (s) =>
      (s.seatNumber || '').toUpperCase().startsWith('L') ||
      (s.seatNumber || '').toUpperCase().startsWith('U') ||
      (s as any).deck === 'LOWER' ||
      (s as any).deck === 'UPPER'
  );

  const maxCol = seats.reduce((max, s) => Math.max(max, s.column || 0), 0);
  const isVip2x1 = !isSleeper && (maxCol === 3 || seats.length <= 30);

  // Layout Builders
  const handleToggle = (seat: Seat) => {
    onToggle(seat);
  };

  // --- SLEEPER DOUBLE DECK RENDERING ---
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

  const lowerSeatsList: Seat[] = [];
  const upperSeatsList: Seat[] = [];

  seats.forEach((seat, idx) => {
    const num = (seat.seatNumber || '').toUpperCase();
    if (num.startsWith('L') || (seat as any).deck === 'LOWER') {
      lowerSeatsList.push(seat);
    } else if (num.startsWith('U') || (seat as any).deck === 'UPPER') {
      upperSeatsList.push(seat);
    } else if (idx < 15) {
      lowerSeatsList.push(seat);
    } else {
      upperSeatsList.push(seat);
    }
  });

  const mapSleeperDeckRows = (expectedList: Array<{ label: string; row: number; col: number }>, seatList: Seat[]) => {
    const seatMapByLabel = new Map<string, Seat>();
    seatList.forEach((s) => {
      if (s.seatNumber) seatMapByLabel.set(s.seatNumber.toUpperCase(), s);
    });

    const rowsMap = new Map<number, Array<{ expected: { label: string; row: number; col: number }; seat: Seat }>>();

    expectedList.forEach((exp, idx) => {
      let seat = seatMapByLabel.get(exp.label);
      if (!seat && seatList[idx]) seat = seatList[idx];
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

  const lowerRows = mapSleeperDeckRows(lowerDeckExpected, lowerSeatsList);
  const upperRows = mapSleeperDeckRows(upperDeckExpected, upperSeatsList);

  const lowerSelectedCount = selectedSeats.filter((s) => (s.seatNumber || '').toUpperCase().startsWith('L')).length;
  const upperSelectedCount = selectedSeats.filter((s) => (s.seatNumber || '').toUpperCase().startsWith('U')).length;

  const renderDeckView = (deckTitle: string, rows: typeof lowerRows) => (
    <div className="border-2 border-gray-200 rounded-3xl overflow-hidden bg-white shadow-xs">
      <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-800 font-extrabold">
          <RiBusFill className="text-[#E31B23] text-lg" />
          <span>{deckTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[#E31B23] shadow-2xs">
            <RiSteering2Fill size={18} />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isBn ? 'ড্রাইভার' : 'Driver'}</span>
        </div>
      </div>

      <div className="h-1.5 bg-gradient-to-r from-sky-400/30 via-sky-300/50 to-sky-400/30 border-b border-sky-100" />

      <div className="px-4 py-6 sm:px-6 bg-slate-50/50 space-y-3.5">
        {rows.map(([rowNum, items]) => {
          const leftCol = items.find((i) => i.expected.col === 1);
          const rightCols = items.filter((i) => i.expected.col === 2 || i.expected.col === 3);

          return (
            <div key={rowNum} className="flex items-center justify-center gap-2 sm:gap-3 max-w-[250px] mx-auto">
              <div className="w-10 sm:w-11 flex justify-center shrink-0">
                {leftCol ? (
                  <SeatComponent
                    seat={leftCol.seat}
                    displayLabel={leftCol.expected.label}
                    isSelected={selectedIds.has(leftCol.seat.id)}
                    onToggle={handleToggle}
                    isBn={isBn}
                  />
                ) : (
                  <div className="w-10 sm:w-11 h-14" />
                )}
              </div>

              <div className="flex-1 flex items-center justify-center min-w-[24px]">
                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest select-none">
                  {isBn ? 'গলি' : 'Aisle'}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {rightCols.map((item) => (
                  <SeatComponent
                    key={item.expected.label}
                    seat={item.seat}
                    displayLabel={item.expected.label}
                    isSelected={selectedIds.has(item.seat.id)}
                    onToggle={handleToggle}
                    isBn={isBn}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // --- CHAIR COACH (2+2 OR 2+1) RENDERING ---
  const renderChairCoachView = () => {
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    const cols = isVip2x1 ? 3 : 4;
    const totalRowsCount = Math.max(
      1,
      seats.length > 0 ? Math.ceil(seats.length / cols) : 10
    );
    const seatMapByLabel = new Map<string, Seat>();
    seats.forEach((s) => {
      if (s.seatNumber) seatMapByLabel.set(s.seatNumber.toUpperCase(), s);
    });

    const rowsArray: Array<{ letter: string; rowNum: number; leftSeats: Seat[]; rightSeats: Seat[] }> = [];

    for (let r = 0; r < totalRowsCount; r++) {
      const letter = rowLetters[r] || `R${r + 1}`;
      const leftSeats: Seat[] = [];
      const rightSeats: Seat[] = [];

      if (isVip2x1) {
        // 2+1 Layout: Col 1 on Left | Col 2 & 3 on Right
        const col1Label = `${letter}1`;
        const col2Label = `${letter}2`;
        const col3Label = `${letter}3`;

        const s1 = seatMapByLabel.get(col1Label) || ({ id: `v-${col1Label}`, seatNumber: col1Label } as Seat);
        const s2 = seatMapByLabel.get(col2Label) || ({ id: `v-${col2Label}`, seatNumber: col2Label } as Seat);
        const s3 = seatMapByLabel.get(col3Label) || ({ id: `v-${col3Label}`, seatNumber: col3Label } as Seat);

        leftSeats.push(s1);
        rightSeats.push(s2, s3);
      } else {
        // 2+2 Layout: Col 1 & 2 on Left | Col 3 & 4 on Right
        const col1Label = `${letter}1`;
        const col2Label = `${letter}2`;
        const col3Label = `${letter}3`;
        const col4Label = `${letter}4`;

        const s1 = seatMapByLabel.get(col1Label) || ({ id: `v-${col1Label}`, seatNumber: col1Label } as Seat);
        const s2 = seatMapByLabel.get(col2Label) || ({ id: `v-${col2Label}`, seatNumber: col2Label } as Seat);
        const s3 = seatMapByLabel.get(col3Label) || ({ id: `v-${col3Label}`, seatNumber: col3Label } as Seat);
        const s4 = seatMapByLabel.get(col4Label) || ({ id: `v-${col4Label}`, seatNumber: col4Label } as Seat);

        leftSeats.push(s1, s2);
        rightSeats.push(s3, s4);
      }

      rowsArray.push({ letter, rowNum: r + 1, leftSeats, rightSeats });
    }

    return (
      <div className="border-2 border-gray-200 rounded-3xl overflow-hidden bg-white shadow-xs max-w-md mx-auto">
        {/* Front Header */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-800 font-extrabold">
            <RiBusFill className="text-[#E31B23] text-xl" />
            <span>
              {isVip2x1
                ? (isBn ? `${seats.length || 30}-সিট ২+১ বিজনেস ভিআইপি কোচ` : `${seats.length || 30}-Seat 2+1 Business Class VIP`)
                : (isBn ? `${seats.length || 40}-সিট ২+২ স্ট্যান্ডার্ড চেয়ার কোচ` : `${seats.length || 40}-Seat 2+2 Standard Chair Coach`)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[#E31B23] shadow-2xs">
              <RiSteering2Fill size={18} />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isBn ? 'ড্রাইভার' : 'Driver'}</span>
          </div>
        </div>

        <div className="h-1.5 bg-gradient-to-r from-sky-400/30 via-sky-300/50 to-sky-400/30 border-b border-sky-100" />

        {/* Seat Rows Grid */}
        <div className="px-4 py-6 sm:px-6 bg-slate-50/50 space-y-3">
          {rowsArray.map((row) => (
            <div key={row.letter} className="flex items-center justify-center gap-3">
              {/* Left Side Seats */}
              <div className="flex items-center gap-2">
                {row.leftSeats.map((s) => (
                  <SeatComponent
                    key={s.seatNumber}
                    seat={s}
                    displayLabel={s.seatNumber}
                    isSelected={selectedIds.has(s.id)}
                    onToggle={handleToggle}
                    isBn={isBn}
                  />
                ))}
              </div>

              {/* Aisle */}
              <div className="w-8 text-center">
                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest select-none">
                  {isBn ? 'গলি' : 'Aisle'}
                </span>
              </div>

              {/* Right Side Seats */}
              <div className="flex items-center gap-2">
                {row.rightSeats.map((s) => (
                  <SeatComponent
                    key={s.seatNumber}
                    seat={s}
                    displayLabel={s.seatNumber}
                    isSelected={selectedIds.has(s.id)}
                    onToggle={handleToggle}
                    isBn={isBn}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Seat Color Indicator / Legend */}
      <div className="bg-white p-2.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2.5 text-center sm:text-left">
          {isBn ? 'আসন নির্দেশিকা (Seat Indicator)' : 'Seat Legend'}
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-6 text-[10px] sm:text-xs font-semibold text-gray-700 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="w-4 sm:w-5 h-5 sm:h-6 rounded-t-md rounded-b-xs bg-sky-50 border border-sky-300 flex items-center justify-center shadow-2xs">
              <div className="w-2 sm:w-2.5 h-1 rounded-full bg-sky-200" />
            </div>
            <span className="whitespace-nowrap">{isBn ? 'খালি' : 'Available'}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="relative w-4 sm:w-5 h-5 sm:h-6 rounded-t-md rounded-b-xs bg-indigo-100 border border-indigo-400 flex items-center justify-center shadow-2xs">
              <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <FaMale size={9} />
              </div>
            </div>
            <span className="whitespace-nowrap">{isBn ? 'পুরুষ' : 'Male'}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="relative w-4 sm:w-5 h-5 sm:h-6 rounded-t-md rounded-b-xs bg-pink-100 border border-pink-400 flex items-center justify-center shadow-2xs">
              <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-pink-600 text-white flex items-center justify-center">
                <FaFemale size={9} />
              </div>
            </div>
            <span className="whitespace-nowrap">{isBn ? 'মহিলা' : 'Female'}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="w-4 sm:w-5 h-5 sm:h-6 rounded-t-md rounded-b-xs bg-slate-100 border border-slate-300 flex items-center justify-center text-[8px] sm:text-[9px] font-black text-slate-500 shadow-2xs">
              ✕
            </div>
            <span className="whitespace-nowrap">{isBn ? 'বুকড' : 'Booked'}</span>
          </div>
        </div>
      </div>

      {/* Main Seat Map Content */}
      {isSleeper ? (
        <>
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
              <span>{isBn ? 'লোয়ার ডেক' : 'Lower Deck'}</span>
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
              <span>{isBn ? 'আপার ডেক' : 'Upper Deck'}</span>
              {upperSelectedCount > 0 && (
                <span className="px-2 py-0.5 bg-[#E31B23] text-white text-[10px] rounded-full">
                  {upperSelectedCount}
                </span>
              )}
            </button>
          </div>

          <div className="lg:hidden">
            {activeDeckTab === 'LOWER'
              ? renderDeckView(isBn ? 'লোয়ার ডেক (১৫টি সিট)' : 'Lower Deck (15 Seats)', lowerRows)
              : renderDeckView(isBn ? 'আপার ডেক (১৫টি সিট)' : 'Upper Deck (15 Seats)', upperRows)}
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-6">
            {renderDeckView(isBn ? 'লোয়ার ডেক (১৫টি সিট)' : 'Lower Deck (15 Seats)', lowerRows)}
            {renderDeckView(isBn ? 'আপার ডেক (১৫টি সিট)' : 'Upper Deck (15 Seats)', upperRows)}
          </div>
        </>
      ) : (
        renderChairCoachView()
      )}

      {/* Selection Summary Bar */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-[#E31B23]/5 rounded-2xl border-2 border-[#E31B23]/20 flex items-center justify-between animate-fade-in-up max-w-md mx-auto">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">
              {isBn ? 'নির্বাচিত সিট' : 'Selected Seats'}
            </span>
            <p className="text-base font-black text-[#E31B23] mt-0.5">
              {selectedSeats.map((s) => s.seatNumber).join(', ')}
            </p>
          </div>
          <span className="text-xs font-black text-gray-800 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
            {isBn ? `${selectedSeats.length}টি সিট নির্বাচিত` : `${selectedSeats.length} seat(s) selected`}
          </span>
        </div>
      )}
    </div>
  );
}
