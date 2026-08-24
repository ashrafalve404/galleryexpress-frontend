import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, MessageCircle, Bus, Globe } from 'lucide-react';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Ready to travel?</h3>
            <p className="text-white/80 text-sm mt-1">Book your seat now and enjoy a comfortable journey.</p>
          </div>
          <Link
            href={ROUTES.SEARCH}
            className="shrink-0 bg-white text-[#E31B23] font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Book a Ticket
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href={ROUTES.HOME} className="inline-block bg-white p-2.5 sm:p-3 rounded-2xl shadow-md mb-5 border border-white/10 hover:scale-105 transition-transform">
              <img
                src="/galleryexplogo.png"
                alt="Gallery Express"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </Link>
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
                <MapPin size={16} className="text-[#E31B23] shrink-0 mt-0.5" />
                <span>Dhaka to Sylhet, Chittagong, Cox's Bazar & more</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-300">
                <Phone size={16} className="text-[#E31B23] shrink-0 mt-0.5" />
                <a href="tel:+88018XXXXXXXX" className="hover:text-white transition-colors">
                  +880 18XX-XXXXXX
                </a>
              </li>
              <li className="flex gap-3 text-sm text-gray-300">
                <Mail size={16} className="text-[#E31B23] shrink-0 mt-0.5" />
                <a href="mailto:info@galleryexpress.com" className="hover:text-white transition-colors">
                  info@galleryexpress.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <span>&copy; {year} Gallery Express. All rights reserved.</span>
          <span className="flex items-center gap-1">
            <Bus size={14} className="text-[#E31B23]" />
            Safe &amp; Comfortable Journeys
          </span>
        </div>
      </div>
    </footer>
  );
}
