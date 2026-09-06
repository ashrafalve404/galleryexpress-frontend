import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FAQContent } from '@/components/faq/FAQContent';

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
        <FAQContent />
      </main>
      <Footer />
    </>
  );
}


