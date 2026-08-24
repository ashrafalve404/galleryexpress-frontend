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

function SearchResults() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  const { data: schedules, isLoading, isError, error, refetch } = useSearchSchedules(
    { from, to, date },
    !!(from && to && date)
  );

  const displayDate = date ? getRelativeDate(date + 'T00:00:00') : '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={ROUTES.HOME} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#111111]">
            {from} → {to}
          </h1>
          <p className="text-sm text-gray-500">{displayDate} · {schedules?.length || 0} buses found</p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <ScheduleCardSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 mb-1">Failed to load schedules</h3>
          <p className="text-gray-500 text-sm mb-4">
            {(error as Error)?.message || 'Please check your connection and try again.'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 bg-[#E31B23] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#C41920] transition-colors"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && (!schedules || schedules.length === 0) && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center">
          <Bus size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 text-lg mb-2">No buses found</h3>
          <p className="text-gray-500 text-sm mb-6">
            No buses available from <strong>{from}</strong> to <strong>{to}</strong> on{' '}
            <strong>{formatDate(date + 'T00:00:00')}</strong>.
          </p>
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 bg-[#E31B23] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C41920] transition-colors"
          >
            Try Different Dates
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
        <div className="bg-white border-b border-gray-100 py-4 mb-4">
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
