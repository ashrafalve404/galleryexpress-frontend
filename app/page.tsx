import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSlider } from '@/components/home/HeroSlider';
import { PopularDestinations, PopularRoutes, WhyChooseUs, HowItWorks, FAQSection, TrustSection } from '@/components/home/HomeSections';
import { OffersSection } from '@/components/home/OffersSection';
import { CheckCircle2, ShieldCheck, Ticket, RotateCcw, BusFront, Shield, MapPin, Zap } from 'lucide-react';
import Link from 'next/link';

const trustBadges = [
  { icon: CheckCircle2, label: 'Instant Booking' },
  { icon: ShieldCheck, label: 'Secure Payment' },
  { icon: Ticket, label: 'Digital Ticket' },
  { icon: RotateCcw, label: 'Easy Cancellation' },
];

const busRoutesSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Popular Bus Routes in Bangladesh',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Dhaka to Cox\'s Bazar Bus Ticket',
      url: 'https://www.ticketdorkar.xyz/search?from=Dhaka&to=Cox%27s+Bazar',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Dhaka to Chittagong Bus Ticket',
      url: 'https://www.ticketdorkar.xyz/search?from=Dhaka&to=Chittagong',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Dhaka to Sylhet Bus Ticket',
      url: 'https://www.ticketdorkar.xyz/search?from=Dhaka&to=Sylhet',
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Dhaka to Rajshahi Bus Ticket',
      url: 'https://www.ticketdorkar.xyz/search?from=Dhaka&to=Rajshahi',
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(busRoutesSchema) }}
      />
      <Header />
      <main className="flex-1">
        {/* ========== HERO SLIDER BANNER WITH FLOATING SEARCH CARD ========== */}
        <HeroSlider />

        {/* ========== TRUST BADGES BAND ========== */}
        <div className="bg-[#111111] py-3 sm:py-4 border-t border-b border-white/10">
          <div className="max-w-xs sm:max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 grid grid-cols-2 lg:flex lg:items-center lg:justify-around gap-x-4 gap-y-2.5 text-white/90 text-xs sm:text-sm">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-start sm:justify-center gap-2 font-bold">
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

        {/* ========== PRO SEO CONTENT BLOCK FOR SEARCH ENGINE RANKING ========== */}
        <section className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Ticket Dorkar (ticketdorkar.xyz) — #1 Online Bus Ticket Booking in Bangladesh
              </h1>
              <p className="text-sm leading-relaxed text-gray-400">
                Welcome to <strong>Ticket Dorkar</strong>, Bangladesh's ultimate destination for booking intercity AC &amp; Non-AC bus tickets online. Whether you are traveling from <strong>Dhaka to Cox's Bazar</strong>, <strong>Dhaka to Chittagong</strong>, <strong>Sylhet</strong>, or <strong>Rajshahi</strong>, Ticket Dorkar delivers a seamless, instant bus ticket booking experience with real-time seat selection, mobile E-tickets, and transparent fares.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-2 text-white font-bold mb-2">
                  <BusFront className="text-[#E31B23] shrink-0" size={18} />
                  <span>Popular Intercity Bus Routes</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Book online bus seats for high-demand express routes including Dhaka – Cox's Bazar Express, Dhaka – Chittagong Highway, Dhaka – Sylhet Bypass, and Dhaka – Rajshahi. Choose between Scania Luxury Multi-Axle AC and Economy Non-AC coaches.
                </p>
              </div>

              <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-2 text-white font-bold mb-2">
                  <Zap className="text-[#E31B23] shrink-0" size={18} />
                  <span>Instant E-Ticket &amp; QR Boarding</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  No more waiting in long counter queues! Complete your bus seat reservation in 60 seconds. Receive your digital QR ticket instantly on your phone or email, ready for hassle-free counter check-in and boarding.
                </p>
              </div>

              <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-2 text-white font-bold mb-2">
                  <Shield className="text-[#E31B23] shrink-0" size={18} />
                  <span>100% Guaranteed Bus Seats</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Ticket Dorkar connects directly with authorized bus counters. Pay securely using bKash, Nagad, Mastercard, Visa, or at counter locations. Verified seat lock ensures your selected seat is guaranteed.
                </p>
              </div>
            </div>

            {/* Quick Route Keywords Tags */}
            <div className="pt-2 border-t border-gray-800/80">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Popular Bus Ticket Searches:</span>
              <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                <Link href="/search?from=Dhaka&to=Cox%27s+Bazar" className="hover:text-[#E31B23] transition-colors bg-gray-800 px-2.5 py-1 rounded-md">Dhaka to Cox's Bazar Bus Ticket</Link>
                <Link href="/search?from=Dhaka&to=Chittagong" className="hover:text-[#E31B23] transition-colors bg-gray-800 px-2.5 py-1 rounded-md">Dhaka to Chittagong Bus Ticket</Link>
                <Link href="/search?from=Dhaka&to=Sylhet" className="hover:text-[#E31B23] transition-colors bg-gray-800 px-2.5 py-1 rounded-md">Dhaka to Sylhet Bus</Link>
                <Link href="/search?from=Dhaka&to=Rajshahi" className="hover:text-[#E31B23] transition-colors bg-gray-800 px-2.5 py-1 rounded-md">Dhaka to Rajshahi Bus Ticket</Link>
                <span className="bg-gray-800 px-2.5 py-1 rounded-md">Ticket Dorkar Online Bus Booking</span>
                <span className="bg-gray-800 px-2.5 py-1 rounded-md">ticketdorkar.xyz Bus Service</span>
                <span className="bg-gray-800 px-2.5 py-1 rounded-md">বাস টিকিট অনলাইন বুকিং</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

