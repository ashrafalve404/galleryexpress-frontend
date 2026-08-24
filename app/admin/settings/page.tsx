'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Building2, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import client from '@/lib/api/client';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    companyName: 'Gallery Express',
    companyPhone: '+880 1700-000000',
    companyEmail: 'info@galleryexpress.com',
    companyAddress: 'Sayedabad Bus Terminal, Dhaka, Bangladesh',
    websiteUrl: 'https://galleryexpress.com',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
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
      toast.success('System settings saved successfully!');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to save settings'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">System Settings</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">Manage company info and operational preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-[#111111] flex items-center gap-2 border-b border-gray-100 pb-3">
            <Building2 size={18} className="text-[#E31B23]" /> Company Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Support Phone</label>
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
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Support Email</label>
              <input
                type="email"
                value={form.companyEmail}
                onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Website URL</label>
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
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Head Office Address</label>
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
            className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            <Save size={16} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
