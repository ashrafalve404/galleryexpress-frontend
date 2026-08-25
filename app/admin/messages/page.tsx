'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, RefreshCw, Trash2, CheckCircle2, Eye, User, Phone, Calendar } from 'lucide-react';
import { RiErrorWarningFill } from 'react-icons/ri';
import client from '@/lib/api/client';
import { formatDateTime } from '@/lib/utils/date';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'UNREAD' | 'READ';
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['admin', 'contact-messages'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/admin/contact-messages');
      const list = data?.data?.data || data?.data || (Array.isArray(data) ? data : []);
      return Array.isArray(list) ? list : [];
    },
  });

  const handleMarkAsRead = async (msg: ContactMessage) => {
    try {
      await client.patch(`/api/v1/admin/contact-messages/${msg.id}/read`);
      refetch();
    } catch {
      /* noop */
    }
  };

  const handleOpenDetail = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'UNREAD') {
      handleMarkAsRead(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await client.delete(`/api/v1/admin/contact-messages/${deleteTarget.id}`);
      toast.success('Message deleted successfully.');
      setDeleteTarget(null);
      if (selectedMessage?.id === deleteTarget.id) {
        setSelectedMessage(null);
      }
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete message.';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const unreadCount = messages.filter((m: ContactMessage) => m.status === 'UNREAD').length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111] flex items-center gap-2">
            Contact Messages
            {unreadCount > 0 && (
              <span className="bg-[#E31B23] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">
            Messages submitted by users via the Contact Us form.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 transition-colors shadow-xs w-full sm:w-auto"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Status', 'Sender Name', 'Contact Info', 'Message Snippet', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="skeleton h-4 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : messages.map((msg: ContactMessage) => (
                <tr
                  key={msg.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    msg.status === 'UNREAD' ? 'bg-amber-50/40 font-semibold' : ''
                  }`}
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                        msg.status === 'UNREAD'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {msg.status === 'UNREAD' ? 'UNREAD' : <><CheckCircle2 size={12} /> READ</>}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-bold text-gray-900">{msg.name}</div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-gray-900 font-medium">{msg.email}</div>
                    {msg.phone && <div className="text-xs text-gray-400">{msg.phone}</div>}
                  </td>

                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-gray-600 truncate text-xs font-normal">{msg.message}</p>
                  </td>

                  <td className="px-5 py-4 text-gray-500 text-xs font-medium whitespace-nowrap">
                    {formatDateTime(msg.createdAt)}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDetail(msg)}
                        className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center gap-1 font-bold text-xs"
                        title="View Full Message"
                      >
                        <Eye size={14} />
                        View
                      </button>

                      <button
                        onClick={() => setDeleteTarget(msg)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors flex items-center gap-1 font-bold text-xs"
                        title="Delete Message"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && messages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm font-medium">
                    No contact messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E31B23]/10 rounded-xl flex items-center justify-center text-[#E31B23]">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-black text-[#111111] text-base">{selectedMessage.name}</h3>
                  <p className="text-gray-400 text-xs">{formatDateTime(selectedMessage.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 font-medium">Email:</span>
                  <div className="font-bold text-gray-800">{selectedMessage.email}</div>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Phone:</span>
                  <div className="font-bold text-gray-800">{selectedMessage.phone || 'N/A'}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message Content:</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedMessage(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <RiErrorWarningFill size={22} className="text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-[#111111] text-base">Delete Message?</h3>
                <p className="text-gray-500 text-xs mt-0.5">From: {deleteTarget.name}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-5">
              Are you sure you want to delete this message from <span className="font-bold">{deleteTarget.email}</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={!!deletingId}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!!deletingId}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deletingId ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Delete Message'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
