import client from './client';

export interface PassengerInfo {
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  nid?: string;
  age?: number;
}

export interface CreateBookingDto {
  scheduleId: string;
  seatIds: string[];
  passengers: PassengerInfo[];
  boardingStopId?: string;
  droppingStopId?: string;
  discountCode?: string;
}

export interface ConfirmBookingDto {
  paymentProvider: string;
  providerRef?: string;
  paymentMetadata?: Record<string, unknown>;
}

export interface CancelBookingDto {
  reason: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  scheduleId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  passengers: PassengerInfo[];
  seats: Array<{ seatNumber: string; seatType: string }>;
  schedule?: {
    departureTime: string;
    arrivalTime: string;
    route: { origin: string; destination: string };
    coach: { name: string };
  };
  payment?: {
    status: string;
    provider: string;
    paidAt?: string;
  };
}

export async function createBooking(dto: CreateBookingDto): Promise<Booking> {
  const seatsPayload = (dto.seatIds || []).map((seatId, idx) => {
    const p = dto.passengers?.[idx] || dto.passengers?.[0] || { name: 'Passenger', phone: '01700000000' };
    return {
      seatId,
      passenger: {
        name: p.name || 'Passenger',
        phone: p.phone || '01700000000',
        ...(p.email ? { email: p.email } : {}),
        gender: p.gender || 'MALE',
      },
    };
  });

  const payload = {
    scheduleId: dto.scheduleId,
    seats: seatsPayload,
    ...(dto.discountCode ? { couponCode: dto.discountCode } : {}),
    source: 'ONLINE',
  };

  const { data } = await client.post<{ data: Booking }>('/api/v1/bookings', payload);
  return data?.data || (data as unknown as Booking);
}

export async function confirmBooking(id: string, dto: ConfirmBookingDto): Promise<Booking> {
  const { data } = await client.post<{ data: Booking }>(`/api/v1/bookings/${id}/confirm`, dto);
  return data?.data || (data as unknown as Booking);
}

export async function cancelBooking(id: string, dto: CancelBookingDto): Promise<Booking> {
  const { data } = await client.post<{ data: Booking }>(`/api/v1/bookings/${id}/cancel`, dto);
  return data?.data || (data as unknown as Booking);
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await client.get<{ data: Booking }>(`/api/v1/bookings/${id}`);
  return data?.data || (data as unknown as Booking);
}

export async function getBookingByRef(ref: string): Promise<Booking> {
  const { data } = await client.get<{ data: Booking }>(`/api/v1/bookings/ref/${ref}`);
  return data?.data || (data as unknown as Booking);
}

// Admin
export async function adminGetBookings(query?: Record<string, unknown>) {
  const { data } = await client.get('/api/v1/admin/bookings', { params: query });
  return data;
}

export async function adminCreateCounterBooking(dto: CreateBookingDto & { counterId?: string }) {
  const { data } = await client.post('/api/v1/admin/bookings', dto);
  return data;
}
