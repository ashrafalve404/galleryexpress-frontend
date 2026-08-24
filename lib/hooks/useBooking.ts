import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBooking,
  confirmBooking,
  cancelBooking,
  getBooking,
  getBookingByRef,
  type CreateBookingDto,
  type ConfirmBookingDto,
  type CancelBookingDto,
} from '../api/bookings';
import { useBookingStore } from '../store/bookingStore';
import { toast } from 'sonner';

export const bookingKeys = {
  all: ['bookings'] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
  byRef: (ref: string) => ['bookings', 'ref', ref] as const,
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

export function useCreateBooking() {
  const setBookingResult = useBookingStore((s) => s.setBookingResult);

  return useMutation({
    mutationFn: (dto: CreateBookingDto) => createBooking(dto),
    onSuccess: (data) => {
      setBookingResult(data.id, data.bookingRef);
      toast.success('Seats held! Please complete payment within 10 minutes.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create booking. Please try again.');
    },
  });
}

export function useConfirmBooking() {
  const qc = useQueryClient();
  const setTicketNumber = useBookingStore((s) => s.setTicketNumber);

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ConfirmBookingDto }) =>
      confirmBooking(id, dto),
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      const ticketNumber = (data as unknown as { tickets?: Array<{ ticketNumber: string }> })
        ?.tickets?.[0]?.ticketNumber;
      if (ticketNumber) {
        setTicketNumber(ticketNumber);
      }
      toast.success('Booking confirmed! Your tickets have been issued.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Payment confirmation failed. Please contact support.');
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
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to cancel booking.');
    },
  });
}
