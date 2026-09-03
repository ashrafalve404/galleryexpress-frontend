'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bell, Ticket, Building2, Mail, ExternalLink, RefreshCw, CheckCircle2, Filter, ArrowRight } from 'lucide-react';
import { getAdminNotifications, type AdminNotification } from '@/lib/api/notifications';
import { formatDateTime } from '@/lib/utils/date';
import { AdminHeader } from '@/components/layout/AdminHeader';

export default function AdminNotificationsPage() {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: getAdminNotifications,
    refetchInterval: 15000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const filteredNotifications = notifications.filter((n) => {
    if (filterCategory === 'ALL') return true;
    return n.category === filterCategory;
  });

  const getCategoryIcon = (category: AdminNotification['category']) => {
    switch (category) {
      case 'USER_PAYMENT':
        return <Ticket size={18} className="text-[#E31B23]" />;
      case 'AGENT_BULK':
        return <Building2 size={18} className="text-amber-600" />;
      case 'MESSAGE':
        return <Mail size={18} className="text-blue-600" />;
      default:
        return <Bell size={18} className="text-gray-600" />;
    }
  };

  return (
    <div>
      <AdminHeader
        title="Notification Center"
        description="Real-time alerts for user ticket payments, agent bulk orders, and customer messages."
      />

      {/* Stats Summary & Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E31B23] flex items-center justify-center font-bold">
            <Bell size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#111111]">{unreadCount}</div>
            <div className="text-xs text-gray-500 font-medium">Action Needed / Pending</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#111111]">
              {notifications.filter((n) => n.category === 'AGENT_BULK').length}
            </div>
            <div className="text-xs text-gray-500 font-medium">Agent Bulk Orders</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Ticket size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#111111]">
              {notifications.filter((n) => n.category === 'USER_PAYMENT').length}
            </div>
            <div className="text-xs text-gray-500 font-medium">User Ticket Payments</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Alerts' },
            { id: 'USER_PAYMENT', label: 'User Payments' },
            { id: 'AGENT_BULK', label: 'Agent Bulk Orders' },
            { id: 'MESSAGE', label: 'Messages' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterCategory === tab.id
                  ? 'bg-[#E31B23] text-white shadow-2xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-700 transition-colors shadow-2xs"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Live
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#E31B23] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-400 font-medium">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-500 opacity-60" />
            <h3 className="font-bold text-gray-800 text-sm mb-1">All Caught Up!</h3>
            <p className="text-xs text-gray-400">No pending notifications in this section.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-white border border-gray-200/80 shrink-0 shadow-2xs">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Requires Action
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium mb-1.5 leading-relaxed">{item.body}</p>
                    <span className="text-[11px] text-gray-400 font-semibold">{formatDateTime(item.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={item.link}
                    className="px-4 py-2.5 bg-[#E31B23] hover:bg-[#C41920] text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 active:scale-98"
                  >
                    <span>Take Action</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
