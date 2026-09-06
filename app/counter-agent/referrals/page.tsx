'use client';

import { useState } from 'react';
import {
  RiFileCopyFill,
  RiCheckFill,
  RiGroupFill,
  RiCoinFill,
  RiAwardFill,
} from 'react-icons/ri';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguageStore } from '@/lib/store/languageStore';

export default function CounterAgentReferralPage() {
  const { user } = useAuthStore();
  const { lang } = useLanguageStore();
  const [copied, setCopied] = useState(false);

  const referralCode =
    (user as any)?.referralCode ||
    (user as any)?.agentCode ||
    `AGENT-${user?.id?.substring(0, 6)?.toUpperCase() || 'C7D202'}`;
  const referralLink = `https://ticketdorkar.xyz/counter-agent/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(lang === 'BN' ? 'রেফারেল লিংক ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {lang === 'BN' ? 'কাউন্টার পার্টনারদের আমন্ত্রণ জানান এবং ক্যাশ বোনাস উপার্জন করুন' : 'Invite Counter Partners & Earn Cash Bonus'}
            </h1>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              {lang === 'BN'
                ? 'অন্যান্য কাউন্টার অপারেটরদের সাথে আপনার রেফারেল লিংক শেয়ার করুন। প্রতিটি নিবন্ধিত ও যাচাইকৃত এজেন্টের জন্য ৫০০ টাকা ইনস্ট্যান্ট বাল্ক ক্রেডিট পান!'
                : 'Share your referral link with other counter operators. Receive ৳500 instant bulk credit for every verified agent that joins!'}
            </p>
          </div>
        </div>

        {/* Referral Link Box */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
            {lang === 'BN' ? 'আপনার রেফারেল লিংক' : 'Your Referral Link'}
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-mono text-xs font-bold text-gray-800 truncate">
              {referralLink}
            </div>
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-5 py-3 bg-[#E31B23] hover:bg-[#c9121a] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
            >
              {copied ? <RiCheckFill size={18} /> : <RiFileCopyFill size={18} />}
              <span>
                {copied
                  ? (lang === 'BN' ? 'কপি সম্পন্ন!' : 'Copied Link!')
                  : (lang === 'BN' ? 'রেফারেল লিংক কপি করুন' : 'Copy Referral Link')}
              </span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-1.5">
              <RiGroupFill size={16} className="text-blue-500" /> {lang === 'BN' ? 'মোট রেফারকৃত এজেন্ট' : 'Total Referred Agents'}
            </div>
            <div className="text-2xl font-black text-gray-900">0 {lang === 'BN' ? 'জন পার্টনার এজেন্ট' : 'Partner Agents'}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-1.5">
              <RiCoinFill size={16} className="text-emerald-500" /> {lang === 'BN' ? 'মোট উপার্জিত বোনাস' : 'Total Bonus Earned'}
            </div>
            <div className="text-2xl font-black text-[#E31B23]">৳ 0</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-1.5">
              <RiAwardFill size={16} className="text-amber-500" /> {lang === 'BN' ? 'কমিশন টায়ার' : 'Commission Tier'}
            </div>
            <div className="text-2xl font-black text-gray-900">{lang === 'BN' ? 'সিলভার এজেন্ট' : 'Silver Agent'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
