'use client';

import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { RefreshCw, Moon, Sun } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Analytics Overview', subtitle: 'Track your key metrics at a glance' },
  '/sessions': { title: 'User Sessions', subtitle: 'Browse and analyze user journeys' },
  '/heatmap': { title: 'Heatmap', subtitle: 'Visualize where users click' },
  '/demo': { title: 'Demo Site', subtitle: 'Test the tracking script live' },
};

export default function Header() {
  const pathname = usePathname();
  const qc = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const info = pageTitles[pathname] ?? { title: 'Analytics', subtitle: '' };

  const handleRefresh = async () => {
    setRefreshing(true);
    await qc.invalidateQueries();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <header className="h-16 cf-card border-b flex items-center justify-between px-6 sticky top-0 z-30 theme-transition">
      <div>
        <h1 className="cf-txt-1 font-semibold text-base">{info.title}</h1>
        <p className="cf-txt-2 text-xs">{info.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 cf-txt-2 hover:cf-txt-1 cf-hover rounded-lg cf-border border transition-all"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-xs cf-txt-2 hover:cf-txt-1 cf-hover rounded-lg cf-border border transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 cf-page rounded-lg cf-border border theme-transition">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="cf-txt-2 text-xs">Connected</span>
        </div>
      </div>
    </header>
  );
}
