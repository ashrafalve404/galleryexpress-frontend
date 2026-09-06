'use client';

import { useLanguageStore } from '@/lib/store/languageStore';
import { RiCheckboxCircleFill } from 'react-icons/ri';

export function AboutContent() {
  const { lang } = useLanguageStore();

  const stats = [
    {
      value: '50K+',
      label: lang === 'BN' ? 'সন্তুষ্ট যাত্রী' : 'Passengers Served',
      desc: lang === 'BN' ? 'টিকিট দরকারের বিশ্বস্ত ভ্রমণকারী' : 'Happy travellers who choose Ticket Dorkar',
    },
    {
      value: '6+',
      label: lang === 'BN' ? 'এক্সপ্রেস রুট' : 'Express Routes',
      desc: lang === 'BN' ? 'ঢাকা, চট্টগ্রাম ও কক্সবাজার সংযোগকারী' : "Connecting Dhaka, Chittagong & Cox's Bazar",
    },
    {
      value: '10+',
      label: lang === 'BN' ? 'বিলাসবহুল এসি কোচ' : 'Luxury AC Coaches',
      desc: lang === 'BN' ? 'আধুনিক প্রিমিয়াম এসি ও স্লিপার কোচ' : 'Modern premium AC & sleeper coaches',
    },
  ];

  const checklistItems = lang === 'BN' ? [
    'নিরাপত্তা প্রশিক্ষণপ্রাপ্ত পেশাদার ও দক্ষ চালক',
    'রিয়েল-টাইম মনিটরিংয়ের জন্য জিপিএস ট্র্যাকড আধুনিক বাস',
    'নিয়মিত রক্ষণাবেক্ষণ ও কঠোর নিরাপত্তা পরিদর্শন',
    'ডিলাক্স রিক্লাইনিং আসন সহ আরামদায়ক এসি কোচ',
    'তাৎক্ষণিক কিউআর ই-টিকিট নিশ্চিতকরণ সহ অনলাইন বুকিং',
    'সুনির্দিষ্ট ও স্বচ্ছ টিকিট বাতিল ও রিফান্ড নীতি',
  ] : [
    'Professional, licensed drivers with safety training',
    'GPS-tracked vehicles for real-time monitoring',
    'Regular maintenance and safety inspections',
    'Modern AC coaches with deluxe reclining seats',
    'Online booking with instant QR ticket confirmation',
    'Structured transparent cancellation & refund policy',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-black text-[#111111] mb-3">
          {lang === 'BN' ? 'টিকিট দরকার লিমিটেড সম্পর্কে' : 'About Ticket Dorkar Limited'}
        </h1>
        <p className="text-gray-500 text-sm">
          {lang === 'BN'
            ? 'এক দশকেরও বেশি সময় ধরে নিরাপদ, আরামদায়ক ও নির্ভরযোগ্য বাস ভ্রমণের মাধ্যমে বাংলাদেশকে যুক্ত করছি।'
            : 'Over a decade of connecting Bangladesh with safe, comfortable, and reliable bus travel.'}
        </p>
      </div>

      <div className="space-y-6 text-gray-600 leading-relaxed">
        {/* Story & Mission Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#111111] mb-3">
              {lang === 'BN' ? 'আমাদের গল্প' : 'Our Story'}
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              {lang === 'BN'
                ? 'টিকিট দরকার লিমিটেড বাংলাদেশের অন্যতম শীর্ষস্থানীয় আন্তঃনগর বাস সেবা সংস্থা। শহরগুলোর মধ্যে যাতায়াতকে আরামদায়ক, সাশ্রয়ী এবং নিরাপদ করার লক্ষ্য নিয়ে ঢাকা, চট্টগ্রাম এবং কক্সবাজার সংযোগকারী গুরুত্বপূর্ণ রুটগুলোতে আধুনিক প্রিমিয়াম এসি কোচ পরিচালনা করা হয়।'
                : 'Ticket Dorkar Limited is one of Bangladesh\'s premier intercity bus operators. Founded with a simple mission — to make intercity travel comfortable, affordable, and safe — we operate modern premium AC coaches on key express routes connecting Dhaka, Chittagong, and Cox\'s Bazar.'}
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h2 className="text-xl font-black text-[#111111] mb-3">
              {lang === 'BN' ? 'আমাদের লক্ষ্য' : 'Our Mission'}
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              {lang === 'BN'
                ? 'বাংলাদেশে সর্বোচ্চ নির্ভরযোগ্য, আরামদায়ক এবং সাশ্রয়ী মূল্যে বাস ভ্রমণের অভিজ্ঞতা প্রদান করা। প্রতিটি আসন, প্রতিটি যাত্রা এবং প্রতিটি যাত্রী আমাদের কাছে সমান গুরুত্বপূর্ণ।'
                : 'To provide the most reliable, comfortable, and affordable bus travel experience in Bangladesh. Every seat, every journey, every passenger matters to us. We combine modern fleet management with digital QR ticketing.'}
            </p>
          </div>
        </div>

        {/* Stat Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-xs">
              <div className="text-3xl font-black text-[#E31B23] mb-1">{stat.value}</div>
              <div className="font-bold text-[#111111] text-sm mb-1">{stat.label}</div>
              <div className="text-gray-500 text-xs">{stat.desc}</div>
            </div>
          ))}
        </div>

        {/* Trust Checklist */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
          <h2 className="text-xl font-black text-[#111111] mb-4">
            {lang === 'BN' ? 'কেন যাত্রীরা আমাদের বিশ্বাস করেন' : 'Why Passengers Trust Us'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium text-gray-700">
            {checklistItems.map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <RiCheckboxCircleFill size={18} className="text-[#E31B23] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
