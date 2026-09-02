'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Ticket,
  LayoutDashboard,
  Store,
  Wallet,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  ArrowRight,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { counterAgentApi, type AllowedRoute } from '@/lib/api/counterAgent';
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

  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 10) {
      setError('Minimum bulk order quantity is 10 tickets.');
      return;
    }
    if (!routeId) {
      setError('Please select an eligible route.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const order = await counterAgentApi.buyBulkTickets(routeId, quantity);
      setSuccess(
        `Successfully purchased ${order.quantity} bulk tickets! Your commission capacity cap increased by ${formatTk(
          Number(order.totalAmount),
        )}.`,
      );
      setTimeout(() => router.push('/counter-agent/dashboard'), 2500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to complete bulk ticket purchase.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/counter-agent/login');
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Ticket className="text-[#E31B23]" size={28} /> Buy Bulk Tickets
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Purchase minimum 10 tickets for Dhaka ↔ Cox&apos;s Bazar route at fixed ৳2,000 unit price
          </p>
        </div>

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Order Completed!</strong> {success}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Purchase Failed:</strong> {error}
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Select Corridor Route
                  </label>
                  <select
                    value={routeId}
                    onChange={(e) => setRouteId(e.target.value)}
                    className="w-full p-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm font-semibold focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20 outline-none"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.origin} → {r.destination} (৳2,000 / Ticket)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Ticket Quantity <span className="text-red-500 font-normal">(Minimum 10 tickets)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(10, q - 10))}
                      className="p-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-gray-700 font-bold transition-all"
                    >
                      <Minus size={18} />
                    </button>
                    <input
                      type="number"
                      min={10}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(10, parseInt(e.target.value) || 10))
                      }
                      className="w-32 py-3 bg-gray-50 border border-gray-300 rounded-xl text-center text-lg font-black text-gray-900 focus:border-[#E31B23] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 10)}
                      className="p-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-gray-700 font-bold transition-all"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 font-medium">
                    <span>Unit Price:</span>
                    <span>৳2,000 / ticket</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 font-medium">
                    <span>Quantity:</span>
                    <span>{quantity} tickets</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-black text-gray-900">
                    <span>Total Investment:</span>
                    <span className="text-[#E31B23]">{formatTk(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || quantity < 10}
                  className="w-full py-4 bg-[#E31B23] hover:bg-[#c9121a] text-white font-extrabold text-base rounded-2xl transition-all shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> Processing Purchase...
                    </>
                  ) : (
                    <>
                      Confirm Bulk Order ({formatTk(total)}) <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Info Box */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Info size={16} className="text-[#E31B23]" /> Bulk Purchase Benefits
              </h3>
              <ul className="space-y-3 text-xs text-gray-600 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Commission Capacity Boost:</strong> Your capacity cap increases by <strong>{formatTk(total)}</strong> upon confirmation.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Platform-wide Earnings:</strong> Receive split shares of ৳200 commission whenever users book at your counter.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
    </div>
  );
}

