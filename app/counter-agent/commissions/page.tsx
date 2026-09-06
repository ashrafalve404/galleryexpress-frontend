'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RiWallet3Fill,
  RiFundsFill,
  RiErrorWarningFill,
  RiCheckboxCircleFill,
  RiTimeFill,
} from 'react-icons/ri';
import { Loader2 } from 'lucide-react';
import { counterAgentApi, type Commission } from '@/lib/api/counterAgent';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    counterAgentApi
      .getCommissions()
      .then(setCommissions)
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
          {getTranslation(lang, 'commissionSubtitle', lang === 'BN' ? 'গ্রাহকদের টিকিট বুকিং থেকে অর্জিত আপনার কমিশন হিসেব' : 'Complete record of your earned split commissions from user ticket bookings')}
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
                  <th className="py-3.5 px-4">{lang === 'BN' ? 'মোট পুল' : 'Total Pool'}</th>
                  <th className="py-3.5 px-4">{lang === 'BN' ? 'এজেন্ট ভাগ' : 'Split'}</th>
                  <th className="py-3.5 px-4">{lang === 'BN' ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3.5 px-6">{lang === 'BN' ? 'তারিখ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-emerald-600 text-sm">
                      {formatTk(c.agentShare)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-700">
                      {formatTk(c.totalCommission)}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500">
                      {c.totalAgents} {lang === 'BN' ? 'জন এজেন্ট' : 'agents'}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
