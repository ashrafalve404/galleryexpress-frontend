import client, { withCompany } from './client';

export interface SearchScheduleParams {
  from: string;
  to: string;
  date: string;
  journeyType?: 'ONE_WAY' | 'ROUND_TRIP';
}

export interface RouteStop {
  id: string;
  name: string;
  distanceFromOriginKm: number;
  arrivalOffset: number;
}

export interface Schedule {
  id: string;
  departureTime: string;
  arrivalTime: string;
  coach: {
    id: string;
    name: string;
    registrationNo?: string;
    registrationNumber?: string;
    coachType?: string | { name?: string };
    totalSeats?: number;
    amenities?: string[];
    _count?: { seats?: number };
  };
  route: {
    id: string;
    name?: string;
    origin: string;
    destination: string;
    distanceKm?: number;
    estimatedDurationMin?: number;
    stops?: RouteStop[];
  };
  fare?: {
    basePrice: number;
    currency?: string;
  };
  availableSeats?: number;
  status: string;
  _count?: { bookings?: number };
}

export interface Seat {
  id: string;
  seatNumber: string;
  seatType: 'REGULAR' | 'VIP' | 'LADIES' | 'DISABLED' | 'DRIVER' | 'HELPER' | 'BLOCKED';
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';
  isBooked: boolean;
  isHeld: boolean;
  price: number;
  row: number;
  column: number;
}

export async function searchSchedules(params: SearchScheduleParams): Promise<Schedule[]> {
  try {
    const { data } = await client.get('/api/v1/schedules/search', {
      params: withCompany({
        origin: params.from,
        destination: params.to,
        from: params.from,
        to: params.to,
        date: params.date,
      }),
    });
    return data?.data || (Array.isArray(data) ? data : []);
  } catch (error) {
    console.warn('No schedules found or search parameter error:', error);
    return [];
  }
}

export async function getSchedule(id: string): Promise<Schedule> {
  const { data } = await client.get(`/api/v1/schedules/${id}`, {
    params: withCompany(),
  });
  return data?.data || data;
}

export async function getScheduleSeats(scheduleId: string): Promise<Seat[]> {
  const { data } = await client.get(`/api/v1/schedules/${scheduleId}/seats`, {
    params: withCompany(),
  });
  return data?.data || data || [];
}

// Admin
export async function adminGetSchedules(query?: Record<string, unknown>) {
  const { data } = await client.get('/api/v1/admin/schedules', { params: query });
  return data;
}

export async function adminCreateSchedule(dto: Record<string, unknown>) {
  const { data } = await client.post('/api/v1/admin/schedules', dto);
  return data;
}

export async function adminUpdateSchedule(id: string, dto: Record<string, unknown>) {
  const { data } = await client.patch(`/api/v1/admin/schedules/${id}`, dto);
  return data;
}

export async function adminCancelSchedule(id: string) {
  const { data } = await client.delete(`/api/v1/admin/schedules/${id}`);
  return data;
}
