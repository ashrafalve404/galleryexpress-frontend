'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Building2,
  Ticket,
  Wallet,
  TrendingUp,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  DollarSign,
  Loader2,
} from 'lucide-react';
import apiClient from '@/lib/api/client';

function formatTk(amount: number) {
  return '৳' + Number(amount).toLocaleString('en-BD');
}

export default function AdminCounterAgentsPage() {
  const [activeTab, setActiveTab] = useState<'agents' | 'orders' | 'commissions'>('agents');
  const [overview, setOverview] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [bulkOrders, setBulkOrders] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [ovRes, agRes, boRes, cmRes] = await Promise.all([
        apiClient.get('/api/v1/counter-agent/admin/overview'),
        apiClient.get('/api/v1/counter-agent/admin/agents'),
        apiClient.get('/api/v1/counter-agent/admin/bulk-orders'),
        apiClient.get('/api/v1/counter-agent/admin/commissions'),
      ]);

      setOverview(ovRes.data?.data ?? ovRes.data);
      setAgents(agRes.data?.data ?? agRes.data ?? []);
      setBulkOrders(boRes.data?.data ?? boRes.data ?? []);
      setCommissions(cmRes.data?.data ?? cmRes.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load counter agent activity data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkPaid = async (commissionId: string) => {
    setActionLoading(commissionId);
    try {
      await apiClient.post(`/api/v1/counter-agent/admin/commissions/${commissionId}/pay`);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to mark commission paid.');
    } finally {
      setActionLoading('');
    }
  };

  const filteredAgents = agents.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.firstName?.toLowerCase().includes(q) ||
      a.lastName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.counter?.name?.toLowerCase().includes(q)
    );
  });

  const filteredOrders = bulkOrders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.agent?.firstName?.toLowerCase().includes(q) ||
      o.agent?.lastName?.toLowerCase().includes(q) ||
      o.route?.origin?.toLowerCase().includes(q) ||
      o.route?.destination?.toLowerCase().includes(q)
    );
  });

  const filteredCommissions = commissions.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.agent?.firstName?.toLowerCase().includes(q) ||
      c.agent?.lastName?.toLowerCase().includes(q) ||
      c.triggerBooking?.bookingRef?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#E31B23] animate-spin" />
        <p className="text-sm font-semibold text-gray-600">Loading Counter Agent Monitoring Panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-[#E31B23]" size={26} /> Counter Agent Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Monitor bulk ticket orders, counter assignments, and commission payouts platform-wide
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-3 font-medium">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Top 4 Key Metric Cards */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Active Agents
              </span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">
                {overview.totalAgents}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Total registered agents</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Bulk Investment
              </span>
              <div className="p-2 bg-[#E31B23]/10 text-[#E31B23] rounded-xl">
                <Wallet size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">
                {formatTk(overview.totalInvested)}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {overview.totalBulkTickets} tickets in {overview.totalBulkOrders} orders
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Commission Earned
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">
                {formatTk(overview.totalCommissionEarned)}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Platform total earned</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Pending Payouts
              </span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Clock size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">
                {overview.pendingCommissionsCount}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Unpaid commission records</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs & Search Bar */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('agents')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'agents'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Agents List ({agents.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Bulk Orders ({bulkOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'commissions'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Commission Ledger ({commissions.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agent name, counter, ref..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#E31B23] outline-none"
            />
          </div>
        </div>

        {/* TAB 1: AGENTS LIST */}
        {activeTab === 'agents' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Agent Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Assigned Counter</th>
                  <th className="py-3.5 px-4">Total Invested</th>
                  <th className="py-3.5 px-4">Earned</th>
                  <th className="py-3.5 px-4">Tickets Left</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No counter agents found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((ag) => (
                    <tr key={ag.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {ag.firstName} {ag.lastName}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">
                        <div>{ag.email}</div>
                        <div className="text-gray-400">{ag.phone || '—'}</div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {ag.counter ? (
                          <span className="flex items-center gap-1">
                            <Building2 size={14} className="text-[#E31B23]" />
                            {ag.counter.name}
                          </span>
                        ) : (
                          <span className="text-amber-500 font-normal">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {formatTk(ag.totalInvested)}
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-600">
                        {formatTk(ag.totalEarned)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-purple-700">
                        {ag.totalRemainingTickets} / {ag.totalTicketsBought}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                          {ag.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: BULK ORDERS */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Agent Name</th>
                  <th className="py-3.5 px-4">Route</th>
                  <th className="py-3.5 px-4">Counter</th>
                  <th className="py-3.5 px-4">Qty</th>
                  <th className="py-3.5 px-4">Remaining</th>
                  <th className="py-3.5 px-4">Invested</th>
                  <th className="py-3.5 px-4">Earned</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-400">
                      No bulk orders recorded.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {o.agent?.firstName} {o.agent?.lastName}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {o.route?.origin} → {o.route?.destination}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600">
                        {o.counter?.name ?? '—'}
                      </td>
                      <td className="py-4 px-4 font-bold">{o.quantity}</td>
                      <td className="py-4 px-4 font-semibold text-purple-700">{o.remainingQuantity}</td>
                      <td className="py-4 px-4 font-bold text-gray-900">{formatTk(o.totalAmount)}</td>
                      <td className="py-4 px-4 font-bold text-emerald-600">{formatTk(o.commissionEarned ?? 0)}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            o.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs">
                        {new Date(o.createdAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: COMMISSIONS LEDGER */}
        {activeTab === 'commissions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Agent Name</th>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Pool</th>
                  <th className="py-3.5 px-4">Agent Share</th>
                  <th className="py-3.5 px-4">Split</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      No commission events recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredCommissions.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {c.agent?.firstName} {c.agent?.lastName}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-gray-900">
                        {c.triggerBooking?.bookingRef ?? '—'}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-600">
                        {formatTk(c.totalCommission)}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-emerald-600">
                        {formatTk(c.agentShare)}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">
                        {c.totalAgents} agents
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            c.status === 'PAID'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs">
                        {new Date(c.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {c.status === 'PENDING' ? (
                          <button
                            onClick={() => handleMarkPaid(c.id)}
                            disabled={actionLoading === c.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-50"
                          >
                            {actionLoading === c.id ? 'Saving…' : 'Mark Paid'}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 flex items-center justify-end gap-1 font-semibold">
                            <CheckCircle2 size={14} className="text-blue-500" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
