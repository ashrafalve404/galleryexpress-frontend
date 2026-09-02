import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RiCheckboxCircleFill, RiAwardFill, RiShieldCheckFill } from 'react-icons/ri';

export const metadata: Metadata = {
  title: 'About Ticket Dorkar',
  description: 'Learn about Ticket Dorkar — Bangladesh\'s trusted intercity bus service with a commitment to safety, comfort, and punctuality.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20 pb-16 min-h-screen bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {/* Plain text header — matches Contact page style */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-black text-[#111111] mb-3">About Ticket Dorkar</h1>
            <p className="text-gray-500 text-sm">Over a decade of connecting Bangladesh with safe, comfortable, and reliable bus travel.</p>
          </div>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#E31B23]/10 text-[#E31B23] flex items-center justify-center mb-4">
                  <RiAwardFill size={26} className="text-[#E31B23]" />
                </div>
                <h2 className="text-xl font-black text-[#111111] mb-3">Our Story</h2>
                <p className="text-sm leading-relaxed text-gray-600">
                  Ticket Dorkar is one of Bangladesh's premier intercity bus operators. Founded with a simple mission — to make intercity travel comfortable, affordable, and safe — we operate modern Scania & Volvo AC double-deck coaches on key express routes connecting Dhaka, Chittagong, and Cox's Bazar.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#E31B23]/10 text-[#E31B23] flex items-center justify-center mb-4">
                  <RiShieldCheckFill size={26} className="text-[#E31B23]" />
                </div>
                <h2 className="text-xl font-black text-[#111111] mb-3">Our Mission</h2>
                <p className="text-sm leading-relaxed text-gray-600">
                  To provide the most reliable, comfortable, and affordable bus travel experience in Bangladesh. Every seat, every journey, every passenger matters to us. We combine modern fleet management with digital QR ticketing.
                </p>
              </div>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              {[
                { value: '50K+', label: 'Passengers Served', desc: 'Happy travellers who choose Ticket Dorkar' },
                { value: '6+', label: 'Express Routes', desc: 'Connecting Dhaka, Chittagong & Cox\'s Bazar' },
                { value: '10+', label: 'Luxury AC Coaches', desc: 'Modern Scania & Volvo AC coaches' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-xs">
                  <div className="text-3xl font-black text-[#E31B23] mb-1">{stat.value}</div>
                  <div className="font-bold text-[#111111] text-sm mb-1">{stat.label}</div>
                  <div className="text-gray-500 text-xs">{stat.desc}</div>
                </div>
              ))}
            </div>

            {/* Trust Checklist */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
              <h2 className="text-xl font-black text-[#111111] mb-4">Why Passengers Trust Us</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium text-gray-700">
                {[
                  'Professional, licensed drivers with safety training',
                  'GPS-tracked vehicles for real-time monitoring',
                  'Regular maintenance and safety inspections',
                  'Modern AC coaches with deluxe reclining seats',
                  'Online booking with instant QR ticket confirmation',
                  'Structured transparent cancellation & refund policy',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <RiCheckboxCircleFill size={18} className="text-[#E31B23] shrink-0" />
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
