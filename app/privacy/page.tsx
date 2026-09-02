import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'Privacy Policy', description: 'Ticket Dorkar privacy policy — how we collect, use, and protect your personal information.' };

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-[#111111] mb-2">Privacy Policy</h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: August 2026</p>
          {[
            { title: '1. Information We Collect', content: 'We collect personal information you provide during registration and booking, including name, email, phone number, and payment information. We also collect usage data to improve our services.' },
            { title: '2. How We Use Your Information', content: 'Your information is used to process bookings, send ticket confirmations, provide customer support, and improve our services. We do not sell your personal data to third parties.' },
            { title: '3. Data Security', content: 'We implement industry-standard security measures to protect your personal information. All payment data is encrypted using SSL technology.' },
            { title: '4. Cookies', content: 'We use cookies to improve your browsing experience and analyze website traffic. You can disable cookies in your browser settings.' },
            { title: '5. Your Rights', content: 'You have the right to access, correct, or delete your personal data. Contact us at info@ticketdorkar.xyz to exercise these rights.' },
            { title: '6. Changes to This Policy', content: 'We may update this privacy policy periodically. Changes will be posted on this page with an updated date.' },
          ].map(({ title, content }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
              <h2 className="text-lg font-bold text-[#111111] mb-3">{title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
