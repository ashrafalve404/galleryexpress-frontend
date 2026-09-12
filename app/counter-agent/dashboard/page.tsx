'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  RiDashboardFill,
  RiStore3Fill,
  RiWallet3Fill,
  RiFundsFill,
  RiStackFill,
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
  const { user, clearAuth } = useAuthStore();
  const { lang } = useLanguageStore();
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

  const agentFullName = agent
    ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim()
    : user?.name || 'Agent';

  return (
    <div className="p-6 sm:p-8 space-y-8">

        {/* Welcome Header Banner (Dark Card View) */}
        <div className="bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-[#222222] text-white p-5 sm:p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#E31B23]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3 z-10 relative">
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              {getTranslation(lang, 'welcome', 'Welcome')}, {agentFullName}! 👋
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
                  <span>{getTranslation(lang, 'noCounterAssigned', 'You have not selected a counter yet —')} </span>
                  <Link href="/counter-agent/select-counter" className="underline hover:text-amber-200">
                    {getTranslation(lang, 'selectCounter', 'Select Counter')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5">
          <Link
            href="/counter-agent/sell-ticket"
            className="w-full sm:w-auto px-6 py-4 sm:py-3.5 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200/90 font-black text-sm sm:text-base rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2.5 active:scale-98"
          >
            <BsFillTicketPerforatedFill size={22} className="text-[#E31B23]" /> {getTranslation(lang, 'sellTicket', 'Sell Ticket')}
          </Link>
          <Link
            href="/counter-agent/buy-bulk"
            className="w-full sm:w-auto px-6 py-4 sm:py-3.5 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200/90 font-black text-sm sm:text-base rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2.5 active:scale-98"
          >
            <RiStackFill size={22} className="text-purple-600" /> {getTranslation(lang, 'buyBulkTicket', 'Buy Bulk Ticket')}
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
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">
                {lang === 'BN' ? 'সর্বমোট কেনা বাল্ক টিকিটের সংখ্যা' : 'Cumulative bulk quantity'}
              </p>
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
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">
                {lang === 'BN' ? 'সক্রিয় বাল্ক টিকিটের স্টক' : 'Active bulk allocation'}
              </p>
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
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">
                {lang === 'BN' ? 'যাত্রীদের ইস্যু করা মোট টিকিট' : 'Issued to passengers'}
              </p>
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
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">
                {lang === 'BN' ? 'সর্বমোট উৎপন্ন আয়' : 'Total revenue generated'}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
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
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">
                {lang === 'BN' ? `${stats.referredCount || 0} জন রেফারকৃত এজেন্ট থেকে` : `From ${stats.referredCount || 0} referred agent(s)`}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Sales Bonus Banner & Target Progress */}
        {stats.monthlySalesBonus && (
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-700/60 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#E31B23] text-white text-[11px] font-black uppercase tracking-wider">
                    {lang === 'BN' ? 'মাসিক সেলস বোনাস' : 'Monthly Sales Bonus'}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">
                    {lang === 'BN' ? 'প্রতি মাসের ১ তারিখে হিসাব করা হয়' : 'Calculated on the 1st of every month'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
                  {lang === 'BN' ? 'আপনার বর্তমান মাসের টিকিট বিক্রি এবং বোনাস টার্গেট' : 'Your Monthly Ticket Sales & Bonus Target Progress'}
                </h2>
              </div>
              <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/10 text-right self-start sm:self-auto">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
                  {lang === 'BN' ? 'চলতি মাসের বিক্রি' : 'Current Month Sales'}
                </span>
                <span className="text-2xl font-black text-amber-400">
                  {stats.monthlySalesBonus.currentMonthTicketsSold} <span className="text-xs text-gray-300 font-normal">{lang === 'BN' ? 'টি টিকিট' : 'tickets'}</span>
                </span>
              </div>
            </div>

            {/* Target Tiers Overview Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className={`p-4 rounded-2xl border transition-all ${
                stats.monthlySalesBonus.currentMonthTicketsSold >= 100
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-gray-300'
              }`}>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1">
                  <span>Target 1</span>
                  {stats.monthlySalesBonus.currentMonthTicketsSold >= 100 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-extrabold text-[9px]">ACHIEVED</span>
                  )}
                </div>
                <div className="text-lg font-black text-white">100 Tickets</div>
                <div className="text-xs font-bold text-emerald-400 mt-1">৳5,000 Bonus</div>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                stats.monthlySalesBonus.currentMonthTicketsSold >= 500
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-gray-300'
              }`}>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1">
                  <span>Target 2</span>
                  {stats.monthlySalesBonus.currentMonthTicketsSold >= 500 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-extrabold text-[9px]">ACHIEVED</span>
                  )}
                </div>
                <div className="text-lg font-black text-white">500 Tickets</div>
                <div className="text-xs font-bold text-emerald-400 mt-1">৳25,000 Bonus</div>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                stats.monthlySalesBonus.currentMonthTicketsSold >= 1000
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-gray-300'
              }`}>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1">
                  <span>Target 3</span>
                  {stats.monthlySalesBonus.currentMonthTicketsSold >= 1000 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-extrabold text-[9px]">ACHIEVED</span>
                  )}
                </div>
                <div className="text-lg font-black text-white">1,000 Tickets</div>
                <div className="text-xs font-bold text-emerald-400 mt-1">৳50,000 Bonus</div>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                stats.monthlySalesBonus.currentMonthTicketsSold >= 5000
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-gray-300'
              }`}>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1">
                  <span>Target 4</span>
                  {stats.monthlySalesBonus.currentMonthTicketsSold >= 5000 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-extrabold text-[9px]">ACHIEVED</span>
                  )}
                </div>
                <div className="text-lg font-black text-white">5,000 Tickets</div>
                <div className="text-xs font-bold text-emerald-400 mt-1">৳250,000 Bonus</div>
              </div>
            </div>

            {/* Next Milestone Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                <span>
                  {lang === 'BN' ? 'পরবর্তী টার্গেটের অগ্রগতি:' : 'Progress to next tier:'} {stats.monthlySalesBonus.currentMonthTicketsSold} / {stats.monthlySalesBonus.nextTierTickets} {lang === 'BN' ? 'টিকিট' : 'tickets'}
                </span>
                <span className="text-amber-400 font-extrabold">{stats.monthlySalesBonus.progressPct}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-[#E31B23] via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.monthlySalesBonus.progressPct}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400">
                {lang === 'BN'
                  ? 'দ্রষ্টব্য: টার্গেট পূরণ না করতে পারলে কোনো বোনাস দেওয়া হবে না। সকল মাসের ১ তারিখে গত মাসের বিক্রির উপর বোনাস বিতরণ করা হয়।'
                  : 'Note: If monthly target is not reached, no bonus is granted. Bonus is calculated & disbursed on the 1st date of each month for the preceding month.'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }


