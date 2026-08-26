'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Calendar, Clock, Bus, MapPin, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { formatDate, formatTime, today } from '@/lib/utils/date';
import { toast } from 'sonner';

interface Schedule {
  id: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  coachId?: string;
  routeId?: string;
  coach?: { name: string; coachNumber?: string; registrationNumber?: string };
  route?: { origin: string; destination: string };
  fare?: { basePrice: number };
}

export default function AdminSchedulesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [form, setForm] = useState({
    coachId: '',
    routeId: '',
    departureDate: today(),
    departureTime: '07:30',
    arrivalTime: '13:30',
    status: 'ACTIVE',
  });

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ['admin', 'schedules'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/schedules', { params: { limit: 100 } });
      return data?.data || data?.schedules || [];
    },
  });

  const { data: coachesData } = useQuery({
    queryKey: ['admin', 'coaches'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/coaches', { params: { limit: 100 } });
      return data?.data || data?.coaches || [];
    },
  });

  const { data: routesData } = useQuery({
    queryKey: ['admin', 'routes'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/routes', { params: { limit: 100 } });
      return data?.data || data?.routes || [];
    },
  });

  const coaches = Array.isArray(coachesData) ? coachesData : [];
  const routes = Array.isArray(routesData) ? routesData : [];

  const createMutation = useMutation({
    mutationFn: (dto: typeof form) => client.post('/api/v1/admin/schedules', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      toast.success('Schedule created successfully!');
      setShowForm(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create schedule'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: typeof form }) =>
      client.patch(`/api/v1/admin/schedules/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      toast.success('Schedule updated successfully!');
      setShowForm(false);
      setEditing(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update schedule'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/schedules/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      toast.success('Schedule status set to CANCELLED');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to cancel schedule'),
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/schedules/${id}/permanent`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      toast.success('Schedule permanently deleted from database!');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to permanently delete schedule'),
  });

  const resetForm = () => {
    setForm({
      coachId: coaches[0]?.id || '',
      routeId: routes[0]?.id || '',
      departureDate: today(),
      departureTime: '07:30',
      arrivalTime: '13:30',
      status: 'ACTIVE',
    });
  };

  const startEdit = (s: Schedule) => {
    setEditing(s);
    setForm({
      coachId: s.coachId || '',
      routeId: s.routeId || '',
      departureDate: s.departureDate ? s.departureDate.split('T')[0] : today(),
      departureTime: s.departureTime || '07:30',
      arrivalTime: s.arrivalTime || '13:30',
      status: s.status || 'ACTIVE',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      coachId: form.coachId || coaches[0]?.id,
      routeId: form.routeId || routes[0]?.id,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, dto: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const schedules: Schedule[] = Array.isArray(schedulesData) ? schedulesData : [];
  const filtered = schedules.filter((s) => {
    if (!search) return true;
    const coachName = s.coach?.name || '';
    const origin = s.route?.origin || '';
    const dest = s.route?.destination || '';
    return (
      coachName.toLowerCase().includes(search.toLowerCase()) ||
      origin.toLowerCase().includes(search.toLowerCase()) ||
      dest.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((s) => s.id));
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

  const handleBulkStatus = async (status: 'ACTIVE' | 'CANCELLED') => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to mark ${selectedIds.length} selected schedule(s) as ${status}?`)) return;

    const toastId = toast.loading(`Updating ${selectedIds.length} schedule(s)...`);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          status === 'CANCELLED'
            ? client.delete(`/api/v1/admin/schedules/${id}`)
            : client.patch(`/api/v1/admin/schedules/${id}`, { status: 'ACTIVE' })
        )
      );
      qc.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      toast.success(`Updated ${selectedIds.length} schedule(s) to ${status}`, { id: toastId });
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update selected schedules', { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`PERMANENT DELETE WARNING:\nThis will permanently delete ${selectedIds.length} selected schedule(s) from database. Proceed?`)) return;

    const toastId = toast.loading(`Deleting ${selectedIds.length} schedule(s)...`);
    try {
      await Promise.all(selectedIds.map((id) => client.delete(`/api/v1/admin/schedules/${id}/permanent`)));
      qc.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      toast.success(`Permanently deleted ${selectedIds.length} schedule(s)`, { id: toastId });
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete selected schedules', { id: toastId });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">Bus Schedules</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">{schedules.length} schedules listed</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowForm(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> Add Schedule
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search schedules..."
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
              <h2 className="font-bold text-[#111111]">{editing ? 'Edit Schedule' : 'Add New Schedule'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Select Coach</label>
                <select
                  value={form.coachId}
                  onChange={(e) => setForm({ ...form, coachId: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                >
                  <option value="">-- Choose Coach --</option>
                  {coaches.map((c: { id: string; name: string; registrationNumber?: string }) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

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
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Departure Date</label>
                <input
                  type="date"
                  value={form.departureDate}
                  onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Departure Time</label>
                  <input
                    type="time"
                    value={form.departureTime}
                    onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Arrival Time</label>
                  <input
                    type="time"
                    value={form.arrivalTime}
                    onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
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
                  {editing ? 'Save Changes' : 'Create Schedule'}
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
              onClick={() => handleBulkStatus('ACTIVE')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs"
            >
              Set Active
            </button>
            <button
              onClick={() => handleBulkStatus('CANCELLED')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold transition-all shadow-xs"
            >
              Cancel Selected
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
          <table className="w-full text-xs sm:text-sm min-w-[700px]">
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
                {['Route', 'Coach', 'Date', 'Dep — Arr', 'Status', 'Actions'].map((h) => (
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
              ) : filtered.map((s) => (
                <tr
                  key={s.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedIds.includes(s.id) ? 'bg-red-50/40' : ''
                  }`}
                >
                  <td className="px-5 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={(e) => handleSelectRow(s.id, e.target.checked)}
                      className="w-4 h-4 rounded text-[#E31B23] focus:ring-[#E31B23] cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-4 font-bold text-[#111111]">
                    {s.route ? `${s.route.origin} → ${s.route.destination}` : 'Standard Route'}
                  </td>
                  <td className="px-5 py-4 text-gray-600 font-medium">{s.coach?.name || 'Luxury Coach'}</td>
                  <td className="px-5 py-4 text-gray-600 font-semibold">{formatDate(s.departureDate)}</td>
                  <td className="px-5 py-4 font-mono font-bold text-[#111111]">
                    {formatTime(s.departureTime)} - {formatTime(s.arrivalTime)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Edit Schedule">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          const isCancelled = s.status === 'CANCELLED';
                          const newStatus = isCancelled ? 'ACTIVE' : 'CANCELLED';
                          if (confirm(`Change trip status to ${newStatus}?`)) {
                            if (isCancelled) {
                              updateMutation.mutate({ id: s.id, dto: { status: 'ACTIVE' } as any });
                            } else {
                              cancelMutation.mutate(s.id);
                            }
                          }
                        }}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                          s.status === 'CANCELLED'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                        title={s.status === 'CANCELLED' ? 'Re-activate Trip' : 'Cancel Trip'}
                      >
                        {s.status === 'CANCELLED' ? 'Activate Trip' : 'Cancel Trip'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('PERMANENT DELETE WARNING:\nThis will permanently delete this schedule and associated seat locks from database. Proceed?')) {
                            permanentDeleteMutation.mutate(s.id);
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
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm font-medium">No schedules found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
