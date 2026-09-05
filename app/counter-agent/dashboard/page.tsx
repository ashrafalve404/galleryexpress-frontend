'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  RiDashboardFill,
  RiStore3Fill,
  RiWallet3Fill,
  RiFundsFill,
  RiShoppingBag3Fill,
  RiAddCircleFill,
  RiErrorWarningFill,
  RiCheckboxCircleFill,
  RiTimeFill,
  RiRefreshLine,
  RiBuilding2Fill,
} from 'react-icons/ri';
import { BsFillTicketPerforatedFill } from 'react-icons/bs';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { counterAgentApi, type DashboardStats } from '@/lib/api/counterAgent';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { getTranslation } from '@/lib/utils/translations';

function formatTk(amount: number) {
  return '৳' + Number(amount).toLocaleString('en-BD');
}

export default function CounterAgentDashboard() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyRefCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Referral code copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

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
          <RiErrorWarningFill className="w-10 h-10 text-[#E31B23] mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Unable to Load Dashboard</h3>
          <p className="text-xs text-red-600 mb-4">{error || 'Something went wrong.'}</p>
          <button
            onClick={loadStats}
            className="w-full py-2.5 bg-[#E31B23] hover:bg-[#c9121a] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <RiRefreshLine size={15} /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { lang } = useLanguageStore();

  const agent = stats?.agent || { id: '', firstName: 'Agent', lastName: '', email: '' };
  const counter = stats?.counter || null;
  const totalTicketsBought = stats?.totalTicketsBought || 0;
  const totalTicketsRemaining = stats?.totalTicketsRemaining || 0;
  const totalInvested = stats?.totalInvested || 0;
  const commissionStats = stats?.commissionStats || {
    totalEarned: 0,
    commissionCap: 0,
    remainingCapacity: 0,
    capReached: false,
    recentCommissions: [],
  };
  const bulkOrders = Array.isArray(stats?.bulkOrders) ? stats.bulkOrders : [];

  const capPct = commissionStats.commissionCap > 0
    ? Math.min((commissionStats.totalEarned / commissionStats.commissionCap) * 100, 100)
    : 0;

  return (
    <div className="p-6 sm:p-8 space-y-8">

        {/* Welcome Header Banner (Dark Card View) */}
        <div className="bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-[#222222] text-white p-5 sm:p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#E31B23]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3 z-10 relative">
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              {getTranslation(lang, 'welcome', 'Welcome')}, {agent?.firstName || 'Agent'}! 👋
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {counter ? (
                <div className="inline-flex items-start gap-2.5 bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-2xl text-xs text-gray-200">
                  <RiStore3Fill size={17} className="text-[#E31B23] shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span className="text-gray-400 font-semibold block sm:inline">{getTranslation(lang, 'assignedCounter', 'Assigned Counter')}: </span>
                    <strong className="text-white font-extrabold">{counter.name}</strong>
                    {counter.location && (
                      <span className="text-gray-300 block sm:inline sm:ml-1 text-[11px] sm:text-xs">
                        ({counter.location})
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold">
                  <RiErrorWarningFill size={16} className="shrink-0 text-amber-400" />
                  <span>You have not selected a counter yet — </span>
                  <Link href="/counter-agent/select-counter" className="underline hover:text-amber-200">
                    Select Counter
                  </Link>
                </div>
              )}

              {agent.referralCode && (
                <div className="inline-flex items-center gap-2 bg-[#E31B23]/10 border border-[#E31B23]/30 px-3.5 py-2 rounded-2xl text-xs font-bold text-white">
                  <span className="text-gray-400 font-medium">{getTranslation(lang, 'referralCode', 'Referral Code')}:</span>
                  <strong className="text-[#E31B23] font-black tracking-wider text-xs sm:text-sm">{agent.referralCode}</strong>
                  <button
                    onClick={() => handleCopyRefCode(agent.referralCode!)}
                    className="p-1 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
                    title="Copy referral code"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3 Quick Action Buttons (Outside Card View) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5">
          <Link
            href="/counter-agent/sell-ticket"
            className="w-full sm:w-auto px-5 py-3.5 sm:py-3 bg-[#E31B23] hover:bg-[#c9121a] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2.5 active:scale-98"
          >
            <BsFillTicketPerforatedFill size={20} /> {getTranslation(lang, 'sellTicket', 'Sell Ticket')}
          </Link>
          <Link
            href="/counter-agent/sold-tickets"
            className="w-full sm:w-auto px-5 py-3.5 sm:py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200/90 font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2.5 active:scale-98"
          >
            <BsFillTicketPerforatedFill size={20} className="text-[#E31B23]" /> {getTranslation(lang, 'mySoldTickets', 'My Sold Tickets')}
          </Link>
          <Link
            href="/counter-agent/buy-bulk"
            className="w-full sm:w-auto px-5 py-3.5 sm:py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200/90 font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2.5 active:scale-98"
          >
            <RiShoppingBag3Fill size={20} className="text-purple-600" /> {getTranslation(lang, 'myBulkOrders', 'My Bulk Orders')}
          </Link>
        </div>

        {/* 5 Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
                {getTranslation(lang, 'totalTicketsBought', 'Total Tickets Bought')}
              </span>
              <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-xl">
                <BsFillTicketPerforatedFill size={19} />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-gray-900">
                {totalTicketsBought}
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">Cumulative bulk quantity</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
                {getTranslation(lang, 'remainingTickets', 'Remaining Tickets')}
              </span>
              <div className="p-1.5 sm:p-2 bg-purple-50 text-purple-600 rounded-xl">
                <BsFillTicketPerforatedFill size={19} />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-purple-700">
                {totalTicketsRemaining}
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">Active bulk allocation</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
                {getTranslation(lang, 'ticketsSold', 'Tickets Sold')}
              </span>
              <div className="p-1.5 sm:p-2 bg-red-50 text-[#E31B23] rounded-xl">
                <BsFillTicketPerforatedFill size={19} />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-[#E31B23]">
                {stats.ticketsSold ?? Math.max(0, totalTicketsBought - totalTicketsRemaining)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">Issued to passengers</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
                {getTranslation(lang, 'commissionEarned', 'Commission Earned')}
              </span>
              <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <RiFundsFill size={19} />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-emerald-600">
                {formatTk(commissionStats.totalEarned)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">Total revenue generated</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
                {getTranslation(lang, 'referralEarnings', 'Referral Earnings')}
              </span>
              <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-xl">
                <RiWallet3Fill size={19} />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-amber-600">
                {formatTk(stats.referralEarnings || 0)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">From {stats.referredCount || 0} referred agent(s)</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
                {getTranslation(lang, 'totalInvested', 'Total Invested')}
              </span>
              <div className="p-1.5 sm:p-2 bg-red-50 text-[#E31B23] rounded-xl">
                <RiWallet3Fill size={19} />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-gray-900">
                {formatTk(totalInvested)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">Max commission cap limit</p>
            </div>
          </div>
        </div>

        {/* Commission Progress Panel */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                <RiWallet3Fill className="text-[#E31B23]" size={22} /> Commission Capacity Tracker
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
                  <RiErrorWarningFill size={15} /> Capacity Cap Reached
                </>
              ) : (
                <>
                  <RiCheckboxCircleFill size={15} /> Commission Active
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
              <RiErrorWarningFill size={18} className="shrink-0 text-amber-600 mt-0.5" />
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
              <BsFillTicketPerforatedFill className="text-[#E31B23]" size={22} /> My Bulk Orders
            </h2>
            <span className="text-xs text-gray-500 font-bold">{bulkOrders.length} total orders</span>
          </div>

          {bulkOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 space-y-3">
              <BsFillTicketPerforatedFill className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-sm font-medium">No bulk ticket orders found.</p>
              <Link
                href="/counter-agent/buy-bulk"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] text-white text-xs font-bold rounded-xl"
              >
                <BsFillTicketPerforatedFill size={16} /> Buy First Bulk Batch
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

