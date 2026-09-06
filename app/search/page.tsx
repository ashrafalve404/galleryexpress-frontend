'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, AlertCircle, Bus } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchCard } from '@/components/home/SearchCard';
import { ScheduleCard, ScheduleCardSkeleton } from '@/components/search/ScheduleCard';
import { useSearchSchedules } from '@/lib/hooks/useSchedules';
import { getRelativeDate, formatDate } from '@/lib/utils/date';
import { ROUTES } from '@/lib/utils/constants';

import { useLanguageStore } from '@/lib/store/languageStore';

function SearchResults() {
  const searchParams = useSearchParams();
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  const { data: schedules, isLoading, isError, error, refetch } = useSearchSchedules(
    { from, to, date },
    !!(from && to && date)
  );

  const displayDate = date ? getRelativeDate(date + 'T00:00:00', isBn) : '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" suppressHydrationWarning>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6" suppressHydrationWarning>
        <Link href={ROUTES.HOME} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div suppressHydrationWarning>
          <h1 className="text-xl font-bold text-[#111111]">
            {from} → {to}
          </h1>
          <p className="text-sm text-gray-500">
            {isBn
              ? `${displayDate} · ${schedules?.length || 0}টি বাস পাওয়া গেছে`
              : `${displayDate} · ${schedules?.length || 0} buses found`}
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4" suppressHydrationWarning>
          {[1, 2, 3, 4].map((i) => <ScheduleCardSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-xs" suppressHydrationWarning>
          <AlertCircle size={36} className="text-amber-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-lg mb-1">
            {isBn ? 'কোনো সিডিউল পাওয়া যায়নি' : 'No schedules currently available'}
          </h3>
          <p className="text-gray-600 text-sm mb-5 leading-relaxed">
            {isBn ? (
              <>আমরা <strong>{from}</strong> থেকে <strong>{to}</strong> রুটে নির্বাচিত তারিখে কোনো ট্রিপ খুঁজে পাইনি। অন্য তারিখ বা রুট চেষ্টা করুন।</>
            ) : (
              <>We couldn't find any trips from <strong>{from}</strong> to <strong>{to}</strong> for the selected date. Try searching for a different date or route.</>
            )}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-xs"
            >
              <RefreshCw size={14} /> {isBn ? 'রিফ্রেশ' : 'Refresh'}
            </button>
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center gap-2 bg-[#E31B23] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C41920] transition-colors shadow-xs"
            >
              {isBn ? 'অন্য তারিখ বেছে নিন' : 'Try Different Date'}
            </Link>
          </div>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && (!schedules || schedules.length === 0) && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center" suppressHydrationWarning>
          <Bus size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 text-lg mb-2">
            {isBn ? 'কোনো বাস পাওয়া যায়নি' : 'No buses found'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {isBn ? (
              <><strong>{from}</strong> থেকে <strong>{to}</strong> রুটে <strong>{formatDate(date + 'T00:00:00')}</strong> তারিখে কোনো বাস নেই।</>
            ) : (
              <>No buses available from <strong>{from}</strong> to <strong>{to}</strong> on <strong>{formatDate(date + 'T00:00:00')}</strong>.</>
            )}
          </p>
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 bg-[#E31B23] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C41920] transition-colors"
          >
            {isBn ? 'অন্য তারিখ খুঁজুন' : 'Try Different Dates'}
          </Link>
        </div>
      )}

      {/* Results */}
      {!isLoading && !isError && schedules && schedules.length > 0 && (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20 pb-10 bg-gray-50 min-h-screen">
        {/* Compact search bar at top */}
        <div className="bg-white border-b border-gray-100 py-4 mb-4 relative z-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SearchCard />
          </div>
        </div>

        <Suspense fallback={
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
            {[1, 2, 3].map((i) => <ScheduleCardSkeleton key={i} />)}
          </div>
        }>
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
