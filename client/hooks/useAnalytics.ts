'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOverview } from '@/services/api';
import type { OverviewStats } from '@/types';

export function useAnalytics() {
  return useQuery<{ success: boolean; data: OverviewStats }, Error>({
    queryKey: ['analytics', 'overview'],
    queryFn: fetchOverview,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
