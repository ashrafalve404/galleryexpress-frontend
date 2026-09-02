'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Ticket,
  Store,
  Wallet,
  TrendingUp,
  Package,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  Loader2,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { counterAgentApi, type DashboardStats } from '@/lib/api/counterAgent';
import { useAuthStore } from '@/lib/store/authStore';

function formatTk(amount: number) {
  return '৳' + Number(amount).toLocaleString('en-BD');
}

export default function CounterAgentDashboard() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    try {
      setError('');
      const data = await counterAgentApi.getDashboardStats();
      setStats(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load counter agent stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const handleLogout = () => {
    clearAuth();
    router.push('/counter-agent/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-sans gap-3">
        <Loader2 className="w-10 h-10 text-[#E31B23] animate-spin" />
        <p className="text-sm font-semibold text-gray-600">Loading Agent Portal...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-sans p-4 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-md w-full">
          <AlertCircle className="w-10 h-10 text-[#E31B23] mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Unable to Load Dashboard</h3>
          <p className="text-xs text-red-600 mb-4">{error || 'Something went wrong.'}</p>
          <button
            onClick={loadStats}
            className="w-full py-2.5 bg-[#E31B23] hover:bg-[#c9121a] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const {
    agent,
    counter,
    totalTicketsBought,
    totalTicketsRemaining,
    totalInvested,
    commissionStats,
    bulkOrders,
  } = stats;

  const capPct = commissionStats.commissionCap > 0
    ? Math.min((commissionStats.totalEarned / commissionStats.commissionCap) * 100, 100)
    : 0;

  return (
    <div className="p-6 sm:p-8 space-y-8">

        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-[#222222] text-white p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#E31B23]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Welcome, {agent.firstName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              {counter ? (
                <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                  <Store size={15} className="text-[#E31B23]" /> Assigned Counter:{' '}
                  <strong className="text-white">{counter.name}</strong>
                  {counter.location && ` (${counter.location})`}
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <AlertCircle size={15} /> You have not selected a counter yet —{' '}
                  <Link href="/counter-agent/select-counter" className="underline hover:text-amber-300">
                    Select Counter Now
                  </Link>
                </span>
              )}
            </p>
          </div>

          <Link
            href="/counter-agent/buy-bulk"
            className="shrink-0 px-6 py-3.5 bg-[#E31B23] hover:bg-[#c9121a] text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg hover:shadow-red-600/30 flex items-center gap-2"
          >
            <PlusCircle size={18} /> Buy Bulk Tickets
          </Link>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Tickets Bought
              </span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Ticket size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900">
                {totalTicketsBought}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Cumulative bulk quantity</p>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Remaining Tickets
              </span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Package size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-purple-700">
                {totalTicketsRemaining}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Active bulk allocation</p>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Commission Earned
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                {formatTk(commissionStats.totalEarned)}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Total revenue generated</p>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Invested
              </span>
              <div className="p-2 bg-red-50 text-[#E31B23] rounded-xl">
                <Wallet size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900">
                {formatTk(totalInvested)}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Max commission cap limit</p>
            </div>
          </div>
        </div>

        {/* Commission Progress Panel */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Wallet className="text-[#E31B23]" size={20} /> Commission Capacity Tracker
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Commission is capped at your cumulative bulk ticket investment amount.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full ${
                commissionStats.capReached
                  ? 'bg-red-100 text-red-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {commissionStats.capReached ? (
                <>
                  <AlertCircle size={14} /> Capacity Cap Reached
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Commission Active
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold uppercase text-gray-500">Earned So Far</span>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                {formatTk(commissionStats.totalEarned)}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold uppercase text-gray-500">Max Cap</span>
              <div className="text-2xl font-extrabold text-gray-900 mt-1">
                {formatTk(commissionStats.commissionCap)}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold uppercase text-gray-500">Remaining Margin</span>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">
                {formatTk(commissionStats.remainingCapacity)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  commissionStats.capReached
                    ? 'bg-red-600'
                    : 'bg-gradient-to-r from-[#E31B23] to-red-500'
                }`}
                style={{ width: `${capPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-500">
              <span>{capPct.toFixed(1)}% Capacity Used</span>
              <span>{formatTk(commissionStats.remainingCapacity)} Remaining Capacity</span>
            </div>
          </div>

          {commissionStats.capReached && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Action Required:</strong> Your commission capacity limit has been reached. Purchase more bulk tickets to increase your investment cap and continue earning ৳200 commissions on bookings.
              </div>
            </div>
          )}
        </div>

        {/* Bulk Orders Table */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 pb-2 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Ticket className="text-[#E31B23]" size={20} /> My Bulk Orders
            </h2>
            <span className="text-xs text-gray-500 font-bold">{bulkOrders.length} total orders</span>
          </div>

          {bulkOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 space-y-3">
              <Ticket className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-sm font-medium">No bulk ticket orders found.</p>
              <Link
                href="/counter-agent/buy-bulk"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] text-white text-xs font-bold rounded-xl"
              >
                <PlusCircle size={15} /> Buy First Bulk Batch
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-6">Route</th>
                    <th className="py-3.5 px-4">Qty</th>
                    <th className="py-3.5 px-4">Remaining</th>
                    <th className="py-3.5 px-4">Invested</th>
                    <th className="py-3.5 px-4">Earned</th>
                    <th className="py-3.5 px-4">Cap</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {bulkOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {order.route?.origin ?? '—'} → {order.route?.destination ?? '—'}
                      </td>
                      <td className="py-4 px-4 font-semibold">{order.quantity}</td>
                      <td className="py-4 px-4 font-semibold text-purple-700">
                        {order.remainingQuantity}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {formatTk(order.totalAmount)}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-emerald-600">
                        {formatTk(order.commissionEarned ?? 0)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-600">
                        {formatTk(order.commissionCap ?? order.totalAmount)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            order.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

