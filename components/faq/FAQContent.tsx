'use client';

import { useLanguageStore } from '@/lib/store/languageStore';
import Link from 'next/link';

export function FAQContent() {
  const { lang } = useLanguageStore();

  const faqs = lang === 'BN' ? [
    { q: 'টিকিট দরকার ওয়েবসাইটে কীভাবে বাসের টিকিট বুক করব?', a: 'টিকিট দরকার (ticketdorkar.xyz) ওয়েবসাইটে যাত্রার স্থান ও গন্তব্য নির্বাচন করুন, যাত্রার তারিখ বেছে নিন, পছন্দের এসি বা নন-এসি সময়সূচী ও সিট সিলেক্ট করুন, তথ্য দিন এবং বিকাশ, নগদ বা কার্ডের মাধ্যমে পেমেন্ট সম্পন্ন করুন। সাথে সাথে ডিজিটাল কিউআর টিকিট পেয়ে যাবেন।' },
    { q: 'বাসে ওঠার সময় কী কী ডকুমেন্ট সঙ্গে রাখতে হবে?', a: 'বাসে ওঠার সময় কাউন্টার বা বাসে আপনার ডিজিটাল টিকিট (কিউআর কোড) অথবা বুকিং রেফারেন্স নম্বরটি প্রদর্শন করুন। প্রয়োজনে যাচাইয়ের জন্য জাতীয় পরিচয়পত্র (NID) সাথে রাখা ভালো।' },
    { q: 'আমি কি আমার পছন্দের বাস সিট পছন্দ করতে পারি?', a: 'হ্যাঁ! আমাদের ইন্টারেক্টিভ সিট ম্যাপের মাধ্যমে আপনি রিয়েল-টাইমে খালি আসন, ভিআইপি আসন ও মহিলা আসন নির্বাচন করতে পারবেন।' },
    { q: 'টিকিট দরকার পোর্টালে কী কী পেমেন্ট মাধ্যম গ্রহণযোগ্য?', a: 'আমরা বিকাশ, নগদ, ক্রেডিট/ডেবিট কার্ড (ভিসা, মাস্টারকার্ড) এবং আমাদের কাউন্টার অফিসে সরাসরি ক্যাশ পেমেন্ট গ্রহণ করি।' },
    { q: 'আমি কীভাবে আমার বুকিং করা টিকিট বাতিল করতে পারি?', a: 'ticketdorkar.xyz-এর "আমার বুকিং" অপশনে গিয়ে রেফারেন্স নম্বর প্রদান করে টিকিট বাতিল করা যায়। রিফান্ড নীতির ওপর ভিত্তি করে অর্থ ফেরত প্রদান করা হবে।' },
    { q: 'বাস ছাড়তে বিলম্ব হলে করণীয় কী?', a: 'আমরা সর্বোচ্চ সময়ের বাধ্যবাধকতা বজায় রাখি। ট্রাফিক সংক্রান্ত কোনো বিলম্ব হলে কাউন্টার স্টাফ আপনাকে ফোন বা এসএমএসের মাধ্যমে আপডেট জানিয়ে দেবে।' },
    { q: 'শিশুদের জন্য কি কোনো বিশেষ ছাড় আছে?', a: '৫ বছরের কম বয়সী শিশু অভিভাবকের কোলে ভ্রমণ করলে কোনো ফি লাগবে না। ৫ বছর বা তার বেশি বয়সের শিশুর জন্য পূর্ণ টিকিট আবশ্যক।' },
    { q: 'পেমেন্টের পর ডিজিটাল ই-টিকিট কীভাবে পাব?', a: 'পেমেন্ট সম্পন্ন হওয়া মাত্রই আপনার ডিজিটাল ই-টিকিট তৈরি হয়ে যায়। "আমার বুকিং" মেনু থেকে টিকিট দেখতে, ডাউনলোড বা প্রিন্ট করতে পারবেন।' },
  ] : [
    { q: 'How do I book a bus ticket online on Ticket Dorkar?', a: 'Select your origin and destination on Ticket Dorkar (ticketdorkar.xyz), choose a travel date, pick your preferred AC or Non-AC bus schedule, select your seats, fill in passenger details, and pay securely via bKash, Nagad, or credit card. You will receive an instant digital QR ticket.' },
    { q: 'What documents do I need for boarding the bus?', a: 'Show your digital ticket (QR code) or booking reference at the bus counter or boarding point. A valid NID or government-issued ID may be required for verification.' },
    { q: 'Can I choose my preferred bus seat?', a: 'Yes! Our interactive seat map lets you select available seats in real-time, including regular seats, VIP seats, and ladies-only seats.' },
    { q: 'What payment methods are accepted on Ticket Dorkar?', a: 'We accept bKash, Nagad, credit/debit cards (Visa, Mastercard), and cash payments at our counter offices.' },
    { q: 'How can I cancel my bus ticket booking?', a: 'Go to "My Booking" on ticketdorkar.xyz, enter your ticket reference number, and follow the cancellation steps. Refunds are processed according to our Cancellation Policy.' },
    { q: 'What if my bus is delayed?', a: 'We strive for maximum punctuality. In case of traffic delays, counter staff will update you via SMS or phone.' },
    { q: 'Is there a discount for children?', a: "Children under 5 years travelling on a parent's lap may travel free. Children aged 5 and above require a full ticket." },
    { q: 'How do I get my E-ticket after booking?', a: 'Your digital E-ticket is generated immediately upon payment. You can view, download, or print it from "My Booking" or save the QR code on your mobile device.' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-[#111111] mb-2">
          {lang === 'BN' ? 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী' : 'Frequently Asked Questions'}
        </h1>
        <p className="text-gray-500 text-sm">
          {lang === 'BN' ? 'টিকিট দরকারের সার্ভিস সম্পর্কে প্রয়োজনীয় সকল তথ্য' : 'Everything you need to know about booking bus tickets with Ticket Dorkar.'}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
            <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-semibold text-[#111111] text-sm list-none hover:bg-gray-50 transition-colors">
              {faq.q}
              <span className="ml-4 text-[#E31B23] transition-transform group-open:rotate-45 font-bold text-xl leading-none shrink-0">+</span>
            </summary>
            <div className="px-6 pb-4 text-gray-500 text-sm leading-relaxed">{faq.a}</div>
          </details>
        ))}
      </div>

      <div className="mt-10 bg-[#E31B23]/5 border border-[#E31B23]/20 rounded-2xl p-6 text-center">
        <p className="text-gray-700 text-sm mb-3">
          {lang === 'BN' ? 'বাস যাত্রা নিয়ে আরো কোনো প্রশ্ন আছে?' : 'Still have questions about your bus journey?'}
        </p>
        <Link href="/contact" className="inline-block bg-[#E31B23] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#C41920] transition-colors">
          {lang === 'BN' ? 'গ্রাহক সেবায় যোগাযোগ করুন' : 'Contact Support Team'}
        </Link>
      </div>
    </div>
  );
}
