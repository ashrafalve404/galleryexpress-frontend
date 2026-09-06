import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AboutContent } from '@/components/about/AboutContent';

export const metadata: Metadata = {
  title: 'About Ticket Dorkar Limited — Premier Bus Service in Bangladesh',
  description: 'Learn about Ticket Dorkar Limited (ticketdorkar.xyz) — Bangladesh\'s trusted intercity AC & Non-AC bus ticket booking platform connecting Dhaka, Chittagong, and Cox\'s Bazar.',
  alternates: {
    canonical: 'https://www.ticketdorkar.xyz/about',
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20 pb-16 min-h-screen bg-gray-50/50">
        <AboutContent />
      </main>
      <Footer />
    </>
  );
}

