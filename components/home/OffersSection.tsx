'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { getPublicOffers, type OfferItem } from '@/lib/api/offers';
import { useLanguageStore } from '@/lib/store/languageStore';
import { getTranslation } from '@/lib/utils/translations';

export function OffersSection() {
  const { lang } = useLanguageStore();
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const { data: offersData, isLoading } = useQuery({
    queryKey: ['public', 'offers'],
    queryFn: getPublicOffers,
    staleTime: 60_000,
  });

  const offers: OfferItem[] = Array.isArray(offersData) ? offersData : [];

  useEffect(() => {
    if (offers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [offers.length]);

  // Touch Swipe Handlers for Mobile Manual Sliding
  const minSwipeDistance = 40;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Slide
      setCurrent((prev) => (prev + 1) % (offers.length || 1));
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous Slide
      setCurrent((prev) => (prev === 0 ? (offers.length || 1) - 1 : prev - 1));
    }
  };

  // Hide the entire section if loading is complete and there are no active offer posters
  if (!isLoading && offers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex flex-col items-center sm:items-start justify-between mb-8 sm:mb-10 text-center sm:text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">
              {getTranslation(lang, 'specialOffers', 'Special Offers')}
            </h2>
            <p className="text-gray-500 mt-1 text-sm font-medium">
              {getTranslation(lang, 'specialOffersSub', 'Check out our latest promotional deals')}
            </p>
          </div>
        </div>

        {/* ========== MOBILE SLIDER (< sm) WITH HORIZONTAL TOUCH SWIPE & SLIDE EFFECT ========== */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="sm:hidden relative w-full aspect-square overflow-hidden rounded-3xl shadow-lg border border-gray-100 bg-gray-50 touch-pan-y"
        >
          <div
            className="flex w-full h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {offers.map((offer) => (
              <div key={offer.id} className="w-full shrink-0 h-full relative">
                <Image
                  src={offer.imageUrl || '/dest-coxsbazar.png'}
                  alt={offer.title || 'Promotional Offer Poster'}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Dot Indicators */}
          {offers.length > 1 && (
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {offers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === current ? 'w-5 bg-[#E31B23]' : 'w-2 bg-white/60'
                  }`}
                  aria-label={`Go to offer poster ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ========== DESKTOP GRID (≥ sm) 1:1 POSTERS ========== */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="group relative w-full aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gray-50"
            >
              <Image
                src={offer.imageUrl || '/dest-coxsbazar.png'}
                alt={offer.title || 'Promotional Offer Poster'}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
