'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Building2, Mail, Phone, MapPin, Globe, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import client from '@/lib/api/client';
import { toast } from 'sonner';

import { useAuthStore } from '@/lib/store/authStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { PermissionNotice } from '@/components/admin/PermissionNotice';

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const [form, setForm] = useState({
    companyName: 'Ticket Dorkar',
    companyPhone: '01826-110036',
    companyEmail: 'ticketdorkarltd@gmail.com',
    companyAddress: 'Navana Shopping Centre, Gulshan Avenue 01, Gulshan, Dhaka, Bangladesh',
    websiteUrl: 'https://www.ticketdorkar.xyz',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
  });

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: settingsData } = useQuery({
    queryKey: ['admin', 'settings'],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/settings');
      return data?.data || data || [];
    },
  });

  useEffect(() => {
    if (Array.isArray(settingsData) && settingsData.length > 0) {
      const map: Record<string, string> = {};
      settingsData.forEach((s: { key: string; value: string }) => {
        if (s.key && s.value !== undefined) {
          map[s.key] = s.value;
        }
      });
      setForm((prev) => ({
        ...prev,
        ...map,
      }));
    }
  }, [settingsData]);

  const saveMutation = useMutation({
    mutationFn: async (updatedForm: typeof form) => {
      const settings = Object.entries(updatedForm).map(([key, value]) => ({
        key,
        value: String(value),
        label: key,
      }));
      const { data } = await client.post('/api/v1/admin/settings', { settings });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success(isBn ? 'সিস্টেম সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!' : 'System settings saved successfully!');
    },
    onError: (err: any) => {
      const msg = err.response?.status === 403
        ? (isBn ? 'অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে: কেবল অ্যাডমিনিস্ট্রেটররা সেটিংস পরিবর্তন করতে পারবেন।' : 'Access Denied: Only Administrators can modify system settings.')
        : err.message || (isBn ? 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save settings');
      toast.error(msg);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async () => {
      const { data } = await client.patch('/api/v1/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      return data;
    },
    onSuccess: () => {
      toast.success(isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' : 'Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || (isBn ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে' : 'Failed to change password');
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error(isBn ? 'অ্যাক্সেস প্রত্যাখ্যান: অ্যাডমিনিস্ট্রেটর ভূমিকা প্রয়োজন।' : 'Access Denied: Administrator role required.');
      return;
    }
    saveMutation.mutate(form);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error(isBn ? 'বর্তমান পাসওয়ার্ড লিখুন' : 'Please enter your current password');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error(isBn ? 'নতুন পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে' : 'New password must be at least 8 characters long');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(isBn ? 'নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মেলেনি' : 'New passwords do not match');
      return;
    }
    passwordMutation.mutate();
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">{isBn ? 'সিস্টেম সেটিংস' : 'System Settings'}</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">
            {isBn ? 'কোম্পানির তথ্য ও অ্যাকউন্ট সিকিউরিটি পরিচালনা করুন' : 'Manage company info and account security'}
          </p>
        </div>
      </div>

      {!isAdmin && (
        <PermissionNotice
          moduleName={isBn ? 'সিস্টেম সেটিংস ও কোম্পানি প্রোফাইল' : 'System Settings & Company Profile'}
          requiredRole={isBn ? 'অ্যাডমিনিস্ট্রেটর' : 'Administrator'}
        />
      )}

      {/* Section 1: Company Profile */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-[#111111] flex items-center gap-2 border-b border-gray-100 pb-3">
            <Building2 size={18} className="text-[#E31B23]" /> {isBn ? 'কোম্পানি প্রোফাইল' : 'Company Profile'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                {isBn ? 'কোম্পানির নাম' : 'Company Name'}
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                {isBn ? 'সাপোর্ট ফোন' : 'Support Phone'}
              </label>
              <input
                type="tel"
                value={form.companyPhone}
                onChange={(e) => setForm({ ...form, companyPhone: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                {isBn ? 'সাপোর্ট ইমেইল' : 'Support Email'}
              </label>
              <input
                type="email"
                value={form.companyEmail}
                onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                {isBn ? 'ওয়েবসাইট ইউআরএল' : 'Website URL'}
              </label>
              <input
                type="url"
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              {isBn ? 'প্রধান কার্যালয়ের ঠিকানা' : 'Head Office Address'}
            </label>
            <input
              type="text"
              value={form.companyAddress}
              onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} /> {saveMutation.isPending ? (isBn ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...') : (isBn ? 'সেটিংস সংরক্ষণ করুন' : 'Save Settings')}
          </button>
        </div>
      </form>

      {/* Section 2: Admin Password Change */}
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-xs">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
              <Lock size={18} className="text-[#E31B23]" /> {isBn ? 'অ্যাডমিন সিকিউরিটি ও পাসওয়ার্ড পরিবর্তন' : 'Admin Security & Change Password'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isBn ? 'আপনার নিরাপত্তার জন্য বর্তমান পাসওয়ার্ড নিশ্চিত করে নতুন পাসওয়ার্ড নির্ধারণ করুন।' : 'Confirm your current password to set a new admin password.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                {isBn ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder={isBn ? 'বর্তমান পাসওয়ার্ড লিখুন' : 'Enter current password'}
                  required
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#E31B23]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder={isBn ? 'ন্যূনতম ৮ অক্ষর' : 'At least 8 characters'}
                  required
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#E31B23]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder={isBn ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন' : 'Re-enter new password'}
                  required
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#E31B23]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="flex items-center gap-2 bg-[#111111] hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <KeyRound size={16} /> {passwordMutation.isPending ? (isBn ? 'হালনাগাদ করা হচ্ছে...' : 'Updating...') : (isBn ? 'পাসওয়ার্ড হালনাগাদ করুন' : 'Update Password')}
          </button>
        </div>
      </form>
    </div>
  );
}
