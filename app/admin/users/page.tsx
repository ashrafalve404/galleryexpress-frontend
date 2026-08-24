'use client';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import client from '@/lib/api/client';
import { formatDate } from '@/lib/utils/date';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => { const { data } = await client.get('/api/v1/admin/users', { params: { limit: 50 } }); return data?.data || data || []; },
  });
  const users: Record<string, unknown>[] = (Array.isArray(data) ? data : []).filter((u: Record<string, unknown>) =>
    !search || (u.name as string || '').toLowerCase().includes(search.toLowerCase()) || (u.email as string || '').toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-[#111111]">Users</h1><p className="text-gray-500 text-sm mt-0.5">User accounts management</p></div>
        <button className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white px-4 py-2.5 rounded-xl text-sm font-semibold"><Plus size={15} /> Add User</button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none" /></div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined'].map((h) => (<th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>))}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? ([1,2,3,4,5].map((i) => <tr key={i}>{[1,2,3,4,5,6].map((j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-24" /></td>)}</tr>))
              : users.map((u) => (
                <tr key={u.id as string} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-[#111111]">{u.name as string}</td>
                  <td className="px-5 py-4 text-gray-600">{u.email as string}</td>
                  <td className="px-5 py-4 text-gray-600">{u.phone as string || '--'}</td>
                  <td className="px-5 py-4"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{u.role as string}</span></td>
                  <td className="px-5 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{u.status as string}</span></td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{u.createdAt ? formatDate(u.createdAt as string) : '--'}</td>
                </tr>
              ))}
              {!isLoading && users.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
