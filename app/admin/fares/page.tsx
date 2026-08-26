'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate, today } from '@/lib/utils/date';
import { toast } from 'sonner';

interface Fare {
  id: string;
  routeId: string;
  coachTypeId?: string;
  baseAmount: string | number;
  effectiveFrom: string;
  isActive: boolean;
  route?: { origin: string; destination: string };
  coachType?: { name: string };
}

export default function AdminFaresPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Fare | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [form, setForm] = useState({
    routeId: '',
    coachTypeId: '',
    baseAmount: '850.00',
    effectiveFrom: today(),
    isActive: true,
  });

  const { data: faresData, isLoading } = useQuery({
    queryKey: ['admin', 'fares'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/fares', { params: { limit: 100 } });
      return data?.data || data?.fares || [];
    },
  });

  const { data: routesData } = useQuery({
    queryKey: ['admin', 'routes'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/routes', { params: { limit: 100 } });
      return data?.data || data?.routes || [];
    },
  });

  const { data: coachTypesData } = useQuery({
    queryKey: ['admin', 'coach-types'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/coaches/types');
      return data?.data || data || [];
    },
  });

  const routes = Array.isArray(routesData) ? routesData : [];
  const coachTypes = Array.isArray(coachTypesData) ? coachTypesData : [];

  const createMutation = useMutation({
    mutationFn: (dto: typeof form) => client.post('/api/v1/admin/fares', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fares'] });
      toast.success('Fare created successfully!');
      setShowForm(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create fare'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: typeof form }) =>
      client.patch(`/api/v1/admin/fares/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fares'] });
      toast.success('Fare updated successfully!');
      setShowForm(false);
      setEditing(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update fare'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/fares/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fares'] });
      toast.success('Fare status updated.');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update fare status'),
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/fares/${id}/permanent`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fares'] });
      toast.success('Fare permanently deleted from database!');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to permanently delete fare'),
  });

  const resetForm = () => {
    setForm({
      routeId: routes[0]?.id || '',
      coachTypeId: coachTypes[0]?.id || '',
      baseAmount: '850.00',
      effectiveFrom: today(),
      isActive: true,
    });
  };

  const startEdit = (f: Fare) => {
    setEditing(f);
    setForm({
      routeId: f.routeId || '',
      coachTypeId: f.coachTypeId || '',
      baseAmount: String(f.baseAmount || '850.00'),
      effectiveFrom: f.effectiveFrom ? f.effectiveFrom.split('T')[0] : today(),
      isActive: f.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      routeId: form.routeId || routes[0]?.id || '',
      coachTypeId: form.coachTypeId ? form.coachTypeId : undefined,
      baseAmount: String(form.baseAmount || '850.00'),
      effectiveFrom: form.effectiveFrom ? new Date(form.effectiveFrom).toISOString() : new Date().toISOString(),
      isActive: form.isActive ?? true,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, dto: payload as any });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const fares: Fare[] = Array.isArray(faresData) ? faresData : [];
  const filtered = fares.filter((f) => {
    if (!search) return true;
    const origin = f.route?.origin || '';
    const dest = f.route?.destination || '';
    return origin.toLowerCase().includes(search.toLowerCase()) || dest.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((f) => f.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkStatus = async (isActive: boolean) => {
    if (selectedIds.length === 0) return;
    const label = isActive ? 'ACTIVE' : 'INACTIVE';
    if (!confirm(`Are you sure you want to mark ${selectedIds.length} selected fare(s) as ${label}?`)) return;

    const toastId = toast.loading(`Updating ${selectedIds.length} fare(s)...`);
    try {
      await Promise.all(
        selectedIds.map((id) => client.patch(`/api/v1/admin/fares/${id}`, { isActive }))
      );
      qc.invalidateQueries({ queryKey: ['admin', 'fares'] });
      toast.success(`Updated ${selectedIds.length} fare(s) to ${label}`, { id: toastId });
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update selected fares', { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`PERMANENT DELETE WARNING:\nThis will permanently delete ${selectedIds.length} selected fare(s) from database. Proceed?`)) return;

    const toastId = toast.loading(`Deleting ${selectedIds.length} fare(s)...`);
    try {
      await Promise.all(selectedIds.map((id) => client.delete(`/api/v1/admin/fares/${id}/permanent`)));
      qc.invalidateQueries({ queryKey: ['admin', 'fares'] });
      toast.success(`Permanently deleted ${selectedIds.length} fare(s)`, { id: toastId });
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete selected fares', { id: toastId });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">Fares & Pricing</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">{fares.length} fares configured</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowForm(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> Add Fare
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search fares by route..."
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
              <h2 className="font-bold text-[#111111]">{editing ? 'Edit Fare' : 'Add New Fare'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Select Route</label>
                <select
                  value={form.routeId}
                  onChange={(e) => setForm({ ...form, routeId: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                >
                  <option value="">-- Choose Route --</option>
                  {routes.map((r: { id: string; origin: string; destination: string }) => (
                    <option key={r.id} value={r.id}>
                      {r.origin} → {r.destination}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Coach Type (Optional)</label>
                <select
                  value={form.coachTypeId}
                  onChange={(e) => setForm({ ...form, coachTypeId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                >
                  <option value="">All Coach Types</option>
                  {coachTypes.map((ct: { id: string; name: string }) => (
                    <option key={ct.id} value={ct.id}>{ct.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Base Price (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.baseAmount}
                  onChange={(e) => setForm({ ...form, baseAmount: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Effective Date</label>
                <input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveFare"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#E31B23] rounded focus:ring-[#E31B23]"
                />
                <label htmlFor="isActiveFare" className="text-xs font-bold text-gray-700">Is Active</label>
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
                  {editing ? 'Save Changes' : 'Create Fare'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#111111] text-white px-5 py-3.5 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-4 shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="bg-[#E31B23] text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
              {selectedIds.length} Selected
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-gray-400 hover:text-white underline font-semibold"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs"
            >
              Set Active
            </button>
            <button
              onClick={() => handleBulkStatus(false)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold transition-all shadow-xs"
            >
              Set Inactive
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all shadow-xs"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm min-w-[650px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E31B23] focus:ring-[#E31B23] cursor-pointer"
                  />
                </th>
                {['Route', 'Coach Type', 'Base Price', 'Effective Date', 'Status', 'Actions'].map((h) => (
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
              ) : filtered.map((f) => (
                <tr
                  key={f.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedIds.includes(f.id) ? 'bg-red-50/40' : ''
                  }`}
                >
                  <td className="px-5 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(f.id)}
                      onChange={(e) => handleSelectRow(f.id, e.target.checked)}
                      className="w-4 h-4 rounded text-[#E31B23] focus:ring-[#E31B23] cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-4 font-bold text-[#111111]">
                    {f.route ? `${f.route.origin} → ${f.route.destination}` : 'All Routes'}
                  </td>
                  <td className="px-5 py-4 text-gray-600 font-semibold">{f.coachType?.name || 'All Types'}</td>
                  <td className="px-5 py-4 font-bold text-[#E31B23]">{formatCurrency(Number(f.baseAmount || 0))}</td>
                  <td className="px-5 py-4 text-gray-600 font-medium">{formatDate(f.effectiveFrom)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${f.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                      {f.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(f)} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Edit Fare">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          const newActive = !f.isActive;
                          if (confirm(`Change status to ${newActive ? 'Active' : 'Inactive'}?`)) {
                            if (!newActive) {
                              deleteMutation.mutate(f.id);
                            } else {
                              updateMutation.mutate({ id: f.id, dto: { isActive: true } as any });
                            }
                          }
                        }}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                          f.isActive
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title="Toggle Active/Inactive"
                      >
                        {f.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('PERMANENT DELETE WARNING:\nThis will permanently delete this fare from database. Proceed?')) {
                            permanentDeleteMutation.mutate(f.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm font-medium">No fares found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
