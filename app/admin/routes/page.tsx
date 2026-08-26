'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, MapPin, Ruler, Clock, Octagon, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { toast } from 'sonner';

interface RouteItem {
  id: string;
  origin: string;
  destination: string;
  distanceKm?: number;
  durationMins?: number;
  status: string;
}

export default function AdminRoutesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RouteItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [form, setForm] = useState({
    origin: '',
    destination: '',
    distanceKm: 250,
    durationMins: 300,
    status: 'ACTIVE',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'routes'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/routes', { params: { limit: 100 } });
      return data?.data || data?.routes || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (dto: typeof form) => client.post('/api/v1/admin/routes', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'routes'] });
      toast.success('Route created successfully!');
      setShowForm(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create route'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: typeof form }) =>
      client.patch(`/api/v1/admin/routes/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'routes'] });
      toast.success('Route updated successfully!');
      setShowForm(false);
      setEditing(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update route'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/routes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'routes'] });
      toast.success('Route status set to INACTIVE');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to deactivate route'),
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/routes/${id}/permanent`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'routes'] });
      toast.success('Route permanently deleted from database!');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to permanently delete route'),
  });

  const resetForm = () => {
    setForm({ origin: '', destination: '', distanceKm: 250, durationMins: 300, status: 'ACTIVE' });
  };

  const startEdit = (r: RouteItem) => {
    setEditing(r);
    setForm({
      origin: r.origin,
      destination: r.destination,
      distanceKm: r.distanceKm || 250,
      durationMins: r.durationMins || 300,
      status: r.status || 'ACTIVE',
    });
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

  const routes: RouteItem[] = Array.isArray(data) ? data : [];
  const filtered = routes.filter((r) =>
    !search ||
    r.origin.toLowerCase().includes(search.toLowerCase()) ||
    r.destination.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((r) => r.id));
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

  const handleBulkStatus = async (status: 'ACTIVE' | 'INACTIVE') => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to mark ${selectedIds.length} selected route(s) as ${status}?`)) return;

    const toastId = toast.loading(`Updating ${selectedIds.length} route(s)...`);
    try {
      await Promise.all(
        selectedIds.map((id) => client.patch(`/api/v1/admin/routes/${id}`, { status }))
      );
      qc.invalidateQueries({ queryKey: ['admin', 'routes'] });
      toast.success(`Updated ${selectedIds.length} route(s) to ${status}`, { id: toastId });
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update selected routes', { id: toastId });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`PERMANENT DELETE WARNING:\nThis will permanently delete ${selectedIds.length} selected route(s) from database. Proceed?`)) return;

    const toastId = toast.loading(`Deleting ${selectedIds.length} route(s)...`);
    try {
      await Promise.all(selectedIds.map((id) => client.delete(`/api/v1/admin/routes/${id}/permanent`)));
      qc.invalidateQueries({ queryKey: ['admin', 'routes'] });
      toast.success(`Permanently deleted ${selectedIds.length} route(s)`, { id: toastId });
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete selected routes', { id: toastId });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">Routes</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">{routes.length} routes configured</p>
        </div>
        <div className="flex items-center gap-2">
          {filtered.length > 0 && (
            <button
              onClick={() => handleSelectAll(selectedIds.length !== filtered.length)}
              className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
            >
              {selectedIds.length === filtered.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          <button
            onClick={() => {
              setEditing(null);
              resetForm();
              setShowForm(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus size={16} /> Add Route
          </button>
        </div>
      </div>

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
              onClick={() => handleBulkStatus('INACTIVE')}
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

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search routes by origin, destination..."
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
              <h2 className="font-bold text-[#111111]">{editing ? 'Edit Route' : 'Add New Route'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Origin City</label>
                <input
                  type="text"
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  required
                  placeholder="e.g. Dhaka"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Destination City</label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  required
                  placeholder="e.g. Chittagong"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Distance (km)</label>
                  <input
                    type="number"
                    value={form.distanceKm}
                    onChange={(e) => setForm({ ...form, distanceKm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={form.durationMins}
                    onChange={(e) => setForm({ ...form, durationMins: parseInt(e.target.value) || 0 })}
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
                  <option value="INACTIVE">Inactive</option>
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
                  {editing ? 'Save Changes' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
        ) : filtered.map((route) => (
          <div
            key={route.id}
            className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow relative group ${
              selectedIds.includes(route.id) ? 'border-[#E31B23] bg-red-50/20 ring-1 ring-[#E31B23]' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(route.id)}
                  onChange={(e) => handleSelectRow(route.id, e.target.checked)}
                  className="w-4 h-4 rounded text-[#E31B23] focus:ring-[#E31B23] cursor-pointer"
                />
                <span className="font-bold text-[#111111] text-sm">{route.origin} → {route.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${route.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                  {route.status}
                </span>
                <button onClick={() => startEdit(route)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit Route">
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    const newStatus = route.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                    if (confirm(`Change status to ${newStatus}?`)) {
                      updateMutation.mutate({ id: route.id, dto: { status: newStatus } as any });
                    }
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                    route.status === 'ACTIVE'
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                  title="Toggle Active/Inactive"
                >
                  {route.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => {
                    if (confirm('PERMANENT DELETE WARNING:\nThis will permanently delete this route and its stops from the database. Proceed?')) {
                      permanentDeleteMutation.mutate(route.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Permanently"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <MapPin size={15} className="text-[#E31B23] shrink-0" />
              <span className="font-bold text-gray-900">{route.origin}</span>
              <span className="text-gray-400">→</span>
              <span className="font-bold text-gray-900">{route.destination}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-3 border-t border-gray-50 font-medium">
              <span className="flex items-center gap-1"><Ruler size={13} className="text-gray-400" /> {route.distanceKm || 0} km</span>
              <span className="flex items-center gap-1"><Clock size={13} className="text-gray-400" /> {route.durationMins || 0} min</span>
            </div>
          </div>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm font-medium">
            No routes found
          </div>
        )}
      </div>
    </div>
  );
}
