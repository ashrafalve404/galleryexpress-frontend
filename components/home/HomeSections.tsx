import Link from 'next/link';
import { HiShieldCheck, HiClock, HiLocationMarker, HiCheckCircle, HiChevronDown } from 'react-icons/hi';
import { Search, Armchair, CreditCard, QrCode, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/utils/constants';
import { today } from '@/lib/utils/date';

const popularRoutes = [
  { from: 'Dhaka', to: 'Chittagong', duration: '4h 30m', fare: '৳550', departures: '12+ daily' },
  { from: 'Dhaka', to: 'Sylhet', duration: '4h', fare: '৳500', departures: '10+ daily' },
  { from: "Dhaka", to: "Cox's Bazar", duration: '8h', fare: '৳900', departures: '8+ daily' },
  { from: 'Dhaka', to: 'Rajshahi', duration: '5h', fare: '৳600', departures: '8+ daily' },
  { from: 'Dhaka', to: 'Khulna', duration: '6h', fare: '৳650', departures: '6+ daily' },
  { from: 'Chittagong', to: "Cox's Bazar", duration: '2h 30m', fare: '৳300', departures: '15+ daily' },
];

const features = [
  { icon: HiShieldCheck, title: 'Safe & Trusted', desc: 'Professional licensed drivers, safety checks, and GPS-tracked vehicles.' },
  { icon: HiClock, title: 'Always On Time', desc: 'Punctual departures and real-time tracking across all operational routes.' },
  { icon: HiLocationMarker, title: 'Wide Coverage', desc: '50+ routes connecting all major divisional cities and districts.' },
  { icon: HiCheckCircle, title: 'Easy Cancellation', desc: 'Instant online cancellation with structured transparent refund policies.' },
];

const steps = [
  {
    step: '01',
    icon: Search,
    title: 'Search',
    desc: 'Enter origin, destination, and select your journey date.',
  },
  {
    step: '02',
    icon: Armchair,
    title: 'Select Seat',
    desc: 'Choose preferred seats from our interactive coach layout.',
  },
  {
    step: '03',
    icon: CreditCard,
    title: 'Pay Securely',
    desc: 'Pay via bKash, Nagad, Card, or Counter payment options.',
  },
  {
    step: '04',
    icon: QrCode,
    title: 'Get Ticket',
    desc: 'Receive your instant digital ticket with QR code for boarding.',
  },
];

export function PopularRoutes() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">Popular Routes</h2>
            <p className="text-gray-500 mt-1 text-sm font-medium">Most frequented intercity trips</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularRoutes.map((r) => (
            <Link
              key={`${r.from}-${r.to}`}
              href={`/search?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}&date=${today()}`}
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl hover:border-[#E31B23]/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-lg font-black text-[#111111]">
                  <span>{r.from}</span>
                  <span className="text-[#E31B23]">→</span>
                  <span>{r.to}</span>
                </div>
                <span className="bg-[#E31B23]/10 text-[#E31B23] px-3 py-1 rounded-full font-black text-sm">
                  {r.fare}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50 font-medium">
                <span>⏱ {r.duration}</span>
                <span>🚌 {r.departures}</span>
                <span className="text-[#E31B23] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Book <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">Why Choose Gallery Express?</h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">We deliver excellence across every single journey.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="text-center p-6 rounded-2xl border border-gray-100 hover:border-[#E31B23]/30 hover:shadow-lg transition-all group bg-white"
            >
              <div className="w-14 h-14 bg-[#E31B23]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#E31B23] transition-colors">
                <Icon className="text-2xl text-[#E31B23] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-[#111111] mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="py-20 bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-black">Book in 4 Simple Steps</h2>
          <p className="text-gray-400 mt-2 text-sm font-medium">From search to digital ticket in under 3 minutes.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-white/15 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#E31B23] flex items-center justify-center mb-4 shadow-lg text-white">
                    <Icon size={28} />
                  </div>
                  <div className="text-sm font-black text-[#E31B23] uppercase tracking-wider mb-1">
                    STEP {s.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: 'How do I book a bus ticket?',
    a: 'Select your origin, destination, and travel date on the homepage. Choose a schedule, select your seat, enter passenger details, and pay online. You\'ll receive a digital ticket instantly.',
  },
  {
    q: 'Can I cancel my ticket?',
    a: 'Yes, you can cancel your ticket before departure time through our website. Cancellation charges apply based on our policy.',
  },
  {
    q: 'How do I access my digital ticket?',
    a: 'After booking, your ticket with QR code is available in the "My Booking" section. You can also print it or show it on your mobile device during boarding.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept bKash, Nagad, Credit/Debit cards (Visa, Mastercard), and Counter payment at our physical offices.',
  },
  {
    q: 'Is my seat guaranteed after payment?',
    a: 'Yes. Once payment is confirmed, your seat is locked exclusively for your journey.',
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">Frequently Asked Questions</h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">Everything you need to know about our service</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs"
            >
              <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-bold text-[#111111] text-sm list-none hover:bg-gray-50/80 transition-colors">
                {faq.q}
                <HiChevronDown className="text-xl text-[#E31B23] transition-transform duration-200 group-open:rotate-180 shrink-0 ml-4" />
              </summary>
              <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  const stats = [
    { value: '50K+', label: 'Happy Passengers' },
    { value: '15+', label: 'Intercity Routes' },
    { value: '25+', label: 'Modern Coaches' },
    { value: '5+', label: 'Years of Excellence' },
  ];

  return (
    <section className="py-16 bg-[#E31B23]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl sm:text-4xl font-black mb-1">{stat.value}</div>
              <div className="text-white/90 text-sm font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
