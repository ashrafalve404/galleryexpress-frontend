'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RiFileTextFill,
  RiArrowLeftLine,
  RiDownload2Fill,
  RiLineChartFill,
  RiStackFill,
  RiTicket2Fill,
} from 'react-icons/ri';
import { Loader2 } from 'lucide-react';
import { counterAgentApi } from '@/lib/api/counterAgent';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';

export default function CounterAgentStatementPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [bulkOrders, setBulkOrders] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, ordersData] = await Promise.all([
          counterAgentApi.getDashboardStats().catch(() => null),
          counterAgentApi.getBulkOrders().catch(() => []),
        ]);
        setOverview(statsData);
        setBulkOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (e) {
        console.error('Failed to load statement:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalSold = overview?.ticketsSold ?? overview?.totalTicketsBought ? ((overview?.totalTicketsBought || 0) - (overview?.totalTicketsRemaining || 0)) : 0;
  const remainingBulk = overview?.totalTicketsRemaining ?? 0;
  const totalPurchased = overview?.totalTicketsBought ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-end">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <RiDownload2Fill size={16} /> Download Statement (PDF)
          </button>
        </div>

        {/* Title & Summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Agent Account Statement</h1>
              <p className="text-xs text-gray-500 mt-1">Financial overview of your bulk package purchases, ticket sales activity, and commission earnings ledger.</p>
            </div>
            <div className="bg-red-50 text-[#E31B23] border border-red-100 px-4 py-2 rounded-2xl text-xs font-black self-start md:self-auto">
              Remaining Balance: {remainingBulk} Bulk Tickets
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <RiStackFill size={24} />
            </div>
            <div>
              <div className="text-gray-400 text-xs font-bold uppercase">Total Bulk Package</div>
              <div className="text-2xl font-black text-gray-900">{totalPurchased} Tickets</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <RiTicket2Fill size={24} />
            </div>
            <div>
              <div className="text-gray-400 text-xs font-bold uppercase">Total Sold Tickets</div>
              <div className="text-2xl font-black text-gray-900">{totalSold} Tickets</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <RiLineChartFill size={24} />
            </div>
            <div>
              <div className="text-gray-400 text-xs font-bold uppercase">Active Bulk Orders</div>
              <div className="text-2xl font-black text-gray-900">{bulkOrders.length} Orders</div>
            </div>
          </div>
        </div>

        {/* Bulk Purchases & Ledger Table */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6">
          <h2 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
            <RiFileTextFill size={20} className="text-[#E31B23]" /> Bulk Purchase Ledger History
          </h2>

          {loading ? (
            <div className="py-12 text-center flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
              <p className="text-xs text-gray-500 font-semibold">Loading statement ledger...</p>
            </div>
          ) : bulkOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm font-bold text-gray-600">No statement history found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">Tickets Allocated</th>
                    <th className="py-3 px-4">Remaining</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {bulkOrders.map((order) => (
                    <tr key={order.id || Math.random()} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {order.id?.substring(0, 8) || '--'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {order.quantity || 10} Tickets Bulk Pass
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        +{order.quantity || 0}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#E31B23]">
                        {order.remainingCount ?? order.quantity ?? 0}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {formatCurrency(order.amountPaid || order.price || 0)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          order.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status || 'APPROVED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-gray-500">
                        {order.createdAt ? formatDate(order.createdAt, 'dd MMM yyyy') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
