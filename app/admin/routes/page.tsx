'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, Plus, MapPin, Ruler, Clock, Octagon } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';

export default function AdminRoutesPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'routes'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/routes', { params: { limit: 100 } });
      return data?.data || data?.routes || [];
    },
  });

  const routes: Record<string, unknown>[] = (data || []).filter((r: Record<string, unknown>) =>
    !search ||
    (r.origin as string || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.destination as string || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.name as string || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#111111]">Routes</h1>
          <p className="text-gray-500 text-sm mt-0.5">{(data || []).length} routes configured</p>
        </div>
        <button className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={15} /> Add Route
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search routes..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton h-36 rounded-2xl" />)
        ) : routes.map((route) => (
          <div key={route.id as string} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className="font-bold text-[#111111] text-sm">{route.name as string}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${route.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                {route.status as string}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <MapPin size={14} className="text-[#E31B23]" />
              <span className="font-semibold text-gray-900">{route.origin as string}</span>
              <span className="text-gray-400">→</span>
              <span className="font-semibold text-gray-900">{route.destination as string}</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500 pt-3 border-t border-gray-50">
              <span className="flex items-center gap-1"><Ruler size={13} className="text-gray-400" /> {route.distanceKm as number} km</span>
              <span className="flex items-center gap-1"><Clock size={13} className="text-gray-400" /> {route.estimatedDurationMin as number} min</span>
              <span className="flex items-center gap-1"><Octagon size={13} className="text-gray-400" /> {(route.stops as unknown[])?.length || 0} stops</span>
            </div>
          </div>
        ))}
        {!isLoading && routes.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            No routes found
          </div>
        )}
      </div>
    </div>
  );
}
