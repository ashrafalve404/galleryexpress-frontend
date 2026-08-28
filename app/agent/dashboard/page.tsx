'use client';

import { useQuery } from '@tanstack/react-query';
import { agentGetStats, agentGetBulkOrders, type AgentStats, type BulkOrder } from '@/lib/api/agent';
import { RiShoppingBag3Fill, RiCoupon3Fill, RiTicket2Fill, RiMoneyDollarCircleFill } from 'react-icons/ri';
import Link from 'next/link';

export default function AgentDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<AgentStats>({
    queryKey: ['agent-stats'],
    queryFn: agentGetStats,
  });

  const { data: bulkOrders, isLoading: ordersLoading } = useQuery<BulkOrder[]>({
    queryKey: ['agent-bulk-orders'],
    queryFn: agentGetBulkOrders,
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#111111]">Counter Agent Dashboard</h1>
        <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
          Buy ticket packages for routes and sell passenger tickets easily.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Purchased', value: stats?.totalPurchased || 0, unit: 'Tickets', icon: RiShoppingBag3Fill, color: 'bg-[#111111]' },
          { label: 'Sold Tickets', value: stats?.totalIssued || 0, unit: 'Issued', icon: RiTicket2Fill, color: 'bg-emerald-600' },
          { label: 'Available Tickets Left', value: stats?.totalRemaining || 0, unit: 'Available', icon: RiCoupon3Fill, color: 'bg-[#E31B23]' },
          { label: 'Total Money Spent', value: `৳${(stats?.totalSpent || 0).toLocaleString()}`, unit: 'Spent', icon: RiMoneyDollarCircleFill, color: 'bg-[#111111]' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500">{card.label}</span>
                <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="text-2xl font-black text-[#111111]">
                {statsLoading ? '...' : card.value}
              </div>
              <div className="text-[11px] text-gray-400 font-semibold mt-1">{card.unit}</div>
            </div>
          );
        })}
      </div>

      {/* Action Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111111] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-gray-800">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#E31B23] text-white flex items-center justify-center mb-4">
              <RiShoppingBag3Fill size={22} />
            </div>
            <h2 className="text-xl font-black text-white">Buy Ticket Package</h2>
            <p className="text-xs text-gray-300 font-medium mt-1 leading-relaxed">
              Buy 50 or 100 tickets in advance at discounted rates without choosing travel dates or bus seat numbers right now.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-800">
            <Link
              href="/agent/buy-bulk"
              className="inline-flex items-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white font-black px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95"
            >
              Buy Ticket Package →
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#E31B23]/10 text-[#E31B23] flex items-center justify-center mb-4">
              <RiTicket2Fill size={22} />
            </div>
            <h2 className="text-xl font-black text-[#111111]">Sell Ticket to Passenger</h2>
            <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
              Select travel date, pick bus seats on the coach map, and print customer tickets from your available ticket package.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/agent/issue-ticket"
              className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white font-black px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95"
            >
              Sell Ticket Now →
            </Link>
          </div>
        </div>
      </div>

      {/* Active Quotas Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-[#111111]">Your Purchased Ticket Packages</h3>
          <Link href="/agent/my-quotas" className="text-xs font-bold text-[#E31B23] hover:underline">
            View All →
          </Link>
        </div>

        {ordersLoading ? (
          <div className="text-xs font-semibold text-gray-400 py-6 text-center">Loading ticket packages...</div>
        ) : !bulkOrders || bulkOrders.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 text-xs font-medium">
            You have no ticket packages yet. Click "Buy Ticket Package" above to purchase.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-gray-700">
              <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Route</th>
                  <th className="p-3">Total Bought</th>
                  <th className="p-3">Tickets Left</th>
                  <th className="p-3">Price Per Ticket</th>
                  <th className="p-3">Total Price</th>
                  <th className="p-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bulkOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold text-[#111111]">
                      {order.route?.origin} → {order.route?.destination}
                    </td>
                    <td className="p-3 font-bold">{order.quantity} Tickets</td>
                    <td className="p-3 font-black text-[#E31B23]">{order.remainingQuantity} Left</td>
                    <td className="p-3">৳{Number(order.unitPrice).toLocaleString()}</td>
                    <td className="p-3 font-bold text-[#111111]">৳{Number(order.totalAmount).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        order.status === 'PURCHASED' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {order.status === 'PURCHASED' ? 'ACTIVE' : order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
