'use client';
import { useQuery } from '@tanstack/react-query';
import { Plus, Image } from 'lucide-react';
import client from '@/lib/api/client';

export default function AdminSlidersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'sliders'],
    queryFn: async () => { const { data } = await client.get('/api/v1/admin/sliders'); return data?.data || data || []; },
  });
  const sliders: Record<string, unknown>[] = Array.isArray(data) ? data : [];
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-[#111111]">Sliders</h1><p className="text-gray-500 text-sm mt-0.5">Homepage banner images</p></div>
        <button className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-sm font-semibold"><Plus size={15} /> Add Slider</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? ([1,2,3].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />))
        : sliders.map((s) => (
          <div key={s.id as string} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {s.imageUrl ? (
                <img src={s.imageUrl as string} alt={s.title as string} className="w-full h-full object-cover" />
              ) : (
                <Image size={32} className="text-gray-300" />
              )}
            </div>
            <div className="p-4">
              <div className="font-semibold text-[#111111] text-sm">{s.title as string || 'Untitled'}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.subtitle as string || ''}</div>
              <div className="flex justify-between items-center mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                <div className="flex gap-1.5">
                  <button className="text-xs text-blue-500 hover:underline">Edit</button>
                  <button className="text-xs text-red-400 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && sliders.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Image size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No sliders yet. Add your first banner image.</p>
          </div>
        )}
      </div>
    </div>
  );
}
