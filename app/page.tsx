import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSlider } from '@/components/home/HeroSlider';
import { PopularDestinations, PopularRoutes, WhyChooseUs, HowItWorks, FAQSection, TrustSection } from '@/components/home/HomeSections';
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
        <div className="bg-[#111111] py-4 border-t border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-around gap-4 text-white/85 text-xs sm:text-sm">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 font-bold">
                <Icon size={16} className="text-[#E31B23]" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========== POPULAR DESTINATIONS ========== */}
        <PopularDestinations />

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
