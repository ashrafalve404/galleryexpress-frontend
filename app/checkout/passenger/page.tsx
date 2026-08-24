'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, User, Phone, Mail, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useBookingStore } from '@/lib/store/bookingStore';
import { formatCurrency } from '@/lib/utils/currency';
import { formatTime } from '@/lib/utils/date';
import { ROUTES } from '@/lib/utils/constants';
import { useCreateBooking } from '@/lib/hooks/useBooking';

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
  const { selectedSeats, schedule, scheduleId, setPassengers, boardingStopId, droppingStopId, discountCode, getFinalAmount } = useBookingStore();
  const createBooking = useCreateBooking();

  // Redirect if no seats selected
  useEffect(() => {
    if (!scheduleId || selectedSeats.length === 0) {
      router.replace(ROUTES.HOME);
    }
  }, [scheduleId, selectedSeats.length, router]);

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengers: selectedSeats.map(() => ({ name: '', phone: '', email: '', gender: 'MALE' as const })),
    },
  });

  const { fields } = useFieldArray({ control, name: 'passengers' });

  const onSubmit = async (data: FormData) => {
    setPassengers(data.passengers);

    try {
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
              className="w-full bg-[#E31B23] disabled:opacity-70 hover:bg-[#C41920] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg text-sm"
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
