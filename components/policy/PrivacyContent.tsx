'use client';

import { useLanguageStore } from '@/lib/store/languageStore';

export function PrivacyContent() {
  const { lang } = useLanguageStore();
  const isBn = lang === 'BN';

  const sections = [
    {
      title: isBn ? '১. সংগৃহীত তথ্যসমূহ' : '1. Information We Collect',
      content: isBn
        ? 'আমরা আপনার রেজিস্ট্রেশন এবং টিকিট বুকিংয়ের সময় প্রদত্ত ব্যক্তিগত তথ্য সংগ্রহ করি, যার মধ্যে রয়েছে নাম, ইমেইল, মোবাইল নম্বর এবং পেমেন্ট সংক্রান্ত তথ্য। সেবা উন্নতির জন্য আমরা ব্যবহারের তথ্যও পর্যালোচনা করি।'
        : 'We collect personal information you provide during registration and booking, including name, email, phone number, and payment information. We also collect usage data to improve our services.',
    },
    {
      title: isBn ? '২. তথ্যের ব্যবহার' : '2. How We Use Your Information',
      content: isBn
        ? 'আপনার বুকিং প্রক্রিয়া সম্পন্ন করা, ডিজিটাল টিকিট নিশ্চিতকরণ এসএমএস বা ইমেইল পাঠানো, কাস্টমার সাপোর্ট প্রদান এবং আমাদের সেবার মান বৃদ্ধিতে এই তথ্য ব্যবহৃত হয়। আমরা কোনো তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি করি না।'
        : 'Your information is used to process bookings, send ticket confirmations, provide customer support, and improve our services. We do not sell your personal data to third parties.',
    },
    {
      title: isBn ? '৩. তথ্য নিরাপত্তা' : '3. Data Security',
      content: isBn
        ? 'আপনার ব্যক্তিগত তথ্য সুরক্ষায় আমরা উচ্চমানের সিকিউরিটি ব্যবস্থা প্রয়োগ করি। সকল অনলাইন পেমেন্ট তথ্য এনক্রিপ্টেড ও অত্যন্ত সুরক্ষিত প্রযুক্তি ব্যবহার করে পরিচালিত হয়।'
        : 'We implement industry-standard security measures to protect your personal information. All payment data is encrypted using SSL technology.',
    },
    {
      title: isBn ? '৪. কুকিজের ব্যবহার' : '4. Cookies',
      content: isBn
        ? 'ব্রাউজিং অভিজ্ঞতা উন্নত করতে এবং ওয়েবসাইট ট্র্যাফিক বিশ্লেষণ করতে আমরা কুকিজ ব্যবহার করি। আপনি চাইলে আপনার ব্রাউজার সেটিংস থেকে কুকিজ নিষ্ক্রিয় করতে পারেন।'
        : 'We use cookies to improve your browsing experience and analyze website traffic. You can disable cookies in your browser settings.',
    },
    {
      title: isBn ? '৫. ব্যবহারকারীর অধিকার' : '5. Your Rights',
      content: isBn
        ? 'আপনার ব্যক্তিগত তথ্য পর্যবেক্ষণ, সংশোধন বা মুছে ফেলার অধিকার আপনার রয়েছে। এই সংক্রান্ত সহায়তার জন্য ticketdorkarltd@gmail.com ইমেইলে যোগাযোগ করুন।'
        : 'You have the right to access, correct, or delete your personal data. Contact us at ticketdorkarltd@gmail.com to exercise these rights.',
    },
    {
      title: isBn ? '৬. নীতি পরিবর্তন' : '6. Changes to This Policy',
      content: isBn
        ? 'সময়ে সময়ে আমরা এই গোপনীয়তা নীতি হালনাগাদ করতে পারি। যেকোনো পরিবর্তন নতুন তারিখসহ এই পেজে প্রকাশ করা হবে।'
        : 'We may update this privacy policy periodically. Changes will be posted on this page with an updated date.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-[#111111] mb-2">
        {isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        {isBn ? 'সর্বশেষ সংস্করণ: আগস্ট ২০২৬' : 'Last updated: August 2026'}
      </p>

      {sections.map(({ title, content }) => (
        <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-2xs">
          <h2 className="text-lg font-bold text-[#111111] mb-3">{title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{content}</p>
        </div>
      ))}
    </div>
  );
}
