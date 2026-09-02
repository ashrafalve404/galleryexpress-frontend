import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) — Ticket Dorkar Bus Ticket',
  description: 'Find answers to common questions about booking online bus tickets in Bangladesh with Ticket Dorkar. Learn about seat selection, payments, cancellations, and boarding.',
  alternates: {
    canonical: 'https://www.ticketdorkar.xyz/faq',
  },
};

const faqs = [
  { q: 'How do I book a bus ticket online on Ticket Dorkar?', a: 'Select your origin and destination on Ticket Dorkar (ticketdorkar.xyz), choose a travel date, pick your preferred AC or Non-AC bus schedule, select your seats, fill in passenger details, and pay securely via bKash, Nagad, or credit card. You will receive an instant digital QR ticket.' },
  { q: 'What documents do I need for boarding the bus?', a: 'Show your digital ticket (QR code) or booking reference at the bus counter or boarding point. A valid NID or government-issued ID may be required for verification.' },
  { q: 'Can I choose my preferred bus seat?', a: 'Yes! Our interactive seat map lets you select available seats in real-time, including regular seats, VIP seats, and ladies-only seats.' },
  { q: 'What payment methods are accepted on Ticket Dorkar?', a: 'We accept bKash, Nagad, credit/debit cards (Visa, Mastercard), and cash payments at our counter offices.' },
  { q: 'How can I cancel my bus ticket booking?', a: 'Go to "My Booking" on ticketdorkar.xyz, enter your ticket reference number, and follow the cancellation steps. Refunds are processed according to our Cancellation Policy.' },
  { q: 'What if my bus is delayed?', a: 'We strive for maximum punctuality. In case of traffic delays, counter staff will update you via SMS or phone.' },
  { q: 'Is there a discount for children?', a: 'Children under 5 years travelling on a parent\'s lap may travel free. Children aged 5 and above require a full ticket.' },
  { q: 'How do I get my E-ticket after booking?', a: 'Your digital E-ticket is generated immediately upon payment. You can view, download, or print it from "My Booking" or save the QR code on your mobile device.' },
];

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <Header />
      <main className="flex-1 pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-[#111111] mb-2">Frequently Asked Questions</h1>
            <p className="text-gray-500 text-sm">Everything you need to know about booking bus tickets with Ticket Dorkar.</p>
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
            <p className="text-gray-700 text-sm mb-3">Still have questions about your bus journey?</p>
            <a href="/contact" className="inline-block bg-[#E31B23] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#C41920] transition-colors">
              Contact Support Team
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

