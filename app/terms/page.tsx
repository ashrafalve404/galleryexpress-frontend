import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'Terms & Conditions', description: 'Read the terms and conditions for using Gallery Express bus ticketing services.' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
      <h2 className="text-lg font-bold text-[#111111] mb-3">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-[#111111] mb-2">Terms &amp; Conditions</h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: January 2024</p>
          <Section title="1. Acceptance of Terms">
            <p>By booking tickets through Gallery Express, you agree to these terms and conditions. Please read them carefully before proceeding with a booking.</p>
          </Section>
          <Section title="2. Booking and Tickets">
            <p>All bookings are subject to seat availability. A booking is confirmed only after successful payment. Your digital ticket constitutes a valid boarding pass.</p>
          </Section>
          <Section title="3. Passenger Responsibilities">
            <p>Passengers must arrive at the boarding point at least 15 minutes before departure. Gallery Express is not liable for missed journeys due to late arrival.</p>
          </Section>
          <Section title="4. Cancellation and Refund">
            <p>Cancellations made 24 hours before departure are eligible for a full refund minus processing fees. Late cancellations may incur charges. See our Cancellation Policy for details.</p>
          </Section>
          <Section title="5. Conduct on Board">
            <p>Passengers are expected to maintain decorum and follow crew instructions. Gallery Express reserves the right to refuse travel to passengers who are disruptive.</p>
          </Section>
          <Section title="6. Liability">
            <p>Gallery Express is not liable for delays caused by traffic, weather, or unforeseen events. We will, however, always strive to minimize inconvenience.</p>
          </Section>
          <Section title="7. Contact">
            <p>For queries regarding these terms, contact us at info@galleryexpress.com or call +880 18XX-XXXXXX.</p>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
