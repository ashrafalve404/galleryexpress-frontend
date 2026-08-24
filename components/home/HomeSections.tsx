import Link from 'next/link';
import { HiShieldCheck, HiClock, HiLocationMarker, HiCheckCircle, HiArrowRight, HiChevronDown } from 'react-icons/hi';
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
  { step: '01', title: 'Search', desc: 'Enter origin, destination, and select your journey date.' },
  { step: '02', title: 'Select Seat', desc: 'Choose preferred seats from our interactive coach layout.' },
  { step: '03', title: 'Pay Securely', desc: 'Pay via bKash, Nagad, Card, or Counter payment options.' },
  { step: '04', title: 'Get Ticket', desc: 'Receive your instant digital ticket with QR code for boarding.' },
];

export function PopularRoutes() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">Popular Routes</h2>
            <p className="text-gray-500 mt-1.5 text-sm font-medium">Most frequented intercity trips</p>
          </div>
          <Link
            href={ROUTES.SEARCH}
            className="text-[#E31B23] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
          >
            All Routes <HiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularRoutes.map((route, i) => (
            <Link
              key={i}
              href={`${ROUTES.SEARCH}?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${today()}`}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#E31B23]/40 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#111111]">
                  <span>{route.from}</span>
                  <HiArrowRight className="text-[#E31B23]" />
                  <span>{route.to}</span>
                </div>
                <span className="text-[#E31B23] font-black text-base">{route.fare}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1">
                  <HiClock className="text-gray-400 text-sm" /> {route.duration}
                </span>
                <span>{route.departures}</span>
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
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">Why Choose Gallery Express?</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm font-medium">
            Dedicated to delivering the most reliable, comfortable, and efficient bus travel experience in Bangladesh.
          </p>
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
          <p className="text-gray-400 mt-2 text-sm">From search to digital ticket in under 3 minutes.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-white/15 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#E31B23] flex items-center justify-center mb-5 font-black text-xl shadow-lg">
                  {s.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
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
    { value: '500K+', label: 'Happy Passengers' },
    { value: '50+', label: 'Intercity Routes' },
    { value: '100+', label: 'Modern Coaches' },
    { value: '10+', label: 'Years of Excellence' },
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
