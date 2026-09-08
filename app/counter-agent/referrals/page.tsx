'use client';

import { useState, useEffect } from 'react';
import {
  RiFileCopyFill,
  RiCheckFill,
  RiGroupFill,
  RiCoinFill,
  RiUser3Fill,
  RiPhoneFill,
  RiMailFill,
  RiCalendarCheckFill,
  RiUserSharedFill,
} from 'react-icons/ri';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { counterAgentApi } from '@/lib/api/counterAgent';
import { formatDate } from '@/lib/utils/date';

interface ReferredAgent {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  status?: string;
}

export default function CounterAgentReferralPage() {
  const { user } = useAuthStore();
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';

  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referredAgents, setReferredAgents] = useState<ReferredAgent[]>([]);
  const [stats, setStats] = useState<{ referredCount: number; referralEarnings: number; referralCode?: string }>({
    referredCount: 0,
    referralEarnings: 0,
  });

  useEffect(() => {
    async function loadReferralData() {
      setLoading(true);
      try {
        const data = await counterAgentApi.getDashboardStats().catch(() => null);
        if (data) {
          setStats({
            referredCount: data.referredCount || 0,
            referralEarnings: data.referralEarnings || 0,
            referralCode: data.agent?.referralCode || (data as any)?.referralCode,
          });
          if (Array.isArray(data.referredAgents)) {
            setReferredAgents(data.referredAgents);
          }
        }
      } catch (e) {
        console.error('Failed to load referral stats:', e);
      } finally {
        setLoading(false);
      }
    }
    loadReferralData();
  }, []);

  const referralCode =
    stats.referralCode ||
    (user as any)?.referralCode ||
    `AG-${user?.id?.substring(0, 6)?.toUpperCase() || 'C7D202'}`;
  const referralLink = `https://ticketdorkar.xyz/counter-agent/register?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success(isBn ? 'রেফারেল লিংক ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans pb-16">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {isBn ? 'কাউন্টার পার্টনারদের আমন্ত্রণ জানান' : 'Invite Counter Partners'}
            </h1>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              {isBn
                ? 'অন্যান্য কাউন্টার অপারেটরদের সাথে আপনার অনন্য রেফারেল লিংক শেয়ার করুন এবং টিকিট দরকার প্ল্যাটফর্মে নতুন এজেন্ট যুক্ত করুন।'
                : 'Share your unique referral link with other counter operators to connect new agents.'}
            </p>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="space-y-2">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider">
              {isBn ? 'আপনার রেফারেল লিংক' : 'Your Referral Link'}
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
                    ? (isBn ? 'লিংক কপি সম্পন্ন!' : 'Copied Link!')
                    : (isBn ? 'লিংক কপি করুন' : 'Copy Link')}
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
              <span>{isBn ? 'মোট রেফারকৃত এজেন্ট' : 'Total Referred Agents'}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {stats.referredCount} <span className="text-sm font-bold text-gray-500">{isBn ? 'জন পার্টনার এজেন্ট' : 'Partner Agents'}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2 flex items-center gap-2">
              <RiCoinFill size={18} className="text-emerald-600" />
              <span>{isBn ? 'মোট উপার্জিত বোনাস' : 'Total Bonus Earned'}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#E31B23] mt-1">
              ৳ {stats.referralEarnings.toLocaleString('en-BD')}
            </div>
          </div>
        </div>

        {/* Detailed Referred Agents List / Table */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                <RiUserSharedFill size={20} className="text-[#E31B23]" />
                {isBn ? 'রেফারকৃত পার্টনার এজেন্ট তালিকা' : 'Referred Partner Agents List'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isBn
                  ? 'আপনার রেফারেল কোডে নিবন্ধিত এজেন্টসমূহ।'
                  : 'Agents registered with your referral code.'}
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#E31B23] bg-red-50 px-3 py-1 rounded-full border border-red-100">
              {referredAgents.length} {isBn ? 'জন এজেন্ট' : 'Agents'}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
              <p className="text-xs text-gray-500 font-bold">
                {isBn ? 'রেফারকৃত এজেন্ট ডাটা লোড হচ্ছে...' : 'Loading referred agent list...'}
              </p>
            </div>
          ) : referredAgents.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <RiGroupFill className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">
                {isBn ? 'এখনো কোনো পার্টনার এজেন্ট যুক্ত হয়নি।' : 'No referred partner agents found yet.'}
              </p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {isBn
                  ? 'আপনার রেফারেল লিংক বা কোড অন্য কাউন্টার অপারেটরদের সাথে শেয়ার করুন।'
                  : 'Share your referral link or code with other counter operators to start building your agent network!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200/80 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-extrabold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-4">{isBn ? 'এজেন্টের নাম' : 'Agent Name'}</th>
                    <th className="py-3.5 px-4">{isBn ? 'ফোন নম্বর' : 'Phone Number'}</th>
                    <th className="py-3.5 px-4 text-center">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="py-3.5 px-4 text-right">{isBn ? 'যোগদানের তারিখ' : 'Joined Date'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {referredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-gray-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-[#E31B23] flex items-center justify-center font-bold text-xs shrink-0">
                          {agent.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <span>{agent.name || 'Partner Agent'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        <span className="flex items-center gap-1.5 text-gray-900">
                          <RiPhoneFill size={14} className="text-gray-400" />
                          {agent.phone || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          agent.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {agent.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-gray-500">
                        {agent.createdAt ? formatDate(agent.createdAt, 'dd MMM yyyy') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
