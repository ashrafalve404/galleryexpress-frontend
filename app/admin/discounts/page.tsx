'use client';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import client from '@/lib/api/client';
import { formatDate } from '@/lib/utils/date';

export default function AdminDiscountsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'discounts'],
    queryFn: async () => { const { data } = await client.get('/api/v1/admin/discounts', { params: { limit: 100 } }); return data?.data || data || []; },
  });
  const discounts: Record<string, unknown>[] = Array.isArray(data) ? data : [];
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-[#111111]">Discounts</h1><p className="text-gray-500 text-sm mt-0.5">Promo codes and offers</p></div>
        <button className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-sm font-semibold"><Plus size={15} /> Add Discount</button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['Code', 'Type', 'Value', 'Min. Amount', 'Uses', 'Expires', 'Status'].map((h) => (<th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>))}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? ([1,2,3].map((i) => <tr key={i}>{[1,2,3,4,5,6,7].map((j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-16" /></td>)}</tr>))
              : discounts.map((d) => (
                <tr key={d.id as string} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-mono font-bold text-[#111111]">{d.code as string}</td>
                  <td className="px-5 py-4 text-gray-600">{d.discountType as string}</td>
                  <td className="px-5 py-4 font-semibold text-[#E31B23]">{d.discountType === 'PERCENTAGE' ? `${d.discountValue}%` : `৳${d.discountValue}`}</td>
                  <td className="px-5 py-4 text-gray-600">{d.minBookingAmount ? `৳${d.minBookingAmount}` : '--'}</td>
                  <td className="px-5 py-4 text-gray-600">{d.usedCount as number || 0} / {d.maxUses as number || '∞'}</td>
                  <td className="px-5 py-4 text-gray-600 text-xs">{d.validUntil ? formatDate(d.validUntil as string) : 'No expiry'}</td>
                  <td className="px-5 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{d.isActive ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
              {!isLoading && discounts.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No discounts configured</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
