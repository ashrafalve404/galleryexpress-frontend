'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { RiShieldCheckFill, RiTicket2Fill, RiBusFill } from 'react-icons/ri';
import { useState } from 'react';
import { useLogin } from '@/lib/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations/authSchema';
import { ROUTES } from '@/lib/utils/constants';

export default function LoginPage() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login.mutate({
      phone: data.phone,
      loginIdentifier: data.phone,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left: Decorative Luxury Hero Panel (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between flex-1 relative bg-[#111111] p-12 overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/signin-image.webp"
            alt="Gallery Express Bus Travel"
            fill
            sizes="50vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href={ROUTES.HOME} className="inline-block hover:scale-105 transition-transform">
            <img
              src="/ticketdrkrlogo.png"
              alt="Ticket Dorkar"
              className="h-11 sm:h-13 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Hero Features & Headline */}
        <div className="relative z-10 max-w-md text-white">


          <h2 className="text-white font-black text-3xl sm:text-4xl leading-tight mb-4 drop-shadow-md">
            Your Premium Journey <br />
            <span className="text-[#E31B23]">Starts Right Here.</span>
          </h2>

          <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">
            Sign in with your registered mobile number or email to access digital QR boarding passes, manage schedules, and travel seamlessly across Bangladesh.
          </p>

          <div className="space-y-3 border-t border-white/15 pt-6">
            {[
              { icon: RiShieldCheckFill, label: 'Verified & Secure Online Payment Options' },
              { icon: RiTicket2Fill,     label: 'Instant Mobile QR Boarding Ticket' },
              { icon: RiBusFill,         label: 'Modern Fleet with Premium AC Comfort' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-xs text-white/90 font-semibold">
                <div className="w-7 h-7 rounded-xl bg-[#E31B23]/20 flex items-center justify-center text-[#E31B23] shrink-0">
                  <Icon size={15} />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-white/60 text-xs font-medium">
          &copy; {new Date().getFullYear()} Ticket Dorkar. All rights reserved.
        </div>
      </div>

      {/* Right: Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Header section (outside card, matching signup page) */}
          <div className="text-center mb-8">
            <Link href={ROUTES.HOME} className="inline-flex items-center justify-center mb-6">
              <img
                src="/ticketdrkrlogo.png"
                alt="Ticket Dorkar"
                className="h-12 sm:h-16 w-auto object-contain mx-auto transition-transform hover:scale-105"
              />
            </Link>
            <h1 className="text-2xl font-black text-[#111111] mb-1">Welcome back</h1>
            <p className="text-gray-500 text-sm font-medium">Sign in to your account to continue.</p>
          </div>

          {/* Form Card View */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="text"
                    placeholder="017XXXXXXXX or email"
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-[#111111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-[#111111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={login.isPending}
                className="w-full bg-[#E31B23] disabled:opacity-70 hover:bg-[#C41920] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg text-sm mt-2 active:scale-[0.99]"
              >
                {login.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-center text-xs sm:text-sm text-gray-500 mt-6 font-medium">
              Don't have an account?{' '}
              <Link href={ROUTES.REGISTER} className="text-[#E31B23] font-bold hover:underline">
                Register now
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4 font-medium">
            <Link href={ROUTES.HOME} className="hover:text-[#E31B23] transition-colors inline-flex items-center gap-1">
              <ArrowLeft size={12} /> Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
