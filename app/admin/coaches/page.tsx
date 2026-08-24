'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { toast } from 'sonner';

interface CoachType {
  id: string;
  name: string;
}

interface Coach {
  id: string;
  name: string;
  coachNumber: string;
  registrationNumber: string;
  coachTypeId: string;
  coachType?: CoachType | string;
  totalSeats: number;
  isAC: boolean;
  status: string;
}

export default function AdminCoachesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coach | null>(null);

  const [form, setForm] = useState({
    name: '',
    coachNumber: '',
    registrationNumber: '',
    coachTypeId: '',
    isAC: true,
    totalSeats: 40,
    status: 'ACTIVE',
  });

  // Fetch coaches
  const { data: coachesData, isLoading } = useQuery({
    queryKey: ['admin', 'coaches'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/coaches', { params: { limit: 100 } });
      return data?.data || data?.coaches || [];
    },
  });

  // Fetch coach types for dropdown
  const { data: coachTypesData } = useQuery({
    queryKey: ['admin', 'coach-types'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/coaches/types');
      return data?.data || data || [];
    },
  });

  const coachTypes: CoachType[] = Array.isArray(coachTypesData) ? coachTypesData : [];

  const createMutation = useMutation({
    mutationFn: (dto: typeof form) => client.post('/api/v1/admin/coaches', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'coaches'] });
      toast.success('Coach created successfully!');
      setShowForm(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create coach'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: typeof form }) =>
      client.patch(`/api/v1/admin/coaches/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'coaches'] });
      toast.success('Coach updated successfully!');
      setShowForm(false);
      setEditing(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update coach'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/coaches/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'coaches'] });
      toast.success('Coach removed.');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to remove coach'),
  });

  const resetForm = () => {
    setForm({
      name: '',
      coachNumber: '',
      registrationNumber: '',
      coachTypeId: coachTypes[0]?.id || '',
      isAC: true,
      totalSeats: 40,
      status: 'ACTIVE',
    });
  };

  const startEdit = (c: Coach) => {
    setEditing(c);
    setForm({
      name: c.name,
      coachNumber: c.coachNumber || `GE-${c.registrationNumber}`,
      registrationNumber: c.registrationNumber,
      coachTypeId: typeof c.coachType === 'object' ? c.coachType?.id || '' : c.coachTypeId,
      isAC: c.isAC ?? true,
      totalSeats: c.totalSeats || 40,
      status: c.status || 'ACTIVE',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      coachNumber: form.coachNumber || `GE-${form.registrationNumber.slice(-4)}`,
      coachTypeId: form.coachTypeId || coachTypes[0]?.id || '00000000-0000-0000-0000-000000000001',
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, dto: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const coaches: Coach[] = Array.isArray(coachesData) ? coachesData : [];
  const filtered = coaches.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.registrationNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">Coaches Fleet</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">{coaches.length} buses registered</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowForm(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> Add Coach
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search coaches by name or reg number..."
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
              <h2 className="font-bold text-[#111111]">{editing ? 'Edit Coach' : 'Add New Coach'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Coach Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Scania Multi-Axle 01"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Coach Number</label>
                <input
                  type="text"
                  value={form.coachNumber}
                  onChange={(e) => setForm({ ...form, coachNumber: e.target.value })}
                  required
                  placeholder="e.g. GE-AC-01"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Registration Number</label>
                <input
                  type="text"
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                  required
                  placeholder="e.g. DHAKA-METRO-BA-11-2233"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Coach Type</label>
                <select
                  value={form.coachTypeId}
                  onChange={(e) => setForm({ ...form, coachTypeId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                >
                  {coachTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                  {coachTypes.length === 0 && (
                    <>
                      <option value="00000000-0000-0000-0000-000000000001">AC Executive</option>
                      <option value="00000000-0000-0000-0000-000000000002">Non-AC Deluxe</option>
                      <option value="00000000-0000-0000-0000-000000000003">VIP Sleeper</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Seats</label>
                <input
                  type="number"
                  value={form.totalSeats}
                  onChange={(e) => setForm({ ...form, totalSeats: parseInt(e.target.value) || 40 })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAC"
                  checked={form.isAC}
                  onChange={(e) => setForm({ ...form, isAC: e.target.checked })}
                  className="w-4 h-4 text-[#E31B23] rounded focus:ring-[#E31B23]"
                />
                <label htmlFor="isAC" className="text-xs font-bold text-gray-700">Air Conditioned (AC)</label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-[#E31B23] hover:bg-[#C41920] text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-md"
                >
                  {editing ? 'Save Changes' : 'Create Coach'}
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
                {['Name', 'Coach #', 'Registration #', 'Type', 'Seats', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase tracking-wider text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-[#111111]">{c.name}</td>
                  <td className="px-5 py-4 font-mono text-gray-600 font-semibold">{c.coachNumber || '--'}</td>
                  <td className="px-5 py-4 font-mono text-gray-600 text-xs font-semibold">{c.registrationNumber}</td>
                  <td className="px-5 py-4 text-gray-600 font-semibold">
                    {typeof c.coachType === 'object' && c.coachType
                      ? (c.coachType as { name?: string }).name
                      : String(c.coachType || '').replace('_', ' ')}
                  </td>
                  <td className="px-5 py-4 text-gray-600 font-semibold">{c.totalSeats} seats</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : c.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Remove this coach?')) deleteMutation.mutate(c.id);
                        }}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm font-medium">No coaches found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
