'use client';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2, Phone } from 'lucide-react';
import client from '@/lib/api/client';

export default function AdminCountersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'counters'],
    queryFn: async () => { const { data } = await client.get('/api/v1/admin/counters', { params: { limit: 100 } }); return data?.data || data || []; },
  });
  const counters: Record<string, unknown>[] = Array.isArray(data) ? data : [];
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-[#111111]">Counters</h1><p className="text-gray-500 text-sm mt-0.5">Sales counters and offices</p></div>
        <button className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-sm font-semibold"><Plus size={15} /> Add Counter</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? ([1,2,3,4].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />))
        : counters.map((c) => (
          <div key={c.id as string} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2"><Building2 size={16} className="text-[#E31B23]" /><span className="font-bold text-[#111111] text-sm">{String(c.name || 'Counter')}</span></div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="text-xs text-gray-500">{String(c.address || c.city || '--')}</div>
            {Boolean(c.phone) && <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Phone size={12} className="text-gray-400" /> {String(c.phone)}</div>}
          </div>
        ))}
        {!isLoading && counters.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No counters configured</div>
        )}
      </div>
    </div>
  );
}
