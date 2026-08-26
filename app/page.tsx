import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSlider } from '@/components/home/HeroSlider';
import { PopularDestinations, PopularRoutes, WhyChooseUs, HowItWorks, FAQSection, TrustSection } from '@/components/home/HomeSections';
import { OffersSection } from '@/components/home/OffersSection';
import { CheckCircle2, ShieldCheck, Ticket, RotateCcw } from 'lucide-react';

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
        {/* ========== HERO SLIDER BANNER WITH FLOATING SEARCH CARD ========== */}
        <HeroSlider />

        {/* ========== TRUST BADGES BAND ========== */}
        <div className="bg-[#111111] py-3.5 sm:py-4 border-t border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:flex lg:items-center lg:justify-around gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2 font-bold px-1">
                <Icon size={16} className="text-[#E31B23] shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========== POPULAR DESTINATIONS ========== */}
        <PopularDestinations />

        {/* ========== POPULAR ROUTES ========== */}
        <PopularRoutes />

        {/* ========== PROMOTIONAL OFFERS (1:1 POSTERS) ========== */}
        <OffersSection />

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
