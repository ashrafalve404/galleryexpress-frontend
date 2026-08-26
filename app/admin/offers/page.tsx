'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles, Plus, Trash2, Edit3, Eye, EyeOff, Search, RefreshCw, X, Upload
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  adminGetOffers, adminCreateOffer, adminUpdateOffer, adminDeleteOffer, type OfferItem
} from '@/lib/api/offers';

const SAMPLE_POSTER_PRESETS = [
  { name: "Cox's Bazar", url: '/dest-coxsbazar.png' },
  { name: 'Chittagong', url: '/dest-chittagong.png' },
  { name: 'Sylhet', url: '/dest-sylhet.png' },
  { name: 'Comilla', url: '/dest-comilla.png' },
  { name: 'Rajshahi', url: '/dest-rajshahi.png' },
];

export default function AdminOffersPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    title: '',
    imageUrl: '/dest-coxsbazar.png',
    orderIndex: 0,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const { data: offersData, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'offers'],
    queryFn: adminGetOffers,
  });

  const offers: OfferItem[] = Array.isArray(offersData) ? offersData : [];

  const filteredOffers = offers.filter((o) =>
    o.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: adminCreateOffer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'offers'] });
      qc.invalidateQueries({ queryKey: ['public', 'offers'] });
      toast.success('Promotional Offer Poster added!');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create offer poster');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<OfferItem> }) =>
      adminUpdateOffer(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'offers'] });
      qc.invalidateQueries({ queryKey: ['public', 'offers'] });
      toast.success('Offer poster updated!');
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update offer poster');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteOffer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'offers'] });
      qc.invalidateQueries({ queryKey: ['public', 'offers'] });
      toast.success('Offer poster deleted');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete offer poster');
    },
  });

  const openCreateModal = () => {
    setEditingOffer(null);
    setForm({
      title: 'Offer Poster #' + (offers.length + 1),
      imageUrl: '/dest-coxsbazar.png',
      orderIndex: offers.length + 1,
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const openEditModal = (offer: OfferItem) => {
    setEditingOffer(offer);
    setForm({
      title: offer.title || '',
      imageUrl: offer.imageUrl || '/dest-coxsbazar.png',
      orderIndex: offer.orderIndex || 0,
      status: offer.status || 'ACTIVE',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingOffer(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(webp|png|jpeg|jpg)$/i)) {
      toast.error('Please select a valid image file (WebP, PNG, JPG, JPEG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const src = uploadEvent.target?.result as string;
      if (!src) return;

      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.88);
          setForm((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
          toast.success(`Poster image loaded & optimized (${file.name})`);
        } else {
          setForm((prev) => ({ ...prev, imageUrl: src }));
          toast.success(`Poster image loaded (${file.name})`);
        }
      };
      img.onerror = () => {
        setForm((prev) => ({ ...prev, imageUrl: src }));
        toast.success(`Poster image loaded (${file.name})`);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl.trim()) { toast.error('Poster Image is required'); return; }

    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer.id, dto: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const toggleStatus = (offer: OfferItem) => {
    const nextStatus = offer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateMutation.mutate({ id: offer.id, dto: { status: nextStatus } });
  };

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">Offer Posters Management</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">
            Upload 1:1 aspect ratio promotional poster images (WebP, PNG, JPG) to display on the public website
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={16} />
          Upload New Poster
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search poster title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
          />
        </div>
        <button
          onClick={() => refetch()}
          className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors shrink-0"
          title="Refresh List"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Offers Cards Grid (1:1 Aspect Ratio Preview) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-md mx-auto">
          <Sparkles size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-lg mb-1">No Posters Found</h3>
          <p className="text-gray-500 text-sm mb-5">Click "Upload New Poster" to upload a 1:1 image.</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-[#E31B23] text-white px-4 py-2 rounded-xl text-sm font-bold"
          >
            <Plus size={16} /> Upload First Poster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className={`group relative aspect-square rounded-3xl overflow-hidden border shadow-md flex flex-col justify-between transition-all ${
                offer.status === 'ACTIVE'
                  ? 'border-gray-200 hover:shadow-xl'
                  : 'border-amber-300 bg-amber-50/20 opacity-60'
              }`}
            >
              {/* Poster Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={offer.imageUrl || '/dest-coxsbazar.png'}
                  alt={offer.title || 'Poster'}
                  fill
                  sizes="300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Action Toolbar Overlay */}
              <div className="relative z-10 p-3 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent">
                <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs">
                  #{offer.orderIndex}
                </span>

                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-xl p-1">
                  <button
                    onClick={() => toggleStatus(offer)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                      offer.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/40'
                    }`}
                    title={offer.status === 'ACTIVE' ? 'Set Inactive' : 'Set Active'}
                  >
                    {offer.status === 'ACTIVE' ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  <button
                    onClick={() => openEditModal(offer)}
                    className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                    title="Edit Poster"
                  >
                    <Edit3 size={14} />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Delete this poster?')) {
                        deleteMutation.mutate(offer.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/30 transition-colors"
                    title="Delete Poster"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form for Create / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <h2 className="text-lg font-black text-gray-900">
                {editingOffer ? 'Edit Offer Poster' : 'Upload 1:1 Offer Poster'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Poster Label / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cox's Bazar Eid Promo Poster"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#E31B23]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Upload Poster File (WebP, PNG, JPG) *
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-[#E31B23]/10 hover:bg-[#E31B23]/20 text-[#E31B23] px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                    <Upload size={15} /> Choose Image File
                    <input
                      type="file"
                      accept="image/webp,image/png,image/jpeg,image/jpg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-gray-500 font-medium">or paste image URL below</span>
                </div>

                <input
                  type="text"
                  required
                  placeholder="e.g. /dest-coxsbazar.png or https://..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#E31B23] mb-2"
                />

                {/* Live 1:1 Poster Preview */}
                {form.imageUrl && (
                  <div className="mt-3 relative w-32 aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm mx-auto">
                    <Image
                      src={form.imageUrl}
                      alt="1:1 Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Display Order Index
                </label>
                <input
                  type="number"
                  value={form.orderIndex}
                  onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#E31B23]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Status:</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#E31B23]"
                >
                  <option value="ACTIVE">ACTIVE (Visible on Homepage)</option>
                  <option value="INACTIVE">INACTIVE (Hidden)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-[#E31B23] hover:bg-[#C41920] text-white rounded-xl text-sm font-bold shadow-md"
                >
                  {editingOffer ? 'Save Poster' : 'Upload Poster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
