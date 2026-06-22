'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';

function useTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as Window & { CF_TRACKER_URL?: string }).CF_TRACKER_URL =
      process.env.NEXT_PUBLIC_API_URL + '/api/events';
    if (document.getElementById('cf-tracker')) return;
    const script = document.createElement('script');
    script.id = 'cf-tracker';
    script.src = '/tracker.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);
}

export default function DemoContactPage() {
  useTracker();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600" />
          <span className="text-white font-bold">Acme Corp</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/demo" className="hover:text-white transition-colors">Home</Link>
          <Link href="/demo/products" className="hover:text-white transition-colors">Products</Link>
          <Link href="/demo/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/demo/contact" className="text-white font-medium">Contact</Link>
        </div>
        <Link href="/demo/pricing" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors font-medium">
          Get Started
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-black text-white mb-4">Get In Touch</h1>
          <p className="text-gray-400 text-lg">We&apos;d love to hear from you. Our team responds within 24 hours.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="md:col-span-2 space-y-5">
            {[
              { icon: Mail, label: 'Email', value: 'hello@acmecorp.io' },
              { icon: Phone, label: 'Phone', value: '+1 (800) 123-4567' },
              { icon: MapPin, label: 'Office', value: '123 Main St, San Francisco, CA' },
              { icon: MessageSquare, label: 'Live Chat', value: 'Available 9–6 PST' },
            ].map(({ icon: Icon, label, value }) => (
              <button
                key={label}
                id={`contact-${label.toLowerCase()}`}
                className="w-full flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-violet-500/30 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">{label}</p>
                  <p className="text-white text-sm font-medium">{value}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Contact form */}
          <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <Send className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Message Sent!</h3>
                <p className="text-gray-400 text-sm">Thanks! We&apos;ll get back to you within 24 hours.</p>
                <button
                  id="contact-send-another"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-violet-400 text-sm hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs block mb-1.5">First Name</label>
                    <input
                      id="contact-first-name"
                      type="text"
                      required
                      placeholder="John"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1.5">Last Name</label>
                    <input
                      id="contact-last-name"
                      type="text"
                      required
                      placeholder="Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1.5">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="john@company.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1.5">Company</label>
                  <input
                    id="contact-company"
                    type="text"
                    placeholder="Acme Corp"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1.5">Message</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="Tell us about your needs..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>
                <button
                  id="contact-submit"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-all hover:scale-[1.02]"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
