'use client';

import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/utils/constants';
import { useLanguageStore } from '@/lib/store/languageStore';

interface PermissionNoticeProps {
  moduleName?: string;
  requiredRole?: string;
}

export function PermissionNotice({
  moduleName = 'this section',
  requiredRole = 'Administrator',
}: PermissionNoticeProps) {
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left max-w-2xl my-4 shadow-xs animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <ShieldAlert size={22} />
        </div>
        <div>
          <h3 className="text-base font-black text-amber-950 mb-1">
            {isBn ? 'অ্যাক্সেস সীমিত — অনুমতি প্রয়োজন' : 'Access Restricted — Permission Required'}
          </h3>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
            {isBn ? (
              <>
                আপনি কাউন্টার/স্টাফ পারমিশন নিয়ে লগইন করেছেন। আপনার <span className="font-bold">{moduleName}</span> দেখা বা পরিবর্তন করার অনুমতি নেই। শুধুমাত্র <span className="font-bold underline">{requiredRole}</span> রোলের ব্যবহারকারীরা পরিবর্তন করতে পারবেন।
              </>
            ) : (
              <>
                You are currently logged in with counter/staff privileges. You are not allowed to view or modify{' '}
                <span className="font-bold">{moduleName}</span>. Only accounts with{' '}
                <span className="font-bold underline">{requiredRole}</span> role can make changes here.
              </>
            )}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href={ROUTES.ADMIN_BOOKINGS}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-950 transition-colors shadow-xs"
            >
              <ArrowLeft size={14} /> {isBn ? 'বুকিং প্যানেলে ফিরে যান' : 'Back to Bookings Panel'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
