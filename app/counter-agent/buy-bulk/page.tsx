'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  RiTicket2Fill,
  RiShoppingBag3Fill,
  RiWallet3Fill,
  RiSmartphoneFill,
  RiErrorWarningFill,
  RiCheckboxCircleFill,
  RiShieldCheckFill,
  RiInformationFill,
} from 'react-icons/ri';
import { Loader2, Minus, Plus, ArrowRight } from 'lucide-react';
import { counterAgentApi, type AllowedRoute, type AgentKycStatus } from '@/lib/api/counterAgent';
import { useAuthStore } from '@/lib/store/authStore';

function formatTk(n: number) {
  return '৳' + Number(n).toLocaleString('en-BD');
}

export default function BuyBulkPage() {
  const router = useRouter();
  const { clearAuth, user } = useAuthStore();
  const [routes, setRoutes] = useState<AllowedRoute[]>([]);
  const [routeId, setRouteId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [loading, setLoading] = useState(false);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [kycData, setKycData] = useState<AgentKycStatus | null>(null);

  useEffect(() => {
    counterAgentApi.getKycStatus().then(setKycData).catch(() => {});
    counterAgentApi
      .getAllowedRoutes()
      .then((r) => {
        setRoutes(r);
        if (r.length > 0) setRouteId(r[0].id);
      })
      .catch(() => setError('Failed to load eligible routes.'))
      .finally(() => setRoutesLoading(false));
  }, []);

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
      setError('KYC Verification Required before purchasing bulk tickets.');
      return;
    }
    if (quantity < 10) {
      setError('Minimum bulk order quantity is 10 tickets.');
      return;
    }
    if (!routeId) {
      setError('Please select an eligible route.');
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
        setError('Please enter your mobile banking sender number.');
        return;
      }
      if (!trxId.trim()) {
        setError('Please enter the Transaction ID (TrxID).');
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
      setSuccess(
        `Bulk ticket order for ${order.quantity} tickets submitted! Pending Admin payment verification. Once approved, your bulk ticket quota will be activated.`,
      );
      setTimeout(() => router.push('/counter-agent/dashboard'), 3500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to submit bulk ticket purchase.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <RiTicket2Fill className="text-[#E31B23]" size={28} /> Buy Bulk Tickets
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Purchase minimum 10 tickets for Dhaka ↔ Cox&apos;s Bazar route at fixed ৳2,000 unit price
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 shadow-xs">
          <RiCheckboxCircleFill size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Order Submitted for Approval!</strong> {success}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 shadow-xs">
          <RiErrorWarningFill size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Error:</strong> {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Purchase Form Card */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3">
            Order Configuration
          </h2>

          {routesLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
            </div>
          ) : routes.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No allowed routes found.</p>
          ) : (
            <form onSubmit={handleOpenPaymentModal} className="space-y-6">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 sm:mb-2">
                  Select Corridor Route
                </label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full p-2.5 sm:p-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs sm:text-sm font-semibold focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20 outline-none"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.origin} → {r.destination} (৳2,000 / Ticket)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 sm:mb-2">
                  Ticket Quantity <span className="text-red-500 font-normal">(Minimum 10 tickets)</span>
                </label>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(10, q - 10))}
                    className="p-2.5 sm:p-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-gray-700 font-bold transition-all"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min={10}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(10, parseInt(e.target.value) || 10))
                    }
                    className="w-24 sm:w-32 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-center text-base sm:text-lg font-black text-gray-900 focus:border-[#E31B23] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 10)}
                    className="p-2.5 sm:p-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-gray-700 font-bold transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex justify-between text-[11px] sm:text-xs text-gray-600 font-medium">
                  <span>Unit Price:</span>
                  <span>৳2,000 / ticket</span>
                </div>
                <div className="flex justify-between text-[11px] sm:text-xs text-gray-600 font-medium">
                  <span>Quantity:</span>
                  <span>{quantity} tickets</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-xs sm:text-base font-black text-gray-900">
                  <span>Total Investment:</span>
                  <span className="text-[#E31B23]">{formatTk(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || quantity < 10}
                className="w-full py-3.5 sm:py-4 bg-[#E31B23] hover:bg-[#c9121a] text-white font-extrabold text-xs sm:text-base rounded-2xl transition-all shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50"
              >
                Proceed to Payment ({formatTk(total)}) <ArrowRight size={16} className="shrink-0" />
              </button>
            </form>
          )}
        </div>

        {/* Right Info Box */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
              <RiInformationFill size={18} className="text-[#E31B23]" /> Bulk Purchase Benefits
            </h3>
            <ul className="space-y-3 text-xs text-gray-600 font-medium leading-relaxed">
              <li className="flex items-start gap-2">
                <RiShieldCheckFill size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Commission Capacity Boost:</strong> Your capacity cap increases by <strong>{formatTk(total)}</strong> upon Admin payment approval.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <RiShieldCheckFill size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Platform-wide Earnings:</strong> Receive split shares of ৳200 commission whenever users book at your counter.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Manual Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-gray-900">Bulk Payment Confirmation</h2>
                <p className="text-xs text-gray-500">Order Total: <strong className="text-[#E31B23]">{formatTk(total)}</strong> ({quantity} Tickets)</p>
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
                <RiSmartphoneFill size={16} /> Mobile Banking
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
                <RiWallet3Fill size={16} /> Direct Counter Cash
              </button>
            </div>

            <form onSubmit={handleFinalPaymentSubmit} className="space-y-4">
              {paymentType === 'MOBILE_BANKING' ? (
                <>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
                    <span className="font-bold text-gray-700 block">Admin Send Money Numbers:</span>
                    <div className="flex justify-between items-center text-gray-800 font-mono font-bold bg-white p-2 rounded-xl border border-gray-200">
                      <span>bKash / Nagad / Rocket:</span>
                      <span className="text-[#E31B23] text-sm">01826-110036</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Please send <strong>{formatTk(total)}</strong> to the Admin Send Money number above, then enter your details below.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mobile Banking Provider
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
                      Sender Mobile Number <span className="text-red-500">*</span>
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
                </>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-gray-700 block">Direct Payment Instructions:</span>
                  <p className="text-gray-600 leading-relaxed">
                    Hand over cash or submit bank deposit slip directly to Admin Central Accounts Office.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mt-2 mb-1">
                      Payment Reference / Receipt Notes
                    </label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="e.g. Handed ৳20,000 cash to Central Office Admin on 03 Sep"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#E31B23] hover:bg-[#c9121a] text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Submit Order'
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

