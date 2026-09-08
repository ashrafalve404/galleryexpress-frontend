'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import Link from 'next/link';
import {
  RiUser3Fill,
  RiShieldCheckFill,
  RiMailFill,
  RiPhoneFill,
  RiBuildingFill,
  RiCheckboxCircleFill,
  RiTimeFill,
  RiErrorWarningFill,
  RiUploadCloud2Fill,
  RiArrowRightSLine,
  RiLock2Fill,
  RiSave3Fill,
  RiKey2Fill,
} from 'react-icons/ri';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { counterAgentApi, type AgentKycStatus, type DashboardStats } from '@/lib/api/counterAgent';

export default function CounterAgentProfilePage() {
  const { user, accessToken, refreshToken, setAuth } = useAuthStore();
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';

  const [kycStatus, setKycStatus] = useState<AgentKycStatus | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [kycData, statsData] = await Promise.all([
          counterAgentApi.getKycStatus().catch(() => null),
          counterAgentApi.getDashboardStats().catch(() => null),
        ]);
        if (kycData) setKycStatus(kycData);
        if (statsData) setStats(statsData);

        // Pre-fill profile fields
        const agentFullName = statsData?.agent
          ? `${statsData.agent.firstName || ''} ${statsData.agent.lastName || ''}`.trim()
          : user?.name || '';
        setName(agentFullName || user?.name || '');
        setEmail(statsData?.agent?.email || user?.email || '');
      } catch (e) {
        console.error('Failed to load profile details:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(isBn ? 'অনুগ্রহ করে আপনার নাম লিখুন' : 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      toast.error(isBn ? 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা লিখুন' : 'Please enter a valid email address');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        toast.error(isBn ? 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে' : 'New password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error(isBn ? 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না' : 'New password and confirm password do not match');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: { name: string; email: string; currentPassword?: string; newPassword?: string } = {
        name: name.trim(),
        email: email.trim(),
      };

      if (newPassword) {
        if (currentPassword) payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await counterAgentApi.updateProfile(payload);

      // Update Zustand Auth Store
      if (user && accessToken && refreshToken) {
        setAuth(
          {
            ...user,
            name: res.user.name || name.trim(),
            email: res.user.email || email.trim(),
          },
          accessToken,
          refreshToken
        );
      }

      toast.success(isBn ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || (isBn ? 'প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে' : 'Failed to update profile');
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const kycState = kycStatus?.kycStatus || 'NOT_SUBMITTED';
  const assignedCounterName = stats?.counter?.name || (user as any)?.counter?.name || (isBn ? 'কোনো কাউন্টার নির্ধারিত নেই' : 'No Counter Assigned');
  const agentPhone = stats?.agent?.phone || user?.phone || 'Fixed Account Phone';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans pb-16">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Action Header */}
        <div className="flex justify-end">
          <Link
            href="/counter-agent/kyc"
            className="inline-flex items-center gap-1.5 text-xs font-black text-[#E31B23] bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-100 shadow-2xs transition-colors"
          >
            <RiShieldCheckFill size={16} /> {isBn ? 'কেওয়াইসি ভেরিফিকেশন সেন্টার' : 'KYC Verification Center'}
          </Link>
        </div>

        {/* Profile Banner Card */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#E31B23] text-white flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
              {name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'A'}
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900">{name || user?.name || (isBn ? 'কাউন্টার এজেন্ট' : 'Counter Agent')}</h1>
                {kycState === 'VERIFIED' ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <RiCheckboxCircleFill size={14} /> {isBn ? 'যাচাইকৃত এজেন্ট' : 'Verified Agent'}
                  </span>
                ) : kycState === 'PENDING' ? (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <RiTimeFill size={14} /> {isBn ? 'কেওয়াইসি পর্যালোচনায়' : 'KYC Pending'}
                  </span>
                ) : (
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <RiErrorWarningFill size={14} /> {isBn ? 'কেওয়াইসি আবশ্যক' : 'KYC Required'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {isBn ? 'অফিসিয়াল আন্তঃজেলা টিকিট বিক্রি পার্টনার · টিকিট দরকার' : 'Official Intercity Ticket Selling Partner · Ticket Dorkar'}
              </p>
              <div className="text-xs font-mono text-gray-400 font-semibold pt-1">
                {isBn ? 'এজেন্ট আইডি:' : 'Agent ID:'} <span className="text-gray-800 font-bold">{user?.id?.substring(0, 8) || 'AGT-8492'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Verification Card */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <RiShieldCheckFill size={20} className="text-[#E31B23]" /> {isBn ? 'পরিচয় ও এনআইডি ভেরিফিকেশন (KYC)' : 'Identity & NID Verification (KYC)'}
            </h2>
            <Link
              href="/counter-agent/kyc"
              className="text-xs font-bold text-[#E31B23] hover:underline flex items-center gap-1"
            >
              {isBn ? 'ফর্ম খুলুন' : 'Open Form'} <RiArrowRightSLine size={16} />
            </Link>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-black text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                {isBn ? 'স্ট্যাটাস:' : 'Status:'}
                {kycState === 'VERIFIED' ? (
                  <span className="text-emerald-700 font-bold">{isBn ? 'অনুমোদিত ও সম্পূর্ণভাবে যাচাইকৃত' : 'Approved & Fully Verified'}</span>
                ) : kycState === 'PENDING' ? (
                  <span className="text-amber-700 font-bold">{isBn ? 'ডকুমেন্ট জমা হয়েছে (পর্যালোচনাধীন)' : 'Documents Submitted (Under Review)'}</span>
                ) : kycState === 'REJECTED' ? (
                  <span className="text-rose-700 font-bold">{isBn ? `বাতিলকৃত (${kycStatus?.kycRejectReason || 'এনআইডি পুনরায় দিন'})` : `Rejected (${kycStatus?.kycRejectReason || 'Please resubmit NID'})`}</span>
                ) : (
                  <span className="text-gray-600 font-bold">{isBn ? 'এনআইডি ডকুমেন্ট জমা দেওয়া হয়নি' : 'NID Documents Not Submitted'}</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                {kycStatus?.nidNumber
                  ? (isBn ? `জমা প্রদানকৃত এনআইডি: ${kycStatus.nidNumber}` : `Submitted NID: ${kycStatus.nidNumber}`)
                  : (isBn ? 'উচ্চতর টিকিট সীমার জন্য সরকারি এনআইডি আপলোড আবশ্যক।' : 'Government NID document upload is required for high bulk ticket limits.')}
              </p>
            </div>

            <Link
              href="/counter-agent/kyc"
              className="w-full sm:w-auto px-4 py-2.5 bg-[#E31B23] hover:bg-[#c9121a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
            >
              <RiUploadCloud2Fill size={16} />
              <span>{kycState === 'VERIFIED' ? (isBn ? 'কেওয়াইসি বিবরণ দেখুন' : 'View KYC Specs') : (isBn ? 'এনআইডি ফাইল আপলোড করুন' : 'Submit NID Documents')}</span>
            </Link>
          </div>
        </div>

        {/* Editable Profile & Security Form */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <RiUser3Fill size={20} className="text-[#E31B23]" />
                {isBn ? 'প্রোফাইল সম্পাদনা ও নিরাপত্তা সেটিংস' : 'Edit Agent Profile & Security'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isBn
                  ? 'আপনার নাম, ইমেইল এবং সিকিউরিটি পাসওয়ার্ড যে কোনো সময় আপডেট করতে পারবেন।'
                  : 'Update your name, email address, and account password anytime.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Agent Full Name (Editable) */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-gray-800 flex items-center gap-1.5">
                <RiUser3Fill size={15} className="text-gray-400" />
                {isBn ? 'পূর্ণ নাম' : 'Full Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isBn ? 'আপনার পূর্ণ নাম লিখুন' : 'Enter your full name'}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                required
              />
            </div>

            {/* Email Address (Editable) */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-gray-800 flex items-center gap-1.5">
                <RiMailFill size={15} className="text-gray-400" />
                {isBn ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isBn ? 'আপনার ইমেইল ঠিকানা লিখুন' : 'Enter your email address'}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                required
              />
            </div>

            {/* Phone Number (NON-EDITABLE / LOCKED) */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-gray-800 flex items-center gap-1.5">
                  <RiPhoneFill size={15} className="text-gray-400" />
                  {isBn ? 'ফোন নম্বর (ফিক্সড একাউন্ট আইডি)' : 'Phone Number (Fixed Account ID)'}
                </label>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                  <RiLock2Fill size={12} /> {isBn ? 'পরিবর্তনযোগ্য নয়' : 'Non-Editable Field'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={agentPhone}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-mono font-black text-slate-700 cursor-not-allowed select-none"
                />
                <RiLock2Fill className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
              <p className="text-[11px] text-gray-400 font-medium pt-0.5">
                {isBn
                  ? 'নিরাপত্তা সংক্রান্ত কারণে ফোন নম্বর স্থায়ীভাবে আপনার এজেন্ট আইডির সাথে নিবন্ধিত এবং এটি পরিবর্তন করা যাবে না।'
                  : 'For security verification, your phone number is permanently bound to your agent account and cannot be changed.'}
              </p>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-wide">
              <RiKey2Fill size={18} className="text-[#E31B23]" />
              {isBn ? 'পাসওয়ার্ড পরিবর্তন (ঐচ্ছিক)' : 'Change Account Password (Optional)'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">
                  {isBn ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={isBn ? 'বর্তমান পাসওয়ার্ড' : 'Current password'}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:border-[#E31B23]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">
                  {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isBn ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New password (min 6 chars)'}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:border-[#E31B23]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">
                  {isBn ? 'কনফার্ম পাসওয়ার্ড' : 'Confirm Password'}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isBn ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন' : 'Confirm new password'}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:border-[#E31B23]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#E31B23] hover:bg-[#c9121a] disabled:bg-gray-400 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-wider cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RiSave3Fill size={18} />}
              <span>{saving ? (isBn ? 'সেভ হচ্ছে...' : 'Saving Changes...') : (isBn ? 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন' : 'Save Profile Changes')}</span>
            </button>
          </div>
        </form>

        {/* Assigned Counter Information Card */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <RiBuildingFill size={20} className="text-[#E31B23]" /> {isBn ? 'নির্ধারিত কাউন্টার স্থান' : 'Assigned Counter Location'}
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-extrabold text-gray-900 text-sm">{assignedCounterName}</p>
              <p className="text-gray-500 mt-0.5">{isBn ? 'টিকিট দরকার ফিজিক্যাল এজেন্ট পয়েন্ট' : 'Physical Agent Sales Terminal'}</p>
            </div>

            <Link
              href="/counter-agent/select-counter"
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold rounded-xl transition-colors shrink-0"
            >
              {isBn ? 'কাউন্টার লোকেশন পরিবর্তন করুন' : 'Switch Counter Location'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
