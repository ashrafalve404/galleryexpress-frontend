import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/contact/ContactForm';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Gallery Express. We are here to help with bookings, cancellations, and any queries.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-black text-[#111111] mb-3">Contact Us</h1>
            <p className="text-gray-500 text-sm">Have a question? We're here to help.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-5">
              {[
                { icon: Phone, label: 'Customer Support', value: '+880 18XX-XXXXXX', sub: 'Available 7 days a week', href: 'tel:+880XXXXXXXX' },
                { icon: Mail, label: 'Email', value: 'info@galleryexpress.com', sub: 'We reply within 24 hours', href: 'mailto:info@galleryexpress.com' },
                { icon: MapPin, label: 'Head Office', value: 'Dhaka, Bangladesh', sub: 'Gabtoli Bus Terminal, Dhaka 1216' },
                { icon: Clock, label: 'Business Hours', value: '6:00 AM – 10:00 PM', sub: 'All days including holidays' },
              ].map(({ icon: Icon, label, value, sub, href }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
                  <div className="w-11 h-11 bg-[#E31B23]/10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-[#E31B23]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</div>
                    {href ? (
                      <a href={href} className="font-bold text-[#111111] hover:text-[#E31B23] transition-colors">{value}</a>
                    ) : (
                      <div className="font-bold text-[#111111]">{value}</div>
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
      </main>
      <Footer />
    </>
  );
}
