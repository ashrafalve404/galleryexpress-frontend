'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RiWallet3Fill,
  RiFundsFill,
  RiErrorWarningFill,
  RiCheckboxCircleFill,
  RiTimeFill,
  RiAwardFill,
} from 'react-icons/ri';
import { Loader2, Award, CheckCircle2 } from 'lucide-react';
import { counterAgentApi, type Commission, type DashboardStats } from '@/lib/api/counterAgent';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { getTranslation } from '@/lib/utils/translations';

function formatTk(n: number) {
  return '৳' + Number(n).toLocaleString('en-BD');
}

export default function CommissionsPage() {
  const { clearAuth } = useAuthStore();
  const { lang } = useLanguageStore();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [bonusStats, setBonusStats] = useState<DashboardStats['monthlySalesBonus'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      counterAgentApi.getCommissions(),
      counterAgentApi.getDashboardStats(),
    ])
      .then(([commRes, dashRes]) => {
        setCommissions(commRes);
        setBonusStats(dashRes.monthlySalesBonus || null);
      })
      .catch(() => setError(lang === 'BN' ? 'কমিশন ইতিহাস লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load commission history.'))
      .finally(() => setLoading(false));
  }, [lang]);

  const totalEarned = commissions
    .filter((c) => c.status === 'PENDING' || c.status === 'PAID')
    .reduce((s, c) => s + Number(c.agentShare), 0);
  const pendingCount = commissions.filter((c) => c.status === 'PENDING').length;
  const paidTotal = commissions
    .filter((c) => c.status === 'PAID')
    .reduce((s, c) => s + Number(c.agentShare), 0);

  return (
    <div className="p-6 sm:p-8 space-y-6 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <RiWallet3Fill className="text-[#E31B23]" size={28} />
          {getTranslation(lang, 'commissionTitle', lang === 'BN' ? 'কমিশন লেজার এবং ইতিহাস' : 'Commission Ledger & History')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {getTranslation(lang, 'commissionSubtitle', lang === 'BN' ? 'গ্রাহকদের টিকিট বুকিং এবং সেলস বোনাস থেকে অর্জিত আপনার আয় হিসেব' : 'Complete record of your earned split commissions and monthly sales bonuses')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {lang === 'BN' ? 'মোট কমিশন' : 'Total Commission'}
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {formatTk(totalEarned)}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {lang === 'BN' ? 'পরিশোধিত' : 'Paid Out'}
          </span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {formatTk(paidTotal)}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {lang === 'BN' ? 'অপেক্ষমান এন্ট্রি' : 'Pending Entries'}
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {pendingCount}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {lang === 'BN' ? 'মোট ইভেন্ট' : 'Total Events'}
          </span>
          <div className="text-2xl font-black text-gray-900 mt-1">
            {commissions.length}
          </div>
        </div>
      </div>

      {/* Clean & Simple Monthly Sales Bonus Target Progress */}
      {bonusStats && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-extrabold uppercase">
                  {lang === 'BN' ? 'মাসিক সেলস বোনাস' : 'Monthly Sales Bonus'}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {lang === 'BN' ? 'প্রতি মাসের ১ তারিখে হিসাব করা হয়' : 'Calculated on the 1st of every month'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-1.5 tracking-tight">
                {lang === 'BN' ? 'আপনার বর্তমান মাসের টিকিট বিক্রি এবং বোনাস টার্গেট' : 'Your Monthly Ticket Sales & Bonus Target Progress'}
              </h2>
            </div>
            <div className="bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-200 text-right self-start sm:self-auto">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                {lang === 'BN' ? 'চলতি মাসের বিক্রি' : 'Current Month Sales'}
              </span>
              <span className="text-xl font-black text-gray-900">
                {bonusStats.currentMonthTicketsSold} <span className="text-xs text-gray-500 font-normal">{lang === 'BN' ? 'টি টিকিট' : 'tickets'}</span>
              </span>
            </div>
          </div>

          {/* Target 1 to 4 Clean Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className={`p-4 rounded-2xl border transition-all ${
              bonusStats.currentMonthTicketsSold >= 100
                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                : 'bg-gray-50/60 border-gray-200 text-gray-700'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase text-gray-400 mb-1">
                <span>Target 1</span>
                {bonusStats.currentMonthTicketsSold >= 100 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[9px]">ACHIEVED</span>
                )}
              </div>
              <div className="text-base sm:text-lg font-black text-gray-900">100 Tickets</div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">৳5,000 Bonus</div>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${
              bonusStats.currentMonthTicketsSold >= 500
                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                : 'bg-gray-50/60 border-gray-200 text-gray-700'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase text-gray-400 mb-1">
                <span>Target 2</span>
                {bonusStats.currentMonthTicketsSold >= 500 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[9px]">ACHIEVED</span>
                )}
              </div>
              <div className="text-base sm:text-lg font-black text-gray-900">500 Tickets</div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">৳25,000 Bonus</div>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${
              bonusStats.currentMonthTicketsSold >= 1000
                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                : 'bg-gray-50/60 border-gray-200 text-gray-700'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase text-gray-400 mb-1">
                <span>Target 3</span>
                {bonusStats.currentMonthTicketsSold >= 1000 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[9px]">ACHIEVED</span>
                )}
              </div>
              <div className="text-base sm:text-lg font-black text-gray-900">1,000 Tickets</div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">৳50,000 Bonus</div>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${
              bonusStats.currentMonthTicketsSold >= 5000
                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                : 'bg-gray-50/60 border-gray-200 text-gray-700'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase text-gray-400 mb-1">
                <span>Target 4</span>
                {bonusStats.currentMonthTicketsSold >= 5000 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[9px]">ACHIEVED</span>
                )}
              </div>
              <div className="text-base sm:text-lg font-black text-gray-900">5,000 Tickets</div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">৳250,000 Bonus</div>
            </div>
          </div>

          {/* Simple Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span>
                {lang === 'BN' ? 'পরবর্তী টার্গেটের অগ্রগতি:' : 'Progress to next tier:'} <strong className="text-gray-900">{bonusStats.currentMonthTicketsSold} / {bonusStats.nextTierTickets} {lang === 'BN' ? 'টিকিট' : 'tickets'}</strong>
              </span>
              <span className="text-[#E31B23] font-black">{bonusStats.progressPct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#E31B23] h-full rounded-full transition-all duration-500"
                style={{ width: `${bonusStats.progressPct}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              {lang === 'BN'
                ? 'দ্রষ্টব্য: টার্গেট পূরণ না করতে পারলে কোনো বোনাস দেওয়া হবে না। বোনাস স্বয়ংক্রিয়ভাবে প্রতি মাসের ১ তারিখে গত মাসের বিক্রির উপর হিসাব ও বিতরণ করা হয়।'
                : 'Note: If monthly target is not reached, no bonus is granted. Bonus is calculated & disbursed on the 1st date of each month for the preceding month.'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
          <RiErrorWarningFill size={20} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 pb-2 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
            <RiFundsFill className="text-[#E31B23]" size={20} />
            {lang === 'BN' ? 'লেনদেন ইতিহাস' : 'Transaction History'}
          </h2>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
          </div>
        ) : commissions.length === 0 ? (
          <div className="py-16 text-center text-gray-500 space-y-2">
            <RiWallet3Fill className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-sm font-medium">
              {lang === 'BN' ? 'এখনো কোনো কমিশন তথ্য রেকর্ড হয়নি।' : 'No commission records recorded yet.'}
            </p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {lang === 'BN'
                ? 'আপনার নির্ধারিত কাউন্টার থেকে যাত্রীরা টিকিট বুক করলে কমিশন স্বয়ংক্রিয়ভাবে জমা হবে।'
                : 'Commissions trigger automatically when customers book tickets from your assigned counter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-6">{lang === 'BN' ? 'আপনার অংশ' : 'Your Share'}</th>
                  <th className="py-3.5 px-4">{lang === 'BN' ? 'বিবরণ / ধরণ' : 'Type / Details'}</th>
                  <th className="py-3.5 px-4">{lang === 'BN' ? 'মোট পুল' : 'Total Pool'}</th>
                  <th className="py-3.5 px-4">{lang === 'BN' ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3.5 px-6">{lang === 'BN' ? 'তারিখ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {commissions.map((c) => {
                  const isBonus = c.notes?.toLowerCase().includes('monthly sales bonus') || !c.triggerBooking;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-emerald-600 text-sm">
                        {formatTk(c.agentShare)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {isBonus ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-extrabold text-[10px]">
                            MONTHLY SALES BONUS
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-extrabold text-[10px]">
                            REFERRAL COMMISSION
                          </span>
                        )}
                        {c.notes && <div className="text-[11px] text-gray-500 font-normal mt-0.5">{c.notes}</div>}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-700">
                        {formatTk(c.totalCommission)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            c.status === 'PAID'
                              ? 'bg-blue-100 text-blue-800'
                              : c.status === 'PENDING'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'HELD_UNTIL_DEPARTURE'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.status === 'HELD_UNTIL_DEPARTURE'
                            ? (lang === 'BN' ? 'যাত্রার অপেক্ষায়' : 'Awaiting Departure')
                            : c.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-xs">
                        {new Date(c.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
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
    </div>
  );
}
