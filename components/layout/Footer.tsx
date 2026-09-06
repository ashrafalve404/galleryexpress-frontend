'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Globe } from 'lucide-react';
import { RiMapPinFill, RiPhoneFill, RiMailFill, RiBusFill } from 'react-icons/ri';
import { ROUTES } from '@/lib/utils/constants';
import { useLanguageStore } from '@/lib/store/languageStore';
import { getTranslation } from '@/lib/utils/translations';

export function Footer() {
  const { lang } = useLanguageStore();
  const year = new Date().getFullYear();

  const quickLinks = [
    { href: ROUTES.SEARCH, label: getTranslation(lang, 'searchBuses', 'Book Ticket') },
    { href: ROUTES.MY_BOOKING, label: getTranslation(lang, 'myBooking', 'My Booking') },
    { href: ROUTES.ABOUT, label: getTranslation(lang, 'aboutUs', 'About Us') },
    { href: ROUTES.CONTACT, label: getTranslation(lang, 'contact', 'Contact') },
    { href: ROUTES.FAQ, label: 'FAQ' },
    { href: '/counter-agent/login', label: getTranslation(lang, 'agentPortal', 'Counter Agent Login') },
  ];

  const legalLinks = [
    { href: ROUTES.TERMS, label: lang === 'BN' ? 'শর্তাবলী' : 'Terms & Conditions' },
    { href: ROUTES.PRIVACY, label: lang === 'BN' ? 'গোপনীয়তা নীতি' : 'Privacy Policy' },
    { href: ROUTES.CANCELLATION_POLICY, label: lang === 'BN' ? 'বাতিলকরণ নীতি' : 'Cancellation Policy' },
  ];

  const popularRoutes = [
    { href: '/search?from=Dhaka&to=Cox%27s+Bazar', label: lang === 'BN' ? 'ঢাকা থেকে কক্সবাজার বাস' : 'Dhaka to Cox\'s Bazar Bus' },
    { href: '/search?from=Cox%27s+Bazar&to=Dhaka', label: lang === 'BN' ? 'কক্সবাজার থেকে ঢাকা বাস' : 'Cox\'s Bazar to Dhaka Bus' },
    { href: '/search?from=Dhaka&to=Chittagong', label: lang === 'BN' ? 'ঢাকা থেকে চট্টগ্রাম বাস' : 'Dhaka to Chittagong Bus' },
    { href: '/search?from=Chittagong&to=Dhaka', label: lang === 'BN' ? 'চট্টগ্রাম থেকে ঢাকা বাস' : 'Chittagong to Dhaka Bus' },
    { href: '/search?from=Chittagong&to=Cox%27s+Bazar', label: lang === 'BN' ? 'চট্টগ্রাম থেকে কক্সবাজার' : 'Chittagong to Cox\'s Bazar' },
  ];

  return (
    <footer className="bg-[#111111] text-white" suppressHydrationWarning>
      {/* Booking Illustration Banner with White Background */}
      <div className="bg-white py-8 sm:py-12 border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <img
            src="/booking-illustration.webp"
            alt="Ticket Dorkar Mobile Booking Illustration"
            className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-auto object-contain max-h-[300px] sm:max-h-[380px] md:max-h-[440px]"
          />
        </div>
      </div>

      {/* Top CTA Band */}
      <div className="bg-[#E31B23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {lang === 'BN' ? 'ভ্রমণের জন্য প্রস্তুত?' : 'Ready to travel?'}
            </h3>
            <p className="text-white/90 text-sm sm:text-base font-medium mt-1.5">
              {lang === 'BN' ? 'এখনই আপনার আসন বুক করুন এবং বাংলাদেশজুড়ে আরামদায়ক ভ্রমণ উপভোগ করুন।' : 'Book your seat now and enjoy a comfortable journey across Bangladesh.'}
            </p>
          </div>
          <Link
            href={ROUTES.SEARCH}
            className="shrink-0 bg-white text-[#E31B23] font-bold px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base"
          >
            {lang === 'BN' ? 'টিকিট কাটুন →' : 'Book a Ticket →'}
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand - takes 2 cols on lg */}
          <div className="lg:col-span-1">
            <Link href={ROUTES.HOME} className="inline-block bg-white p-3 sm:p-3.5 rounded-2xl shadow-lg mb-5 border border-white/10 hover:scale-105 transition-transform">
              <img
                src="/ticketdrkrlogo.png"
                alt="Ticket Dorkar"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain"
              />
            </Link>
            <h3 className="text-white font-black text-lg sm:text-xl mb-1.5 tracking-tight">
              {lang === 'BN' ? 'টিকিট দরকার লিমিটেড' : 'Ticket Dorkar Limited'}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              {lang === 'BN'
                ? 'বাংলাদেশের নির্ভরযোগ্য আন্তঃনগর বাস সেবা। নিরাপদ, আরামদায়ক ও সবসময় সময়ের প্রতি বিশ্বস্ত।'
                : "Bangladesh's trusted intercity bus service. Safe, comfortable, and always on time."}
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="#"
                aria-label="Community"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E31B23] flex items-center justify-center transition-colors text-white font-bold text-xs"
              >
                <MessageCircle size={16} />
              </a>
              <a
                href="https://www.ticketdorkar.xyz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E31B23] flex items-center justify-center transition-colors text-white font-bold text-xs"
              >
                <Globe size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-4">
              {lang === 'BN' ? 'দ্রুত লিঙ্কসমূহ' : 'Quick Links'}
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Routes */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-4">
              {lang === 'BN' ? 'জনপ্রিয় বাস রুটসমূহ' : 'Popular Bus Routes'}
            </h4>
            <ul className="space-y-2.5">
              {popularRoutes.map((route) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors"
                  >
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-4">
              {lang === 'BN' ? 'আইনি নীতি' : 'Legal'}
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-4">
              {lang === 'BN' ? 'যোগাযোগ' : 'Contact Us'}
            </h4>
            <ul className="space-y-3">
              <li className="flex gap-2.5 text-xs sm:text-sm text-gray-300">
                <RiMapPinFill size={18} className="text-[#E31B23] shrink-0 mt-0.5" />
                <span>
                  {lang === 'BN'
                    ? 'নভানা শপিং সেন্টার, গুলশান অ্যাভিনিউ ০১, গুলশান, ঢাকা, বাংলাদেশ'
                    : 'Navana Shopping Centre, Gulshan Avenue 01, Gulshan, Dhaka, Bangladesh'}
                </span>
              </li>
              <li className="flex gap-2.5 text-xs sm:text-sm text-gray-300">
                <RiPhoneFill size={18} className="text-[#E31B23] shrink-0 mt-0.5" />
                <a href="tel:01826110036" className="hover:text-white transition-colors">
                  01826-110036
                </a>
              </li>
              <li className="flex gap-2.5 text-xs sm:text-sm text-gray-300">
                <RiMailFill size={18} className="text-[#E31B23] shrink-0 mt-0.5" />
                <a href="mailto:ticketdorkarltd@gmail.com" className="hover:text-white transition-colors">
                  ticketdorkarltd@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <span>
            {lang === 'BN'
              ? `© ${year} টিকেট দরকার লিমিটেড। সর্বস্বত্ব সংরক্ষিত।`
              : `© ${year} Ticket Dorkar Limited. All rights reserved.`}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <RiBusFill className="text-[#E31B23] text-base" />
            {lang === 'BN' ? 'নিরাপদ ও আরামদায়ক যাত্রা' : 'Safe & Comfortable Journeys'}
          </span>
        </div>
      </div>
    </footer>
  );
}

