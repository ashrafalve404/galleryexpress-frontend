'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MapPin, Phone, UserCheck, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { toast } from 'sonner';

interface Counter {
  id: string;
  name: string;
  location?: string;
  phone?: string;
  status: string;
  _count?: { bookings: number };
}

export default function AdminCountersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Counter | null>(null);

  const [form, setForm] = useState({
    name: '',
    location: '',
    phone: '',
  });

  const { data: countersData, isLoading } = useQuery({
    queryKey: ['admin', 'counters'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/counters');
      return data?.data || data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (dto: typeof form) => client.post('/api/v1/admin/counters', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'counters'] });
      toast.success('Counter created successfully!');
      setShowForm(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create counter'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: typeof form }) =>
      client.patch(`/api/v1/admin/counters/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'counters'] });
      toast.success('Counter updated!');
      setShowForm(false);
      setEditing(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update counter'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/counters/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'counters'] });
      toast.success('Counter removed.');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to remove counter'),
  });

  const resetForm = () => {
    setForm({ name: '', location: '', phone: '' });
  };

  const startEdit = (c: Counter) => {
    setEditing(c);
    setForm({
      name: c.name,
      location: c.location || '',
      phone: c.phone || '',
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

  const counters: Counter[] = Array.isArray(countersData) ? countersData : [];
  const filtered = counters.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">Ticket Counters</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">{counters.length} counters active</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowForm(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> Add Counter
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search counters by name or location..."
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
              <h2 className="font-bold text-[#111111]">{editing ? 'Edit Counter' : 'Add New Counter'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Counter Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Sayedabad Gate 2 Counter"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Address / Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Sayedabad Bus Terminal, Dhaka"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 01711002233"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
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
                  {editing ? 'Save Changes' : 'Create Counter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)
        ) : filtered.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow relative">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-[#111111] text-base">{c.name}</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(c)} className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => { if (confirm('Delete counter?')) deleteMutation.mutate(c.id); }} className="p-1 rounded text-gray-400 hover:text-rose-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-gray-600 mb-3 font-medium">
              <div className="flex items-center gap-1.5"><MapPin size={13} className="text-[#E31B23] shrink-0" /> {c.location || 'Terminal Counter'}</div>
              <div className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400 shrink-0" /> {c.phone || 'N/A'}</div>
            </div>
          </div>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm font-medium">
            No counters found
          </div>
        )}
      </div>
    </div>
  );
}
