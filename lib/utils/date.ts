import { format, parseISO, differenceInMinutes, addMinutes, isToday, isTomorrow, isYesterday } from 'date-fns';

export function formatDate(date: string | Date, pattern = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'hh:mm a');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy, hh:mm a');
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getDuration(departure: string | Date, arrival: string | Date): string {
  const d = typeof departure === 'string' ? parseISO(departure) : departure;
  const a = typeof arrival === 'string' ? parseISO(arrival) : arrival;
  const minutes = differenceInMinutes(a, d);
  return formatDuration(minutes);
}

export function getDurationMinutes(departure: string | Date, arrival: string | Date): number {
  const d = typeof departure === 'string' ? parseISO(departure) : departure;
  const a = typeof arrival === 'string' ? parseISO(arrival) : arrival;
  return differenceInMinutes(a, d);
}

export function getRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  return formatDate(d, 'EEE, dd MMM');
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
