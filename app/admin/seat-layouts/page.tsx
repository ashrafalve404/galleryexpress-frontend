'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, X, Eye, LayoutGrid, CheckCircle2, Info } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { toast } from 'sonner';
import { useLanguageStore } from '@/lib/store/languageStore';
import { SeatMap } from '@/components/booking/SeatMap';

interface SeatLayout {
  id: string;
  name: string;
  rows: number;
  columns: number;
  layoutConfig: Array<{ label: string; row: number; column: number; deck?: string }>;
  description?: string;
  createdAt?: string;
}

export default function AdminSeatLayoutsPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLayoutForPreview, setSelectedLayoutForPreview] = useState<SeatLayout | null>(null);

  const [form, setForm] = useState({
    name: '',
    pattern: 'CHAIR_2X2' as 'CHAIR_2X2' | 'CHAIR_2X1' | 'SLEEPER_DOUBLE',
    rows: 10,
    columns: 4,
    description: '',
  });

  // Fetch all seat layouts from API
  const { data: layoutsData, isLoading } = useQuery({
    queryKey: ['admin', 'seat-layouts'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/coaches/layouts');
      return data?.data || data || [];
    },
  });

  const createLayoutMutation = useMutation({
    mutationFn: (payload: { name: string; rows: number; columns: number; layoutConfig: object; description?: string }) =>
      client.post('/api/v1/admin/coaches/layouts', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'seat-layouts'] });
      toast.success(isBn ? 'নতুন সিট লেআউট সফলভাবে সংরক্ষিত হয়েছে!' : 'Seat layout created successfully!');
      setShowCreateModal(false);
      resetForm();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create seat layout';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const deleteLayoutMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/coaches/layouts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'seat-layouts'] });
      toast.success(isBn ? 'সিট লেআউট মুছে ফেলা হয়েছে।' : 'Seat layout deleted.');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete layout';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });

  const resetForm = () => {
    setForm({
      name: '',
      pattern: 'CHAIR_2X2',
      rows: 10,
      columns: 4,
      description: '',
    });
  };

  const handlePatternChange = (pattern: 'CHAIR_2X2' | 'CHAIR_2X1' | 'SLEEPER_DOUBLE') => {
    let cols = 4;
    let rows = 10;
    if (pattern === 'CHAIR_2X1') {
      cols = 3;
      rows = 8;
    } else if (pattern === 'SLEEPER_DOUBLE') {
      cols = 3;
      rows = 5;
    }
    setForm({ ...form, pattern, columns: cols, rows });
  };

  const generateLayoutConfig = () => {
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const config: Array<{ label: string; row: number; column: number; deck: string }> = [];

    if (form.pattern === 'SLEEPER_DOUBLE') {
      // Lower deck L1..L(rows*cols)
      let count = 1;
      for (let r = 1; r <= form.rows; r++) {
        for (let c = 1; c <= form.columns; c++) {
          config.push({ label: `L${count}`, row: r, column: c, deck: 'LOWER' });
          count++;
        }
      }
      // Upper deck U1..U(rows*cols)
      count = 1;
      for (let r = 1; r <= form.rows; r++) {
        for (let c = 1; c <= form.columns; c++) {
          config.push({ label: `U${count}`, row: r, column: c, deck: 'UPPER' });
          count++;
        }
      }
    } else {
      for (let r = 0; r < form.rows; r++) {
        const letter = rowLetters[r] || `R${r + 1}`;
        for (let c = 1; c <= form.columns; c++) {
          config.push({
            label: `${letter}${c}`,
            row: r + 1,
            column: c,
            deck: 'SINGLE',
          });
        }
      }
    }
    return config;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const layoutConfig = generateLayoutConfig();
    const payload = {
      name: form.name,
      rows: form.rows,
      columns: form.columns,
      layoutConfig,
      description: form.description || `${form.rows * form.columns} seats template (${form.pattern})`,
    };
    createLayoutMutation.mutate(payload);
  };

  const getLayoutSeatsForPreview = (layout: SeatLayout) => {
    if (Array.isArray(layout.layoutConfig) && layout.layoutConfig.length > 0) {
      return layout.layoutConfig.map((item, idx) => ({
        id: `seat-${idx}`,
        seatNumber: item.label,
        row: item.row,
        column: item.column,
        deck: item.deck || 'SINGLE',
        status: 'AVAILABLE',
      }));
    }
    const total = layout.rows * layout.columns;
    const list: any[] = [];
    for (let i = 1; i <= total; i++) {
      list.push({
        id: `seat-${i}`,
        seatNumber: `S${i}`,
        row: Math.ceil(i / layout.columns),
        column: ((i - 1) % layout.columns) + 1,
        status: 'AVAILABLE',
      });
    }
    return list;
  };

  const layouts: SeatLayout[] = Array.isArray(layoutsData) ? layoutsData : [];
  const filtered = layouts.filter(
    (l) =>
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111] flex items-center gap-2">
            <LayoutGrid className="text-[#E31B23]" size={26} />
            {isBn ? 'সিট লেআউট ম্যানেজার (Seat Layout Templates)' : 'Seat Layout Templates'}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">
            {isBn
              ? 'বাসের জন্য নতুন সিট লেআউট ডিজাইন তৈরি করুন যা কোচ ডিরেক্টরিতে নির্বাচন করা যাবে'
              : 'Design & manage bus seat map layouts for automatic selection during coach setup'}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> {isBn ? 'নতুন লেআউট যোগ করুন' : 'Create New Layout'}
        </button>
      </div>

      {/* Info Notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3 text-sky-900 text-xs sm:text-sm">
        <Info size={20} className="text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-sky-950 mb-0.5">
            {isBn ? 'কিভাবে কাজ করে?' : 'How Seat Layout Templates Work'}
          </span>
          {isBn
            ? 'এখানে নতুন সিট লেআউট তৈরি করলে তা "কোচসমূহ" (Admin Coaches) পেজে কোচ যোগ করার সময় "Seat Layout Format" ড্রপডাউনে স্বয়ংক্রিয়ভাবে দেখাবে।'
            : 'Templates created here immediately populate the "Seat Layout Format" dropdown when adding new buses in the Admin Coaches Fleet page.'}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isBn ? 'লেআউটের নাম দিয়ে খুঁজুন...' : 'Search seat layout templates by name...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm min-w-[650px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  isBn ? 'লেআউটের নাম' : 'Layout Name',
                  isBn ? 'গ্রিড (সারির সংখ্যা × কলাম)' : 'Grid (Rows × Cols)',
                  isBn ? 'মোট সিট' : 'Total Seats',
                  isBn ? 'বিবরণ' : 'Description',
                  isBn ? 'অ্যাকশন' : 'Actions',
                ].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="px-5 py-4 whitespace-nowrap">
                        <div className="skeleton h-4 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((l) => {
                const totalSeats = Array.isArray(l.layoutConfig)
                  ? l.layoutConfig.length
                  : l.rows * l.columns;
                return (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-[#111111] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <LayoutGrid size={16} className="text-[#E31B23]" />
                        <span>{l.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-gray-600 font-bold whitespace-nowrap">
                      {l.rows} × {l.columns}
                    </td>
                    <td className="px-5 py-4 font-black text-gray-900 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-black whitespace-nowrap">
                        {totalSeats} {isBn ? 'সিট' : 'Seats'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{l.description || '--'}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedLayoutForPreview(l)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition-colors flex items-center gap-1.5 text-xs whitespace-nowrap"
                          title={isBn ? 'সিট লেআউট ম্যাপ দেখুন' : 'Preview Seat Map'}
                        >
                          <Eye size={14} />
                          <span>{isBn ? 'প্রিভিউ ম্যাপ' : 'Preview Map'}</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(isBn ? 'এই সিট লেআউটটি মুছে ফেলবেন?' : 'Delete this seat layout template?')) {
                              deleteLayoutMutation.mutate(l.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title={isBn ? 'মুছুন' : 'Delete'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm font-medium">
                    {isBn ? 'কোনো সিট লেআউট ফরম্যাট পাওয়া যায়নি' : 'No seat layout templates found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-black text-gray-900 flex items-center gap-2 text-base">
                <Plus size={18} className="text-[#E31B23]" />
                {isBn ? 'নতুন সিট লেআউট টেমপ্লেট যোগ করুন' : 'Add Seat Layout Template'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  {isBn ? 'লেআউটের নাম (Layout Name)' : 'Layout Name'}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder={isBn ? 'যেমন: 24-Seat 2+1 Deluxe VIP' : 'e.g. 24-Seat 2+1 Deluxe VIP'}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  {isBn ? 'লেআউট টাইপ / প্যাটার্ন' : 'Layout Type / Pattern'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePatternChange('CHAIR_2X2')}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${
                      form.pattern === 'CHAIR_2X2'
                        ? 'bg-[#E31B23] text-white border-[#C41920] shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    2+2 Chair
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePatternChange('CHAIR_2X1')}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${
                      form.pattern === 'CHAIR_2X1'
                        ? 'bg-[#E31B23] text-white border-[#C41920] shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    2+1 VIP
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePatternChange('SLEEPER_DOUBLE')}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${
                      form.pattern === 'SLEEPER_DOUBLE'
                        ? 'bg-[#E31B23] text-white border-[#C41920] shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Sleeper
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    {isBn ? 'সারির সংখ্যা (Rows)' : 'Total Rows'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.rows}
                    onChange={(e) => setForm({ ...form, rows: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    {isBn ? 'কলাম সংখ্যা (Cols)' : 'Total Columns'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={form.columns}
                    onChange={(e) => setForm({ ...form, columns: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{isBn ? 'মোট সিট সংখ্যা:' : 'Total Seat Count:'}</span>
                <span className="text-base text-[#E31B23] font-black">
                  {form.pattern === 'SLEEPER_DOUBLE' ? form.rows * form.columns * 2 : form.rows * form.columns} Seats
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  {isBn ? 'বিবরণ (ঐচ্ছিক)' : 'Description (Optional)'}
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={isBn ? 'যেমন: প্রিমিয়াম স্লিপার ও ভিআইপি লাক্সারি কোচ' : 'e.g. Premium VIP Luxury Coach'}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={createLayoutMutation.isPending}
                  className="flex-1 bg-[#E31B23] hover:bg-[#C41920] text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  <span>{isBn ? 'লেআউট সংরক্ষণ করুন' : 'Save Template'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Map Lightbox Modal */}
      {selectedLayoutForPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Eye className="text-[#E31B23]" size={20} />
                  {selectedLayoutForPreview.name} — {isBn ? 'সিট ম্যাপ প্রিভিউ' : 'Seat Layout Map Preview'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {selectedLayoutForPreview.rows} × {selectedLayoutForPreview.columns} Grid •{' '}
                  {Array.isArray(selectedLayoutForPreview.layoutConfig)
                    ? selectedLayoutForPreview.layoutConfig.length
                    : selectedLayoutForPreview.rows * selectedLayoutForPreview.columns}{' '}
                  {isBn ? 'সিট' : 'Total Seats'}
                </p>
              </div>
              <button
                onClick={() => setSelectedLayoutForPreview(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-2">
              <SeatMap
                seats={getLayoutSeatsForPreview(selectedLayoutForPreview)}
                selectedSeats={[]}
                onToggle={() => {}}
                maxSeats={selectedLayoutForPreview.rows * selectedLayoutForPreview.columns}
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedLayoutForPreview(null)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
              >
                {isBn ? 'বন্ধ করুন' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
