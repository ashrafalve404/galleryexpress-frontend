'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  RiStore3Fill,
  RiMapPinFill,
  RiPhoneFill,
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiSearchLine,
} from 'react-icons/ri';
import { Loader2 } from 'lucide-react';
import { counterAgentApi, type Counter, type DashboardStats } from '@/lib/api/counterAgent';
import { useAuthStore } from '@/lib/store/authStore';

export default function SelectCounterPage() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [counters, setCounters] = useState<Counter[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([counterAgentApi.getCounters(), counterAgentApi.getDashboardStats()])
      .then(([c, s]) => {
        setCounters(c);
        setStats(s);
      })
      .catch(() => setError('Failed to load counters.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (counterId: string) => {
    setSaving(counterId);
    setError('');
    setSuccess('');
    try {
      await counterAgentApi.assignCounter(counterId);
      const updated = await counterAgentApi.getDashboardStats();
      setStats(updated);
      setSuccess('Counter assigned successfully!');
      setTimeout(() => router.push('/counter-agent/dashboard'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to assign counter.');
    } finally {
      setSaving('');
    }
  };

  const currentCounterId = stats?.counter?.id;

  const filteredCounters = counters.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.location && c.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <RiStore3Fill className="text-[#E31B23]" size={28} /> Select Counter Assignment
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {currentCounterId
              ? `Currently assigned to: ${stats?.counter?.name}${stats?.counter?.location ? ` (${stats.counter.location})` : ''}`
              : 'Choose your assigned counter (Dhaka & Cox\'s Bazar counters only).'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <RiSearchLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search counter or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] shadow-xs"
          />
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3">
          <RiCheckboxCircleFill size={18} className="text-emerald-600 shrink-0" />
          <span>{success} Redirecting to dashboard…</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-3">
          <RiErrorWarningFill size={18} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-10 h-10 text-[#E31B23] animate-spin" />
        </div>
      ) : filteredCounters.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-white rounded-3xl border border-gray-200/80 p-8 space-y-2">
          <RiStore3Fill className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No Matching Counters</h3>
          <p className="text-xs text-gray-500">Try searching for another counter name or location.</p>
        </div>
      ) : (
        /* 2-column layout on mobile, 4-column layout on PC / desktop */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredCounters.map((c) => {
            const isActive = c.id === currentCounterId;
            return (
              <div
                key={c.id}
                className={`bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all flex flex-col justify-between space-y-3 sm:space-y-4 ${
                  isActive
                    ? 'border-[#E31B23] ring-2 ring-[#E31B23]/20 shadow-md'
                    : 'border-gray-200/80 hover:border-gray-300 shadow-xs'
                }`}
              >
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 sm:p-2.5 bg-red-50 text-[#E31B23] rounded-xl sm:rounded-2xl">
                      <RiStore3Fill size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    {isActive && (
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-[#E31B23] text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs sm:text-base font-black text-gray-900 pt-1 line-clamp-2">
                    {c.name}
                  </h3>
                  {c.location && (
                    <p className="text-[10px] sm:text-xs text-gray-500 flex items-start gap-1 font-medium line-clamp-2">
                      <RiMapPinFill size={13} className="shrink-0 text-gray-400 mt-0.5" />
                      {c.location}
                    </p>
                  )}
                  {c.phone && (
                    <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 font-medium truncate">
                      <RiPhoneFill size={13} className="shrink-0 text-gray-400" />
                      {c.phone}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSelect(c.id)}
                  disabled={saving === c.id || isActive}
                  className={`w-full py-2 sm:py-3 rounded-xl font-bold text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-gray-100 text-gray-500 cursor-default'
                      : 'bg-[#E31B23] hover:bg-[#c9121a] text-white shadow-xs'
                  }`}
                >
                  {saving === c.id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving…
                    </>
                  ) : isActive ? (
                    'Assigned'
                  ) : (
                    'Select Counter'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

