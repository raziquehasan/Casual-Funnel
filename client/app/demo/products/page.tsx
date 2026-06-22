'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Check, Zap, Building, Rocket } from 'lucide-react';

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

const products = [
  {
    id: 'starter',
    name: 'Analytics Starter',
    price: '$29/mo',
    icon: Zap,
    color: 'from-cyan-500 to-blue-600',
    features: ['10K events/month', 'Session recording', 'Basic heatmaps', '7-day retention'],
  },
  {
    id: 'pro',
    name: 'Analytics Pro',
    price: '$99/mo',
    icon: Rocket,
    color: 'from-violet-500 to-purple-600',
    featured: true,
    features: ['500K events/month', 'Unlimited sessions', 'Advanced heatmaps', '90-day retention', 'Team access'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    icon: Building,
    color: 'from-amber-500 to-orange-600',
    features: ['Unlimited everything', 'Custom dashboards', 'SLA guarantee', 'Dedicated support', 'SSO'],
  },
];

export default function DemoProductsPage() {
  useTracker();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600" />
          <span className="text-white font-bold">Acme Corp</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/demo" className="hover:text-white transition-colors">Home</Link>
          <Link href="/demo/products" className="text-white font-medium">Products</Link>
          <Link href="/demo/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/demo/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <Link href="/demo/pricing" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors font-medium">
          Get Started
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-black text-white mb-4">Our Products</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Choose the right plan for your analytics needs. All plans include our core tracking capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(({ id, name, price, icon: Icon, color, features, featured }) => (
            <div
              key={id}
              className={`relative rounded-2xl p-6 border transition-all hover:scale-105 cursor-default
                ${featured
                  ? 'bg-violet-600/20 border-violet-500/50 shadow-lg shadow-violet-500/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
            >
              {featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-white font-bold text-lg mb-1">{name}</h2>
              <p className="text-2xl font-black text-white mb-5">{price}</p>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                id={`product-cta-${id}`}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all
                  ${featured
                    ? 'bg-violet-600 hover:bg-violet-700 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
              >
                {price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Session Replay', 'Funnel Analysis', 'A/B Testing', 'Custom Events'].map((feature) => (
            <button
              key={feature}
              id={`feature-tag-${feature.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm hover:bg-white/10 hover:border-violet-500/30 transition-all font-medium"
            >
              {feature}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
