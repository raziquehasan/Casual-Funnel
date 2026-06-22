// Shared TypeScript types across the client

export interface Event {
  _id: string;
  event_id: string;
  session_id: string;
  event_type: 'page_view' | 'click';
  page_url: string;
  timestamp: string;
  createdAt: string;
  x: number | null;
  y: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
}

export interface SessionListItem {
  session_id: string;
  total_events: number;
  total_clicks: number;
  total_page_views: number;
  started_at: string;
  last_activity: string;
  user_agent: string | null;
  pages_visited: string[];
}

export interface SessionDetail {
  session_id: string;
  summary: SessionListItem;
  events: Event[];
}

export interface SessionsResponse {
  success: boolean;
  data: SessionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OverviewStats {
  totalSessions: number;
  totalEvents: number;
  totalClicks: number;
  totalPageViews: number;
  eventsPerDay: Array<{ date: string; count: number; clicks: number; page_views: number }>;
  eventDistribution: Array<{ type: string; count: number }>;
  topPages: Array<{ page: string; views: number }>;
}

export interface HeatmapClick {
  x: number;
  y: number;
  nx: number;
  ny: number;
}

export interface HeatmapResponse {
  page_url: string;
  clicks: HeatmapClick[];
}

export interface PagesResponse {
  success: boolean;
  pages: string[];
}
