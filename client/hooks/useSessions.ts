'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSessions, fetchSessionDetail } from '@/services/api';

export function useSessions(params: {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: string;
}) {
  return useQuery({
    queryKey: ['sessions', params],
    queryFn: () => fetchSessions(params),
    staleTime: 15_000,
  });
}

export function useSessionDetail(sessionId: string | null) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => fetchSessionDetail(sessionId!),
    enabled: !!sessionId,
    staleTime: 30_000,
  });
}
