'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowRight, Star, Zap, Shield, BarChart3 } from 'lucide-react';

// Inject tracker for demo purposes
function useTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Dynamically set tracker URL to backend
    (window as Window & { CF_TRACKER_URL?: string }).CF_TRACKER_URL =
      process.env.NEXT_PUBLIC_API_URL + '/api/events';

    // Load tracker script if not already loaded
    if (document.getElementById('cf-tracker')) return;
    const script = document.createElement('script');
    script.id = 'cf-tracker';
    script.src = '/tracker.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);
}

const features = [
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track every user interaction as it happens.' },
  { icon: Zap, title: 'Instant Setup', desc: 'One script tag — zero configuration required.' },
  { icon: Shield, title: 'Privacy First', desc: 'No cookies, no PII, GDPR compliant by design.' },
  { icon: Star, title: 'Heatmaps', desc: 'See exactly where users click on every page.' },
];

export default function DemoHomePage() {
  useTracker();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600" />
          <span className="text-white font-bold">Acme Corp</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/demo" className="text-white font-medium">Home</Link>
          <Link href="/demo/products" className="hover:text-white transition-colors">Products</Link>
          <Link href="/demo/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/demo/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <Link
          href="/demo/pricing"
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors font-medium"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-8 py-28">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/15 border border-violet-500/25 rounded-full text-violet-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          Analytics demo site — all clicks are tracked
        </div>
        <h1 className="text-5xl font-black text-white leading-tight mb-6">
          Build Better Products<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            With Real User Insights
          </span>
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
          Understand how users interact with your product. Track sessions, visualize clicks,
          and make data-driven decisions.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/demo/products"
            id="hero-cta-primary"
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-violet-500/25"
          >
            View Products <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            id="hero-cta-dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-all"
          >
            Open Dashboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 pb-28">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Why teams choose us</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <button
              key={title}
              id={`feature-${title.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-left bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-violet-500/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center mb-3 group-hover:bg-violet-500/30 transition-colors">
                <Icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-t border-white/10 py-12">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center px-8">
          {[
            { value: '10M+', label: 'Events tracked daily' },
            { value: '50K+', label: 'Active sessions' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                {value}
              </p>
              <p className="text-gray-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
