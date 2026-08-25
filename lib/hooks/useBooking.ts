import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBooking,
  confirmBooking,
  cancelBooking,
  getBooking,
  getBookingByRef,
  getUserBookings,
  type CreateBookingDto,
  type ConfirmBookingDto,
  type CancelBookingDto,
} from '../api/bookings';
import { useBookingStore } from '../store/bookingStore';
import { toast } from 'sonner';

// Extended booking type that includes tickets from GET /bookings/:id
interface BookingWithTickets {
  tickets?: Array<{ ticketNumber: string; status: string }>;
}

export const bookingKeys = {
  all: ['bookings'] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
  byRef: (ref: string) => ['bookings', 'ref', ref] as const,
  userBookings: () => ['bookings', 'user'] as const,
};

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => getBooking(id),
    enabled: !!id,
  });
}

export function useBookingByRef(ref: string) {
  return useQuery({
    queryKey: bookingKeys.byRef(ref),
    queryFn: () => getBookingByRef(ref),
    enabled: !!ref,
  });
}

export function useUserBookings(enabled = true) {
  return useQuery({
    queryKey: bookingKeys.userBookings(),
    queryFn: () => getUserBookings(),
    enabled,
  });
}

export function useCreateBooking() {
  const setBookingResult = useBookingStore((s) => s.setBookingResult);

  return useMutation({
    mutationFn: (dto: CreateBookingDto) => createBooking(dto),
    onSuccess: (data) => {
      setBookingResult(data.id, data.bookingRef);
      toast.success('Seats held! Please complete payment within 10 minutes.');
    },
    onError: (err: any) => {
      const isAuthErr =
        err?.response?.status === 401 ||
        err?.message?.includes('token') ||
        err?.message?.includes('sign in') ||
        err?.message?.includes('Unauthorized');

      const errors = err?.response?.data?.errors;
      const rawMsg = Array.isArray(errors) && errors.length > 0
        ? errors.join(' | ')
        : Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join(' | ')
        : err?.response?.data?.message || err?.message;

      const userMsg = isAuthErr
        ? 'Please sign in to your account to complete your booking.'
        : rawMsg || 'Failed to create booking. Please try again.';

      console.error('Booking creation failed:', rawMsg || err?.message || err);
      toast.error(userMsg);
    },
  });
}

export function useConfirmBooking() {
  const qc = useQueryClient();
  const setTicketNumber = useBookingStore((s) => s.setTicketNumber);

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ConfirmBookingDto }) =>
      confirmBooking(id, dto),
    onSuccess: async (_, { id }) => {
      // The confirm endpoint returns the raw booking without tickets.
      // Fetch the booking detail which includes tickets[].
      try {
        const bookingDetail = await getBooking(id) as unknown as BookingWithTickets;
        const ticketNumber = bookingDetail?.tickets?.[0]?.ticketNumber;
        if (ticketNumber) {
          setTicketNumber(ticketNumber);
        }
      } catch {
        // ticket number fetch failed — confirmation still succeeded
      }
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      toast.success('Booking confirmed! Your tickets have been issued.');
    },
    onError: (err: any) => {
      const rawMsg = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join(' | ')
        : err?.response?.data?.message || err?.message;
      toast.error(rawMsg || 'Payment confirmation failed. Please contact support.');
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CancelBookingDto }) =>
      cancelBooking(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      toast.success('Booking cancelled successfully.');
    },
    onError: (err: any) => {
      const rawMsg = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join(' | ')
        : err?.response?.data?.message || err?.message;
      toast.error(rawMsg || 'Failed to cancel booking. Please try again.');
    },
  });
}
