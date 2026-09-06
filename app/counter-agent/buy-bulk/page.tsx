'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  RiShoppingBag3Fill,
  RiWallet3Fill,
  RiSmartphoneFill,
  RiErrorWarningFill,
  RiCheckboxCircleFill,
  RiShieldCheckFill,
  RiInformationFill,
  RiStackFill,
} from 'react-icons/ri';
import { BsFillTicketPerforatedFill } from 'react-icons/bs';
import { Loader2, Minus, Plus, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { counterAgentApi, type AllowedRoute, type AgentKycStatus, type BulkOrder } from '@/lib/api/counterAgent';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { getTranslation } from '@/lib/utils/translations';

function formatTk(n: number) {
  return '৳' + Number(n).toLocaleString('en-BD');
}

export default function BuyBulkPage() {
  const router = useRouter();
  const { clearAuth, user } = useAuthStore();
  const { lang } = useLanguageStore();
  const [routes, setRoutes] = useState<AllowedRoute[]>([]);
  const [routeId, setRouteId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [loading, setLoading] = useState(false);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [myBulkOrders, setMyBulkOrders] = useState<BulkOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [kycData, setKycData] = useState<AgentKycStatus | null>(null);

  useEffect(() => {
    counterAgentApi.getKycStatus().then(setKycData).catch(() => {});
    counterAgentApi
      .getBulkOrders()
      .then(setMyBulkOrders)
      .catch(() => {})
      .finally(() => setOrdersLoading(false));

    counterAgentApi
      .getAllowedRoutes()
      .then((r) => {
        setRoutes(r);
        if (r.length > 0) setRouteId(r[0].id);
      })
      .catch(() => setError(lang === 'BN' ? 'অনুমোদিত রুটসমূহ লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load eligible routes.'))
      .finally(() => setRoutesLoading(false));
  }, [lang]);

  const UNIT_PRICE = 2000;
  const total = quantity * UNIT_PRICE;

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'MOBILE_BANKING' | 'DIRECT_CASH'>('MOBILE_BANKING');
  const [mobileProvider, setMobileProvider] = useState<'BKASH' | 'NAGAD' | 'ROCKET'>('BKASH');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const handleOpenPaymentModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (kycData?.kycStatus !== 'VERIFIED') {
      setError(lang === 'BN' ? 'বাল্ক টিকিট কেনার আগে কেওয়াইসি ভেরিফিকেশন সম্পন্ন করা আবশ্যক।' : 'KYC Verification Required before purchasing bulk tickets.');
      return;
    }
    if (quantity < 10) {
      setError(lang === 'BN' ? 'সর্বনিম্ন বাল্ক অর্ডারের পরিমাণ 10টি টিকিট।' : 'Minimum bulk order quantity is 10 tickets.');
      return;
    }
    if (!routeId) {
      setError(lang === 'BN' ? 'অনুগ্রহ করে একটি রুট সিলেক্ট করুন।' : 'Please select an eligible route.');
      return;
    }
    setError('');
    setShowPaymentModal(true);
  };

  const isKycVerified = kycData?.kycStatus === 'VERIFIED';

  const handleFinalPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentType === 'MOBILE_BANKING') {
      if (!senderPhone.trim()) {
        setError(lang === 'BN' ? 'অনুগ্রহ করে আপনার মোবাইল ব্যাংকিং প্রেরক নম্বর লিখুন।' : 'Please enter your mobile banking sender number.');
        return;
      }
      if (!trxId.trim()) {
        setError(lang === 'BN' ? 'অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) লিখুন।' : 'Please enter the Transaction ID (TrxID).');
        return;
      }
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const order = await counterAgentApi.buyBulkTickets({
        routeId,
        quantity,
        paymentMethod: paymentType === 'MOBILE_BANKING' ? mobileProvider : 'DIRECT_CASH',
        senderPhone: paymentType === 'MOBILE_BANKING' ? senderPhone.trim() : undefined,
        trxId: paymentType === 'MOBILE_BANKING' ? trxId.trim() : undefined,
        paymentNotes: paymentNotes.trim() || undefined,
      });

      setShowPaymentModal(false);
      setMyBulkOrders((prev) => [order, ...prev]);
      setSuccess(
        lang === 'BN'
          ? `${order.quantity}টি টিকিটের বাল্ক টিকিট অর্ডার জমা দেওয়া হয়েছে! অ্যাডমিনের পেমেন্ট যাচাইকরণের অপেক্ষায় রয়েছে। অনুমোদিত হলে আপনার টিকিট কোটা চালু হবে।`
          : `Bulk ticket order for ${order.quantity} tickets submitted! Pending Admin payment verification. Once approved, your bulk ticket quota will be activated.`,
      );
      setTimeout(() => router.push('/counter-agent/dashboard'), 3500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          (lang === 'BN' ? 'বাল্ক টিকিট কেনাকাটা জমা দিতে ব্যর্থ হয়েছে।' : 'Failed to submit bulk ticket purchase.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <BsFillTicketPerforatedFill className="text-[#E31B23]" size={28} /> {getTranslation(lang, 'buyBulkTitle', 'Buy Bulk Tickets')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {getTranslation(lang, 'buyBulkSubtitle', 'Purchase ticket batches to build your commission investment cap.')}
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 shadow-xs">
          <RiCheckboxCircleFill size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">{lang === 'BN' ? 'অর্ডার জমা সম্পন্ন!' : 'Order Submitted for Approval!'}</strong> {success}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 shadow-xs">
          <RiErrorWarningFill size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">{lang === 'BN' ? 'ত্রুটি:' : 'Error:'}</strong> {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Purchase Form Card */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3">
            {lang === 'BN' ? 'অর্ডার কনফিগারেশন' : 'Order Configuration'}
          </h2>

          {routesLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
            </div>
          ) : routes.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">{lang === 'BN' ? 'কোনো অনুমোদিত রুট পাওয়া যায়নি।' : 'No allowed routes found.'}</p>
          ) : (
            <form onSubmit={handleOpenPaymentModal} className="space-y-6">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 sm:mb-2">
                  {lang === 'BN' ? 'করিডোর রুট সিলেক্ট করুন' : 'Select Corridor Route'}
                </label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full p-2.5 sm:p-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs sm:text-sm font-semibold focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20 outline-none"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.origin} → {r.destination} (৳2,000 / {lang === 'BN' ? 'টিকিট' : 'Ticket'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 sm:mb-2">
                  {lang === 'BN' ? 'টিকিটের পরিমাণ' : 'Ticket Quantity'} <span className="text-red-500 font-normal">{lang === 'BN' ? '(সর্বনিম্ন 10টি টিকিট)' : '(Minimum 10 tickets)'}</span>
                </label>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {/* Decrease 10 tickets */}
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(10, q - 10))}
                    className="p-2.5 sm:p-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-gray-700 font-bold transition-all active:scale-95 shrink-0"
                    title={lang === 'BN' ? '10টি কমাইন' : 'Decrease by 10 tickets'}
                  >
                    <Minus size={18} />
                  </button>

                  {/* Quantity input box with always-visible single ticket Up/Down stepper arrows */}
                  <div className="relative flex items-center w-32 sm:w-36">
                    <input
                      type="number"
                      min={10}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setQuantity(isNaN(val) ? 10 : Math.max(10, val));
                      }}
                      className="w-full py-2.5 sm:py-3 pl-3 pr-8 bg-gray-50 border border-gray-300 rounded-xl text-center text-base sm:text-lg font-black text-gray-900 focus:bg-white focus:border-[#E31B23] outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {/* Always-visible single-ticket Up/Down stepper arrows */}
                    <div className="absolute right-1.5 inset-y-0 flex flex-col justify-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="p-0.5 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors"
                        title={lang === 'BN' ? '১টি বাড়ান' : 'Increase 1 ticket'}
                      >
                        <ChevronUp size={14} className="stroke-[3]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(10, q - 1))}
                        className="p-0.5 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors"
                        title={lang === 'BN' ? '১টি কমাইন' : 'Decrease 1 ticket'}
                      >
                        <ChevronDown size={14} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  {/* Increase 10 tickets */}
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 10)}
                    className="p-2.5 sm:p-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-gray-700 font-bold transition-all active:scale-95 shrink-0"
                    title={lang === 'BN' ? '10টি বাড়ান' : 'Increase by 10 tickets'}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex justify-between text-[11px] sm:text-xs text-gray-600 font-medium">
                  <span>{lang === 'BN' ? 'একক মূল্য:' : 'Unit Price:'}</span>
                  <span>৳2,000 / {lang === 'BN' ? 'টিকিট' : 'ticket'}</span>
                </div>
                <div className="flex justify-between text-[11px] sm:text-xs text-gray-600 font-medium">
                  <span>{lang === 'BN' ? 'পরিমাণ:' : 'Quantity:'}</span>
                  <span>{quantity} {lang === 'BN' ? 'টি টিকিট' : 'tickets'}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-xs sm:text-base font-black text-gray-900">
                  <span>{lang === 'BN' ? 'মোট বিনিয়োগ:' : 'Total Investment:'}</span>
                  <span className="text-[#E31B23]">{formatTk(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || quantity < 10}
                className="w-full py-3.5 sm:py-4 bg-[#E31B23] hover:bg-[#c9121a] text-white font-extrabold text-xs sm:text-base rounded-2xl transition-all shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50"
              >
                {lang === 'BN' ? `পেমেন্টে এগিয়ে যান (${formatTk(total)})` : `Proceed to Payment (${formatTk(total)})`} <ArrowRight size={16} className="shrink-0" />
              </button>
            </form>
          )}
        </div>

        {/* Right Info Box */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
              <RiInformationFill size={18} className="text-[#E31B23]" /> {lang === 'BN' ? 'বাল্ক ক্রয়ের সুবিধাসমূহ' : 'Bulk Purchase Benefits'}
            </h3>
            <ul className="space-y-3 text-xs text-gray-600 font-medium leading-relaxed">
              <li className="flex items-start gap-2">
                <RiShieldCheckFill size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{lang === 'BN' ? 'কমিশন ক্যাপাসিটি বৃদ্ধি:' : 'Commission Capacity Boost:'}</strong>{' '}
                  {lang === 'BN'
                    ? `অ্যাডমিন পেমেন্ট অনুমোদনের সাথে সাথে আপনার কমিশন সীমা ${formatTk(total)} বৃদ্ধি পাবে।`
                    : `Your capacity cap increases by ${formatTk(total)} upon Admin payment approval.`}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <RiShieldCheckFill size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{lang === 'BN' ? 'প্ল্যাটফর্ম-ব্যাপী আয়:' : 'Platform-wide Earnings:'}</strong>{' '}
                  {lang === 'BN'
                    ? 'আপনার কাউন্টার থেকে গ্রাহকরা টিকিট কাটলেই ২০০ টাকা পর্যন্ত শেয়ার পাবেন।'
                    : 'Receive split shares of ৳200 commission whenever users book at your counter.'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Existing / Active Bulk Ticket Orders Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <RiStackFill className="text-[#E31B23]" size={22} />
              {lang === 'BN' ? 'আপনার বাল্ক টিকিট অর্ডারের তালিকা' : 'Your Bulk Ticket Orders'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === 'BN' ? 'আপনার বর্তমান সক্রিয় ও সেপ্টেম্বর সংক্রান্ত বাল্ক অর্ডারের বিবরণ।' : 'Overview of your active and pending bulk ticket allocations.'}
            </p>
          </div>
          {myBulkOrders.length > 0 && (
            <span className="text-xs font-black text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 w-fit">
              {lang === 'BN' ? `মোট ${myBulkOrders.length}টি অর্ডার` : `${myBulkOrders.length} Total Orders`}
            </span>
          )}
        </div>

        {ordersLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-[#E31B23] animate-spin" />
          </div>
        ) : myBulkOrders.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <BsFillTicketPerforatedFill className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-bold text-gray-500">
              {lang === 'BN' ? 'আপনার কোনো সক্রিয় বা পূর্বের বাল্ক টিকিট অর্ডার নেই।' : 'You have no active or past bulk ticket orders yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 px-2">{lang === 'BN' ? 'রুট' : 'Route'}</th>
                  <th className="pb-3 px-2 text-center">{lang === 'BN' ? 'পরিমাণ (বাকি)' : 'Qty (Remaining)'}</th>
                  <th className="pb-3 px-2 text-right">{lang === 'BN' ? 'মোট মূল্য' : 'Total Amount'}</th>
                  <th className="pb-3 px-2 text-center">{lang === 'BN' ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="pb-3 px-2 text-right">{lang === 'BN' ? 'তারিখ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {myBulkOrders.map((order) => {
                  const status = (order.status || 'PENDING').toUpperCase();
                  const isApproved = status === 'APPROVED' || status === 'ACTIVE';
                  const isPending = status === 'PENDING';
                  const isRejected = status === 'REJECTED';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-2 font-black text-gray-900">
                        {order.route ? `${order.route.origin} → ${order.route.destination}` : 'General Bulk Quota'}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className="font-extrabold text-gray-900">{order.quantity}</span>{' '}
                        <span className="text-xs text-gray-500 font-semibold">
                          ({lang === 'BN' ? `${order.remainingQuantity ?? order.quantity}টি বাকি` : `${order.remainingQuantity ?? order.quantity} left`})
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right font-black text-[#E31B23]">
                        {formatTk(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <RiCheckboxCircleFill size={13} /> {lang === 'BN' ? 'সক্রিয়' : 'Active'}
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                            <RiInformationFill size={13} /> {lang === 'BN' ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approval'}
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-200">
                            <RiErrorWarningFill size={13} /> {lang === 'BN' ? 'প্রত্যাখ্যাত' : 'Rejected'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right text-xs text-gray-500 font-medium whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString(lang === 'BN' ? 'bn-BD' : 'en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  {lang === 'BN' ? 'বাল্ক পেমেন্ট নিশ্চিতকরণ' : 'Bulk Payment Confirmation'}
                </h2>
                <p className="text-xs text-gray-500">
                  {lang === 'BN' ? 'অর্ডার মোট:' : 'Order Total:'} <strong className="text-[#E31B23]">{formatTk(total)}</strong> ({quantity} {lang === 'BN' ? 'টি টিকিট' : 'Tickets'})
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentType('MOBILE_BANKING')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  paymentType === 'MOBILE_BANKING'
                    ? 'border-[#E31B23] bg-red-50 text-[#E31B23] shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <RiSmartphoneFill size={16} /> {lang === 'BN' ? 'মোবাইল ব্যাংকিং' : 'Mobile Banking'}
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('DIRECT_CASH')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  paymentType === 'DIRECT_CASH'
                    ? 'border-[#E31B23] bg-red-50 text-[#E31B23] shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <RiWallet3Fill size={16} /> {lang === 'BN' ? 'সরাসরি কাউন্টার ক্যাশ' : 'Direct Counter Cash'}
              </button>
            </div>

            <form onSubmit={handleFinalPaymentSubmit} className="space-y-4">
              {paymentType === 'MOBILE_BANKING' ? (
                <>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
                    <span className="font-bold text-gray-700 block">
                      {lang === 'BN' ? 'অ্যাডমিন সেন্ড মানি নম্বরসমূহ:' : 'Admin Send Money Numbers:'}
                    </span>
                    <div className="flex justify-between items-center text-gray-800 font-mono font-bold bg-white p-2 rounded-xl border border-gray-200">
                      <span>bKash / Nagad / Rocket:</span>
                      <span className="text-[#E31B23] text-sm">01739-142959</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {lang === 'BN'
                        ? <>উপরে উল্লিখিত অ্যাডমিন সেন্ড মানি নম্বরে <strong>{formatTk(total)}</strong> টাকা পাঠান, তারপর নিচে বিবরণ প্রদান করুন।</>
                        : <>Please send <strong>{formatTk(total)}</strong> to the Admin Send Money number above, then enter your details below.</>}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {lang === 'BN' ? 'মোবাইল ব্যাংকিং প্রোভাইডার' : 'Mobile Banking Provider'}
                    </label>
                    <div className="flex gap-2">
                      {(['BKASH', 'NAGAD', 'ROCKET'] as const).map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setMobileProvider(prov)}
                          className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                            mobileProvider === prov
                              ? 'border-[#E31B23] bg-[#E31B23] text-white'
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
                      {lang === 'BN' ? 'প্রেরকের মোবাইল নম্বর' : 'Sender Mobile Number'} <span className="text-red-500">*</span>
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
                      {lang === 'BN' ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID (TrxID)'} <span className="text-red-500">*</span>
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
                </>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-gray-700 block">
                    {lang === 'BN' ? 'সরাসরি পেমেন্ট নির্দেশাবলী:' : 'Direct Payment Instructions:'}
                  </span>
                  <p className="text-gray-600 leading-relaxed">
                    {lang === 'BN'
                      ? 'অ্যাডমিন সেন্ট্রাল একাউন্ট অফিসে নগদ টাকা প্রদান করুন বা ব্যাংক জমা স্লিপ জমা দিন।'
                      : 'Hand over cash or submit bank deposit slip directly to Admin Central Accounts Office.'}
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mt-2 mb-1">
                      {lang === 'BN' ? 'পেমেন্ট রেফারেন্স / রসিদ নোট' : 'Payment Reference / Receipt Notes'}
                    </label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder={lang === 'BN' ? 'যেমন: সেন্ট্রাল অফিসে নগদ টাকা প্রদান করা হয়েছে' : 'e.g. Handed ৳20,000 cash to Central Office Admin on 03 Sep'}
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs focus:border-[#E31B23] outline-none"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={loading}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                >
                  {lang === 'BN' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#E31B23] hover:bg-[#c9121a] text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    lang === 'BN' ? 'অর্ডার জমা দিন' : 'Submit Order'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
