'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, Bus } from 'lucide-react';
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
    login.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left: decorative */}
      <div className="hidden lg:flex flex-col justify-between flex-1 bg-[#111111] p-12">
        <Link href={ROUTES.HOME} className="flex items-center">
          <img
            src="/galleryexplogo.png"
            alt="Gallery Express"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <div>
          <div className="w-16 h-16 bg-[#E31B23]/20 rounded-2xl flex items-center justify-center mb-6">
            <Bus size={32} className="text-[#E31B23]" />
          </div>
          <h2 className="text-white font-black text-3xl leading-tight mb-4">
            Your journey<br />starts here.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Sign in to manage your bookings, download tickets, and enjoy a seamless travel experience with Gallery Express.
          </p>
        </div>

        <div className="text-gray-600 text-xs">
          &copy; {new Date().getFullYear()} Gallery Express. All rights reserved.
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href={ROUTES.HOME} className="flex items-center mb-8 lg:hidden">
            <img
              src="/galleryexplogo.png"
              alt="Gallery Express"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <h1 className="text-2xl font-black text-[#111111] mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-[#E31B23] disabled:opacity-70 hover:bg-[#C41920] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-md text-sm mt-2"
            >
              {login.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link href={ROUTES.REGISTER} className="text-[#E31B23] font-semibold hover:underline">
              Create one
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            <Link href={ROUTES.HOME} className="hover:text-[#E31B23] transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
