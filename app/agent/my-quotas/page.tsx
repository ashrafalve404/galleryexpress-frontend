'use client';

import { useQuery } from '@tanstack/react-query';
import { agentGetBulkOrders, type BulkOrder } from '@/lib/api/agent';
import Link from 'next/link';
import { RiCoupon3Fill, RiTicket2Fill } from 'react-icons/ri';

export default function AgentMyQuotasPage() {
  const { data: bulkOrders, isLoading } = useQuery<BulkOrder[]>({
    queryKey: ['agent-bulk-orders'],
    queryFn: agentGetBulkOrders,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111]">My Ticket Packages</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Active ticket packages purchased to sell seats to passengers.
          </p>
        </div>
        <Link
          href="/agent/buy-bulk"
          className="inline-flex items-center gap-2 bg-[#E31B23] hover:bg-[#C41920] text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          + Buy New Ticket Package
        </Link>
      </div>

      {isLoading ? (
        <div className="text-xs font-semibold text-gray-400 py-10 text-center">Loading ticket packages...</div>
      ) : !bulkOrders || bulkOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
          <RiCoupon3Fill size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-[#111111] text-base mb-1">No Ticket Packages Found</h3>
          <p className="text-gray-500 text-xs mb-6 max-w-sm mx-auto">
            You haven't bought any ticket packages yet. Buy your first package to start selling tickets to passengers.
          </p>
          <Link
            href="/agent/buy-bulk"
            className="inline-flex items-center gap-2 bg-[#E31B23] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#C41920]"
          >
            Buy Ticket Package Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bulkOrders.map((order) => {
            const issuedCount = order.quantity - order.remainingQuantity;
            const percentUsed = Math.round((issuedCount / order.quantity) * 100);

            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-[#E31B23] bg-red-50 px-2.5 py-1 rounded-lg">
                      Package #{order.id.slice(0, 8)}
                    </span>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                      order.status === 'PURCHASED' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {order.status === 'PURCHASED' ? 'ACTIVE' : order.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#111111]">
                    {order.route?.origin} → {order.route?.destination}
                  </h3>
                  {order.notes && (
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{order.notes}</p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>{issuedCount} Sold</span>
                    <span className="text-[#E31B23] font-black">{order.remainingQuantity} Tickets Left Available</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E31B23] transition-all duration-500 rounded-full"
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold text-right">
                    Total Package: {order.quantity} Tickets @ ৳{Number(order.unitPrice).toLocaleString()} / ticket
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs font-black text-[#111111]">
                    Total Price: ৳{Number(order.totalAmount).toLocaleString()}
                  </div>
                  {order.remainingQuantity > 0 ? (
                    <Link
                      href={`/agent/issue-ticket?quotaId=${order.id}`}
                      className="inline-flex items-center gap-1.5 bg-[#111111] hover:bg-[#E31B23] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                    >
                      <RiTicket2Fill size={14} />
                      Sell Ticket
                    </Link>
                  ) : (
                    <span className="text-xs font-bold text-gray-400 italic">All Tickets Sold Out</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
