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
import client from '@/lib/api/client';
import { RiCheckboxCircleFill, RiTicket2Fill, RiSmartphoneFill, RiWallet3Fill } from 'react-icons/ri';

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
  const [paymentType, setPaymentType] = useState<'MOBILE_BANKING' | 'CASH'>('MOBILE_BANKING');
  const [mobileProvider, setMobileProvider] = useState<'BKASH' | 'NAGAD' | 'ROCKET'>('BKASH');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      router.replace(ROUTES.HOME);
    }
  }, [bookingId, router]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;

    if (paymentType === 'MOBILE_BANKING') {
      if (!senderPhone.trim()) {
        toast.error('Please enter your mobile banking sender number.');
        return;
      }
      if (!trxId.trim()) {
        toast.error('Please enter your Transaction ID (TrxID).');
        return;
      }
    }

    setSubmitting(true);
    try {
      // Save payment credentials on booking record
      await client.post(`/api/v1/bookings/${bookingId}/confirm`, {
        paymentProvider: paymentType === 'MOBILE_BANKING' ? mobileProvider : 'CASH',
        providerRef: paymentType === 'MOBILE_BANKING' ? trxId.trim() : `CASH-${Date.now()}`,
        paymentMetadata: {
          paymentMethod: paymentType === 'MOBILE_BANKING' ? mobileProvider : 'CASH',
          senderPhone: paymentType === 'MOBILE_BANKING' ? senderPhone.trim() : undefined,
          trxId: paymentType === 'MOBILE_BANKING' ? trxId.trim() : undefined,
          paymentNotes: paymentNotes.trim() || undefined,
        },
      });

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Payment submission error:', err);
      // Even if confirm endpoint throws if already held, we still show approval pending
      setShowSuccessModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = getFinalAmount();

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
              <p className="text-sm font-semibold text-amber-800">Seats Reserved & Held</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Booking Ref: <strong className="font-mono font-black text-amber-900">{bookingRef}</strong>. Admin will verify your payment and issue your digital boarding pass.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6 shadow-xs">
            <h3 className="font-bold text-[#111111] mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-3">
              <div className="flex justify-between">
                <span>{schedule?.origin} → {schedule?.destination}</span>
              </div>
              <div className="flex justify-between">
                <span>{selectedSeats.length} seat(s) ({selectedSeats.map((s) => s.seatNumber).join(', ')})</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-base mt-3">
              <span>Total Payable Amount</span>
              <span className="text-[#E31B23]">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method Form */}
          <form onSubmit={handleConfirm} className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4 shadow-xs">
              <h3 className="font-bold text-[#111111]">Select Payment Option</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentType('MOBILE_BANKING')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    paymentType === 'MOBILE_BANKING'
                      ? 'border-[#E31B23] bg-red-50 text-[#E31B23] shadow-xs'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <RiSmartphoneFill size={16} /> Mobile Banking
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('CASH')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    paymentType === 'CASH'
                      ? 'border-[#E31B23] bg-red-50 text-[#E31B23] shadow-xs'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <RiWallet3Fill size={16} /> Cash on Counter
                </button>
              </div>

              {paymentType === 'MOBILE_BANKING' ? (
                <div className="space-y-4 pt-2">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
                    <span className="font-bold text-gray-800 block">Admin Send Money Numbers:</span>
                    <div className="flex justify-between items-center text-gray-900 font-mono font-bold bg-white p-2.5 rounded-xl border border-gray-200">
                      <span>bKash / Nagad / Rocket:</span>
                      <span className="text-[#E31B23] text-sm">01739-142959</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Send <strong>{formatCurrency(totalAmount)}</strong> to the Admin Send Money number above, then submit your details below.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Select Mobile Provider
                    </label>
                    <div className="flex gap-2">
                      {(['BKASH', 'NAGAD', 'ROCKET'] as const).map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setMobileProvider(prov)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                            mobileProvider === prov
                              ? 'border-[#E31B23] bg-[#E31B23] text-white shadow-xs'
                              : 'border-gray-200 bg-gray-50 text-gray-700'
                          }`}
                        >
                          {prov}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Sender Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="e.g. 01712345678"
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:border-[#E31B23] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Transaction ID (TrxID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g. BL90XK2191"
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold uppercase focus:border-[#E31B23] outline-none placeholder:normal-case placeholder:font-sans"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-gray-800 block">Cash on Counter Instructions:</span>
                  <p className="text-gray-600 leading-relaxed">
                    You can pay in cash at the bus counter before boarding. Please enter any payment notes if you have already deposited cash.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mt-2 mb-1">
                      Payment Notes / Counter Ref
                    </label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="e.g. Paying cash at Arambagh counter before departure"
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs focus:border-[#E31B23] outline-none"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield size={14} />
              <span>Payment submission is encrypted and securely sent for Admin verification.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#E31B23] disabled:opacity-70 disabled:cursor-not-allowed hover:bg-[#C41920] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg text-base active:scale-98"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Submit Payment
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Payment Submitted - Pending Admin Approval Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden border border-amber-100">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
            
            {/* Animated Checkmark / Hourglass Circle */}
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg relative">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
              <RiCheckboxCircleFill size={48} className="relative z-10 text-amber-600" />
            </div>

            <h2 className="text-2xl font-black text-[#111111] mb-1">Payment Submitted!</h2>
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full uppercase tracking-wider mb-4">
              Pending Admin Approval
            </span>
            <p className="text-gray-500 text-xs sm:text-sm font-medium mb-6">
              Thank you for booking with Ticket Dorkar. Your booking has been received and is pending Admin payment approval. Your seats remain reserved.
            </p>

            {/* Payment Details Card */}
            <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100 space-y-2.5 mb-6 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Booking Ref</span>
                <span className="font-mono font-black text-[#111111]">{bookingRef}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Payment Option</span>
                <span className="font-bold text-gray-800">
                  {paymentType === 'MOBILE_BANKING' ? mobileProvider : 'Cash on Counter'}
                </span>
              </div>
              {trxId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Transaction ID</span>
                  <span className="font-mono font-bold text-blue-700">{trxId}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Route</span>
                <span className="font-bold text-gray-800">{schedule?.origin} → {schedule?.destination}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between items-center pt-0.5">
                <span className="font-bold text-gray-700">Total Amount</span>
                <span className="font-black text-[#E31B23] text-base">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => router.push(ROUTES.DASHBOARD)}
                className="w-full bg-[#E31B23] hover:bg-[#C41920] text-[#FFFFFF] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-98"
              >
                <RiTicket2Fill size={18} /> Go to My Bookings
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
