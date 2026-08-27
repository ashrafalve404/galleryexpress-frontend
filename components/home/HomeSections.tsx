'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { HiShieldCheck, HiClock, HiLocationMarker, HiCheckCircle, HiChevronDown, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { RiBusFill } from 'react-icons/ri';
import { Search, Armchair, CreditCard, QrCode, ArrowRight, Clock } from 'lucide-react';
import client from '@/lib/api/client';
import { today } from '@/lib/utils/date';

interface BackendRoute {
  id: string;
  origin: string;
  destination: string;
  distanceKm?: number;
  durationMins?: number;
  status: string;
}

const DEFAULT_POPULAR_ROUTES = [
  { from: 'Dhaka', to: "Cox's Bazar", duration: '8h', fare: '৳2,000', departures: '4 daily' },
  { from: 'Dhaka', to: 'Chittagong', duration: '5h', fare: '৳1,200', departures: '3 daily' },
  { from: 'Chittagong', to: "Cox's Bazar", duration: '3h', fare: '৳800', departures: '2 daily' },
  { from: "Cox's Bazar", to: 'Dhaka', duration: '8h', fare: '৳2,000', departures: '3 daily' },
  { from: 'Chittagong', to: 'Dhaka', duration: '5h', fare: '৳1,200', departures: '2 daily' },
];

const destinations = [
  {
    name: "Cox's Bazar",
    tag: 'Beach & Ocean',
    desc: "World's longest natural sandy sea beach & scenic marine drive highway.",
    image: '/coxbazar.webp',
    fare: 'From ৳2,000',
  },
  {
    name: 'Chittagong',
    tag: 'Port City',
    desc: "Bangladesh's major port city — Patenga sea beach & lush hill tracts scenery.",
    image: '/chittagong.webp',
    fare: 'From ৳1,200',
  },
];

