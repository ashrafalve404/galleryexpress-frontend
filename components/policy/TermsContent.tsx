'use client';

import { useLanguageStore } from '@/lib/store/languageStore';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-2xs">
      <h2 className="text-lg font-bold text-[#111111] mb-3">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export function TermsContent() {
  const { lang } = useLanguageStore();

  const isBn = lang === 'BN';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-[#111111] mb-2">
        {isBn ? 'শর্তাবলী ও নিয়মাবলী' : 'Terms & Conditions'}
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        {isBn ? 'সর্বশেষ সংস্করণ: আগস্ট ২০২৬' : 'Last updated: August 2026'}
      </p>

      <Section title={isBn ? '১. শর্তাবলী সম্মতি' : '1. Acceptance of Terms'}>
        <p>
          {isBn
            ? 'টিকিট দরকার লিমিটেড-এর মাধ্যমে টিকিট বুক করার মাধ্যমে আপনি আমাদের শর্তাবলী ও নিয়মাবলী মেনে নিচ্ছেন। বুকিং সম্পন্ন করার পূর্বে অনুগ্রহ করে এগুলো মনোযোগ দিয়ে পড়ুন।'
            : 'By booking tickets through Ticket Dorkar Limited, you agree to these terms and conditions. Please read them carefully before proceeding with a booking.'}
        </p>
      </Section>

      <Section title={isBn ? '২. বুকিং এবং টিকিট' : '2. Booking and Tickets'}>
        <p>
          {isBn
            ? 'সকল বুকিং সিট প্রাপ্যতার ওপর নির্ভর করে। সফলভাবে মূল্য পরিশোধ করার পরেই একটি বুকিং নিশ্চিত বলে গণ্য হবে। আপনার ডিজিটাল টিকিটটি বৈধ বোর্ডিং পাস হিসেবে গণ্য হবে।'
            : 'All bookings are subject to seat availability. A booking is confirmed only after successful payment. Your digital ticket constitutes a valid boarding pass.'}
        </p>
      </Section>

      <Section title={isBn ? '৩. যাত্রীর দায়িত্বসমূহ' : '3. Passenger Responsibilities'}>
        <p>
          {isBn
            ? 'যাত্রীদের গাড়ি ছাড়ার নির্দিষ্ট সময়ের অন্তত ১৫ মিনিট পূর্বে বোর্ডিং পয়েন্টে উপস্থিত হতে হবে। দেরিতে উপস্থিত হওয়ার কারণে গাড়ি মিস হলে টিকিট দরকার লিমিটেড দায়ী থাকবে না।'
            : 'Passengers must arrive at the boarding point at least 15 minutes before departure. Ticket Dorkar Limited is not liable for missed journeys due to late arrival.'}
        </p>
      </Section>

      <Section title={isBn ? '৪. টিকিট বাতিল ও রিফান্ড' : '4. Cancellation and Refund'}>
        <p>
          {isBn
            ? 'গাড়ি ছাড়ার ২৪ ঘণ্টা পূর্বে টিকিট রি সেল বা বাতিল করলে প্রসেসিং ফি ব্যতিরেকে সম্পূর্ণ মূল্য ফেরত দেওয়া হবে। বিস্তারিত জানার জন্য আমাদের টিকিট রি সেল ও রিফান্ড নীতি দেখুন।'
            : 'Cancellations made 24 hours before departure are eligible for a full refund minus processing fees. Late cancellations may incur charges. See our Cancellation Policy for details.'}
        </p>
      </Section>

      <Section title={isBn ? '৫. বাসে আচরণের নিয়মাবলী' : '5. Conduct on Board'}>
        <p>
          {isBn
            ? 'যাত্রীদের ভ্রমণের সময় যথাযথ শৃঙ্খলা বজায় রাখা এবং বাস ক্রুদের নির্দেশনাবলী মেনে চলার অনুরোধ করা হচ্ছে। কোনো যাত্রী বিশৃঙ্খলা সৃষ্টি করলে তার যাত্রা বাতিলের অধিকার সংরক্ষিত।'
            : 'Passengers are expected to maintain decorum and follow crew instructions. Ticket Dorkar Limited reserves the right to refuse travel to passengers who are disruptive.'}
        </p>
      </Section>

      <Section title={isBn ? '৬. দায়বদ্ধতার সীমাবদ্ধতা' : '6. Liability'}>
        <p>
          {isBn
            ? 'যানজট, প্রতিকূল আবহাওয়া বা অনাকাঙ্ক্ষিত কোনো কারণে সময় বিলম্ব হলে টিকিট দরকার লিমিটেড দায়ী থাকবে না। তবে আমরা সর্বদা সর্বোচ্চ সেবা প্রদানে সচেষ্ট থাকি।'
            : 'Ticket Dorkar Limited is not liable for delays caused by traffic, weather, or unforeseen events. We will, however, always strive to minimize inconvenience.'}
        </p>
      </Section>

      <Section title={isBn ? '৭. যোগাযোগ' : '7. Contact'}>
        <p>
          {isBn
            ? 'আমাদের শর্তাবলী সংক্রান্ত যেকোনো অনুসন্ধানের জন্য ইমেইল করুন ticketdorkarltd@gmail.com অথবা সরাসরি কল করুন 01826-110036 নম্বরে।'
            : 'For queries regarding these terms, contact us at ticketdorkarltd@gmail.com or call 01826-110036.'}
        </p>
      </Section>
    </div>
  );
}
