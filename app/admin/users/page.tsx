'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Shield, User, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { toast } from 'sonner';
import { useLanguageStore } from '@/lib/store/languageStore';

import { formatDisplayEmail, isInternalEmail } from '@/lib/utils/email';

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
}

import { useAuthStore } from '@/lib/store/authStore';
import { PermissionNotice } from '@/components/admin/PermissionNotice';

export default function AdminUsersPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: 'Password123!',
    role: 'COUNTER_AGENT',
    referredByCode: '',
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/users', { params: { limit: 100 } });
      const list = data?.data?.data || data?.data || data?.users || [];
      return Array.isArray(list) ? list : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (dto: typeof form) => client.post('/api/v1/admin/users', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User created successfully!');
      setShowForm(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<typeof form> }) =>
      client.patch(`/api/v1/admin/users/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User updated!');
      setShowForm(false);
      setEditing(null);
      resetForm();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || 'Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User deleted.');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || 'Failed to delete user'),
  });

  const resetForm = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: 'Password123!',
      role: 'COUNTER_AGENT',
      referredByCode: '',
    });
  };

  const startEdit = (u: UserItem) => {
    setEditing(u);
    setForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: isInternalEmail(u.email) ? '' : u.email || '',
      phone: u.phone || '',
      password: '',
      role: u.role || 'COUNTER_AGENT',
      referredByCode: '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const payload: Partial<typeof form> = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        role: form.role,
      };
      updateMutation.mutate({ id: editing.id, dto: payload });
    } else {
      createMutation.mutate(form);
    }
  };

  const users: UserItem[] = Array.isArray(usersData) ? usersData : [];
  const filtered = users.filter((u) => {
    if (!search) return true;
    const name = `${u.firstName || ''} ${u.lastName || ''}`;
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search)
    );
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">{isBn ? 'ব্যবহারকারী ও কর্মী' : 'Users & Staff'}</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">{isBn ? `মোট ${users.length} টি নিবন্ধিত অ্যাকাউন্ট` : `${users.length} registered accounts`}</p>
        </div>

      {!isAdmin && (
        <PermissionNotice moduleName="Users & Staff Management" requiredRole="Administrator" />
      )}
        <button
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowForm(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> {isBn ? 'ব্যবহারকারী যোগ করুন' : 'Add User'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isBn ? 'নাম, ইমেইল বা ফোন দিয়ে ব্যবহারকারী খুঁজুন...' : 'Search users by name, email, or phone...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20"
          />
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-[#111111]">{editing ? (isBn ? 'ব্যবহারকারী এডিট করুন' : 'Edit User') : (isBn ? 'নতুন ব্যবহারকারী যোগ করুন' : 'Add New User')}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{isBn ? 'নামের প্রথম অংশ' : 'First Name'}</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                    placeholder="e.g. Tanvir"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{isBn ? 'নামের শেষ অংশ' : 'Last Name'}</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                    placeholder="e.g. Hossain"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{isBn ? 'ফোন নম্বর' : 'Phone Number'}</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 01711223344"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  {isBn ? 'ইমেইল ঠিকানা (ঐচ্ছিক)' : 'Email Address (Optional)'}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. agent@ticketdorkar.xyz"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              {!editing && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{isBn ? 'পাসওয়ার্ড' : 'Password'}</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    placeholder={isBn ? 'সর্বনিম্ন ৮ অক্ষর' : 'Min. 8 characters'}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{isBn ? 'ভূমিকা' : 'Role'}</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                >
                  <option value="SUPER_ADMIN">{isBn ? 'সুপার অ্যাডমিন' : 'Super Admin'}</option>
                  <option value="ADMIN">{isBn ? 'অ্যাডমিন' : 'Admin'}</option>
                  <option value="COUNTER_AGENT">{isBn ? 'কাউন্টার এজেন্ট' : 'Counter Agent'}</option>
                  <option value="STAFF">{isBn ? 'কর্মী (Staff)' : 'Staff'}</option>
                  <option value="CUSTOMER">{isBn ? 'গ্রাহক (Customer)' : 'Customer'}</option>
                </select>
              </div>

              {form.role === 'COUNTER_AGENT' && !editing && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 text-amber-700">
                    {isBn ? 'রেফারেল কোড (ঐচ্ছিক)' : 'Referral Code (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={form.referredByCode}
                    onChange={(e) => setForm({ ...form, referredByCode: e.target.value })}
                    placeholder="e.g. AG-5YPIC2"
                    className="w-full px-4 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-sm font-extrabold text-amber-900 focus:outline-none uppercase font-mono tracking-wider"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    {isBn
                      ? 'এজেন্ট অন্য কোনো রেফারারের রেফারেল কোড দিয়ে যুক্ত হলে কোডটি দিন।'
                      : 'If this agent was referred by another agent, enter their referral code here.'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-[#E31B23] hover:bg-[#C41920] text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-md"
                >
                  {editing ? (isBn ? 'সংরক্ষণ করুন' : 'Save Changes') : (isBn ? 'ব্যবহারকারী তৈরি করুন' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm min-w-[650px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  isBn ? 'ব্যবহারকারী' : 'User',
                  isBn ? 'ফোন' : 'Phone',
                  isBn ? 'ইমেইল' : 'Email',
                  isBn ? 'ভূমিকা' : 'Role',
                  isBn ? 'স্ট্যাটাস' : 'Status',
                  isBn ? 'অ্যাকশন' : 'Actions'
                ].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase tracking-wider text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-[#111111]">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-5 py-4 font-mono text-gray-600 font-semibold">{u.phone || 'N/A'}</td>
                  <td className="px-5 py-4 text-gray-600 font-medium">{formatDisplayEmail(u.email)}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      {u.status || (isBn ? 'সক্রিয়' : 'ACTIVE')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(u)} className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title={isBn ? 'এডিট করুন' : 'Edit'}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => { if (confirm(isBn ? 'ব্যবহারকারী মুছে ফেলবেন?' : 'Delete user?')) deleteMutation.mutate(u.id); }} className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors" title={isBn ? 'মুছুন' : 'Delete'}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm font-medium">
                    {isBn ? 'কোনো ব্যবহারকারী পাওয়া যায়নি' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
