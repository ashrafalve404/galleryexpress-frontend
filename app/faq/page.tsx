import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'FAQ — Frequently Asked Questions' };

const faqs = [
  { q: 'How do I book a bus ticket online?', a: 'Select your origin and destination on the homepage, choose a travel date, pick your preferred schedule, select seats, fill passenger details, and pay securely. You\'ll receive a digital ticket instantly.' },
  { q: 'What documents do I need for boarding?', a: 'Show your digital ticket (QR code) or booking reference at the boarding point. A valid NID or any government-issued ID may be required for verification.' },
  { q: 'Can I choose my seat?', a: 'Yes! Our interactive seat map lets you choose from available seats, including regular, VIP, and ladies-only seats.' },
  { q: 'What payment methods are accepted?', a: 'We accept bKash, Nagad, credit/debit cards (Visa, Mastercard), and cash at our counter offices.' },
  { q: 'How can I cancel my booking?', a: 'Go to "My Booking", enter your reference number, and follow the cancellation steps. Refunds are processed per our Cancellation Policy.' },
  { q: 'What if my bus is delayed?', a: 'We do our best to maintain schedules. In case of significant delays, our staff will notify you. Follow us on Facebook for live updates.' },
  { q: 'Is there a discount for children?', a: 'Children below 5 years travelling on a parent\'s lap may travel free. Children above 5 require a full ticket. Contact support for group booking discounts.' },
  { q: 'How do I get my ticket after booking?', a: 'Your digital ticket is immediately available in "My Booking". You can also print it or save the QR code on your phone.' },
];

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-[#111111] mb-2">Frequently Asked Questions</h1>
            <p className="text-gray-500 text-sm">Everything you need to know about travelling with Ticket Dorkar.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-semibold text-[#111111] text-sm list-none hover:bg-gray-50 transition-colors">
                  {faq.q}
                  <span className="ml-4 text-[#E31B23] transition-transform group-open:rotate-45 font-bold text-xl leading-none shrink-0">+</span>
                </summary>
                <div className="px-6 pb-4 text-gray-500 text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
          <div className="mt-10 bg-[#E31B23]/5 border border-[#E31B23]/20 rounded-2xl p-6 text-center">
            <p className="text-gray-700 text-sm mb-3">Still have questions?</p>
            <a href="/contact" className="inline-block bg-[#E31B23] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#C41920] transition-colors">
              Contact Our Support Team
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
