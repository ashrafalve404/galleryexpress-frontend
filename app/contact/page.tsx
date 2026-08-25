import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/contact/ContactForm';
import { RiPhoneFill, RiMailFill, RiMapPinFill, RiTimeFill } from 'react-icons/ri';

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
                { icon: RiPhoneFill, label: 'Customer Support', value: '01826-110036', sub: 'Available 7 days a week', href: 'tel:01826110036' },
                { icon: RiMailFill, label: 'Email', value: 'galleryexpresslimited@gmail.com', sub: 'We reply within 24 hours', href: 'mailto:galleryexpresslimited@gmail.com' },
                { icon: RiMapPinFill, label: 'Head Office', value: 'Gulshan, Dhaka', sub: 'Navana Shopping Centre, Gulshan Avenue 01, Gulshan, Dhaka, Bangladesh' },
                { icon: RiTimeFill, label: 'Business Hours', value: '6:00 AM – 10:00 PM', sub: 'All days including holidays' },
              ].map(({ icon: Icon, label, value, sub, href }) => (
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
      </main>
      <Footer />
    </>
  );
}
