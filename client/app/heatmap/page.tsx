'use client';

import { useState } from 'react';
import { useHeatmap, usePages } from '@/hooks/useHeatmap';
import HeatmapCanvas from '@/components/heatmap/HeatmapCanvas';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { SkeletonChart } from '@/components/ui/Skeletons';
import { Flame, ChevronDown } from 'lucide-react';

export default function HeatmapPage() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const { data: pagesData, isLoading: pagesLoading } = usePages();
  const { data: heatmapData, isLoading: heatLoading, isError, error, refetch } = useHeatmap(selectedPage);

  const pages = pagesData?.pages ?? [];

  return (
    <div className="space-y-5">
      {/* Page Selector */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h2 className="text-white font-semibold">Select a Page</h2>
            <p className="text-gray-500 text-xs mt-0.5">Choose a tracked URL to visualize click data</p>
          </div>
          <div className="relative">
            <select
              value={selectedPage ?? ''}
              onChange={(e) => setSelectedPage(e.target.value || null)}
              disabled={pagesLoading}
              className="appearance-none bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-violet-500 transition-colors min-w-[280px] disabled:opacity-50 cursor-pointer"
            >
              <option value="">
                {pagesLoading ? 'Loading pages…' : pages.length === 0 ? 'No pages tracked yet' : '— Select a page —'}
              </option>
              {pages.map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {selectedPage && heatmapData && (
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
              <Flame className="w-4 h-4 text-red-400" />
              <span>
                <strong className="text-white">{heatmapData.clicks.length.toLocaleString()}</strong> clicks on{' '}
                <code className="text-violet-400">{selectedPage}</code>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Canvas */}
      {!selectedPage ? (
        <EmptyState
          title="No page selected"
          description="Select a page from the dropdown above to visualize click heatmap data."
          icon={<Flame className="w-7 h-7 text-red-400" />}
        />
      ) : heatLoading ? (
        <SkeletonChart />
      ) : isError ? (
        <ErrorState message={error?.message ?? 'Failed to load heatmap'} onRetry={() => refetch()} />
      ) : heatmapData && heatmapData.clicks.length === 0 ? (
        <EmptyState
          title="No clicks recorded"
          description={`No click events found for "${selectedPage}". Visit the demo site and click around to generate data.`}
          icon={<Flame className="w-7 h-7 text-gray-600" />}
        />
      ) : (
        <HeatmapCanvas clicks={heatmapData?.clicks ?? []} />
      )}
    </div>
  );
}
