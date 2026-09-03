'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  Store,
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';

export default function CounterAgentLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/auth/login', form);
      const data = res.data?.data ?? res.data;
      const { user, accessToken, refreshToken } = data;

      if (user.role !== 'COUNTER_AGENT') {
        setError('Access denied. This portal is strictly for Counter Agents.');
        setLoading(false);
        return;
      }

      setAuth(
        {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          phone: user.phone,
        },
        accessToken,
        refreshToken,
      );
      router.push('/counter-agent/dashboard');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Invalid login credentials. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 font-sans">
      {/* Main Login Card (Clean Centered) */}
      <main className="w-full max-w-md my-auto">
        <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-200/80 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Link href="/" title="Go to Website" className="inline-block hover:opacity-80 transition-opacity">
                <img
                  src="/ticketdrkrlogo.png"
                  alt="Ticket Dorkar"
                  className="h-11 w-auto object-contain"
                />
              </Link>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Counter Agent Portal
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Enter your agent account details to continue
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 font-medium">
              <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Agent Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="agent@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:bg-white focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:bg-white focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#E31B23] hover:bg-[#c9121a] text-white font-bold text-base rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Signing In…
                </>
              ) : (
                'Login to Agent Dashboard'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Are you a customer?{' '}
              <Link
                href="/auth/login"
                className="font-bold text-[#E31B23] hover:underline"
              >
                Customer Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
