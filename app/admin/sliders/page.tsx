'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Image as ImageIcon, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { toast } from 'sonner';

interface SliderItem {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  status?: string;
}

export default function AdminSlidersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SliderItem | null>(null);

  const [form, setForm] = useState({
    imageUrl: '/hero-bus-bd.png',
    title: '',
    subtitle: '',
    ctaText: 'Book Now',
    ctaUrl: '/search',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const { data: slidersData, isLoading } = useQuery({
    queryKey: ['admin', 'sliders'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/sliders');
      return data?.data || data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (dto: typeof form) => client.post('/api/v1/admin/sliders', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'sliders'] });
      toast.success('Banner slider created!');
      setShowForm(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create slider'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: typeof form }) =>
      client.patch(`/api/v1/admin/sliders/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'sliders'] });
      toast.success('Slider updated!');
      setShowForm(false);
      setEditing(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update slider'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/sliders/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'sliders'] });
      toast.success('Slider deleted.');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete slider'),
  });

  const resetForm = () => {
    setForm({
      imageUrl: '/hero-bus-bd.png',
      title: '',
      subtitle: '',
      ctaText: 'Book Now',
      ctaUrl: '/search',
      status: 'ACTIVE',
    });
  };

  const startEdit = (s: SliderItem) => {
    setEditing(s);
    setForm({
      imageUrl: s.imageUrl || '/hero-bus-bd.png',
      title: s.title || '',
      subtitle: s.subtitle || '',
      ctaText: s.ctaText || 'Book Now',
      ctaUrl: s.ctaUrl || '/search',
      status: (s.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
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

  const sliders: SliderItem[] = Array.isArray(slidersData) ? slidersData : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">Homepage Sliders</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">{sliders.length} banner slides configured</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowForm(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> Add Slider
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-[#111111]">{editing ? 'Edit Slider' : 'Add New Slider'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Image URL</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  required
                  placeholder="e.g. /hero-bus-bd.png"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Eid Special Discount"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Save 20% on Cox's Bazar tickets"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Button Text</label>
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    placeholder="Book Now"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
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
                  {editing ? 'Save Changes' : 'Create Slider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading ? (
          [1, 2].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)
        ) : sliders.map((slide) => (
          <div key={slide.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow relative flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="w-20 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
                <img src={slide.imageUrl || '/hero-bus-bd.png'} alt={slide.title || 'Slider'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#111111] text-sm truncate">{slide.title || 'Untitled Banner'}</h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">{slide.subtitle || 'No subtitle'}</p>
                <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${slide.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                  {slide.status || 'ACTIVE'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(slide)} className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => { if (confirm('Delete slider?')) deleteMutation.mutate(slide.id); }} className="p-1 rounded text-gray-400 hover:text-rose-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && sliders.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm font-medium">
            No sliders configured
          </div>
        )}
      </div>
    </div>
  );
}
