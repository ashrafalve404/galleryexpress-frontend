'use client';

import { toast } from 'sonner';

export function ContactForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you! Your message has been sent successfully. We will reply within 24 hours.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="font-bold text-[#111111] mb-5">Send a Message</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {[
          { label: 'Your Name', type: 'text', placeholder: 'Full name' },
          { label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
          { label: 'Phone Number', type: 'tel', placeholder: '01XXXXXXXXX' },
        ].map(({ label, type, placeholder }) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              required={type !== 'tel'}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23]"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Message</label>
          <textarea
            rows={4}
            required
            placeholder="How can we help?"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 focus:border-[#E31B23] resize-none"
          />
        </div>
        <button type="submit" className="w-full bg-[#E31B23] hover:bg-[#C41920] text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-sm">
          Send Message
        </button>
      </form>
    </div>
  );
}
