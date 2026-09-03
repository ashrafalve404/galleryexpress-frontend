'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { SearchCard } from './SearchCard';

const slides = [
  {
    image: '/herro-image0.webp',
    title: 'Premium Executive Coach Travel',
    subtitle: 'Experience Unmatched Comfort & Luxury Intercity Journeys Across Bangladesh',
    position: 'object-top',
  },
  {
    image: '/hero-image1.webp',
    title: "Explore Cox's Bazar Coastal Highway",
    subtitle: 'Daily Scania & Volvo AC Express Coaches with Deluxe Seat Comfort',
    position: 'object-bottom',
  },
  {
    image: '/hero-image2.webp',
    title: 'Scenic Green Journeys',
    subtitle: 'Punctual Departures & GPS-Tracked Fleet Across All Routes',
    position: 'object-bottom',
  },
  {
    image: '/hero-image3.webp',
    title: 'Intercity Highway Express',
    subtitle: "Connecting Dhaka, Chittagong & Cox's Bazar Daily",
    position: 'object-bottom',
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);

  return (
    <section className="relative z-20 pt-16 sm:pt-20 bg-gray-50">
      {/* 1. Dedicated Banner Carousel Block (Full Banner Image View on Mobile) */}
      <div className="relative w-full aspect-[16/8] sm:aspect-auto sm:h-[400px] md:h-[520px] lg:h-[600px] xl:h-[680px] 2xl:h-[740px] overflow-hidden">
        {slides.map((s, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              sizes="100vw"
              priority={index === 0}
              className={`object-cover ${s.position}`}
            />
            {/* Soft Overlay - Top 100% clear */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            {/* Slide Overlay Text */}
            <div className="absolute bottom-3 sm:bottom-12 lg:bottom-18 xl:bottom-22 left-3 sm:left-10 right-3 max-w-xl text-white z-20">
              <h1 className="text-xs sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
                {s.title}
              </h1>
              <p className="text-white/85 text-[10px] sm:text-sm font-medium mt-0.5 drop-shadow-xs line-clamp-1 sm:line-clamp-2">
                {s.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-[#E31B23] text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/20 shadow-lg"
          aria-label="Previous Slide"
        >
          <HiChevronLeft size={18} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-[#E31B23] text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/20 shadow-lg"
          aria-label="Next Slide"
        >
          <HiChevronRight size={18} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute top-3 right-3 sm:right-6 z-30 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-5 sm:w-6 bg-[#E31B23]' : 'w-2 bg-white/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Search Booking Widget Container - Positioned below banner in mobile mode, floating in desktop */}
      <div className="relative z-30 max-w-4xl mx-auto px-3 sm:px-4 mt-4 sm:-mt-10 lg:-mt-16 xl:-mt-20 pb-8 sm:pb-12">
        <SearchCard />
      </div>
    </section>
  );
}
