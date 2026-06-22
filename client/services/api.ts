import type {
  SessionsResponse,
  SessionDetail,
  OverviewStats,
  HeatmapResponse,
  PagesResponse,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Analytics ──────────────────────────────────────────────────────────────
export async function fetchOverview(): Promise<{ success: boolean; data: OverviewStats }> {
  return apiFetch('/api/analytics/overview');
}

// ── Sessions ───────────────────────────────────────────────────────────────
export async function fetchSessions(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<SessionsResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.sortBy) qs.set('sortBy', params.sortBy);
  if (params.sortOrder) qs.set('sortOrder', params.sortOrder);
  return apiFetch(`/api/sessions?${qs.toString()}`);
}

export async function fetchSessionDetail(sessionId: string): Promise<{ success: boolean } & SessionDetail> {
  return apiFetch(`/api/sessions/${sessionId}`);
}

// ── Heatmap ────────────────────────────────────────────────────────────────
export async function fetchHeatmap(pageUrl: string): Promise<{ success: boolean } & HeatmapResponse> {
  return apiFetch(`/api/heatmap?page=${encodeURIComponent(pageUrl)}`);
}

export async function fetchPages(): Promise<PagesResponse> {
  return apiFetch('/api/pages');
}
