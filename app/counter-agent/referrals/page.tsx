'use client';

import { useState, useEffect } from 'react';
import {
  RiFileCopyFill,
  RiCheckFill,
  RiGroupFill,
  RiCoinFill,
} from 'react-icons/ri';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { counterAgentApi } from '@/lib/api/counterAgent';

export default function CounterAgentReferralPage() {
  const { user } = useAuthStore();
  const { lang } = useLanguageStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [stats, setStats] = useState<{ referredCount: number; referralEarnings: number; referralCode?: string }>({
    referredCount: 0,
    referralEarnings: 0,
  });

  useEffect(() => {
    counterAgentApi
      .getDashboardStats()
      .then((data) => {
        setStats({
          referredCount: data?.referredCount || 0,
          referralEarnings: data?.referralEarnings || 0,
          referralCode: data?.agent?.referralCode || (data as any)?.referralCode,
        });
      })
      .catch(() => {});
  }, []);

  const referralCode =
    stats.referralCode ||
    (user as any)?.referralCode ||
    `AG-${user?.id?.substring(0, 6)?.toUpperCase() || 'C7D202'}`;
  const referralLink = `https://ticketdorkar.xyz/counter-agent/register?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success(lang === 'BN' ? 'রেফারেল লিংক ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast.success(lang === 'BN' ? 'রেফারেল কোড ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Referral code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {lang === 'BN' ? 'কাউন্টার পার্টনারদের আমন্ত্রণ জানান' : 'Invite Counter Partners'}
            </h1>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              {lang === 'BN'
                ? 'অন্যান্য কাউন্টার অপারেটরদের সাথে আপনার অনন্য রেফারেল লিংক ও রেফারেল কোড শেয়ার করুন এবং টিকিট দরকার প্ল্যাটফর্মে এজেন্ট যুক্ত করুন।'
                : 'Share your unique referral link and referral code with other counter operators to connect new agents.'}
            </p>
          </div>
        </div>

        {/* Referral Code & Link Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          {/* Referral Code Box */}
          <div className="space-y-2">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider">
              {lang === 'BN' ? 'আপনার রেফারেল কোড' : 'Your Referral Code'}
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full bg-red-50 border border-red-200 px-4 py-3 rounded-xl font-mono text-base sm:text-lg font-black text-[#E31B23] tracking-widest text-center sm:text-left select-all">
                {referralCode}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="w-full sm:w-auto px-5 py-3.5 bg-gray-900 hover:bg-black text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
              >
                {copiedCode ? <RiCheckFill size={18} /> : <RiFileCopyFill size={18} />}
                <span>
                  {copiedCode
                    ? (lang === 'BN' ? 'কোড কপি সম্পন্ন!' : 'Copied Code!')
                    : (lang === 'BN' ? 'কোড কপি করুন' : 'Copy Code')}
                </span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Referral Link Box */}
          <div className="space-y-2">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider">
              {lang === 'BN' ? 'আপনার রেফারেল লিংক' : 'Your Referral Link'}
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-mono text-xs font-bold text-gray-800 truncate select-all">
                {referralLink}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-5 py-3.5 bg-[#E31B23] hover:bg-[#c9121a] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
              >
                {copiedLink ? <RiCheckFill size={18} /> : <RiFileCopyFill size={18} />}
                <span>
                  {copiedLink
                    ? (lang === 'BN' ? 'লিংক কপি সম্পন্ন!' : 'Copied Link!')
                    : (lang === 'BN' ? 'লিংক কপি করুন' : 'Copy Link')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Referral Stats Grid (2 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2 flex items-center gap-2">
              <RiGroupFill size={18} className="text-blue-600" />
              <span>{lang === 'BN' ? 'মোট রেফারকৃত এজেন্ট' : 'Total Referred Agents'}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {stats.referredCount} <span className="text-sm font-bold text-gray-500">{lang === 'BN' ? 'জন পার্টনার এজেন্ট' : 'Partner Agents'}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2 flex items-center gap-2">
              <RiCoinFill size={18} className="text-emerald-600" />
              <span>{lang === 'BN' ? 'মোট উপার্জিত বোনাস' : 'Total Bonus Earned'}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#E31B23] mt-1">
              ৳ {stats.referralEarnings.toLocaleString('en-BD')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
