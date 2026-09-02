export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || '00000000-0000-4000-a000-000000000001';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  BOOKING: (scheduleId: string) => `/booking/${scheduleId}`,
  CHECKOUT_PASSENGER: '/checkout/passenger',
  CHECKOUT_PAYMENT: '/checkout/payment',
  CHECKOUT_CONFIRMATION: '/checkout/confirmation',
  TICKET: (ticketNumber: string) => `/ticket/${ticketNumber}`,
  MY_BOOKING: '/my-booking',
  DASHBOARD: '/dashboard',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  CANCELLATION_POLICY: '/cancellation-policy',
  // Admin
  ADMIN: '/admin',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_COACHES: '/admin/coaches',
  ADMIN_ROUTES: '/admin/routes',
  ADMIN_SCHEDULES: '/admin/schedules',
  ADMIN_FARES: '/admin/fares',
  ADMIN_DISCOUNTS: '/admin/discounts',
  ADMIN_COUNTERS: '/admin/counters',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_CMS: '/admin/cms',
  ADMIN_SLIDERS: '/admin/sliders',
  ADMIN_OFFERS: '/admin/offers',
  ADMIN_TICKETS: '/admin/tickets',
  ADMIN_MESSAGES: '/admin/messages',
} as const;

export const SEAT_TYPE_LABELS: Record<string, string> = {
  REGULAR: 'Regular',
  VIP: 'VIP',
  LADIES: 'Ladies',
  DISABLED: 'Disabled',
  DRIVER: 'Driver',
  HELPER: 'Helper',
  BLOCKED: 'Blocked',
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  HELD: 'Held',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  FAILED: 'Failed',
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  HELD: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
  EXPIRED: 'bg-gray-100 text-gray-700',
  FAILED: 'bg-red-100 text-red-800',
};

export function getOriginDisplayName(
  origin: string | undefined,
  counter: { name?: string; location?: string } | null | undefined
): string {
  const baseOrigin = origin || 'Dhaka';
  if (!counter?.name) return baseOrigin;

  const cName = counter.name.trim();
  if (cName.toLowerCase().startsWith(baseOrigin.toLowerCase())) {
    return cName;
  }
  return `${baseOrigin} (${cName})`;
}

export const PAYMENT_PROVIDERS = [
  { id: 'BKASH', name: 'bKash', iconName: 'Smartphone', description: 'Pay via bKash mobile banking' },
  { id: 'NAGAD', name: 'Nagad', iconName: 'Wallet', description: 'Pay via Nagad digital wallet' },
  { id: 'SSLCOMMERZ', name: 'Card / Banking', iconName: 'CreditCard', description: 'Visa, Mastercard, Amex' },
  { id: 'MANUAL', name: 'Counter Payment', iconName: 'Building2', description: 'Pay at physical counter' },
] as const;

export const AMENITIES = [
  { id: 'AC', label: 'AC', iconName: 'Wind' },
  { id: 'RECLINING', label: 'Reclining Seats', iconName: 'Armchair' },
  { id: 'ENTERTAINMENT', label: 'Entertainment', iconName: 'Tv' },
  { id: 'CHARGING', label: 'Charging Point', iconName: 'Zap' },
  { id: 'WATER', label: 'Water Bottle', iconName: 'Droplet' },
  { id: 'WIFI', label: 'Free Wi-Fi', iconName: 'Wifi' },
] as const;
