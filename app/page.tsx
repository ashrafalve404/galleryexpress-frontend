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
        <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-bus.png"
              alt="Gallery Express luxury bus on highway"
              fill
              priority
              className="object-cover"
              quality={90}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/60" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex flex-col items-center text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Bangladesh's Most Trusted Bus Service
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 max-w-4xl">
              Travel Bangladesh{' '}
              <span className="text-[#E31B23]">Comfortably</span>
              {' & Safely'}
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-10 max-w-xl leading-relaxed">
              Book intercity bus tickets instantly. Choose your seat, pay securely, and travel with confidence.
            </p>

            {/* Search Card */}
            <div className="w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <SearchCard />
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-white/80 text-xs">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 font-medium">
                  <Icon size={14} className="text-[#E31B23]" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/50 animate-bounce">
            <span className="text-xs font-medium uppercase tracking-wider">Scroll</span>
            <div className="w-0.5 h-6 bg-white/40 rounded-full" />
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
