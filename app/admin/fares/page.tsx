'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import client from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils/currency';

export default function AdminFaresPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'fares'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/fares', { params: { limit: 100 } });
      return data?.data || data || [];
    },
  });
  const fares: Record<string, unknown>[] = Array.isArray(data) ? data : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#111111]">Fares</h1>
          <p className="text-gray-500 text-sm mt-0.5">Route pricing configuration</p>
        </div>
        <button className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={15} /> Add Fare
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Route', 'Coach Type', 'Base Price', 'Currency', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1,2,3].map((i) => <tr key={i}>{[1,2,3,4,5].map((j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-24" /></td>)}</tr>)
              ) : fares.map((f) => {
                const route = f.route as Record<string, unknown> | undefined;
                return (
                  <tr key={f.id as string} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-[#111111]">{route ? `${route.origin} → ${route.destination}` : '--'}</td>
                    <td className="px-5 py-4 text-gray-600">{f.coachType as string || '--'}</td>
                    <td className="px-5 py-4 font-semibold text-[#E31B23]">{formatCurrency(f.basePrice as number || 0)}</td>
                    <td className="px-5 py-4 text-gray-600">{f.currency as string || 'BDT'}</td>
                    <td className="px-5 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{f.isActive ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                );
              })}
              {!isLoading && fares.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">No fares configured</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
