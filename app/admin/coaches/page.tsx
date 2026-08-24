'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import client from '@/lib/api/client';

interface Coach {
  id: string;
  name: string;
  registrationNo: string;
  coachType: string;
  totalSeats: number;
  status: string;
  amenities: string[];
}

export default function AdminCoachesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coach | null>(null);
  const [form, setForm] = useState({ name: '', registrationNo: '', coachType: 'AC', totalSeats: 40, status: 'ACTIVE' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'coaches'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/coaches', { params: { limit: 100 } });
      return data?.data || data?.coaches || [];
    },
  });

  const coaches: Coach[] = data || [];

  const createMutation = useMutation({
    mutationFn: (dto: typeof form) => client.post('/api/v1/admin/coaches', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coaches'] }); toast.success('Coach created!'); setShowForm(false); setForm({ name: '', registrationNo: '', coachType: 'AC', totalSeats: 40, status: 'ACTIVE' }); },
    onError: () => toast.error('Failed to create coach'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<typeof form> }) => client.patch(`/api/v1/admin/coaches/${id}`, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coaches'] }); toast.success('Coach updated!'); setShowForm(false); setEditing(null); },
    onError: () => toast.error('Failed to update coach'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/coaches/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'coaches'] }); toast.success('Coach removed'); },
    onError: () => toast.error('Failed to remove coach'),
  });

  const startEdit = (c: Coach) => {
    setEditing(c);
    setForm({ name: c.name, registrationNo: c.registrationNo, coachType: c.coachType, totalSeats: c.totalSeats, status: c.status });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, dto: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = coaches.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.registrationNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#111111]">Coaches</h1>
          <p className="text-gray-500 text-sm mt-0.5">{coaches.length} coaches in fleet</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', registrationNo: '', coachType: 'AC', totalSeats: 40, status: 'ACTIVE' }); setShowForm(true); }} className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus size={15} /> Add Coach
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search coaches..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20" />
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-[#111111]">{editing ? 'Edit Coach' : 'Add Coach'}</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {[
                { label: 'Coach Name', key: 'name', type: 'text', placeholder: 'e.g. GE Volvo 01' },
                { label: 'Registration No.', key: 'registrationNo', type: 'text', placeholder: 'e.g. DHK-XX-XXXX' },
                { label: 'Total Seats', key: 'totalSeats', type: 'number', placeholder: '40' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(form as Record<string, unknown>)[key] as string}
                    onChange={(e) => setForm({ ...form, [key]: type === 'number' ? parseInt(e.target.value) : e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Coach Type</label>
                <select value={form.coachType} onChange={(e) => setForm({ ...form, coachType: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
                  {['AC', 'NON_AC', 'SLEEPER', 'SEMI_SLEEPER', 'DOUBLE_DECKER', 'VIP'].map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
                  {['ACTIVE', 'INACTIVE', 'MAINTENANCE'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-[#E31B23] disabled:opacity-70 hover:bg-[#C41920] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Name', 'Reg. No.', 'Type', 'Seats', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-[#111111]">{c.name}</td>
                  <td className="px-5 py-4 font-mono text-gray-600">{c.registrationNo}</td>
                  <td className="px-5 py-4 text-gray-600">{c.coachType?.replace('_', ' ')}</td>
                  <td className="px-5 py-4 text-gray-600">{c.totalSeats}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : c.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil size={13} /></button>
                      <button onClick={() => { if (confirm('Remove this coach?')) deleteMutation.mutate(c.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No coaches found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
