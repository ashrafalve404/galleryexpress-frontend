'use client';

import { useState, useEffect } from 'react';
import {
  RiShieldCheckFill,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiTimeFill,
  RiRefreshLine,
  RiExternalLinkLine,
  RiUser3Fill,
  RiCloseLine,
  RiCheckLine,
  RiSearchLine,
} from 'react-icons/ri';
import { Loader2 } from 'lucide-react';
import { counterAgentApi, type AgentKycStatus } from '@/lib/api/counterAgent';
import { formatDateTime } from '@/lib/utils/date';
import { useLanguageStore } from '@/lib/store/languageStore';
import { toast } from 'sonner';

export default function AdminKycPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';
  const [agents, setAgents] = useState<AgentKycStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');

  // Modal / Lightbox State
  const [selectedAgent, setSelectedAgent] = useState<AgentKycStatus | null>(null);
  const [modalType, setModalType] = useState<'IMAGE' | 'REJECT' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchKycRequests = async () => {
    try {
      const data = await counterAgentApi.getAdminKycRequests();
      setAgents(data);
    } catch {
      toast.error('Failed to load agent KYC requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchKycRequests();
  };

  const handleApprove = async (agent: AgentKycStatus) => {
    if (!confirm(`Are you sure you want to approve KYC for agent ${agent.firstName} ${agent.lastName}?`)) return;
    setActionLoading(true);
    try {
      await counterAgentApi.approveKyc(agent.id);
      toast.success(`KYC Approved for ${agent.firstName} ${agent.lastName}`);
      fetchKycRequests();
      setSelectedAgent(null);
      setModalType(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    setActionLoading(true);
    try {
      await counterAgentApi.rejectKyc(selectedAgent.id, rejectReason.trim());
      toast.success(`KYC Rejected for ${selectedAgent.firstName} ${selectedAgent.lastName}`);
      fetchKycRequests();
      setSelectedAgent(null);
      setModalType(null);
      setRejectReason('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject KYC');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAgents = agents.filter((a) => {
    const matchesTab = activeTab === 'ALL' || a.kycStatus === activeTab;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      a.firstName.toLowerCase().includes(query) ||
      a.lastName.toLowerCase().includes(query) ||
      a.email.toLowerCase().includes(query) ||
      (a.phone && a.phone.includes(query)) ||
      (a.nidNumber && a.nidNumber.includes(query));
    return matchesTab && matchesSearch;
  });

  const pendingCount = agents.filter((a) => a.kycStatus === 'PENDING').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <RiShieldCheckFill className="text-[#E31B23]" size={32} /> {isBn ? 'কাউন্টার এজেন্ট কেওয়াইসি ভেরিফিকেশন' : 'Counter Agent KYC Verification'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isBn ? 'কাউন্টার এজেন্টের এনআইডি ডকুমেন্ট ও পরিচয়পত্র যাচাই ও অনুমোদন করুন।' : 'Review NID document submissions and verify counter agent identity approvals.'}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <RiRefreshLine size={15} className={refreshing ? 'animate-spin' : ''} /> {isBn ? 'তালিকা রিফ্রেশ করুন' : 'Refresh List'}
        </button>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['PENDING', 'ALL', 'VERIFIED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>
                {tab === 'PENDING'
                  ? (isBn ? 'পেন্ডিং আবেদন' : 'Pending Review')
                  : tab === 'VERIFIED'
                  ? (isBn ? 'ভেরিফাইড' : 'Verified')
                  : tab === 'REJECTED'
                  ? (isBn ? 'বাতিলকৃত' : 'Rejected')
                  : (isBn ? 'সকল আবেদন' : 'All Requests')}
              </span>
              {tab === 'PENDING' && pendingCount > 0 && (
                <span className="px-1.5 py-0.5 bg-white text-[#E31B23] text-[10px] font-black rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <RiSearchLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isBn ? 'নাম, ফোন বা এনআইডি দিয়ে খুঁজুন...' : 'Search name, phone, NID...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:border-[#E31B23] outline-none"
          />
        </div>
      </div>

      {/* Agents Table / Cards */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {filteredAgents.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <RiShieldCheckFill size={36} className="mx-auto mb-2 text-gray-300" />
            <h3 className="text-sm font-bold text-gray-700">{isBn ? 'কোনো কেওয়াইসি আবেদন পাওয়া যায়নি' : 'No KYC submissions found'}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{isBn ? 'নির্বাচিত ফিল্টারের সাথে কোনো এজেন্টের রেকর্ড মেলেনি।' : 'There are no agent records matching your selected filter.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">{isBn ? 'এজেন্টের বিবরণ' : 'Agent Details'}</th>
                  <th className="p-4">{isBn ? 'বরাদ্দকৃত কাউন্টার' : 'Assigned Counter'}</th>
                  <th className="p-4">{isBn ? 'এনআইডি নম্বর' : 'NID Number'}</th>
                  <th className="p-4">{isBn ? 'এনআইডি ছবি' : 'NID Images'}</th>
                  <th className="p-4">{isBn ? 'কেওয়াইসি স্ট্যাটাস' : 'KYC Status'}</th>
                  <th className="p-4 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredAgents.map((agent) => {
                  const statusLabel = agent.kycStatus || 'NOT_SUBMITTED';
                  return (
                    <tr key={agent.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-black text-gray-900 text-sm">
                          {agent.firstName} {agent.lastName}
                        </div>
                        <div className="text-[11px] text-gray-500">{agent.email}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{agent.phone || 'N/A'}</div>
                      </td>

                      <td className="p-4">
                        {agent.counter ? (
                          <div>
                            <span className="font-bold text-gray-900 block">{agent.counter.name}</span>
                            <span className="text-[10px] text-gray-400 block">{agent.counter.location}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-medium">{isBn ? 'অনর্ধারিত' : 'Unassigned'}</span>
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold text-gray-900">
                        {agent.nidNumber || (isBn ? 'দেওয়া হয়নি' : 'Not Entered')}
                      </td>

                      <td className="p-4">
                        {agent.nidFrontDocUrl || agent.nidBackDocUrl ? (
                          <button
                            onClick={() => {
                              setSelectedAgent(agent);
                              setModalType('IMAGE');
                            }}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-[#E31B23] hover:text-white text-gray-800 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1"
                          >
                            <RiExternalLinkLine size={13} /> {isBn ? 'এনআইডি ছবি দেখুন' : 'View NID Front & Back'}
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">{isBn ? 'কোনো ডকুমেন্ট নেই' : 'No Docs Uploaded'}</span>
                        )}
                      </td>

                      <td className="p-4">
                        {statusLabel === 'VERIFIED' && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black inline-flex items-center gap-1">
                            <RiCheckboxCircleFill size={12} /> {isBn ? 'ভেরিফাইড' : 'VERIFIED'}
                          </span>
                        )}
                        {statusLabel === 'PENDING' && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black inline-flex items-center gap-1 animate-pulse">
                            <RiTimeFill size={12} /> {isBn ? 'পর্যালোচনার অপেক্ষায়' : 'PENDING REVIEW'}
                          </span>
                        )}
                        {statusLabel === 'REJECTED' && (
                          <div>
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-black inline-flex items-center gap-1">
                              <RiCloseCircleFill size={12} /> {isBn ? 'বাতিলকৃত' : 'REJECTED'}
                            </span>
                            {agent.kycRejectReason && (
                              <p className="text-[10px] text-rose-600 mt-1 line-clamp-1 max-w-xs" title={agent.kycRejectReason}>
                                {agent.kycRejectReason}
                              </p>
                            )}
                          </div>
                        )}
                        {statusLabel === 'NOT_SUBMITTED' && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">
                            {isBn ? 'আবেদন করা হয়নি' : 'NOT SUBMITTED'}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {statusLabel !== 'VERIFIED' && (agent.nidFrontDocUrl || agent.nidNumber) && (
                            <button
                              onClick={() => handleApprove(agent)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <RiCheckLine size={14} /> {isBn ? 'অনুমোদন' : 'Approve'}
                            </button>
                          )}
                          {statusLabel !== 'REJECTED' && (agent.nidFrontDocUrl || agent.nidNumber) && (
                            <button
                              onClick={() => {
                                setSelectedAgent(agent);
                                setModalType('REJECT');
                                setRejectReason('');
                              }}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <RiCloseLine size={14} /> {isBn ? 'বাতিল' : 'Reject'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal Lightbox */}
      {modalType === 'IMAGE' && selectedAgent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {isBn ? 'এনআইডি ভেরিফিকেশন ডকুমেন্ট' : 'NID Verification Documents'} — {selectedAgent.firstName} {selectedAgent.lastName}
                </h3>
                <p className="text-xs text-gray-500">{isBn ? 'এনআইডি নম্বর:' : 'NID Number:'} {selectedAgent.nidNumber || 'N/A'}</p>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-xl hover:bg-gray-100 text-gray-500"
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-gray-700 block mb-2">{isBn ? 'এনআইডি সামনের দিক' : 'NID Front Side'}</span>
                {selectedAgent.nidFrontDocUrl ? (
                  <img
                    src={selectedAgent.nidFrontDocUrl}
                    alt="NID Front"
                    className="w-full h-56 object-cover rounded-2xl border border-gray-200 shadow-xs"
                  />
                ) : (
                  <div className="h-56 bg-gray-100 rounded-2xl flex items-center justify-center text-xs text-gray-400">
                    {isBn ? 'সামনের ছবি নেই' : 'No Front Image'}
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-gray-700 block mb-2">{isBn ? 'এনআইডি পিছনের দিক' : 'NID Back Side'}</span>
                {selectedAgent.nidBackDocUrl ? (
                  <img
                    src={selectedAgent.nidBackDocUrl}
                    alt="NID Back"
                    className="w-full h-56 object-cover rounded-2xl border border-gray-200 shadow-xs"
                  />
                ) : (
                  <div className="h-56 bg-gray-100 rounded-2xl flex items-center justify-center text-xs text-gray-400">
                    {isBn ? 'পিছনের ছবি নেই' : 'No Back Image'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
              {selectedAgent.kycStatus !== 'VERIFIED' && (
                <button
                  onClick={() => handleApprove(selectedAgent)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  {isBn ? 'কেওয়াইসি অনুমোদন করুন' : 'Approve KYC'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {modalType === 'REJECT' && selectedAgent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">
                {isBn ? 'কেওয়াইসি বাতিল করুন' : 'Reject KYC'} — {selectedAgent.firstName} {selectedAgent.lastName}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-xl hover:bg-gray-100 text-gray-500"
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {isBn ? 'বাতিলের কারণ (এজেন্ট এই বার্তাটি দেখতে পাবেন)' : 'Rejection Reason (Agent will see this message)'}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={isBn ? 'যেমন: এনআইডি ছবি অস্পষ্ট, তথ্য মিলছে না...' : 'e.g. NID image blurry, front side cropped out, details do not match...'}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:border-[#E31B23] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  {actionLoading ? (isBn ? 'বাতিল করা হচ্ছে...' : 'Rejecting...') : (isBn ? 'বাতিল নিশ্চিত করুন' : 'Confirm Rejection')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
