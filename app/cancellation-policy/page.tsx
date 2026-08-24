import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = { title: 'Cancellation Policy', description: 'Gallery Express cancellation and refund policy for bus ticket bookings.' };

export default function CancellationPolicyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-[#111111] mb-2">Cancellation Policy</h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: January 2024</p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <p className="text-amber-800 text-sm font-medium">Please review our cancellation policy before making a booking.</p>
          </div>

          {/* Refund Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#111111]">Refund Schedule</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Time Before Departure</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Refund Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { time: 'More than 48 hours', refund: '100% (full refund)' },
                  { time: '24 – 48 hours', refund: '75% of ticket price' },
                  { time: '12 – 24 hours', refund: '50% of ticket price' },
                  { time: 'Less than 12 hours', refund: 'No refund' },
                  { time: 'After departure', refund: 'No refund' },
                ].map((row) => (
                  <tr key={row.time} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5 text-gray-700">{row.time}</td>
                    <td className={`px-6 py-3.5 font-semibold ${row.refund.includes('100%') ? 'text-green-600' : row.refund.includes('No') ? 'text-red-500' : 'text-orange-600'}`}>{row.refund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {[
            { title: 'How to Cancel', content: 'You can cancel your booking through the "My Booking" section on our website using your booking reference number. Alternatively, contact our customer support team.' },
            { title: 'Refund Processing', content: 'Approved refunds are processed within 5-7 business days to your original payment method. For bKash/Nagad, refunds may take 3-5 business days.' },
            { title: 'Non-Refundable Cases', content: 'Convenience fees, processing charges, and tickets cancelled after the departure time are non-refundable.' },
          ].map(({ title, content }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
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
