'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

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

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: '$0', annual: '$0' },
    features: { Events: '1K/mo', Sessions: '100', Heatmaps: false, Exports: false, Support: 'Community' },
  },
  {
    id: 'starter',
    name: 'Starter',
    price: { monthly: '$29', annual: '$23' },
    features: { Events: '10K/mo', Sessions: '1,000', Heatmaps: true, Exports: false, Support: 'Email' },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: '$99', annual: '$79' },
    popular: true,
    features: { Events: '500K/mo', Sessions: 'Unlimited', Heatmaps: true, Exports: true, Support: 'Priority' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 'Custom', annual: 'Custom' },
    features: { Events: 'Unlimited', Sessions: 'Unlimited', Heatmaps: true, Exports: true, Support: 'Dedicated SLA' },
  },
];

const featureKeys = ['Events', 'Sessions', 'Heatmaps', 'Exports', 'Support'] as const;

export default function DemoPricingPage() {
  useTracker();
  const [annual, setAnnual] = useState(false);

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
          <Link href="/demo/pricing" className="text-white font-medium">Pricing</Link>
          <Link href="/demo/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <Link href="/demo/contact" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors font-medium">
          Contact Sales
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-gray-400 text-lg mb-8">No hidden fees. Cancel anytime.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-white/10 rounded-xl p-1">
            <button
              id="billing-monthly"
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!annual ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              id="billing-annual"
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${annual ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'}`}
            >
              Annual
              <span className="ml-2 text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">−20%</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-5 border transition-all
                ${plan.popular ? 'bg-violet-600/20 border-violet-500/50' : 'bg-white/5 border-white/10'}`}
            >
              {plan.popular && (
                <span className="inline-block bg-violet-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                  Popular
                </span>
              )}
              <h2 className="text-white font-bold mb-1">{plan.name}</h2>
              <p className="text-2xl font-black text-white mb-4">
                {annual ? plan.price.annual : plan.price.monthly}
                {plan.price.monthly !== 'Custom' && <span className="text-sm font-normal text-gray-400">/mo</span>}
              </p>
              <button
                id={`pricing-cta-${plan.id}`}
                className={`w-full py-2 rounded-xl text-sm font-semibold transition-all
                  ${plan.popular ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
              >
                {plan.name === 'Enterprise' ? 'Contact Us' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Feature</th>
                {plans.map((p) => (
                  <th key={p.id} className={`px-4 py-3 text-center font-semibold ${p.popular ? 'text-violet-400' : 'text-gray-300'}`}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureKeys.map((key) => (
                <tr key={key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-gray-300 font-medium">{key}</td>
                  {plans.map((p) => {
                    const val = p.features[key];
                    return (
                      <td key={p.id} className="px-4 py-3 text-center">
                        {typeof val === 'boolean' ? (
                          val ? (
                            <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-gray-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-300">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
