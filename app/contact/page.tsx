import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactContent } from '@/components/contact/ContactContent';

export const metadata: Metadata = {
  title: 'Contact Us — Ticket Dorkar Limited',
  description: 'Get in touch with Ticket Dorkar Limited customer support for bus ticket bookings, counter locations, cancellations, and inquiries. Hotline: 01826-110036.',
  alternates: {
    canonical: 'https://www.ticketdorkar.xyz/contact',
  },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-16 min-h-screen bg-gray-50">
        <ContactContent />
      </main>
      <Footer />
    </>
  );
}

