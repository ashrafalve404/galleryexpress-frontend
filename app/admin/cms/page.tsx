'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, FileText, Globe, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { toast } from 'sonner';

interface CmsPageItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  isPublished?: boolean;
}

export default function AdminCmsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CmsPageItem | null>(null);

  const [form, setForm] = useState({
    slug: '',
    title: '',
    content: '',
    isPublished: true,
  });

  const { data: pagesData, isLoading } = useQuery({
    queryKey: ['admin', 'cms'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/cms');
      return data?.data || data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (dto: typeof form) => client.post('/api/v1/admin/cms', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'cms'] });
      toast.success('CMS Page created!');
      setShowForm(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create page'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: typeof form }) =>
      client.patch(`/api/v1/admin/cms/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'cms'] });
      toast.success('CMS Page updated!');
      setShowForm(false);
      setEditing(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update page'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/admin/cms/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'cms'] });
      toast.success('CMS Page deleted.');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete page'),
  });

  const resetForm = () => {
    setForm({ slug: '', title: '', content: '', isPublished: true });
  };

  const startEdit = (p: CmsPageItem) => {
    setEditing(p);
    setForm({
      slug: p.slug,
      title: p.title,
      content: p.content || '',
      isPublished: p.isPublished ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      slug: form.slug.toLowerCase().trim().replace(/\s+/g, '-'),
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, dto: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const pages: CmsPageItem[] = Array.isArray(pagesData) ? pagesData : [];
  const filtered = pages.filter((p) =>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">CMS Pages</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">{pages.length} content pages managed</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowForm(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> Add Page
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20"
          />
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-[#111111]">{editing ? 'Edit CMS Page' : 'Add New CMS Page'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Page Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  required
                  placeholder="e.g. Terms & Conditions"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Page Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="e.g. terms-and-conditions"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Content (Markdown / HTML)</label>
                <textarea
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                  placeholder="Write page content here..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPub"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 text-[#E31B23] rounded focus:ring-[#E31B23]"
                />
                <label htmlFor="isPub" className="text-xs font-bold text-gray-700">Published</label>
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
                  {editing ? 'Save Changes' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)
        ) : filtered.map((page) => (
          <div key={page.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow relative">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-[#111111] text-base">{page.title}</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(page)} className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => { if (confirm('Delete page?')) deleteMutation.mutate(page.id); }} className="p-1 rounded text-gray-400 hover:text-rose-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-mono mb-3">/{page.slug}</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${page.isPublished !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                {page.isPublished !== false ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm font-medium">
            No CMS pages found
          </div>
        )}
      </div>
    </div>
  );
}
