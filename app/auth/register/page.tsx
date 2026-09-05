'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Lock, Eye, EyeOff, User, Phone, Mail, ShieldCheck, ArrowRight, RotateCw, X, Building2, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRegister, useSendOtp } from '@/lib/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/lib/validations/authSchema';
import { ROUTES } from '@/lib/utils/constants';

export default function RegisterPage() {
  const registerMutation = useRegister();
  const sendOtpMutation = useSendOtp();

  const [role, setRole] = useState<'CUSTOMER' | 'COUNTER_AGENT'>('CUSTOMER');
  const [referCode, setReferCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

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

  const onSubmit = (data: RegisterFormData) => {
    setFormData(data);
    setOtpError('');

    if (role === 'COUNTER_AGENT') {
      // Counter Agent registration: No OTP required!
      registerMutation.mutate({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        password: data.password,
        role: 'COUNTER_AGENT',
        referCode: referCode.trim() || undefined,
      });
    } else {
      // Customer registration: Require mobile OTP verification first
      sendOtpMutation.mutate(data.phone, {
        onSuccess: () => {
          setShowOtpModal(true);
          setCountdown(60);
          setCanResend(false);
        },
      });
    }
  };

  const handleVerifyAndRegister = () => {
    if (!otpCode || otpCode.trim().length !== 4) {
      setOtpError('Please enter the 4-digit OTP code sent to your phone.');
      return;
    }
    setOtpError('');
    if (!formData) return;

    // Submit customer registration with verified OTP code
    registerMutation.mutate(
      {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        role: 'CUSTOMER',
        otp: otpCode.trim(),
      },
      {
        onError: (err: any) => {
          setOtpError(err?.response?.data?.message || err?.message || 'Invalid or expired OTP code.');
        },
      }
    );
  };

  const handleResendOtp = () => {
    if (!formData || !canResend) return;
    setOtpError('');
    sendOtpMutation.mutate(formData.phone, {
      onSuccess: () => {
        setCountdown(60);
        setCanResend(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={ROUTES.HOME} className="inline-flex items-center justify-center mb-6">
            <img
              src="/ticketdrkrlogo.png"
              alt="Ticket Dorkar"
              className="h-12 sm:h-16 w-auto object-contain mx-auto transition-transform hover:scale-105"
            />
          </Link>
          <h1 className="text-2xl font-black text-[#111111] mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm font-medium">Join thousands of happy travellers across Bangladesh.</p>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 text-center">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100/80 rounded-xl border border-gray-200/60">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-extrabold transition-all ${
                  role === 'CUSTOMER'
                    ? 'bg-white text-[#E31B23] shadow-xs border border-gray-200/60'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <User size={15} /> Passenger
              </button>
              <button
                type="button"
                onClick={() => setRole('COUNTER_AGENT')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-extrabold transition-all ${
                  role === 'COUNTER_AGENT'
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Building2 size={15} /> Counter Agent
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 1. Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                {role === 'COUNTER_AGENT' ? 'Agent / Counter Name' : 'Full Name'}
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('name')}
                  type="text"
                  placeholder={role === 'COUNTER_AGENT' ? 'e.g. Sayedabad Counter 1' : 'e.g. Tanvir Hossain'}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
            </div>

            {/* 2. Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="017XXXXXXXX"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>}
            </div>

            {/* 3. Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            {/* 4. Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            {/* 5. Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
            </div>

            {/* 6. Referral Code (Optional for Counter Agent) */}
            {role === 'COUNTER_AGENT' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Referral Code <span className="text-gray-400 font-normal uppercase text-[10px]">(Optional)</span>
                </label>
                <div className="relative">
                  <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={referCode}
                    onChange={(e) => setReferCode(e.target.value)}
                    placeholder="e.g. AG-8F4A21"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] uppercase tracking-wider transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={sendOtpMutation.isPending || registerMutation.isPending}
              className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-md text-sm mt-2 active:scale-[0.99] ${
                role === 'COUNTER_AGENT'
                  ? 'bg-[#111827] hover:bg-black text-white'
                  : 'bg-[#E31B23] hover:bg-[#C41920] text-white'
              }`}
            >
              {sendOtpMutation.isPending || registerMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : role === 'COUNTER_AGENT' ? (
                'Register Counter Agent Account'
              ) : (
                'Send Verification OTP'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5 font-medium">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="text-[#E31B23] font-bold hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 font-medium">
          By registering, you agree to our{' '}
          <Link href={ROUTES.TERMS} className="underline hover:text-gray-600">Terms</Link> and{' '}
          <Link href={ROUTES.PRIVACY} className="underline hover:text-gray-600">Privacy Policy</Link>.
        </p>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mx-auto mb-4 border border-red-100">
              <ShieldCheck size={26} />
            </div>

            <h3 className="text-xl font-black text-center text-gray-900 mb-1">Verify Mobile OTP</h3>
            <p className="text-xs text-center text-gray-500 mb-6 leading-relaxed">
              We sent a 4-digit verification code via SMS to{' '}
              <strong className="text-gray-900 font-bold">{formData?.phone}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Enter 4-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-full text-center text-2xl font-black tracking-[0.5em] py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#E31B23] transition-all"
                  autoFocus
                />
              </div>

              {otpError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-center">
                  {otpError}
                </div>
              )}

              <button
                onClick={handleVerifyAndRegister}
                disabled={registerMutation.isPending || otpCode.length !== 4}
                className="w-full bg-[#E31B23] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#C41920] text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-sm"
              >
                {registerMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Verify & Create Account <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    disabled={sendOtpMutation.isPending}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E31B23] hover:underline"
                  >
                    <RotateCw size={13} /> Resend OTP SMS
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 font-medium">
                    Resend OTP code in <span className="font-bold text-gray-700">{countdown}s</span>
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
