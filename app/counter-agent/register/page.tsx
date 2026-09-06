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
  ShieldCheck,
  RotateCw,
  X,
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import { sendRegisterOtp } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { toast } from 'sonner';

function CounterAgentRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const { lang } = useLanguageStore();

  const isBn = lang === 'BN';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam.trim().toUpperCase());
    }
  }, [searchParams]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtpModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [showOtpModal, countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      setError(isBn ? 'অনুগ্রহ করে প্রথম নাম লিখুন।' : 'Please enter your First Name.');
      return;
    }
    if (!phone.trim()) {
      setError(isBn ? 'অনুগ্রহ করে মোবাইল নম্বর লিখুন।' : 'Please enter your Mobile Phone Number.');
      return;
    }
    if (!password || password.length < 6) {
      setError(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setSendingOtp(true);

    try {
      await sendRegisterOtp(phone.trim());
      toast.success(
        isBn
          ? `ভেরিফিকেশন কোড পাঠানো হয়েছে: ${phone.trim()}`
          : `Verification OTP sent to ${phone.trim()}`,
      );
      setShowOtpModal(true);
      setCountdown(60);
      setCanResend(false);
      setOtpError('');
      setOtpCode('');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          (isBn
            ? 'ওটিপি পাঠাতে ব্যর্থ হয়েছে। মোবাইল নম্বরটি ইতিমধ্যে ব্যবহৃত হয়ে থাকতে পারে।'
            : 'Failed to send OTP code. Phone number may already be registered.'),
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || !phone.trim()) return;
    setOtpError('');
    setSendingOtp(true);
    try {
      await sendRegisterOtp(phone.trim());
      toast.success(
        isBn
          ? `নতুন ওটিপি কোড পাঠানো হয়েছে: ${phone.trim()}`
          : `New OTP code sent to ${phone.trim()}`,
      );
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      setOtpError(
        err?.response?.data?.message ||
          err?.message ||
          (isBn ? 'পুনরায় ওটিপি পাঠাতে ব্যর্থ হয়েছে।' : 'Failed to resend OTP code.'),
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!otpCode || otpCode.trim().length !== 4) {
      setOtpError(
        isBn
          ? 'আপনার মোবাইলে পাঠানো ৪-ডিজিটের ওটিপি কোডটি লিখুন।'
          : 'Please enter the 4-digit OTP code sent to your mobile phone.',
      );
      return;
    }

    setOtpError('');
    setVerifyingOtp(true);

    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
        otp: otpCode.trim(),
        role: 'COUNTER_AGENT',
        referralCode: referralCode.trim() || undefined,
      };

      const res = await apiClient.post('/api/v1/auth/register', payload);
      const data = res.data?.data ?? res.data;

      toast.success(
        isBn
          ? 'কাউন্টার এজেন্ট অ্যাকাউন্ট সফলভাবে নিবন্ধিত হয়েছে!'
          : 'Agent Account registered successfully!',
      );

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
      setOtpError(
        err?.response?.data?.message ||
          err?.message ||
          (isBn
            ? 'অকার্যকর বা মেয়ারউত্তীর্ণ ওটিপি কোড। সঠিক কোড লিখুন।'
            : 'Invalid or expired OTP code. Please enter the correct code.'),
      );
    } finally {
      setVerifyingOtp(false);
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
            {isBn ? 'কাউন্টার এজেন্ট নিবন্ধন' : 'Agent Registration'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isBn ? 'অফিসিয়াল টিকিট দরকার কাউন্টার এজেন্ট অ্যাকাউন্ট তৈরি করুন' : 'Create an official Ticket Dorkar Counter Agent account'}
          </p>
        </div>

        {/* Highlighted Referral Badge */}
        {referralCode ? (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 shadow-2xs">
            <Gift size={18} className="text-amber-600 shrink-0" />
            <div>
              <span>{isBn ? 'রেফারকারী এজেন্ট: ' : 'Referred by Agent: '}</span>
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

        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                {isBn ? 'এজেন্টের নাম লিখুন *' : 'Enter Agent Name *'}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={isBn ? 'যেমন: আব্দুল করিম' : 'e.g. Abdul Karim'}
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:border-[#E31B23] outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                {isBn ? 'পদবি / শেষ অংশ' : 'Last Name'}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={isBn ? 'যেমন: হোসেন' : 'Last name'}
                className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs focus:bg-white focus:border-[#E31B23] outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              {isBn ? 'মোবাইল ফোন নম্বর (ওটিপি যাচাইয়ের জন্য) *' : 'Mobile Phone Number (for OTP) *'}
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
              {isBn ? 'ইমেইল ঠিকানা (ঐচ্ছিক)' : 'Email Address (Optional)'}
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
              {isBn ? 'পাসওয়ার্ড *' : 'Password *'}
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
              {isBn ? 'রেফারেল কোড (ঐচ্ছিক)' : 'Referral Code (Optional)'}
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
            disabled={sendingOtp}
            className="w-full py-3.5 bg-[#E31B23] hover:bg-[#c9121a] text-white font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {sendingOtp ? (
              <>
                <Loader2 size={16} className="animate-spin" /> {isBn ? 'ওটিপি কোড পাঠানো হচ্ছে…' : 'Sending Verification OTP…'}
              </>
            ) : (
              isBn ? 'যাচাইকরণ ওটিপি পাঠান' : 'Send Verification OTP'
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
          <p className="text-xs text-gray-500">
            {isBn ? 'ইতিমধ্যে এজেন্ট অ্যাকাউন্ট রয়েছে?' : 'Already have an Agent Account?'}{' '}
            <Link
              href="/counter-agent/login"
              className="font-bold text-[#E31B23] hover:underline"
            >
              {isBn ? 'এজেন্ট পোর্টালে সাইন ইন করুন' : 'Login to Agent Portal'}
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative border border-gray-100">
            <button
              type="button"
              onClick={() => setShowOtpModal(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mx-auto mb-4 border border-red-100">
              <ShieldCheck size={26} />
            </div>

            <h3 className="text-xl font-black text-center text-gray-900 mb-1">
              {isBn ? 'মোবাইল ওটিপি যাচাই করুন' : 'Verify Mobile OTP'}
            </h3>
            <p className="text-xs text-center text-gray-500 mb-6 leading-relaxed">
              {isBn ? 'আমরা এই এজেন্ট নম্বরে ৪-ডিজিটের ভেরিফিকেশন কোড পাঠিয়েছি:' : 'We sent a 4-digit verification code via SMS to agent phone:'}{' '}
              <strong className="text-gray-900 font-bold">{phone}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {isBn ? '৪-ডিজিটের ওটিপি কোড লিখুন' : 'Enter 4-Digit OTP Code'}
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono font-black py-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#E31B23] outline-none text-[#111111]"
                  autoFocus
                />
                {otpError && (
                  <p className="text-red-500 text-xs text-center mt-2 font-medium leading-tight">{otpError}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleVerifyAndRegister}
                disabled={verifyingOtp || otpCode.length !== 4}
                className="w-full py-3.5 bg-[#E31B23] hover:bg-[#C41920] disabled:opacity-60 text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isBn ? 'যাচাই করা হচ্ছে…' : 'Verifying & Registering…'}
                  </>
                ) : (
                  isBn ? 'ওটিপি যাচাই করে অ্যাকাউন্ট রেজিস্টার করুন' : 'Verify OTP & Create Agent Account'
                )}
              </button>

              <div className="text-center pt-2">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={sendingOtp}
                    className="text-xs font-bold text-[#E31B23] hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <RotateCw size={13} className={sendingOtp ? 'animate-spin' : ''} />
                    {isBn ? 'পুনরায় ওটিপি কোড পাঠান' : 'Resend OTP Code'}
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 font-medium">
                    {isBn ? 'পুনরায় ওটিপি পাঠানোর সময় বাকি:' : 'Resend OTP in'}{' '}
                    <span className="font-bold text-gray-700 font-mono">{countdown}s</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