const features = [
  { icon: HiClock, title: 'Instant Booking', desc: 'Book your seat online in under 60 seconds with instant confirmation.' },
  { icon: HiShieldCheck, title: 'Secure Payment', desc: '100% verified SSL payment with bKash, Nagad & Cards.' },
  { icon: HiLocationMarker, title: 'Digital Ticket', desc: 'Instant QR code mobile boarding ticket sent to your phone.' },
  { icon: HiCheckCircle, title: 'Easy Cancellation', desc: 'Instant online cancellation with transparent refund policies.' },
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

function formatMinutes(mins?: number): string {
  if (!mins) return '4h+';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function PopularDestinations() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % destinations.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrent((prev) => (prev === 0 ? destinations.length - 1 : prev - 1));
  const nextSlide = () => setCurrent((prev) => (prev + 1) % destinations.length);

  return (
    <section className="py-16 bg-white" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">Popular Destinations</h2>
            <p className="text-gray-500 mt-1 text-sm font-medium">Explore Bangladesh's most iconic travel hubs</p>
          </div>
        </div>

        {/* ========== MOBILE MODE SLIDER (< sm) WITH HORIZONTAL TRANSLATE SLIDE EFFECT ========== */}
        <div className="sm:hidden relative w-full overflow-hidden rounded-2xl shadow-lg border border-gray-100">
          <div
            className="flex w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {destinations.map((d) => (
              <div key={d.name} className="w-full shrink-0 h-88 relative">
                <Link
                  href={`/search?from=Dhaka&to=${encodeURIComponent(d.name)}&date=${today()}`}
                  className="group relative w-full h-full flex flex-col justify-end p-6"
                >
                  {/* Image poster background */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                  </div>

                  {/* Content overlay */}
                  <div className="relative z-10 text-white">
                    <span className="inline-block bg-[#E31B23] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1.5 uppercase tracking-wide shadow-xs">
                      {d.tag}
                    </span>

                    <h3 className="text-xl sm:text-2xl font-black text-white mb-1 leading-tight">
                      {d.name}
                    </h3>

                    <p className="text-white/85 text-[11px] sm:text-xs line-clamp-2 mb-2.5 leading-relaxed font-medium">
                      {d.desc}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-2.5 border-t border-white/20 font-semibold text-white/90">
                      <span className="font-bold text-white text-xs">{d.fare}</span>
                      <span className="bg-[#E31B23] hover:bg-[#C41920] text-white font-bold flex items-center gap-1 px-3 py-1 rounded-xl shadow-md transition-all">
                        Book <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Mobile Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-black/25 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-xs flex items-center justify-center border border-white/15 transition-all active:scale-90"
            aria-label="Previous Destination"
          >
            <HiChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-black/25 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-xs flex items-center justify-center border border-white/15 transition-all active:scale-90"
            aria-label="Next Destination"
          >
            <HiChevronRight size={16} />
          </button>

          {/* Slide Dot Indicators */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
            {destinations.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-5 bg-[#E31B23]' : 'w-2 bg-white/60'
                }`}
                aria-label={`Go to destination ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ========== DESKTOP GRID (≥ sm) ========== */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((d) => (
            <Link
              key={d.name}
              href={`/search?from=Dhaka&to=${encodeURIComponent(d.name)}&date=${today()}`}
              className="group relative h-80 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col justify-end p-5 border border-gray-100"
            >
              {/* Image poster background */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-all" />
              </div>

              {/* Content overlay */}
              <div className="relative z-10 text-white">
                <span className="inline-block bg-[#E31B23] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1.5 uppercase tracking-wide shadow-xs">
                  {d.tag}
                </span>

                <h3 className="text-xl font-black text-white mb-1 group-hover:text-[#E31B23] transition-colors">
                  {d.name}
                </h3>

                <p className="text-white/80 text-[11px] sm:text-xs line-clamp-2 mb-2.5 leading-relaxed font-medium">
                  {d.desc}
                </p>

                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-white/20 font-semibold text-white/90">
                  <span className="font-bold text-white text-xs">{d.fare}</span>
                  <span className="bg-[#E31B23] group-hover:bg-[#C41920] text-white font-bold group-hover:translate-x-0.5 transition-all flex items-center gap-1.5 px-3.5 py-1 rounded-xl shadow-md">
                    Book <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PopularRoutes() {
  const { data: apiRoutes } = useQuery({
    queryKey: ['public', 'routes'],
    queryFn: async () => {
      const { data } = await client.get('/api/v1/routes');
      const list = data?.data || data || [];
      return Array.isArray(list) ? list : [];
    },
  });

  // Fare lookup based on known corridor prices
  const fareLookup: Record<string, string> = {
    "Dhaka→Cox's Bazar": '৳2,000',
    "Cox's Bazar→Dhaka": '৳2,000',
    'Dhaka→Chittagong': '৳1,200',
    'Chittagong→Dhaka': '৳1,200',
    "Chittagong→Cox's Bazar": '৳800',
    "Cox's Bazar→Chittagong": '৳800',
  };

  const activeRoutes = Array.isArray(apiRoutes) && apiRoutes.length > 0
    ? apiRoutes
        .filter((r: BackendRoute) => r.status === 'ACTIVE' && r.origin !== 'Comilla' && r.destination !== 'Comilla')
        .slice(0, 6)
        .map((r: BackendRoute) => ({
          from: r.origin,
          to: r.destination,
          duration: formatMinutes(r.durationMins),
          fare: `From ${fareLookup[`${r.origin}→${r.destination}`] || '৳350'}`,
          departures: 'Daily',
        }))
    : DEFAULT_POPULAR_ROUTES;

  return (
    <section className="py-16 bg-gray-50" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">Popular Routes</h2>
            <p className="text-gray-500 mt-1 text-sm font-medium">Most frequented intercity bus trips across Bangladesh</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRoutes.map((r, i) => (
            <Link
              key={`${r.from}-${r.to}-${i}`}
              href={`/search?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}&date=${today()}`}
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl hover:border-[#E31B23]/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-base sm:text-lg font-black text-[#111111]">
                  <span>{r.from}</span>
                  <span className="text-[#E31B23]">→</span>
                  <span>{r.to}</span>
                </div>
                <span className="bg-[#E31B23]/10 text-[#E31B23] px-3 py-1 rounded-full font-black text-xs sm:text-sm">
                  {r.fare}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#E31B23]" /> {r.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <RiBusFill size={15} className="text-[#E31B23]" /> Direct Bus
                </span>
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
          <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">Why Choose Gallery Express Limited?</h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">We deliver excellence across every single journey.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="text-center p-4 sm:p-6 rounded-2xl border border-gray-100 hover:border-[#E31B23]/30 hover:shadow-lg transition-all group bg-white"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#E31B23]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-[#E31B23] transition-colors">
                <Icon className="text-xl sm:text-2xl text-[#E31B23] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-[#111111] text-xs sm:text-base mb-1 sm:mb-2">{title}</h3>
              <p className="text-gray-500 text-[11px] sm:text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="py-14 sm:py-20 bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-black">Book in 4 Simple Steps</h2>
          <p className="text-gray-400 mt-2 text-xs sm:text-sm font-medium">From search to digital ticket in under 3 minutes.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 sm:top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] border-t-2 border-dashed border-[#E31B23]/40 z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#E31B23] flex items-center justify-center mb-3 sm:mb-4 shadow-lg text-white mx-auto">
                    <Icon className="text-xl sm:text-2xl" />
                  </div>
                  <div className="text-xs sm:text-sm font-black text-[#E31B23] uppercase tracking-wider mb-1">
                    STEP {s.step}
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-1.5">{s.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
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
    { value: '6+', label: 'Express Routes' },
    { value: '10+', label: 'Luxury AC Coaches' },
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
