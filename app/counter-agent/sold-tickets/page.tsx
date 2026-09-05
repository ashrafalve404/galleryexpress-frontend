'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Search,
  Calendar,
  User,
  Phone,
  Bus,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { BsFillTicketPerforatedFill } from 'react-icons/bs';
import { counterAgentApi } from '@/lib/api/counterAgent';
import { formatDate } from '@/lib/utils/date';
import { toast } from 'sonner';

export default function CounterAgentSoldTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await counterAgentApi.getMySoldTickets();
        setTickets(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error('Failed to load sold tickets:', e);
        toast.error('Failed to load sold tickets.');
        setTickets([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const safeTickets = Array.isArray(tickets) ? tickets : [];

  const filtered = safeTickets.filter((t) => {
    if (!t) return false;
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const ref = (t.bookingRef || '').toLowerCase();
    const passName = (t.passengers?.[0]?.name || '').toLowerCase();
    const passPhone = (t.passengers?.[0]?.phone || '').toLowerCase();
    return ref.includes(q) || passName.includes(q) || passPhone.includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/counter-agent/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-xs"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <Link
            href="/counter-agent/sell-ticket"
            className="px-4 py-2 bg-[#E31B23] hover:bg-[#c9121a] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
          >
            <BsFillTicketPerforatedFill size={16} /> Sell New Ticket
          </Link>
        </div>

        {/* Title & Search */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Sold Tickets</h1>
            <p className="text-xs text-gray-500 mt-1">
              List of all passenger tickets issued from your bulk balance. Print or view digital QR boarding passes anytime.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ref #, name, phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#E31B23] outline-none"
            />
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6">
          {loading ? (
            <div className="py-12 text-center flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
              <p className="text-xs text-gray-500 font-semibold">Loading your sold tickets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-3">
              <BsFillTicketPerforatedFill className="w-12 h-12 mx-auto text-gray-300" />
              <p className="text-sm font-bold text-gray-600">No sold tickets found.</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                When you sell tickets to passengers from your bulk package, they will appear here for easy printing and lookup.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Passenger Name</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Seats</th>
                    <th className="py-3.5 px-4">Route & Bus</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filtered.map((ticket) => {
                    if (!ticket) return null;
                    const passenger = Array.isArray(ticket.passengers) ? ticket.passengers[0] : null;
                    const seats = Array.isArray(ticket.bookingSeats) && ticket.bookingSeats.length > 0
                      ? ticket.bookingSeats.map((s: any) => s?.seat?.seatNumber || s?.seatId || '').filter(Boolean).join(', ')
                      : '—';
                    const route = ticket.schedule?.route;
                    const coachType = ticket.schedule?.coach?.coachType || 'AC';
                    const dateStr = ticket.createdAt ? formatDate(ticket.createdAt, 'dd MMM yyyy') : '—';

                    return (
                      <tr key={ticket.id || Math.random()} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-4 font-mono font-black text-gray-900">
                          {ticket.bookingRef || '—'}
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-900">
                          {passenger?.name || 'Passenger'}
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-600">
                          {passenger?.phone || '—'}
                        </td>
                        <td className="py-4 px-4 font-bold text-[#E31B23]">
                          {seats || '—'}
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-800">
                          <div>{route?.origin || 'Dhaka'} ➔ {route?.destination || "Cox's Bazar"}</div>
                          <div className="text-[10px] text-gray-400 font-semibold">{coachType}</div>
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-500 font-semibold">
                          {dateStr}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/ticket/${ticket.bookingRef || ticket.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-[#E31B23] hover:text-white text-gray-700 font-bold text-xs rounded-lg transition-colors shadow-2xs"
                          >
                            <Printer size={14} /> Print Ticket <ExternalLink size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
