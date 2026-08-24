import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Gallery Express',
  description: 'Learn about Gallery Express — Bangladesh\'s trusted intercity bus service with a commitment to safety, comfort, and punctuality.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-24 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-black text-[#111111] mb-3">About Gallery Express</h1>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">Over a decade of connecting Bangladesh with safe, comfortable, and reliable bus travel.</p>
          </div>

          <div className="prose max-w-none text-gray-600 leading-relaxed space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-[#111111] mb-4">Our Story</h2>
              <p>Gallery Express has been one of Bangladesh's leading intercity bus operators for over 10 years. Founded with a simple mission — to make intercity travel comfortable, affordable, and safe — we have grown to operate over 100 modern coaches across 50+ routes nationwide.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-[#111111] mb-4">Our Mission</h2>
              <p>To provide the most reliable, comfortable, and affordable bus travel experience in Bangladesh. Every seat, every journey, every passenger matters to us.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { value: '50K+', label: 'Passengers Served', desc: 'Happy customers who chose Gallery Express' },
                { value: '15+', label: 'Routes', desc: 'Covering key intercity routes' },
                { value: '25+', label: 'Modern Coaches', desc: 'AC & Non-AC coaches with amenities' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#E31B23]/5 border border-[#E31B23]/20 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-black text-[#E31B23] mb-1">{stat.value}</div>
                  <div className="font-bold text-[#111111] text-sm mb-1">{stat.label}</div>
                  <div className="text-gray-500 text-xs">{stat.desc}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-[#111111] mb-4">Why Passengers Trust Us</h2>
              <div className="space-y-3 text-sm">
                {[
                  'Professional, licensed drivers with safety training',
                  'GPS-tracked vehicles for real-time monitoring',
                  'Regular maintenance and safety inspections',
                  'Modern AC coaches with reclining seats',
                  'Online booking with instant ticket confirmation',
                  'Flexible cancellation policy',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
