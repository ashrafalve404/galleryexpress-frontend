'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { getPublicOffers, type OfferItem } from '@/lib/api/offers';

export function OffersSection() {
  const [current, setCurrent] = useState(0);

  const { data: offersData, isLoading } = useQuery({
    queryKey: ['public', 'offers'],
    queryFn: getPublicOffers,
    staleTime: 60_000,
  });

  const offers: OfferItem[] = Array.isArray(offersData) ? offersData : [];

  // Hide the entire section if loading is complete and there are no active offer posters
  if (!isLoading && offers.length === 0) {
    return null;
  }

  const prevSlide = () => setCurrent((prev) => (prev === 0 ? offers.length - 1 : prev - 1));
  const nextSlide = () => setCurrent((prev) => (prev + 1) % (offers.length || 1));

  return (
    <section className="py-16 bg-white" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">
              Special Offers
            </h2>
            <p className="text-gray-500 mt-1 text-sm font-medium">
              Check out our latest promotional deals
            </p>
          </div>
        </div>

        {/* ========== MOBILE SLIDER (< sm) WITH HORIZONTAL SLIDE EFFECT ========== */}
        <div className="sm:hidden relative w-full aspect-square overflow-hidden rounded-3xl shadow-lg border border-gray-100 bg-gray-50">
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

          {/* Navigation Arrows */}
          {offers.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center border border-white/20 transition-all active:scale-90"
                aria-label="Previous Offer Poster"
              >
                <HiChevronLeft size={18} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center border border-white/20 transition-all active:scale-90"
                aria-label="Next Offer Poster"
              >
                <HiChevronRight size={18} />
              </button>

              {/* Dot Indicators */}
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
            </>
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
