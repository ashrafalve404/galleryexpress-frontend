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
  Trash2,
  Power,
  Eye,
  X,
  ShieldCheck,
  Phone,
  Mail,
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useLanguageStore } from '@/lib/store/languageStore';
import { toast } from 'sonner';

function formatTk(amount: number) {
  return '৳' + Number(amount).toLocaleString('en-BD');
}

export default function AdminCounterAgentsPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';
  const [activeTab, setActiveTab] = useState<'agents' | 'orders' | 'commissions'>('agents');
  const [overview, setOverview] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [bulkOrders, setBulkOrders] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Agent Details Modal States
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedAgentSummary, setSelectedAgentSummary] = useState<any | null>(null);
  const [agentDetails, setAgentDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [modalTab, setModalTab] = useState<'overview' | 'bulk' | 'referrals' | 'sales' | 'ledger'>('overview');

  const handleOpenAgentDetails = async (agent: any) => {
    const agentId = typeof agent === 'string' ? agent : agent.id;
    const summary = typeof agent === 'object' ? agent : agents.find((a) => a.id === agentId) || null;
    setSelectedAgentId(agentId);
    setSelectedAgentSummary(summary);
    setModalTab('overview');
    setDetailsLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/counter-agent/admin/agents/${agentId}/details`);
      setAgentDetails(res.data?.data ?? res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load agent full details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleAgentStatus = async (agentId: string, name: string, currentStatus: string) => {
    const newStatus = currentStatus === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    const actionName = newStatus === 'INACTIVE' ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${actionName} Counter Agent "${name}"?`)) return;
    setActionLoading(agentId);
    try {
      await apiClient.patch(`/api/v1/admin/users/${agentId}`, { status: newStatus });
      toast.success(`Agent "${name}" updated to ${newStatus}.`);
      await loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Failed to ${actionName} agent.`);
    } finally {
      setActionLoading('');
    }
  };

  const handleDeleteAgent = async (agentId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete Counter Agent "${name}"? This action cannot be undone.`)) return;
    try {
      await apiClient.delete(`/api/v1/admin/users/${agentId}`);
      toast.success(`Agent "${name}" deleted successfully.`);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete agent.');
    }
  };

  const handleDeleteOrder = async (orderId: string, qty: number, amount: number) => {
    if (!confirm(`Are you sure you want to delete this bulk order of ${qty} tickets (৳${amount})? This will remove the remaining tickets from the agent's quota.`)) return;
    setActionLoading(orderId);
    try {
      await apiClient.delete(`/api/v1/counter-agent/admin/bulk-orders/${orderId}`);
      toast.success('Bulk ticket order deleted successfully.');
      await loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete bulk ticket order.');
    } finally {
      setActionLoading('');
    }
  };

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

  const handleApproveOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await apiClient.post(`/api/v1/counter-agent/admin/bulk-orders/${orderId}/approve`);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to approve bulk ticket order.');
    } finally {
      setActionLoading('');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt('Please enter rejection reason (optional):');
    if (reason === null) return;
    setActionLoading(orderId);
    try {
      await apiClient.post(`/api/v1/counter-agent/admin/bulk-orders/${orderId}/reject`, { reason });
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject bulk ticket order.');
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
        <p className="text-sm font-semibold text-gray-600">
          {isBn ? 'কাউন্টার এজেন্ট মনিটরিং প্যানেল লোড হচ্ছে...' : 'Loading Counter Agent Monitoring Panel...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-[#E31B23]" size={26} /> {isBn ? 'কাউন্টার এজেন্ট ব্যবস্থাপনা' : 'Counter Agent Management'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isBn ? 'প্ল্যাটফর্মের সকল বাল্ক টিকিট অর্ডার, কাউন্টার বরাদ্দ এবং কমিশন মনিটর করুন' : 'Monitor bulk ticket orders, counter assignments, and commission payouts platform-wide'}
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={14} /> {isBn ? 'তথ্য রিফ্রেশ করুন' : 'Refresh Data'}
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
                {isBn ? 'সক্রিয় এজেন্ট' : 'Active Agents'}
              </span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">
                {overview.totalAgents}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{isBn ? 'মোট নিবন্ধিত এজেন্ট' : 'Total registered agents'}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {isBn ? 'বাল্ক বিনিয়োগ' : 'Bulk Investment'}
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
                {overview.totalBulkTickets} {isBn ? 'টি টিকিট' : 'tickets in'} {overview.totalBulkOrders} {isBn ? 'টি অর্ডারে' : 'orders'}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {isBn ? 'অর্জিত কমিশন' : 'Commission Earned'}
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">
                {formatTk(overview.totalCommissionEarned)}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{isBn ? 'মোট অর্জিত কমিশন' : 'Platform total earned'}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {isBn ? 'বকেয়া কমিশন' : 'Pending Payouts'}
              </span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Clock size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">
                {overview.pendingCommissionsCount}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{isBn ? 'পরিশোধ বকেয়া রেকর্ড' : 'Unpaid commission records'}</p>
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
              {isBn ? 'এজেন্ট তালিকা' : 'Agents List'} ({agents.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {isBn ? 'বাল্ক অর্ডার' : 'Bulk Orders'} ({bulkOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'commissions'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {isBn ? 'কমিশন লেজার' : 'Commission Ledger'} ({commissions.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isBn ? 'এজেন্টের নাম, কাউন্টার দিয়ে খুঁজুন...' : 'Search agent name, counter, ref...'}
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
                  <th className="py-3.5 px-4">{isBn ? 'এজেন্টের নাম' : 'Agent Name'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'রেফারেল কোড' : 'Referral Code'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'বরাদ্দকৃত কাউন্টার' : 'Assigned Counter'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'বাল্ক টিকিট' : 'Bulk Tickets'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'বিক্রি' : 'Sold'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'বিনিয়োগ' : 'Invested'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'রেফারেল আয়' : 'Referral Earnings'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-400">
                      {isBn ? 'কোনো কাউন্টার এজেন্ট পাওয়া যায়নি।' : 'No counter agents found matching search.'}
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((ag) => (
                    <tr key={ag.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-900">
                        <button
                          onClick={() => handleOpenAgentDetails(ag)}
                          className="text-left font-bold text-gray-900 hover:text-[#E31B23] transition-colors group flex flex-col"
                          title={isBn ? 'এজেন্টের বিস্তারিত তথ্য দেখুন' : 'Click to view full agent details'}
                        >
                          <span className="group-hover:underline flex items-center gap-1.5">
                            {ag.firstName} {ag.lastName}
                            <Eye size={13} className="text-gray-400 group-hover:text-[#E31B23] transition-colors shrink-0" />
                          </span>
                          <span className="text-xs text-gray-400 font-normal">{ag.phone || ag.email}</span>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-gray-800">
                        {ag.referralCode ? (
                          <span className="font-mono bg-red-50 text-[#E31B23] px-2 py-0.5 rounded-md border border-red-100 font-bold">
                            {ag.referralCode}
                          </span>
                        ) : '—'}
                        {ag.referredByCode && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {isBn ? 'যার মাধ্যমে:' : 'Referred by:'} <strong className="text-gray-600 font-bold">{ag.referredByCode}</strong>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {ag.counter ? (
                          <span className="flex items-center gap-1">
                            <Building2 size={14} className="text-[#E31B23]" />
                            {ag.counter.name}
                          </span>
                        ) : (
                          <span className="text-amber-500 font-normal">{isBn ? 'অনর্ধারিত' : 'Unassigned'}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-purple-700">
                        {ag.totalRemainingTickets} {isBn ? 'অবশিষ্ট' : 'left'} / {ag.totalTicketsBought} {isBn ? 'মোট' : 'total'}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#E31B23]">
                        {ag.ticketsSold ?? Math.max(0, ag.totalTicketsBought - ag.totalRemainingTickets)}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {formatTk(ag.totalInvested)}
                      </td>
                      <td className="py-4 px-4 font-bold text-amber-600">
                        {formatTk(ag.totalReferralCommissionEarned || 0)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            ag.status === 'INACTIVE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {ag.status === 'INACTIVE' ? (isBn ? 'নিষ্ক্রিয়' : 'INACTIVE') : (isBn ? 'সক্রিয়' : 'ACTIVE')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => handleOpenAgentDetails(ag)}
                            className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center gap-1 font-bold text-xs"
                            title={isBn ? 'এজেন্টের সকল তথ্য ও অ্যাক্টিভিটি দেখুন' : 'View full agent details and activity'}
                          >
                            <Eye size={13} />
                            <span className="hidden sm:inline">{isBn ? 'বিস্তারিত' : 'Details'}</span>
                          </button>
                          <button
                            onClick={() => handleToggleAgentStatus(ag.id, `${ag.firstName} ${ag.lastName}`, ag.status || 'ACTIVE')}
                            disabled={actionLoading === ag.id}
                            className={`p-1.5 rounded-lg border transition-colors inline-flex items-center gap-1 font-bold text-xs ${
                              ag.status === 'INACTIVE'
                                ? 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                                : 'text-amber-600 hover:bg-amber-50 border-amber-200'
                            }`}
                            title={ag.status === 'INACTIVE' ? (isBn ? 'এজেন্ট অ্যাকাউন্ট সক্রিয় করুন' : 'Activate Agent Account') : (isBn ? 'এজেন্ট অ্যাকাউন্ট নিষ্ক্রিয় করুন' : 'Deactivate Agent Account')}
                          >
                            <Power size={13} />
                            <span className="hidden sm:inline">
                              {ag.status === 'INACTIVE' ? (isBn ? 'সক্রিয় করুন' : 'Activate') : (isBn ? 'নিষ্ক্রিয় করুন' : 'Deactivate')}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteAgent(ag.id, `${ag.firstName} ${ag.lastName}`)}
                            disabled={actionLoading === ag.id}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors inline-flex items-center gap-1 font-bold text-xs"
                            title={isBn ? 'এজেন্ট অ্যাকাউন্ট মুছুন' : 'Delete Agent Account'}
                          >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">{isBn ? 'মুছুন' : 'Delete'}</span>
                          </button>
                        </div>
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
                  <th className="py-3.5 px-4">{isBn ? 'এজেন্টের নাম' : 'Agent Name'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'রুট ও কাউন্টার' : 'Route & Counter'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'পরিমাণ' : 'Qty'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'মোট টাকা' : 'Total Amount'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'পেমেন্ট বিবরণ' : 'Payment Details'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th className="py-3.5 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      {isBn ? 'কোনো বাল্ক অর্ডার পাওয়া যায়নি।' : 'No bulk orders recorded.'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {o.agent?.firstName} {o.agent?.lastName}
                        <div className="text-[11px] text-gray-400 font-normal">{o.agent?.phone || o.agent?.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{o.route?.origin} → {o.route?.destination}</div>
                        <div className="text-[11px] text-gray-500">{o.counter?.name ?? (isBn ? 'কাউন্টার অনর্ধারিত' : 'No counter assigned')}</div>
                      </td>
                      <td className="py-4 px-4 font-bold">
                        {o.quantity} {isBn ? 'টিকিট' : 'tickets'}
                        <div className="text-[11px] text-purple-700 font-semibold">{o.remainingQuantity} {isBn ? 'অবশিষ্ট' : 'remaining'}</div>
                      </td>
                      <td className="py-4 px-4 font-black text-gray-900">{formatTk(o.totalAmount)}</td>
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-[#E31B23] text-xs">
                          {o.paymentMethod || 'DIRECT_CASH'}
                        </div>
                        {o.senderPhone && (
                          <div className="text-[11px] text-gray-600 font-medium">
                            {isBn ? 'প্রেরক:' : 'Sender:'} <span className="font-bold text-gray-900">{o.senderPhone}</span>
                          </div>
                        )}
                        {o.trxId && (
                          <div className="text-[11px] text-gray-600 font-mono font-bold">
                            TrxID: <span className="text-blue-700">{o.trxId}</span>
                          </div>
                        )}
                        {o.paymentNotes && (
                          <div className="text-[11px] text-gray-500 italic max-w-xs truncate">
                            &quot;{o.paymentNotes}&quot;
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            o.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : o.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {o.status === 'PENDING_APPROVAL' ? (isBn ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approval') : o.status === 'ACTIVE' ? (isBn ? 'সক্রিয়' : 'ACTIVE') : o.status === 'REJECTED' ? (isBn ? 'প্রত্যাখ্যানিত' : 'REJECTED') : o.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs">
                        {new Date(o.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          {o.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                onClick={() => handleApproveOrder(o.id)}
                                disabled={actionLoading === o.id}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 disabled:opacity-60"
                              >
                                {actionLoading === o.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  isBn ? 'অনুমোদন' : 'Approve'
                                )}
                              </button>
                              <button
                                onClick={() => handleRejectOrder(o.id)}
                                disabled={actionLoading === o.id}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-all disabled:opacity-60"
                              >
                                {isBn ? 'প্রত্যাখ্যান' : 'Reject'}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(o.id, o.quantity, Number(o.totalAmount || 0))}
                            disabled={actionLoading === o.id}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors inline-flex items-center gap-1 font-bold text-xs"
                            title={isBn ? 'মুছুন / বাল্ক অর্ডার বাতিল করুন' : 'Delete / Cancel Bulk Order'}
                          >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">{isBn ? 'মুছুন' : 'Delete'}</span>
                          </button>
                        </div>
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
                  <th className="py-3.5 px-4">{isBn ? 'এজেন্টের নাম' : 'Agent Name'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'বুকিং রেফারেন্স' : 'Booking Ref'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'পুল' : 'Pool'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'এজেন্ট শেয়ার' : 'Agent Share'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'বিভাজন' : 'Split'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th className="py-3.5 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      {isBn ? 'কোনো কমিশন রেকর্ড এখনো নেই।' : 'No commission events recorded yet.'}
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
                        {c.totalAgents} {isBn ? 'জন এজেন্ট' : 'agents'}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            c.status === 'PAID'
                              ? 'bg-blue-100 text-blue-800'
                              : c.status === 'PENDING'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'HELD_UNTIL_DEPARTURE'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.status === 'HELD_UNTIL_DEPARTURE' ? (isBn ? 'যাত্রার অপেক্ষায়' : 'Awaiting Departure') : c.status === 'PAID' ? (isBn ? 'পরিশোধিত' : 'PAID') : c.status === 'PENDING' ? (isBn ? 'বকেয়া' : 'PENDING') : c.status}
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
                            {actionLoading === c.id ? (isBn ? 'সংরক্ষণ হচ্ছে…' : 'Saving…') : (isBn ? 'পরিশোধিত করুন' : 'Mark Paid')}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 flex items-center justify-end gap-1 font-semibold">
                            <CheckCircle2 size={14} className="text-blue-500" /> {isBn ? 'পরিশোধিত' : 'Settled'}
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

      {/* Agent Full Details Modal */}
      {selectedAgentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            {(() => {
              const displayAgent = agentDetails?.agent || selectedAgentSummary;
              const fName = displayAgent?.firstName || (displayAgent?.name ? displayAgent.name.split(' ')[0] : '');
              const lName = displayAgent?.lastName || (displayAgent?.name ? displayAgent.name.split(' ').slice(1).join(' ') : '');
              const fullName = fName || lName ? `${fName} ${lName}`.trim() : (displayAgent?.name || 'Agent Details');
              const initials = `${fName?.[0] || 'A'}${lName?.[0] || 'G'}`.toUpperCase();
              const phoneNum = displayAgent?.phone || selectedAgentSummary?.phone;
              const emailAdd = displayAgent?.email || selectedAgentSummary?.email;
              const statusVal = displayAgent?.status || selectedAgentSummary?.status || 'ACTIVE';
              const counterName = displayAgent?.counter?.name || selectedAgentSummary?.counter?.name;

              return (
                <div className="p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E31B23] to-red-700 text-white font-black text-xl flex items-center justify-center shadow-lg shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-black tracking-tight text-white">
                          {fullName}
                        </h2>
                        {statusVal && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            statusVal === 'INACTIVE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {statusVal}
                          </span>
                        )}
                        {displayAgent?.kycStatus && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 ${
                            displayAgent.kycStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            <ShieldCheck size={12} />
                            KYC: {displayAgent.kycStatus}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-300 mt-1 flex-wrap font-medium">
                        {phoneNum && (
                          <span className="flex items-center gap-1"><Phone size={12} className="text-[#E31B23]" /> {phoneNum}</span>
                        )}
                        {emailAdd && (
                          <span className="flex items-center gap-1"><Mail size={12} className="text-[#E31B23]" /> {emailAdd}</span>
                        )}
                        {counterName && (
                          <span className="flex items-center gap-1 text-amber-400 font-bold"><Building2 size={12} /> {counterName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setSelectedAgentId(null); setSelectedAgentSummary(null); setAgentDetails(null); }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              );
            })()}

            {/* Modal Tabs Navigation */}
            <div className="bg-gray-100 p-2 border-b border-gray-200 flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                onClick={() => setModalTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === 'overview' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp size={14} className="text-[#E31B23]" /> {isBn ? 'সারসংক্ষেপ ও আয়' : 'Overview & Financials'}
              </button>
              <button
                onClick={() => setModalTab('bulk')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === 'bulk' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package size={14} className="text-purple-600" /> {isBn ? 'বাল্ক টিকিট অর্ডার' : 'Bulk Ticket Orders'} ({agentDetails?.bulkOrders?.length || 0})
              </button>
              <button
                onClick={() => setModalTab('referrals')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === 'referrals' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users size={14} className="text-amber-600" /> {isBn ? 'রেফারেল নেটওয়ার্ক' : 'Referral Network'} ({agentDetails?.referredAgents?.length || 0})
              </button>
              <button
                onClick={() => setModalTab('sales')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === 'sales' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Ticket size={14} className="text-blue-600" /> {isBn ? 'বিক্রিকৃত টিকিট' : 'Tickets Sold'} ({agentDetails?.soldBookings?.length || 0})
              </button>
              <button
                onClick={() => setModalTab('ledger')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  modalTab === 'ledger' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Wallet size={14} className="text-emerald-600" /> {isBn ? 'কমিশন লেজার' : 'Commission Ledger'} ({agentDetails?.commissions?.length || 0})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/50">
              {detailsLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
                  <p className="text-xs font-bold text-gray-500">
                    {isBn ? 'এজেন্টের বিস্তারিত তথ্য লোড হচ্ছে...' : 'Loading complete agent details & activity ledger...'}
                  </p>
                </div>
              ) : agentDetails ? (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {modalTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Metric Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-2xl border border-emerald-200/80">
                          <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                            {isBn ? 'মোট উপার্জিত আয়' : 'Total Earnings'}
                          </span>
                          <div className="text-2xl font-black text-emerald-700 mt-1">
                            {formatTk(agentDetails.stats?.totalEarnings || 0)}
                          </div>
                          <div className="text-[10px] text-emerald-600 mt-1 font-medium flex items-center justify-between">
                            <span>{isBn ? 'রেফারেল:' : 'Ref:'} {formatTk(agentDetails.stats?.referralCommissionsTotal || 0)}</span>
                            <span>{isBn ? 'বোনাস:' : 'Bonus:'} {formatTk(agentDetails.stats?.monthlyBonusesTotal || 0)}</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-4 rounded-2xl border border-purple-200/80">
                          <span className="text-[10px] font-extrabold uppercase text-purple-700 tracking-wider">
                            {isBn ? 'বাল্ক টিকিট কোটা' : 'Bulk Ticket Quota'}
                          </span>
                          <div className="text-2xl font-black text-purple-700 mt-1">
                            {agentDetails.stats?.totalBulkRemaining || 0} / {agentDetails.stats?.totalBulkTicketsBought || 0}
                          </div>
                          <p className="text-[10px] text-purple-600 mt-1 font-medium">
                            {isBn ? 'অবশিষ্ট কোটা টিকিট' : 'Remaining available tickets'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50/50 p-4 rounded-2xl border border-blue-200/80">
                          <span className="text-[10px] font-extrabold uppercase text-blue-700 tracking-wider">
                            {isBn ? 'মোট বিক্রিকৃত টিকিট' : 'Total Tickets Sold'}
                          </span>
                          <div className="text-2xl font-black text-blue-700 mt-1">
                            {agentDetails.stats?.totalTicketsSold || 0}
                          </div>
                          <p className="text-[10px] text-blue-600 mt-1 font-medium">
                            {isBn ? 'প্যাকেজ থেকে বিক্রিত' : 'Sold to passengers'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-2xl border border-amber-200/80">
                          <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">
                            {isBn ? 'মোট বিনিয়োগ' : 'Total Investment'}
                          </span>
                          <div className="text-2xl font-black text-amber-700 mt-1">
                            {formatTk(agentDetails.stats?.totalInvested || 0)}
                          </div>
                          <p className="text-[10px] text-amber-600 mt-1 font-medium">
                            {agentDetails.bulkOrders?.length || 0} {isBn ? 'টি বাল্ক ক্রয়ে' : 'bulk purchases'}
                          </p>
                        </div>
                      </div>

                      {/* Detailed Agent Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 border-b pb-3">
                            <Users size={16} className="text-[#E31B23]" />
                            {isBn ? 'এজেন্ট প্রোফাইল ও পরিচিতি' : 'Agent Identity & Profile'}
                          </h3>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-400 font-bold block">{isBn ? 'রেফারেল কোড' : 'Referral Code'}</span>
                              <span className="font-mono font-black text-[#E31B23] bg-red-50 px-2 py-0.5 rounded border border-red-100 inline-block mt-0.5">
                                {agentDetails.agent?.referralCode || '—'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 font-bold block">{isBn ? 'যার রেফারেলে যুক্ত' : 'Referred By'}</span>
                              <span className="font-semibold text-gray-800 mt-0.5 block">
                                {agentDetails.agent?.referredByCode || 'Direct Sign-up'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 font-bold block">{isBn ? 'এনআইডি নম্বর' : 'NID Number'}</span>
                              <span className="font-semibold text-gray-800 mt-0.5 block">
                                {agentDetails.agent?.nidNumber || 'Not submitted'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 font-bold block">{isBn ? 'নিবন্ধনের তারিখ' : 'Joined Date'}</span>
                              <span className="font-semibold text-gray-800 mt-0.5 block">
                                {new Date(agentDetails.agent?.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 border-b pb-3">
                            <ShieldCheck size={16} className="text-emerald-600" />
                            {isBn ? 'কেওয়াইসি যাচাই ও কাউন্টার' : 'KYC Verification & Counter'}
                          </h3>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-400 font-bold block">{isBn ? 'কেওয়াইসি স্ট্যাটাস' : 'KYC Status'}</span>
                              <span className={`font-black text-xs inline-block mt-0.5 ${
                                agentDetails.agent?.kycStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-amber-600'
                              }`}>
                                {agentDetails.agent?.kycStatus || 'NOT_SUBMITTED'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 font-bold block">{isBn ? 'কাউন্টার' : 'Counter'}</span>
                              <span className="font-semibold text-gray-800 mt-0.5 block">
                                {agentDetails.agent?.counter?.name || 'Unassigned'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: BULK ORDERS */}
                  {modalTab === 'bulk' && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                      <div className="p-4 border-b border-gray-100 font-bold text-xs text-gray-700 bg-gray-50 flex items-center justify-between">
                        <span>{isBn ? 'এজেন্টের সকল বাল্ক টিকিট ক্রয় ইতিহাস' : 'All Bulk Ticket Purchase History'}</span>
                        <span className="text-gray-400 font-normal">{agentDetails.bulkOrders?.length || 0} records</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b">
                            <tr>
                              <th className="py-3 px-4">Route</th>
                              <th className="py-3 px-4">Purchased Qty</th>
                              <th className="py-3 px-4">Remaining</th>
                              <th className="py-3 px-4">Total Price</th>
                              <th className="py-3 px-4">Payment</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-700">
                            {(!agentDetails.bulkOrders || agentDetails.bulkOrders.length === 0) ? (
                              <tr>
                                <td colSpan={7} className="text-center py-6 text-gray-400">No bulk orders found for this agent.</td>
                              </tr>
                            ) : (
                              agentDetails.bulkOrders.map((o: any) => (
                                <tr key={o.id} className="hover:bg-gray-50">
                                  <td className="py-3 px-4 font-bold text-gray-900">
                                    {o.route?.origin} ↔ {o.route?.destination}
                                  </td>
                                  <td className="py-3 px-4 font-bold text-purple-700">{o.quantity} tickets</td>
                                  <td className="py-3 px-4 font-bold text-emerald-700">{o.remainingQuantity} remaining</td>
                                  <td className="py-3 px-4 font-bold text-gray-900">{formatTk(o.totalAmount)}</td>
                                  <td className="py-3 px-4 font-medium text-gray-600">
                                    {o.paymentMethod || 'bKash'} {o.trxId && <span className="font-mono text-[10px] text-gray-400 block">Trx: {o.trxId}</span>}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      o.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : o.status === 'EXHAUSTED' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {o.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-gray-400">
                                    {new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: REFERRAL NETWORK */}
                  {modalTab === 'referrals' && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                      <div className="p-4 border-b border-gray-100 font-bold text-xs text-gray-700 bg-gray-50 flex items-center justify-between">
                        <span>{isBn ? 'এই এজেন্টের রেফারেলে সাইনআপকৃত এজেন্ট তালিকা' : 'Sub-Agents Joined Via Referral'}</span>
                        <span className="text-gray-400 font-normal">{agentDetails.referredAgents?.length || 0} sub-agents</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b">
                            <tr>
                              <th className="py-3 px-4">Agent Name</th>
                              <th className="py-3 px-4">Contact</th>
                              <th className="py-3 px-4">Total Bought</th>
                              <th className="py-3 px-4">Tickets Sold</th>
                              <th className="py-3 px-4">Ref Commission Generated</th>
                              <th className="py-3 px-4">Joined Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-700">
                            {(!agentDetails.referredAgents || agentDetails.referredAgents.length === 0) ? (
                              <tr>
                                <td colSpan={6} className="text-center py-6 text-gray-400">No agents joined using this agent's referral code yet.</td>
                              </tr>
                            ) : (
                              agentDetails.referredAgents.map((ref: any) => (
                                <tr key={ref.id} className="hover:bg-gray-50">
                                  <td className="py-3 px-4 font-bold text-gray-900">
                                    {ref.firstName} {ref.lastName}
                                  </td>
                                  <td className="py-3 px-4 text-gray-600">{ref.phone || ref.email}</td>
                                  <td className="py-3 px-4 font-semibold">{ref.totalBought || 0} tickets</td>
                                  <td className="py-3 px-4 font-bold text-blue-600">{ref.totalSold || 0} sold</td>
                                  <td className="py-3 px-4 font-bold text-emerald-600">{formatTk(ref.referralCommissionGenerated || 0)}</td>
                                  <td className="py-3 px-4 text-gray-400">
                                    {new Date(ref.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: TICKETS SOLD */}
                  {modalTab === 'sales' && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                      <div className="p-4 border-b border-gray-100 font-bold text-xs text-gray-700 bg-gray-50 flex items-center justify-between">
                        <span>{isBn ? 'এজেন্ট দ্বারা যাত্রীদের কাছে বিক্রিকৃত টিকিট' : 'Recent Ticket Bookings Sold'}</span>
                        <span className="text-gray-400 font-normal">{agentDetails.soldBookings?.length || 0} bookings</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b">
                            <tr>
                              <th className="py-3 px-4">Booking Ref</th>
                              <th className="py-3 px-4">Route</th>
                              <th className="py-3 px-4">Travel Date</th>
                              <th className="py-3 px-4">Amount</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Sold Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-700">
                            {(!agentDetails.soldBookings || agentDetails.soldBookings.length === 0) ? (
                              <tr>
                                <td colSpan={6} className="text-center py-6 text-gray-400">No sold ticket bookings found for this agent.</td>
                              </tr>
                            ) : (
                              agentDetails.soldBookings.map((b: any) => (
                                <tr key={b.id} className="hover:bg-gray-50">
                                  <td className="py-3 px-4 font-mono font-bold text-[#E31B23]">{b.bookingRef}</td>
                                  <td className="py-3 px-4 font-semibold text-gray-900">
                                    {b.schedule?.route ? `${b.schedule.route.origin} ↔ ${b.schedule.route.destination}` : 'Bus Route'}
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 font-medium">{b.schedule?.departureDate || '—'}</td>
                                  <td className="py-3 px-4 font-bold text-gray-900">{formatTk(b.totalAmount)}</td>
                                  <td className="py-3 px-4">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                                      {b.status || 'CONFIRMED'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-gray-400">
                                    {new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: COMMISSION LEDGER */}
                  {modalTab === 'ledger' && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                      <div className="p-4 border-b border-gray-100 font-bold text-xs text-gray-700 bg-gray-50 flex items-center justify-between">
                        <span>{isBn ? 'এজেন্টের সকল রেফারেল ও মাসিক বোনাস লেজার' : 'Commissions & Monthly Sales Bonus Ledger'}</span>
                        <span className="text-gray-400 font-normal">{agentDetails.commissions?.length || 0} records</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b">
                            <tr>
                              <th className="py-3 px-4">Commission Type</th>
                              <th className="py-3 px-4">Amount</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Description / Notes</th>
                              <th className="py-3 px-4">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-700">
                            {(!agentDetails.commissions || agentDetails.commissions.length === 0) ? (
                              <tr>
                                <td colSpan={5} className="text-center py-6 text-gray-400">No commission or bonus ledger entries found.</td>
                              </tr>
                            ) : (
                              agentDetails.commissions.map((c: any) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                  <td className="py-3 px-4 font-bold">
                                    {c.type === 'MONTHLY_SALES_BONUS' ? (
                                      <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-extrabold text-[10px]">MONTHLY SALES BONUS</span>
                                    ) : (
                                      <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-extrabold text-[10px]">REFERRAL COMMISSION</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 font-black text-emerald-600 text-sm">{formatTk(c.amount)}</td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      c.status === 'PAID' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {c.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-gray-600">{c.notes || (c.triggerBooking ? `Triggered by booking ${c.triggerBooking.bookingRef}` : '—')}</td>
                                  <td className="py-3 px-4 text-gray-400">
                                    {new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end shrink-0">
              <button
                onClick={() => { setSelectedAgentId(null); setSelectedAgentSummary(null); setAgentDetails(null); }}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all"
              >
                {isBn ? 'বন্ধ করুন' : 'Close Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

