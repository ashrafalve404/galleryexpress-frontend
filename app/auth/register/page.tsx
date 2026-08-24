'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { useState } from 'react';
import { useRegister } from '@/lib/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/lib/validations/authSchema';
import { ROUTES } from '@/lib/utils/constants';

export default function RegisterPage() {
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={ROUTES.HOME} className="inline-flex items-center justify-center mb-6">
            <img
              src="/galleryexplogo.png"
              alt="Gallery Express"
              className="h-11 w-auto object-contain"
            />
          </Link>
          <h1 className="text-2xl font-black text-[#111111] mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">Join thousands of happy travellers.</p>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('name')}
                  placeholder="Your full name"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="w-full pl-9 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] transition-all"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-[#E31B23] disabled:opacity-70 hover:bg-[#C41920] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-md text-sm"
            >
              {registerMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="text-[#E31B23] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By registering, you agree to our{' '}
          <Link href={ROUTES.TERMS} className="underline">Terms</Link> and{' '}
          <Link href={ROUTES.PRIVACY} className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
