'use client';

import Link from 'next/link';
import { RiShieldCheckFill } from 'react-icons/ri';
import { useLanguageStore } from '@/lib/store/languageStore';

export default function CounterAgentSettingsPage() {
  const { lang } = useLanguageStore();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              {lang === 'BN' ? 'পোর্টাল সেটিংস' : 'Portal Settings'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'BN'
                ? 'কাউন্টার এজেন্ট অ্যাকাউন্ট সেটিংস ও কেওয়াইসি (KYC) যাচাইকরণ তথ্য।'
                : 'Configure counter agent account settings and Identity & KYC verification preferences.'}
            </p>
          </div>
        </div>

        {/* Settings Sections - Functional KYC Verification Only */}
        <div className="space-y-6">
          {/* Identity & KYC Verification */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center font-bold shrink-0">
                <RiShieldCheckFill size={26} />
              </div>
              <div>
                <div className="text-sm font-black text-gray-900">
                  {lang === 'BN' ? 'আইডেন্টিটি এবং কেওয়াইসি (KYC) ভেরিফিকেশন' : 'Identity & KYC Verification'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {lang === 'BN'
                    ? 'উচ্চতর বাল্ক টিকিট প্যাকেজ সুবিধা আনলক করতে এনআইডি (NID) ডকুমেন্ট আপলোড করুন'
                    : 'Upload NID documents to unlock higher bulk ticket package limits'}
                </div>
              </div>
            </div>
            <Link
              href="/counter-agent/kyc"
              className="px-5 py-2.5 bg-[#E31B23] hover:bg-[#C41920] text-white text-xs font-extrabold rounded-xl transition-all shadow-sm text-center shrink-0"
            >
              {lang === 'BN' ? 'কেওয়াইসি ম্যানেজ করুন' : 'Manage KYC'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
