import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CancellationPolicyContent } from '@/components/policy/CancellationPolicyContent';

export const metadata: Metadata = {
  title: 'Bus Ticket Resell & Cancellation Policy — Ticket Dorkar Limited',
  description: 'Understand Ticket Dorkar Limited\'s bus ticket resell, refund rates, and cancellation policies for intercity bus bookings in Bangladesh.',
  alternates: {
    canonical: 'https://www.ticketdorkar.xyz/cancellation-policy',
  },
};

export default function CancellationPolicyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-16 min-h-screen bg-gray-50">
        <CancellationPolicyContent />
      </main>
      <Footer />
    </>
  );
}

