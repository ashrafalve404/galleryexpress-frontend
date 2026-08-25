import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Globe } from 'lucide-react';
import { RiMapPinFill, RiPhoneFill, RiMailFill, RiBusFill } from 'react-icons/ri';
import { ROUTES } from '@/lib/utils/constants';

const quickLinks = [
  { href: ROUTES.SEARCH, label: 'Book Ticket' },
  { href: ROUTES.MY_BOOKING, label: 'My Booking' },
  { href: ROUTES.ABOUT, label: 'About Us' },
  { href: ROUTES.CONTACT, label: 'Contact' },
  { href: ROUTES.FAQ, label: 'FAQ' },
];

const legalLinks = [
  { href: ROUTES.TERMS, label: 'Terms & Conditions' },
  { href: ROUTES.PRIVACY, label: 'Privacy Policy' },
  { href: ROUTES.CANCELLATION_POLICY, label: 'Cancellation Policy' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#111111] text-white">
      {/* Top CTA Band */}
      <div className="bg-[#E31B23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-white">Ready to travel?</h3>
            <p className="text-white/90 text-sm sm:text-base font-medium mt-1.5">Book your seat now and enjoy a comfortable journey across Bangladesh.</p>
          </div>
          <Link
            href={ROUTES.SEARCH}
            className="shrink-0 bg-white text-[#E31B23] font-bold px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base"
          >
            Book a Ticket →
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href={ROUTES.HOME} className="inline-block bg-white p-3 sm:p-3.5 rounded-2xl shadow-lg mb-5 border border-white/10 hover:scale-105 transition-transform">
              <img
                src="/galleryexplogo.png"
                alt="Gallery Express Limited"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            </Link>
            <h3 className="text-white font-black text-lg sm:text-xl mb-1.5 tracking-tight">
              Gallery Express Limited
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bangladesh's trusted intercity bus service. Safe, comfortable, and always on time.
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
                href="#"
                aria-label="Website"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E31B23] flex items-center justify-center transition-colors text-white font-bold text-xs"
              >
                <Globe size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-5">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-gray-300">
                <RiMapPinFill size={18} className="text-[#E31B23] shrink-0 mt-0.5" />
                <span>Navana Shopping Centre, Gulshan Avenue 01, Gulshan, Dhaka, Bangladesh</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-300">
                <RiPhoneFill size={18} className="text-[#E31B23] shrink-0 mt-0.5" />
                <a href="tel:01826110036" className="hover:text-white transition-colors">
                  01826-110036
                </a>
              </li>
              <li className="flex gap-3 text-sm text-gray-300">
                <RiMailFill size={18} className="text-[#E31B23] shrink-0 mt-0.5" />
                <a href="mailto:galleryexpresslimited@gmail.com" className="hover:text-white transition-colors">
                  galleryexpresslimited@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <span>&copy; {year} Gallery Express Limited. All rights reserved.</span>
          <span className="flex items-center gap-1.5 font-medium">
            <RiBusFill className="text-[#E31B23] text-base" />
            Safe &amp; Comfortable Journeys
          </span>
        </div>
      </div>
    </footer>
  );
}
