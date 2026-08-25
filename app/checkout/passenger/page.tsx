'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Phone, Mail, ChevronRight, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useBookingStore } from '@/lib/store/bookingStore';
import { formatCurrency } from '@/lib/utils/currency';
import { ROUTES } from '@/lib/utils/constants';
import { useCreateBooking } from '@/lib/hooks/useBooking';
import client, { withCompany } from '@/lib/api/client';
import { toast } from 'sonner';

const passengerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(11, 'Enter a valid phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

const formSchema = z.object({
  passengers: z.array(passengerSchema),
});

type FormData = z.infer<typeof formSchema>;

export default function PassengerPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const {
    selectedSeats,
    schedule,
    scheduleId,
    setPassengers,
    boardingStopId,
    droppingStopId,
    setStops,
    discountCode,
    getFinalAmount,
    reset,
  } = useBookingStore();
  const createBooking = useCreateBooking();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Strict UUID validation matching class-validator rules (v1-v5)
  const strictUuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // Redirect if no seats selected or scheduleId is not a valid UUID v4
  useEffect(() => {
    if (!isMounted) return;
    const isUuid = Boolean(scheduleId && strictUuidRe.test(scheduleId));
    if (!scheduleId || !isUuid || selectedSeats.length === 0) {
      if (scheduleId && !isUuid) {
        toast.error('Your bus session stored invalid data. Resetting session...');
        reset();
      }
      router.replace(ROUTES.HOME);
    }
  }, [isMounted, scheduleId, selectedSeats.length, router, reset]);

  // Fetch counters for origin city
  const originCity = schedule?.origin || '';
  const { data: countersData } = useQuery({
    queryKey: ['public', 'counters'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/counters', { params: withCompany() });
      return data?.data || (Array.isArray(data) ? data : []);
    },
  });

  const cityCounters = Array.isArray(countersData)
    ? countersData.filter((c: any) =>
        (c.name || '').toLowerCase().includes(originCity.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(originCity.toLowerCase())
      )
    : [];

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengers: selectedSeats.map(() => ({ name: '', phone: '', email: '', gender: 'MALE' as const })),
    },
  });

  const { fields } = useFieldArray({ control, name: 'passengers' });

  const onSubmit = async (data: FormData) => {
    setPassengers(data.passengers);

    const isUuid = Boolean(scheduleId && strictUuidRe.test(scheduleId));
    if (!scheduleId || !isUuid) {
      toast.error('Session expired or invalid bus schedule. Please search and select your bus again.');
      reset();
      router.push(ROUTES.HOME);
      return;
    }

    try {
      console.log('[onSubmit] scheduleId from store:', JSON.stringify(scheduleId));
      console.log('[onSubmit] seatIds:', selectedSeats.map((s) => s.id));
      // Create booking via API
      await createBooking.mutateAsync({
        scheduleId: scheduleId!,
        seatIds: selectedSeats.map((s) => s.id),
        passengers: data.passengers,
        boardingStopId: boardingStopId ?? undefined,
        droppingStopId: droppingStopId ?? undefined,
        discountCode: discountCode || undefined,
      });

      // Navigate to payment
      router.push(ROUTES.CHECKOUT_PAYMENT);
    } catch (err: any) {
      const isAuthErr =
        err?.response?.status === 401 ||
        err?.message?.includes('token') ||
        err?.message?.includes('sign in') ||
        err?.message?.includes('Unauthorized');

      if (isAuthErr) {
        router.push(ROUTES.LOGIN);
      }
    }
  };

  const totalAmount = getFinalAmount();

  if (!isMounted) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E31B23]" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 pb-10 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back */}
          <div className="flex items-center gap-2 mb-6">
            <Link href={scheduleId ? ROUTES.BOOKING(scheduleId) : ROUTES.HOME} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
              <ArrowLeft size={18} className="text-gray-600" />
            </Link>
            <h1 className="font-bold text-[#111111]">Passenger Details</h1>
          </div>

          {/* Progress */}
          <div className="flex gap-1 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 1 ? 'bg-[#E31B23]' : 'bg-gray-200'}`} />
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-[#111111] mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#E31B23] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  Passenger {index + 1}
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    (Seat {selectedSeats[index]?.seatNumber})
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register(`passengers.${index}.name`)}
                        placeholder="Enter full name"
                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                      />
                    </div>
                    {errors.passengers?.[index]?.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.passengers[index]!.name!.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register(`passengers.${index}.phone`)}
                        placeholder="01XXXXXXXXX"
                        type="tel"
                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                      />
                    </div>
                    {errors.passengers?.[index]?.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.passengers[index]!.phone!.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Email (optional)
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        {...register(`passengers.${index}.email`)}
                        placeholder="email@example.com"
                        type="email"
                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Gender
                    </label>
                    <select
                      {...register(`passengers.${index}.gender`)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all appearance-none"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Boarding Counter Selection Card */}
            {cityCounters.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
                <h3 className="font-bold text-[#111111] mb-1 flex items-center gap-2 text-sm sm:text-base">
                  <Building2 size={18} className="text-[#E31B23]" />
                  Select Preferred Boarding Counter / Pickup Spot
                </h3>
                <p className="text-xs text-gray-500 mb-4 font-medium">
                  Choose the counter location closest to you where you will board the bus.
                </p>
                <select
                  value={boardingStopId || ''}
                  onChange={(e) => setStops(e.target.value || null, droppingStopId)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                >
                  <option value="">-- Select Pickup Counter Location --</option>
                  {cityCounters.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.location}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Order summary */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-bold text-[#111111] mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{schedule?.origin} → {schedule?.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span>{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} × {formatCurrency(schedule?.fare || 0)}</span>
                </div>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-bold text-base">
                <span>Total Amount</span>
                <span className="text-[#E31B23]">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={createBooking.isPending}
              className="w-full bg-[#E31B23] disabled:opacity-70 hover:bg-[#C41920] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg text-sm active:scale-98"
            >
              {createBooking.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>Continue to Payment <ChevronRight size={16} /></>
              )}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
