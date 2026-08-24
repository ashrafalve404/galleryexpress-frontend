'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Seat {
  id: string;
  seatNumber: string;
  seatType: string;
  price: number;
}

interface PassengerInfo {
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  nid?: string;
  age?: number;
}

interface BookingState {
  // Step tracking
  step: 'search' | 'select-seat' | 'passenger' | 'payment' | 'confirmation';

  // Search params
  from: string;
  to: string;
  date: string;

  // Selected trip
  scheduleId: string | null;
  schedule: {
    departureTime: string;
    arrivalTime: string;
    origin: string;
    destination: string;
    coachName: string;
    fare: number;
  } | null;

  // Seat selection
  selectedSeats: Seat[];

  // Passenger info
  passengers: PassengerInfo[];

  // Boarding / dropping
  boardingStopId: string | null;
  droppingStopId: string | null;

  // Discount
  discountCode: string;
  discountAmount: number;

  // Booking result
  bookingId: string | null;
  bookingRef: string | null;
  ticketNumber: string | null;

  // Payment
  paymentProvider: string | null;

  // Actions
  setSearch: (from: string, to: string, date: string) => void;
  setSchedule: (scheduleId: string, schedule: BookingState['schedule']) => void;
  toggleSeat: (seat: Seat) => void;
  clearSeats: () => void;
  setPassengers: (passengers: PassengerInfo[]) => void;
  setStops: (boardingStopId: string | null, droppingStopId: string | null) => void;
  setDiscount: (code: string, amount: number) => void;
  setBookingResult: (bookingId: string, bookingRef: string) => void;
  setTicketNumber: (ticketNumber: string) => void;
  setPaymentProvider: (provider: string) => void;
  setStep: (step: BookingState['step']) => void;
  reset: () => void;

  // Computed
  getTotalAmount: () => number;
  getFinalAmount: () => number;
}

const initialState = {
  step: 'search' as const,
  from: '',
  to: '',
  date: '',
  scheduleId: null,
  schedule: null,
  selectedSeats: [],
  passengers: [],
  boardingStopId: null,
  droppingStopId: null,
  discountCode: '',
  discountAmount: 0,
  bookingId: null,
  bookingRef: null,
  ticketNumber: null,
  paymentProvider: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSearch: (from, to, date) => set({ from, to, date }),

      setSchedule: (scheduleId, schedule) => {
        const currentId = get().scheduleId;
        if (currentId === scheduleId) {
          set({ schedule });
        } else {
          set({ scheduleId, schedule, selectedSeats: [], step: 'select-seat' });
        }
      },

      toggleSeat: (seat) => {
        const { selectedSeats } = get();
        const exists = selectedSeats.find((s) => s.id === seat.id);
        if (exists) {
          set({ selectedSeats: selectedSeats.filter((s) => s.id !== seat.id) });
        } else {
          set({ selectedSeats: [...selectedSeats, seat] });
        }
      },

      clearSeats: () => set({ selectedSeats: [] }),

      setPassengers: (passengers) => set({ passengers, step: 'payment' }),

      setStops: (boardingStopId, droppingStopId) => set({ boardingStopId, droppingStopId }),

      setDiscount: (code, amount) => set({ discountCode: code, discountAmount: amount }),

      setBookingResult: (bookingId, bookingRef) =>
        set({ bookingId, bookingRef, step: 'payment' }),

      setTicketNumber: (ticketNumber) => set({ ticketNumber, step: 'confirmation' }),

      setPaymentProvider: (paymentProvider) => set({ paymentProvider }),

      setStep: (step) => set({ step }),

      reset: () => set(initialState),

      getTotalAmount: () => {
        const { selectedSeats, schedule } = get();
        const fallbackFare = schedule?.fare || 0;
        return selectedSeats.reduce((sum, seat) => sum + (seat.price || fallbackFare), 0);
      },

      getFinalAmount: () => {
        const { discountAmount } = get();
        return get().getTotalAmount() - discountAmount;
      },
    }),
    {
      name: 'gallery-express-booking',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (state) => ({
        from: state.from,
        to: state.to,
        date: state.date,
        scheduleId: state.scheduleId,
        schedule: state.schedule,
        selectedSeats: state.selectedSeats,
        passengers: state.passengers,
        boardingStopId: state.boardingStopId,
        droppingStopId: state.droppingStopId,
        discountCode: state.discountCode,
        discountAmount: state.discountAmount,
        bookingId: state.bookingId,
        bookingRef: state.bookingRef,
        ticketNumber: state.ticketNumber,
        paymentProvider: state.paymentProvider,
        step: state.step,
      }),
    }
  )
);
