import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSlider } from '@/components/home/HeroSlider';
import { PopularDestinations, PopularRoutes, WhyChooseUs, HowItWorks, FAQSection, TrustSection, TrustBadgesBand } from '@/components/home/HomeSections';
import { OffersSection } from '@/components/home/OffersSection';

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
      name: 'Chittagong to Cox\'s Bazar Bus Ticket',
      url: 'https://www.ticketdorkar.xyz/search?from=Chittagong&to=Cox%27s+Bazar',
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Cox\'s Bazar to Dhaka Bus Ticket',
      url: 'https://www.ticketdorkar.xyz/search?from=Cox%27s+Bazar&to=Dhaka',
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
        <TrustBadgesBand />


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


