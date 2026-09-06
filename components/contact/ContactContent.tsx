'use client';

import { useLanguageStore } from '@/lib/store/languageStore';
import { ContactForm } from '@/components/contact/ContactForm';
import { RiPhoneFill, RiMailFill, RiMapPinFill, RiTimeFill } from 'react-icons/ri';

export function ContactContent() {
  const { lang } = useLanguageStore();

  const contactItems = [
    {
      icon: RiPhoneFill,
      label: lang === 'BN' ? 'গ্রাহক সহায়তা' : 'Customer Support',
      value: '01826-110036',
      sub: lang === 'BN' ? 'সপ্তাহে ৭ দিন উন্মুক্ত' : 'Available 7 days a week',
      href: 'tel:01826110036',
    },
    {
      icon: RiMailFill,
      label: lang === 'BN' ? 'ইমেইল' : 'Email',
      value: 'ticketdorkarltd@gmail.com',
      sub: lang === 'BN' ? '২৪ ঘণ্টার মধ্যে উত্তর প্রদান' : 'We reply within 24 hours',
      href: 'mailto:ticketdorkarltd@gmail.com',
    },
    {
      icon: RiMapPinFill,
      label: lang === 'BN' ? 'প্রধান কার্যালয়' : 'Head Office',
      value: lang === 'BN' ? 'গুলশান, ঢাকা' : 'Gulshan, Dhaka',
      sub: lang === 'BN' ? 'নভানা শপিং সেন্টার, গুলশান অ্যাভিনিউ ০১, গুলশান, ঢাকা, বাংলাদেশ' : 'Navana Shopping Centre, Gulshan Avenue 01, Gulshan, Dhaka, Bangladesh',
    },
    {
      icon: RiTimeFill,
      label: lang === 'BN' ? 'অফিস সময়' : 'Business Hours',
      value: lang === 'BN' ? 'সকাল ৬:০০ – রাত ১০:০০' : '6:00 AM – 10:00 PM',
      sub: lang === 'BN' ? 'সরকারি ছুটির দিন সহ প্রতিদিন' : 'All days including holidays',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-black text-[#111111] mb-3">
          {lang === 'BN' ? 'যোগাযোগ করুন' : 'Contact Us'}
        </h1>
        <p className="text-gray-500 text-sm">
          {lang === 'BN' ? 'আপনার কোনো প্রশ্ন আছে? আমরা সাহায্য করতে প্রস্তুত।' : "Have a question? We're here to help."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-5">
          {contactItems.map(({ icon: Icon, label, value, sub, href }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 shadow-2xs hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-[#E31B23]/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="text-xl text-[#E31B23]" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</div>
                {href ? (
                  <a href={href} className="font-bold text-[#111111] text-base hover:text-[#E31B23] transition-colors">{value}</a>
                ) : (
                  <div className="font-bold text-[#111111] text-base">{value}</div>
                )}
                <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form Client Component */}
        <ContactForm />
      </div>
    </div>
  );
}
