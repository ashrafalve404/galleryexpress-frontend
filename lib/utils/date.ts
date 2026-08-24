import { format, parseISO, differenceInMinutes, addMinutes, isToday, isTomorrow, isYesterday } from 'date-fns';

export function formatDate(date: string | Date | undefined | null, pattern = 'dd MMM yyyy'): string {
  if (!date) return '--';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(d.getTime())) return typeof date === 'string' ? date : '--';
    return format(d, pattern);
  } catch {
    return typeof date === 'string' ? date : '--';
  }
}

export function formatTime(date: string | Date | undefined | null): string {
  if (!date) return '--:--';
  if (typeof date === 'string') {
    const str = date.trim();
    // Handle HH:mm format e.g. "07:30", "22:45"
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
      const [hStr, mStr] = str.split(':');
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (isNaN(h) || isNaN(m)) return str;
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    try {
      const d = parseISO(str);
      if (isNaN(d.getTime())) return str;
      return format(d, 'hh:mm a');
    } catch {
      return str;
    }
  }

  try {
    if (isNaN((date as Date).getTime())) return '--:--';
    return format(date, 'hh:mm a');
  } catch {
    return '--:--';
  }
}

export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '--';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(d.getTime())) return typeof date === 'string' ? date : '--';
    return format(d, 'dd MMM yyyy, hh:mm a');
  } catch {
    return typeof date === 'string' ? date : '--';
  }
}

export function formatDuration(minutes: number): string {
  if (isNaN(minutes) || minutes < 0) return '--';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getDuration(departure: string | Date, arrival: string | Date): string {
  try {
    const d = typeof departure === 'string' ? (departure.includes(':') && !departure.includes('T') ? new Date(`1970-01-01T${departure}:00`) : parseISO(departure)) : departure;
    const a = typeof arrival === 'string' ? (arrival.includes(':') && !arrival.includes('T') ? new Date(`1970-01-01T${arrival}:00`) : parseISO(arrival)) : arrival;
    const minutes = differenceInMinutes(a, d);
    if (isNaN(minutes) || minutes < 0) return '6h 00m';
    return formatDuration(minutes);
  } catch {
    return '6h 00m';
  }
}

export function getDurationMinutes(departure: string | Date, arrival: string | Date): number {
  try {
    const d = typeof departure === 'string' ? parseISO(departure) : departure;
    const a = typeof arrival === 'string' ? parseISO(arrival) : arrival;
    const minutes = differenceInMinutes(a, d);
    return isNaN(minutes) ? 0 : minutes;
  } catch {
    return 0;
  }
}

export function getRelativeDate(date: string | Date | undefined | null): string {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(d.getTime())) return String(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    if (isYesterday(d)) return 'Yesterday';
    return formatDate(d, 'EEE, dd MMM');
  } catch {
    return String(date);
  }
}

export function toInputDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function today(): string {
  return toInputDate(new Date());
}

export function tomorrow(): string {
  return toInputDate(addMinutes(new Date(), 24 * 60));
}

export function isValidDate(dateStr: string): boolean {
  try {
    const d = parseISO(dateStr);
    return !isNaN(d.getTime());
  } catch {
    return false;
  }
}
