'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  Loader2,
  Gift,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';

function CounterAgentRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam.trim().toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      setError('Please enter your First Name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your Mobile Phone Number.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
        role: 'COUNTER_AGENT',
        referralCode: referralCode.trim() || undefined,
      };

      const res = await apiClient.post('/api/v1/auth/register', payload);
      const data = res.data?.data ?? res.data;

      toast.success('Agent Account registered successfully!');

      if (data?.accessToken && data?.user) {
        const u = data.user;
        setAuth(
          {
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            role: u.role,
            companyId: u.companyId,
            phone: u.phone,
          },
          data.accessToken,
          data.refreshToken,
        );
        router.push('/counter-agent/dashboard');
      } else {
        router.push('/counter-agent/login');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to complete agent registration. Mobile number or email may already be in use.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md my-auto">
      <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-200/80 p-8 sm:p-10">
        <div className="text-center mb-6">
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
            Agent Registration
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Create an official Ticket Dorkar Counter Agent account
          </p>
        </div>

        {/* Highlighted Referral Badge */}
        {referralCode ? (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 shadow-2xs">
            <Gift size={18} className="text-amber-600 shrink-0" />
            <div>
              <span>Referred by Agent: </span>
              <span className="font-mono text-[#E31B23] font-black">{referralCode}</span>
            </div>
          </div>
        ) : null}

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 font-medium">
            <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                First Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:border-[#E31B23] outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:border-[#E31B23] outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Mobile Phone Number *
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:border-[#E31B23] outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@example.com"
                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:border-[#E31B23] outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:border-[#E31B23] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Referral Code (Optional)
            </label>
            <div className="relative">
              <Gift size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g. AGENT-C7D202"
                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs font-mono font-bold focus:bg-white focus:border-[#E31B23] outline-none uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#E31B23] hover:bg-[#c9121a] text-white font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Registering Agent…
              </>
            ) : (
              'Create Agent Account'
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
          <p className="text-xs text-gray-500">
            Already have an Agent Account?{' '}
            <Link
              href="/counter-agent/login"
              className="font-bold text-[#E31B23] hover:underline"
            >
              Login to Agent Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CounterAgentRegisterPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 font-sans">
      <Suspense fallback={
        <div className="py-12 text-center">
          <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-semibold mt-2">Loading Agent Registration…</p>
        </div>
      }>
        <CounterAgentRegisterForm />
      </Suspense>
    </div>
  );
}
