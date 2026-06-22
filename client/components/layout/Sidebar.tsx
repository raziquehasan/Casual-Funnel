'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  Flame,
  Activity,
  Zap,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: BarChart3 },
  { href: '/sessions', label: 'Sessions', icon: Users },
  { href: '/heatmap', label: 'Heatmap', icon: Flame },
  { href: '/demo', label: 'Demo Site', icon: Zap },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 cf-page border-r cf-border flex flex-col z-40 theme-transition">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b cf-border theme-transition">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="cf-txt-1 font-bold text-sm leading-tight">CausalFunnel</p>
          <p className="cf-txt-2 text-xs">Analytics Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="cf-txt-3 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
          Dashboard
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-violet-600/20 text-violet-500 border border-violet-500/30'
                  : 'cf-txt-2 hover:cf-txt-1 cf-hover border border-transparent'
                }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${isActive ? 'text-violet-500' : 'cf-txt-3 group-hover:cf-txt-2'}`}
              />
              {label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t cf-border theme-transition">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="cf-txt-2 text-xs">Live tracking active</span>
        </div>
        <p className="cf-txt-3 text-xs mt-1">v1.0.0</p>
      </div>
    </aside>
  );
}
