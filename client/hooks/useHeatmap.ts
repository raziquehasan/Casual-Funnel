'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchHeatmap, fetchPages } from '@/services/api';

export function useHeatmap(pageUrl: string | null) {
  return useQuery({
    queryKey: ['heatmap', pageUrl],
    queryFn: () => fetchHeatmap(pageUrl!),
    enabled: !!pageUrl,
    staleTime: 30_000,
  });
}

export function usePages() {
  return useQuery({
    queryKey: ['pages'],
    queryFn: fetchPages,
    staleTime: 60_000,
  });
}
