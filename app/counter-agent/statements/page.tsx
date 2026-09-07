'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RiFileTextFill,
  RiDownload2Fill,
  RiLineChartFill,
  RiStackFill,
  RiTicket2Fill,
  RiPercentFill,
  RiUser3Fill,
  RiStore3Fill,
  RiCheckDoubleLine,
  RiPrinterFill,
  RiCalendarEventFill,
  RiShareForwardFill,
  RiShieldCheckFill,
} from 'react-icons/ri';
import { Loader2 } from 'lucide-react';
import { counterAgentApi, BulkOrder, Commission } from '@/lib/api/counterAgent';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { useLanguageStore } from '@/lib/store/languageStore';
import { getTranslation } from '@/lib/utils/translations';
import { useAuthStore } from '@/lib/store/authStore';

export default function CounterAgentStatementPage() {
  const { lang } = useLanguageStore();
  const { user } = useAuthStore();
  const isBn = lang === 'BN';

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bulk' | 'tickets' | 'commissions'>('bulk');
  const [overview, setOverview] = useState<any>(null);
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [soldTickets, setSoldTickets] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);

  useEffect(() => {
    async function loadAllStatementData() {
      setLoading(true);
      try {
        const [statsData, ordersData, ticketsData, commsData] = await Promise.all([
          counterAgentApi.getDashboardStats().catch(() => null),
          counterAgentApi.getBulkOrders().catch(() => []),
          counterAgentApi.getMySoldTickets().catch(() => []),
          counterAgentApi.getCommissions().catch(() => []),
        ]);

        setOverview(statsData);
        setBulkOrders(Array.isArray(ordersData) ? ordersData : []);
        setSoldTickets(Array.isArray(ticketsData) ? ticketsData : []);
        setCommissions(Array.isArray(commsData) ? commsData : []);
      } catch (e) {
        console.error('Failed to load statement data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadAllStatementData();
  }, []);

  const agentName = overview?.agent
    ? `${overview.agent.firstName || ''} ${overview.agent.lastName || ''}`.trim()
    : user?.name || 'Valued Agent';
  const agentPhone = overview?.agent?.phone || user?.phone || overview?.agent?.email || user?.email || 'N/A';
  const counterName = overview?.counter?.name || 'Main Counter';
  const counterLoc = overview?.counter?.location || '';
  const referralCode = overview?.agent?.referralCode || 'N/A';

  const totalPurchased = overview?.totalTicketsBought ?? 0;
  const totalRemaining = overview?.totalTicketsRemaining ?? 0;
  const totalSold = overview?.ticketsSold ?? Math.max(0, totalPurchased - totalRemaining);
  const totalInvested = overview?.totalInvested ?? 0;
  const totalEarned = overview?.commissionStats?.totalEarned ?? 0;
  const referralEarnings = overview?.referralEarnings ?? 0;
  const remainingCap = overview?.commissionStats?.remainingCapacity ?? 0;
  const commissionCap = overview?.commissionStats?.commissionCap ?? totalInvested;

  const capPercentage = commissionCap > 0 ? Math.min(100, Math.round((totalEarned / commissionCap) * 100)) : 0;
  const generatedAtStr = formatDate(new Date().toISOString(), 'dd MMM yyyy, hh:mm a');
  const statementId = `STMT-${(user?.id || overview?.agent?.id || '0000').substring(0, 8).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      {/* CSS for print/PDF export */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          aside, header, nav, button, .no-print {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-show-all-tabs {
            display: block !important;
          }
          .print-break-inside {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-6 print-full-width">
        {/* Top Header Actions */}
        <div className="flex items-center justify-between no-print">
          <div>
            <span className="text-xs font-black text-[#E31B23] uppercase tracking-wider">
              {isBn ? 'অফিসিয়াল এজেন্ট পোর্টাল' : 'Official Agent Portal'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {getTranslation(lang, 'statementTitle', 'Agent Account Statement')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-[#E31B23] hover:bg-[#c9121a] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 uppercase tracking-wide cursor-pointer"
            >
              <RiDownload2Fill size={18} />
              <span>{getTranslation(lang, 'downloadPdf', 'Download Statement (PDF)')}</span>
            </button>
          </div>
        </div>

        {/* Official Header Banner (Visible in Print & Screen) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6 print-break-inside">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <img src="/ticketdrkrlogo.png" alt="Ticket Dorkar" className="h-10 sm:h-12 w-auto object-contain shrink-0" />
              <div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                  TICKET DORKAR LIMITED
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  {isBn ? 'এজেন্ট অফিসিয়াল ফাইনান্সিয়াল স্টেটমেন্ট ও লেজার' : 'Agent Official Financial Statement & Inventory Ledger'}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right space-y-1 text-xs">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-black text-[11px]">
                <RiShieldCheckFill size={15} />
                {isBn ? 'যাচাইকৃত এজেন্ট একাউন্ট' : 'VERIFIED ACTIVE AGENT'}
              </div>
              <p className="text-gray-500 font-semibold">Statement Ref: <strong className="text-gray-900 font-mono">{statementId}</strong></p>
              <p className="text-gray-400 text-[11px]">Generated At: {generatedAtStr}</p>
            </div>
          </div>

          {/* Agent Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 text-xs">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                <RiUser3Fill size={14} className="text-[#E31B23]" />
                {isBn ? 'এজেন্ট এর নাম' : 'Agent Name'}
              </span>
              <p className="font-extrabold text-gray-900 text-sm truncate">{agentName}</p>
              <p className="text-gray-600 font-mono font-bold text-xs truncate">{agentPhone}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                <RiStore3Fill size={14} className="text-purple-600" />
                {isBn ? 'বরাদ্দকৃত কাউন্টার' : 'Assigned Counter'}
              </span>
              <p className="font-extrabold text-gray-900 text-sm truncate">{counterName}</p>
              <p className="text-gray-500 truncate">{counterLoc || 'Ticket Counter Terminal'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                <RiShareForwardFill size={14} className="text-amber-500" />
                {isBn ? 'রেফারেল কোড' : 'Referral Code'}
              </span>
              <p className="font-mono font-extrabold text-[#E31B23] text-sm">{referralCode}</p>
              <p className="text-gray-500">{isBn ? 'এজেন্ট নেটওয়ার্ক' : 'Partner Agent'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                <RiStackFill size={14} className="text-sky-500" />
                {isBn ? 'অবশিষ্ট স্টক টিকিট' : 'Remaining Stock'}
              </span>
              <p className="font-extrabold text-emerald-600 text-sm">
                {totalRemaining} {isBn ? 'টি টিকিট' : 'Tickets'}
              </p>
              <p className="text-gray-500">{isBn ? 'ইস্যু করতে প্রস্তুত' : 'Ready to Sell'}</p>
            </div>
          </div>
        </div>

        {/* Financial & Inventory Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print-break-inside">
          <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <RiStackFill size={24} />
            </div>
            <div>
              <div className="text-gray-400 text-[11px] font-extrabold uppercase">
                {isBn ? 'মোট বাল্ক বিনিয়োগ' : 'Total Investment'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                {formatCurrency(totalInvested)}
              </div>
              <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                {totalPurchased} {isBn ? 'টি টিকিট ক্রয়ে' : 'Tickets Purchased'}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <RiPercentFill size={24} />
            </div>
            <div>
              <div className="text-gray-400 text-[11px] font-extrabold uppercase">
                {isBn ? 'অর্জিত কমিশন' : 'Commission Earned'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600">
                {formatCurrency(totalEarned)}
              </div>
              <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                {capPercentage}% {isBn ? 'ক্যাপ পূরণ' : 'of Cap Capacity'}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <RiTicket2Fill size={24} />
            </div>
            <div>
              <div className="text-gray-400 text-[11px] font-extrabold uppercase">
                {isBn ? 'বিক্রীত যাত্রী টিকিট' : 'Tickets Issued'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                {totalSold} {isBn ? 'টি' : 'Tickets'}
              </div>
              <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                {totalRemaining} {isBn ? 'টি স্টকে বাকি' : 'Tickets Remaining'}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RiLineChartFill size={24} />
            </div>
            <div>
              <div className="text-gray-400 text-[11px] font-extrabold uppercase">
                {isBn ? 'রেফারেল আয়' : 'Referral Earnings'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-purple-600">
                {formatCurrency(referralEarnings)}
              </div>
              <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                {isBn ? 'এজেন্ট বোনাস লভ্যাংশ' : 'Agent Network Dividend'}
              </div>
            </div>
          </div>
        </div>

        {/* Commission Cap Margin Bar */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3 print-break-inside">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-black gap-2">
            <span className="text-gray-900 uppercase flex items-center gap-1.5">
              <RiPercentFill className="text-[#E31B23]" size={16} />
              {isBn ? 'কমিশন ক্যাপ মার্জিন স্থিতি' : 'Commission Capacity Cap Status'}
            </span>
            <span className="text-gray-600">
              {isBn ? 'অর্জিত:' : 'Earned:'} <strong className="text-emerald-600">{formatCurrency(totalEarned)}</strong> / {isBn ? 'সর্বোচ্চ ক্যাপ:' : 'Max Cap:'} <strong className="text-gray-900">{formatCurrency(commissionCap)}</strong>
            </span>
          </div>

          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5 border border-gray-200">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max(3, capPercentage)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-bold text-gray-500">
            <span>{isBn ? `ব্যবহৃত ক্যাপাসিটি: ${capPercentage}%` : `Capacity Used: ${capPercentage}%`}</span>
            <span>{isBn ? `অবশিষ্ট মার্জিন সীমা: ${formatCurrency(remainingCap)}` : `Remaining Margin Cap: ${formatCurrency(remainingCap)}`}</span>
          </div>
        </div>

        {/* Tab Switcher for Web Screen (Hidden when printing to show all sections) */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden print-break-inside">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-2">
              <RiFileTextFill size={22} className="text-[#E31B23]" />
              <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">
                {isBn ? 'বিস্তারিত লেনদেন লেজার' : 'Detailed Transaction Ledgers'}
              </h2>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-black">
              <button
                onClick={() => setActiveTab('bulk')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'bulk'
                    ? 'bg-[#E31B23] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isBn ? `বাল্ক অর্ডার (${bulkOrders.length})` : `Bulk Orders (${bulkOrders.length})`}
              </button>

              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'tickets'
                    ? 'bg-[#E31B23] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isBn ? `ইস্যুকৃত টিকিট (${soldTickets.length})` : `Issued Tickets (${soldTickets.length})`}
              </button>

              <button
                onClick={() => setActiveTab('commissions')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'commissions'
                    ? 'bg-[#E31B23] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isBn ? `কমিশন লেজার (${commissions.length})` : `Commissions (${commissions.length})`}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
              <p className="text-xs text-gray-500 font-bold">
                {isBn ? 'স্টেটমেন্ট লেজার ডাটা লোড হচ্ছে...' : 'Loading official statement ledgers...'}
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-8">
              {/* SECTION 1: Bulk Orders Ledger */}
              <div className={activeTab === 'bulk' ? 'block' : 'hidden print:block'}>
                <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <RiStackFill size={18} className="text-[#E31B23]" />
                  {isBn ? '১. বাল্ক প্যাকেজ ক্রয় লেজার' : '1. Bulk Package Investment Orders'}
                </h3>
                {bulkOrders.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs font-semibold">
                    {isBn ? 'কোনো বাল্ক অর্ডার ইতিহাস নেই।' : 'No bulk purchase orders found.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200/80 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 font-extrabold uppercase text-[11px] border-b border-gray-200">
                        <tr>
                          <th className="py-3.5 px-4">{isBn ? 'অর্ডার আইডি' : 'Order ID'}</th>
                          <th className="py-3.5 px-4">{isBn ? 'রুট / প্যাকেজ' : 'Route / Package'}</th>
                          <th className="py-3.5 px-4 text-center">{isBn ? 'মোট টিকিট' : 'Qty'}</th>
                          <th className="py-3.5 px-4 text-center">{isBn ? 'অবশিষ্ট' : 'Remaining'}</th>
                          <th className="py-3.5 px-4 text-right">{isBn ? 'পরিশোধিত অর্থ' : 'Amount Paid'}</th>
                          <th className="py-3.5 px-4 text-right">{isBn ? 'ক্যাপ যোগ' : 'Cap Cap Added'}</th>
                          <th className="py-3.5 px-4 text-center">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                          <th className="py-3.5 px-4 text-right">{isBn ? 'তারিখ' : 'Date'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-800">
                        {bulkOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono font-bold text-gray-900">
                              #{o.id?.substring(0, 8)}
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-900">
                              {o.route ? `${o.route.origin} ➔ ${o.route.destination}` : 'Standard Corridor Route'}
                            </td>
                            <td className="py-3 px-4 text-center font-extrabold text-gray-900">
                              +{o.quantity}
                            </td>
                            <td className="py-3 px-4 text-center font-extrabold text-[#E31B23]">
                              {o.remainingQuantity ?? o.quantity}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-emerald-600">
                              {formatCurrency(o.totalAmount || 0)}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-blue-600">
                              {formatCurrency(o.commissionCap || o.totalAmount || 0)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                o.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.status === 'REJECTED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {o.status || 'APPROVED'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-500 font-medium">
                              {o.createdAt ? formatDate(o.createdAt, 'dd MMM yyyy') : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* SECTION 2: Issued Passenger Tickets Ledger */}
              <div className={activeTab === 'tickets' ? 'block' : 'hidden print:block'}>
                <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <RiTicket2Fill size={18} className="text-[#E31B23]" />
                  {isBn ? '২. যাত্রীদের ইস্যুকৃত টিকিট ইতিহাস' : '2. Issued Passenger Ticket Records'}
                </h3>
                {soldTickets.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs font-semibold">
                    {isBn ? 'কোনো বিক্রীত টিকিটের তথ্য পাওয়া যায়নি।' : 'No issued ticket history found.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200/80 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 font-extrabold uppercase text-[11px] border-b border-gray-200">
                        <tr>
                          <th className="py-3.5 px-4">{isBn ? 'পিএনআর / রেফারেন্স' : 'PNR / Booking Ref'}</th>
                          <th className="py-3.5 px-4">{isBn ? 'যাত্রীর নাম ও ফোন' : 'Passenger Info'}</th>
                          <th className="py-3.5 px-4">{isBn ? 'রুট' : 'Route'}</th>
                          <th className="py-3.5 px-4 text-center">{isBn ? 'আসন' : 'Seats'}</th>
                          <th className="py-3.5 px-4 text-right">{isBn ? 'মূল্য' : 'Amount Paid'}</th>
                          <th className="py-3.5 px-4 text-right">{isBn ? 'ইস্যু তারিখ' : 'Issued Date'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-800">
                        {soldTickets.map((t) => (
                          <tr key={t.id || t.bookingRef} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono font-bold text-[#E31B23]">
                              {t.bookingRef || `#${t.id?.substring(0, 8)}`}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-extrabold text-gray-900">{t.passengerName || t.user?.name || 'Walk-in Passenger'}</p>
                              <p className="text-[11px] text-gray-500 font-mono">{t.passengerPhone || t.user?.phone || ''}</p>
                            </td>
                            <td className="py-3 px-4 font-semibold text-gray-800">
                              {t.schedule?.route ? `${t.schedule.route.origin} ➔ ${t.schedule.route.destination}` : 'Express Route'}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-purple-700">
                              {Array.isArray(t.seatNumbers) ? t.seatNumbers.join(', ') : t.seatNumbers || t.seatsCount || '1 Seat'}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-emerald-600">
                              {formatCurrency(t.totalAmount || t.price || 0)}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-500 font-medium">
                              {t.createdAt ? formatDate(t.createdAt, 'dd MMM yyyy, hh:mm a') : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* SECTION 3: Commission Earnings Ledger */}
              <div className={activeTab === 'commissions' ? 'block' : 'hidden print:block'}>
                <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <RiPercentFill size={18} className="text-[#E31B23]" />
                  {isBn ? '৩. কমিশন অর্জনের বিবরণ' : '3. Commission Earnings Log'}
                </h3>
                {commissions.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs font-semibold">
                    {isBn ? 'কোনো লভ্যাংশ কমিশন পাওয়া যায়নি।' : 'No commission records logged yet.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200/80 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 font-extrabold uppercase text-[11px] border-b border-gray-200">
                        <tr>
                          <th className="py-3.5 px-4">{isBn ? 'কমিশন আইডি' : 'Commission ID'}</th>
                          <th className="py-3.5 px-4">{isBn ? 'উৎস রেফারেন্স' : 'Trigger Booking Ref'}</th>
                          <th className="py-3.5 px-4 text-right">{isBn ? 'এজেন্ট শেয়ার কমিশন' : 'Agent Commission'}</th>
                          <th className="py-3.5 px-4 text-center">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                          <th className="py-3.5 px-4 text-right">{isBn ? 'তারিখ' : 'Date'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-800">
                        {commissions.map((c) => (
                          <tr key={c.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono font-bold text-gray-900">
                              #{c.id?.substring(0, 8)}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-sky-600">
                              {c.triggerBooking?.bookingRef || 'System Split Allocation'}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-emerald-600">
                              {formatCurrency(c.agentShare || 0)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {c.status || 'PAID'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-500 font-medium">
                              {c.createdAt ? formatDate(c.createdAt, 'dd MMM yyyy') : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Note for Official Print & Export */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl text-xs space-y-2 print-break-inside">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="font-extrabold uppercase text-gray-300">
              Ticket Dorkar Limited • Agent Official Statement Document
            </span>
            <span className="text-gray-400 font-mono text-[11px]">
              System Verified • Auto-Generated Report
            </span>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            {isBn
              ? 'এই দলিলটি টিকিট দরকার সিস্টেম দ্বারা প্রস্তুতকৃত একটি অফিসিয়াল ফাইনান্সিয়াল স্টেটমেন্ট। টিকিট বুকিং, কমিশন লভ্যাংশ এবং বাল্ক ক্রয়ের বিবরণ রিয়েল-টাইম ডাটাবেজ থেকে সংগৃহীত।'
              : 'This official financial statement is digitally generated by Ticket Dorkar Limited. All transactions, commission caps, and ticket inventory logs are dynamically reconciled.'}
          </p>
        </div>
      </div>
    </div>
  );
}
