import type { Metadata } from 'next';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchCard } from '@/components/home/SearchCard';
import { CheckCircle2, ShieldCheck, Ticket, RotateCcw } from 'lucide-react';
import {
  PopularRoutes,
  WhyChooseUs,
  HowItWorks,
  FAQSection,
  TrustSection,
} from '@/components/home/HomeSections';

export const metadata: Metadata = {
  title: 'Gallery Express — Book Bus Tickets Online',
  description:
    'Book bus tickets online with Gallery Express. Find and book intercity bus tickets across Bangladesh. Safe, comfortable, and on-time.',
};

const trustBadges = [
  { icon: CheckCircle2, label: 'Instant Booking' },
  { icon: ShieldCheck, label: 'Secure Payment' },
  { icon: Ticket, label: 'Digital Ticket' },
  { icon: RotateCcw, label: 'Easy Cancellation' },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ========== HERO ========== */}
        <section className="relative flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 z-20">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="/hero-bus-bd.png"
              alt="Gallery Express Bangladesh intercity bus on highway"
              fill
              priority
              className="object-cover"
              quality={90}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/70" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 flex flex-col items-center text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1 text-white text-xs sm:text-sm font-semibold mb-4">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Bangladesh's Most Trusted Bus Service
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 max-w-3xl">
              Travel Bangladesh{' '}
              <span className="text-[#E31B23]">Comfortably</span>
              {' & Safely'}
            </h1>
            <p className="text-white/80 text-xs sm:text-base mb-6 max-w-lg leading-relaxed font-medium">
              Book intercity bus tickets instantly. Choose your seat, pay securely, and travel with confidence.
            </p>

            {/* Search Card Widget */}
            <div className="w-full max-w-3xl animate-fade-in-up">
              <SearchCard />
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-white/85 text-xs">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 font-bold">
                  <Icon size={14} className="text-[#E31B23]" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== POPULAR ROUTES ========== */}
        <PopularRoutes />

        {/* ========== TRUST STATS ========== */}
        <TrustSection />

        {/* ========== WHY CHOOSE US ========== */}
        <WhyChooseUs />

        {/* ========== HOW IT WORKS ========== */}
        <HowItWorks />

        {/* ========== FAQ ========== */}
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
