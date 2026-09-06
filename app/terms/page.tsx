import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TermsContent } from '@/components/policy/TermsContent';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Ticket Dorkar Limited',
  description: 'Read the official terms and conditions for booking intercity bus tickets online with Ticket Dorkar Limited (ticketdorkar.xyz).',
  alternates: {
    canonical: 'https://www.ticketdorkar.xyz/terms',
  },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-16 min-h-screen bg-gray-50">
        <TermsContent />
      </main>
      <Footer />
    </>
  );
}

