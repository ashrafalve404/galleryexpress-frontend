'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import client, { withCompany } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import { RiTicket2Fill, RiLockPasswordFill, RiUserFill } from 'react-icons/ri';
import { HiExclamationCircle } from 'react-icons/hi';
import Link from 'next/link';

export default function AgentLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await client.post(
        '/api/v1/auth/login',
        { loginIdentifier, password },
        { params: withCompany() }
      );

      const payload = data?.data || data;
      const user = payload?.user;
      const accessToken = payload?.accessToken;
      const refreshToken = payload?.refreshToken;

      if (!user || !accessToken) {
        throw new Error('Invalid authentication response');
      }

      const ALLOWED_AGENT_ROLES = ['COUNTER_AGENT', 'COUNTER_MANAGER', 'ADMIN', 'SUPER_ADMIN'];
      if (!ALLOWED_AGENT_ROLES.includes(user.role)) {
        setError('Access Denied: Only authorized Counter Agents can log in to this portal. Passenger accounts cannot access the Agent Portal.');
        setLoading(false);
        return;
      }

      setAuth(
        {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          phone: user.phone,
        },
        accessToken,
        refreshToken || ''
      );

      router.push('/agent/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid agent login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 relative overflow-hidden">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#E31B23] text-white flex items-center justify-center mx-auto mb-4 font-black">
            <RiTicket2Fill size={32} />
          </div>
          <h1 className="text-2xl font-black text-[#111111]">Counter Agent Portal</h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Gallery Express Limited · Bulk Ticket Management
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <HiExclamationCircle size={18} className="shrink-0 text-[#E31B23]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Email or Phone Number
            </label>
            <div className="relative">
              <RiUserFill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="Enter email or phone number"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <div className="relative">
              <RiLockPasswordFill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#111111] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E31B23] hover:bg-[#C41920] text-white font-black py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Authenticating Agent...' : 'Login to Agent Portal'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          Agent accounts are issued strictly by Company Administration.
          <div className="mt-2">
            <Link href="/" className="text-[#E31B23] hover:underline font-bold">
              ← Return to Main Passenger Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
