'use client';

import { useLanguageStore } from '@/lib/store/languageStore';
import { AlertTriangle } from 'lucide-react';

export function CancellationPolicyContent() {
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';

  const scheduleRows = [
    {
      time: isBn ? 'গাড়ি ছাড়ার ২৪ ঘণ্টার বেশি পূর্বে রি সেল' : 'Resold > 24 hours before departure',
      refund: isBn ? '১০০% সম্পূর্ণ মূল্য ফেরত (০% কর্তন)' : '100% Full Refund (0% deduction)',
      type: 'full',
    },
    {
      time: isBn ? 'গাড়ি ছাড়ার ২৪ ঘণ্টার মধ্যে রি সেল' : 'Resold within 24 hours of departure',
      refund: isBn ? '৮০% মূল্য ফেরত (২০% সার্ভিস ফি)' : '80% Refund (20% fee deduction)',
      type: 'partial',
    },
    {
      time: isBn ? 'আজকের যাত্রার টিকিট (Same-day Ticket)' : 'Same-day departure date tickets',
      refund: isBn ? 'অফেরতযোগ্য ও রি সেল প্রযোজ্য নয় (০%)' : 'Non-resellable & Non-refundable (0% refund)',
      type: 'none',
    },
    {
      time: isBn ? 'গাড়ি ছেড়ে যাওয়ার পর' : 'After bus departure time',
      refund: isBn ? 'অফেরতযোগ্য (Non-refundable)' : 'Non-refundable',
      type: 'none',
    },
  ];

  const sections = [
    {
      title: isBn ? 'অ্যাডমিনের কাছে টিকিট রি সেল' : 'Reselling Tickets to Admin',
      content: isBn
        ? 'সরাসরি তাত্ক্ষণিক বাতিলের পরিবর্তে যাত্রীরা তাদের নিশ্চিতকৃত টিকিটটি ড্যাশবোর্ড বা \'মাই বুকিং\' পেজ থেকে সরাসরি টিকিট দরকার অ্যাডমিনের কাছে রি সেল বা বিক্রি করতে পারবেন।'
        : 'There is no traditional instant cancellation option. Instead, passengers can resell their confirmed tickets back to Ticket Dorkar Admin directly from their Dashboard or My Booking page.',
    },
    {
      title: isBn ? 'আজকের যাত্রার টিকিট নিয়মাবলী' : 'Same-Day Departure Restriction',
      content: isBn
        ? 'আজকের ভ্রমণ বা যাত্রার তারিখের টিকিট কোনো অবস্থাতেই রি সেল বা বাতিল করা যাবে না।'
        : 'Tickets purchased for today’s departure date cannot be resold or cancelled under any circumstances.',
    },
    {
      title: isBn ? '২৪ ঘণ্টার রি সেল রুলস' : '24-Hour Resell Rules',
      content: isBn
        ? 'যাত্রার ২৪ ঘণ্টা পূর্বে রি সেল করলে টিকিট ক্রয়মূল্যের ১০০% রিফান্ড দেওয়া হবে। ২৪ ঘণ্টার মধ্যে রি সেল করলে ২০% প্রসেসিং ফি কর্তন পূর্বক ৮০% রিফান্ড প্রদান করা হবে।'
        : 'If you resell your ticket more than 24 hours prior to departure, you will receive a 100% full refund at your original purchase price. If resold within 24 hours of departure, a 20% service fee will be deducted and you will receive an 80% refund.',
    },
    {
      title: isBn ? 'রিফান্ড প্রদান পদ্ধতি' : 'Refund Disbursement',
      content: isBn
        ? 'রি সেলের অনুমোদিত মূল্য আপনার ব্যবহৃত পেমেন্ট অ্যাকাউন্টে (বিকাশ, নগদ বা ব্যাংক অ্যাকাউন্ট) সরাসরি জমা দেওয়া হয়।'
        : 'Approved refunds from ticket resells are disbursed directly to your original payment channel (bKash, Nagad, or Bank Account).',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-[#111111] mb-2">
        {isBn ? 'টিকিট রি সেল ও টিকিট বাতিল নীতি' : 'Ticket Resell & Cancellation Policy'}
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        {isBn ? 'সর্বশেষ সংস্করণ: আগস্ট ২০২৬' : 'Last updated: August 2026'}
      </p>

      {/* Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
        <AlertTriangle size={18} className="text-amber-600 shrink-0" />
        <p className="text-amber-800 text-sm font-medium">
          {isBn ? (
            <>
              টিকিট দরকার লিমিটেড টিকিট বাতিল প্রক্রিয়াটি <strong>'অ্যাডমিনের কাছে টিকিট রি সেল'</strong> হিসেবে সম্পাদন করে।
            </>
          ) : (
            <>
              Ticket Dorkar Limited handles ticket cancellations as a <strong>Ticket Resell to Admin</strong>. Please review the terms below.
            </>
          )}
        </p>
      </div>

      {/* Refund / Resell Schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-2xs">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#111111]">
            {isBn ? 'টিকিট রি সেল ও রিফান্ড সময়সূচী' : 'Ticket Resell & Refund Schedule'}
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                {isBn ? 'যাত্রার সময়সীমা' : 'Departure Timeline'}
              </th>
              <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                {isBn ? 'রি সেল হার ও রিফান্ড' : 'Resell Rate & Refund'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {scheduleRows.map((row) => (
              <tr key={row.time} className="hover:bg-gray-50">
                <td className="px-6 py-3.5 text-gray-700 font-medium">{row.time}</td>
                <td
                  className={`px-6 py-3.5 font-bold ${
                    row.type === 'full'
                      ? 'text-emerald-600'
                      : row.type === 'partial'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {row.refund}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Cards */}
      {sections.map(({ title, content }) => (
        <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-2xs">
          <h2 className="text-lg font-bold text-[#111111] mb-2">{title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{content}</p>
        </div>
      ))}
    </div>
  );
}
