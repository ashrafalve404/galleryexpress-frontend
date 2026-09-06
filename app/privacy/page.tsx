import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PrivacyContent } from '@/components/policy/PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy — Ticket Dorkar Limited',
  description: 'Learn how Ticket Dorkar Limited (ticketdorkar.xyz) protects your personal information and payment privacy when booking bus tickets online.',
  alternates: {
    canonical: 'https://www.ticketdorkar.xyz/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-16 min-h-screen bg-gray-50">
        <PrivacyContent />
      </main>
      <Footer />
    </>
  );
}

