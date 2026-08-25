import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ticket Resell & Cancellation Policy',
  description: 'Gallery Express ticket resell and refund policy.',
};

export default function CancellationPolicyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-[#111111] mb-2">Ticket Resell &amp; Cancellation Policy</h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: August 2026</p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <p className="text-amber-800 text-sm font-medium">
              Gallery Express handles ticket cancellations as a <strong>Ticket Resell to Admin</strong>. Please review the terms below.
            </p>
          </div>

          {/* Refund / Resell Schedule */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-2xs">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#111111]">Ticket Resell &amp; Refund Schedule</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Departure Timeline</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Resell Rate &amp; Refund</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { time: 'Resold > 24 hours before departure', refund: '100% Full Refund (0% deduction)' },
                  { time: 'Resold within 24 hours of departure', refund: '80% Refund (20% fee deduction)' },
                  { time: 'Same-day departure date tickets', refund: 'Non-resellable & Non-refundable (0% refund)' },
                  { time: 'After bus departure time', refund: 'Non-refundable' },
                ].map((row) => (
                  <tr key={row.time} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5 text-gray-700 font-medium">{row.time}</td>
                    <td className={`px-6 py-3.5 font-bold ${row.refund.includes('100%') ? 'text-emerald-600' : row.refund.includes('80%') ? 'text-amber-600' : 'text-rose-600'}`}>
                      {row.refund}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {[
            {
              title: 'Reselling Tickets to Admin',
              content: 'There is no traditional instant cancellation option. Instead, passengers can resell their confirmed tickets back to Gallery Express Admin directly from their Dashboard or My Booking page.'
            },
            {
              title: 'Same-Day Departure Restriction',
              content: 'Tickets purchased for today’s departure date cannot be resold or cancelled under any circumstances.'
            },
            {
              title: '24-Hour Resell Rules',
              content: 'If you resell your ticket more than 24 hours prior to departure, you will receive a 100% full refund at your original purchase price. If resold within 24 hours of departure, a 20% service fee will be deducted and you will receive an 80% refund.'
            },
            {
              title: 'Refund Disbursement',
              content: 'Approved refunds from ticket resells are disbursed directly to your original payment channel (bKash, Nagad, or Bank Account).'
            },
          ].map(({ title, content }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-2xs">
              <h2 className="text-lg font-bold text-[#111111] mb-2">{title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
