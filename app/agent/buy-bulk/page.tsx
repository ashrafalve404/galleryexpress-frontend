'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { agentPurchaseBulkQuota, agentGetKycDetails, type AgentKycDetails } from '@/lib/api/agent';
import { getRoutes, type Route } from '@/lib/api/routes';
import { RiShoppingBag3Fill, RiShieldCheckFill, RiAlertFill, RiArrowRightLine, RiInformationFill } from 'react-icons/ri';
import { HiExclamationCircle } from 'react-icons/hi';
import Link from 'next/link';

export default function AgentBuyBulkPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [routeId, setRouteId] = useState('');
  const [quantity, setQuantity] = useState<number>(50);
  const [unitPrice, setUnitPrice] = useState<number>(1000);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [showKycModal, setShowKycModal] = useState(false);

  const { data: kycData } = useQuery<AgentKycDetails>({
    queryKey: ['agent-kyc-details'],
    queryFn: agentGetKycDetails,
  });

  const isVerified = kycData?.kycStatus === 'VERIFIED';

  const { data: routes, isLoading: routesLoading } = useQuery<Route[]>({
    queryKey: ['agent-routes'],
    queryFn: () => getRoutes(),
  });

  const mutation = useMutation({
    mutationFn: agentPurchaseBulkQuota,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-stats'] });
      queryClient.invalidateQueries({ queryKey: ['agent-bulk-orders'] });
      router.push('/agent/my-quotas');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to purchase bulk quota');
    },
  });

  const totalAmount = (quantity || 0) * (unitPrice || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check KYC status
    if (!isVerified) {
      setShowKycModal(true);
      return;
    }

    if (!routeId) {
      setError('Please select a route for bulk purchase');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (unitPrice <= 0) {
      setError('Unit price must be greater than 0');
      return;
    }

    mutation.mutate({
      routeId,
      quantity,
      unitPrice,
      notes,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#111111]">Buy Ticket Package</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">
          Buy tickets in advance at discounted rates without picking travel dates or seats right now.
        </p>
      </div>

      {/* KYC Warning Banner if not verified */}
      {!isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <RiAlertFill size={24} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-black text-amber-900 text-sm">Account Verification Needed</div>
              <p className="text-amber-700 font-medium leading-relaxed">
                Your agent account status is <strong>{kycData?.kycStatus || 'NOT_SUBMITTED'}</strong>. Buying ticket packages is locked until your NID & Counter details are verified by admin.
              </p>
            </div>
          </div>
          <Link
            href="/agent/verification"
            className="inline-flex items-center justify-center gap-1.5 bg-[#E31B23] hover:bg-[#C41920] text-white font-black px-4 py-2.5 rounded-xl text-xs shrink-0 transition-colors shadow-xs"
          >
            <RiShieldCheckFill size={16} /> Verify Account Now →
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <HiExclamationCircle size={18} className="shrink-0 text-[#E31B23]" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Route Selector */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            Select Bus Route *
          </label>
          <select
            required
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
          >
            <option value="">-- Select Bus Route --</option>
            {routes?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.origin} → {r.destination} ({r.distanceKm} km)
              </option>
            ))}
          </select>
        </div>

        {/* Quantity & Unit Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Number of Tickets *
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder="e.g. 50"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Price Per Ticket (৳) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 1000"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
            />
          </div>
        </div>

        {/* Purchase Summary Box */}
        <div className="bg-[#111111] text-white rounded-2xl p-5 space-y-2.5 shadow-lg border border-gray-800">
          <div className="flex justify-between items-center text-xs font-medium text-gray-400">
            <span>Ticket Package Quota:</span>
            <span className="font-bold text-white">{quantity} Tickets</span>
          </div>
          <div className="flex justify-between items-center text-xs font-medium text-gray-400">
            <span>Agent Rate Per Ticket:</span>
            <span className="font-bold text-white">৳{unitPrice.toLocaleString()}</span>
          </div>
          <div className="pt-2.5 border-t border-gray-800 flex justify-between items-center text-sm font-black text-[#E31B23]">
            <span>Total Purchase Cost:</span>
            <span className="text-xl font-black text-white">৳{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            Order Reference / Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Eid Pre-Booking Quota for ABC Travels"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-[#E31B23] hover:bg-[#C41920] text-white font-black py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
        >
          <RiShoppingBag3Fill size={18} />
          {mutation.isPending ? 'Processing Purchase...' : `Confirm Bulk Purchase (৳${totalAmount.toLocaleString()})`}
        </button>
      </form>

      {/* KYC Warning Popup Modal Interceptor */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-100 shadow-2xl space-y-5 animate-fade-in-up">
            <div className="text-center pb-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-black mx-auto mb-3">
                <RiAlertFill size={32} />
              </div>
              <h2 className="text-xl font-black text-[#111111]">KYC Verification Required</h2>
              <p className="text-xs text-gray-500 font-semibold mt-1.5 leading-relaxed">
                Your agent account status is <strong>{kycData?.kycStatus || 'NOT_SUBMITTED'}</strong>. You cannot purchase bulk ticket quotas until your National ID (NID) and Counter details are verified by company administration.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 text-xs text-amber-800 font-medium flex items-center gap-1.5">
              <RiInformationFill className="shrink-0 text-amber-600" size={18} />
              <span>Please go to <strong>Verify Account (NID)</strong> to submit your NID Front & Back photos and Counter location.</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowKycModal(false);
                  router.push('/agent/verification');
                }}
                className="flex-1 bg-[#E31B23] hover:bg-[#C41920] text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <RiShieldCheckFill size={18} /> Go to KYC Verification
              </button>
              <button
                onClick={() => setShowKycModal(false)}
                className="px-4 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
