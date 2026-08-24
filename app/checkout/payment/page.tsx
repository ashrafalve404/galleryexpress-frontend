'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Timer, Shield, Smartphone, Wallet, CreditCard, Building2, Ticket, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useBookingStore } from '@/lib/store/bookingStore';
import { useConfirmBooking } from '@/lib/hooks/useBooking';
import { formatCurrency } from '@/lib/utils/currency';
import { PAYMENT_PROVIDERS, ROUTES } from '@/lib/utils/constants';
import { toast } from 'sonner';
import { RiCheckboxCircleFill, RiTicket2Fill } from 'react-icons/ri';

const PROVIDER_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Smartphone,
  Wallet,
  CreditCard,
  Building2,
};

export default function PaymentPage() {
  const router = useRouter();
  const { bookingId, bookingRef, schedule, selectedSeats, getFinalAmount, setPaymentProvider, paymentProvider, ticketNumber } = useBookingStore();
  const confirmBooking = useConfirmBooking();
  const [selected, setSelected] = useState<string>(paymentProvider || 'BKASH');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      router.replace(ROUTES.HOME);
    }
  }, [bookingId, router]);

  const handleConfirm = async () => {
    if (!selected || !bookingId) return;
    setPaymentProvider(selected);

    try {
      await confirmBooking.mutateAsync({
        id: bookingId,
        dto: {
          paymentProvider: selected,
          providerRef: `SIM-${Date.now()}`,
        },
      });

      toast.success('Payment completed successfully!');
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Payment confirmation error:', err);
      const msg = err?.response?.data?.message || 'Failed to confirm payment.';
      toast.error(msg);
    }
  };

  const totalAmount = getFinalAmount();
  const selectedProviderObj = PAYMENT_PROVIDERS.find((p) => p.id === selected);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20 pb-10 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back */}
          <div className="flex items-center gap-2 mb-6">
            <Link href={ROUTES.CHECKOUT_PASSENGER} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
              <ArrowLeft size={18} className="text-gray-600" />
            </Link>
            <h1 className="font-bold text-[#111111]">Payment</h1>
          </div>

          {/* Progress */}
          <div className="flex gap-1 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 2 ? 'bg-[#E31B23]' : 'bg-gray-200'}`} />
            ))}
          </div>

          {/* Hold notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Timer size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Your seats are held</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Booking Ref: <strong className="font-mono">{bookingRef}</strong>. Complete payment within 10 minutes or your seats will be released.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
            <h3 className="font-bold text-[#111111] mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-3">
              <div className="flex justify-between">
                <span>{schedule?.origin} → {schedule?.destination}</span>
              </div>
              <div className="flex justify-between">
                <span>{selectedSeats.length} seat(s) ({selectedSeats.map(s => s.seatNumber).join(', ')})</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-base mt-3">
              <span>Amount to Pay</span>
              <span className="text-[#E31B23]">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
            <h3 className="font-bold text-[#111111] mb-4">Select Payment Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_PROVIDERS.map((provider) => {
                const IconComponent = PROVIDER_ICONS[provider.iconName] || CreditCard;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelected(provider.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selected === provider.id
                        ? 'border-[#E31B23] bg-[#E31B23]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                      <IconComponent size={20} className={selected === provider.id ? 'text-[#E31B23]' : 'text-gray-600'} />
                    </div>
                    <div className="font-semibold text-sm text-[#111111]">{provider.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{provider.description}</div>
                    {selected === provider.id && (
                      <div className="mt-2">
                        <CheckCircle2 size={16} className="text-[#E31B23]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Shield size={13} />
            <span>Your payment information is 100% encrypted and secure.</span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selected || confirmBooking.isPending}
            className="w-full bg-[#E31B23] disabled:opacity-70 disabled:cursor-not-allowed hover:bg-[#C41920] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg text-base active:scale-98"
          >
            {confirmBooking.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Shield size={16} />
                Pay {formatCurrency(totalAmount)} Securely
              </>
            )}
          </button>
        </div>
      </main>

      {/* Payment Success Popup Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden border border-emerald-100">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500" />
            
            {/* Animated Checkmark Circle */}
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg relative">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              <RiCheckboxCircleFill size={48} className="relative z-10 text-emerald-600" />
            </div>

            <h2 className="text-2xl font-black text-[#111111] mb-1">Payment Successful!</h2>
            <p className="text-gray-500 text-xs sm:text-sm font-medium mb-6">
              Thank you for booking with Gallery Express. Your seats are confirmed.
            </p>

            {/* Payment Details Card */}
            <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100 space-y-2.5 mb-6 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Booking Ref</span>
                <span className="font-mono font-black text-[#111111]">{bookingRef}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Payment Method</span>
                <span className="font-bold text-gray-800">{selectedProviderObj?.name || 'Mobile Banking'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Route</span>
                <span className="font-bold text-gray-800">{schedule?.origin} → {schedule?.destination}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between items-center pt-0.5">
                <span className="font-bold text-gray-700">Total Paid</span>
                <span className="font-black text-[#E31B23] text-base">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => router.push(ROUTES.CHECKOUT_CONFIRMATION)}
                className="w-full bg-[#E31B23] hover:bg-[#C41920] text-[#FFFFFF] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-98"
              >
                <RiTicket2Fill size={18} /> View Digital Boarding Pass
              </button>
              <button
                onClick={() => router.push(ROUTES.DASHBOARD)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-xs sm:text-sm transition-colors"
              >
                Go to Passenger Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
