import { Session } from '../models/Session.model';
import { Event } from '../models/Event.model';
import type { IEvent } from '../models/Event.model';

export interface SessionListItem {
  session_id: string;
  total_events: number;
  total_clicks: number;
  total_page_views: number;
  started_at: Date;
  last_activity: Date;
  user_agent: string | null;
  pages_visited: string[];
}

export interface SessionDetail {
  session_id: string;
  summary: SessionListItem;
  events: IEvent[];
}

/**
 * Paginated session list from the sessions summary collection.
 */
export async function getSessions(options: {
  page: number;
  limit: number;
  search?: string;
  sortBy?: 'last_seen' | 'total_events';
  sortOrder?: 'asc' | 'desc';
}): Promise<{ data: SessionListItem[]; total: number; page: number; limit: number }> {
  const { page, limit, search, sortBy = 'last_seen', sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};
  if (search) {
    query.session_id = { $regex: search, $options: 'i' };
  }

  const sortDir = sortOrder === 'asc' ? 1 : -1;
  const sortField = sortBy === 'total_events' ? 'total_events' : 'last_seen';

  const [sessions, total] = await Promise.all([
    Session.find(query)
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit)
      .lean(),
    Session.countDocuments(query),
  ]);

  const data: SessionListItem[] = sessions.map((s) => ({
    session_id: s.session_id,
    total_events: s.total_events,
    total_clicks: s.total_clicks,
    total_page_views: s.total_page_views,
    started_at: s.first_seen,
    last_activity: s.last_seen,
    user_agent: s.user_agent,
    pages_visited: s.pages_visited,
  }));

  return { data, total, page, limit };
}

/**
 * Full session detail: summary + all events ordered by timestamp.
 */
export async function getSessionDetail(sessionId: string): Promise<SessionDetail | null> {
  const [summary, events] = await Promise.all([
    Session.findOne({ session_id: sessionId }).lean(),
    Event.find({ session_id: sessionId }).sort({ timestamp: 1 }).lean(),
  ]);

  if (!summary) return null;

  return {
    session_id: sessionId,
    summary: {
      session_id: summary.session_id,
      total_events: summary.total_events,
      total_clicks: summary.total_clicks,
      total_page_views: summary.total_page_views,
      started_at: summary.first_seen,
      last_activity: summary.last_seen,
      user_agent: summary.user_agent,
      pages_visited: summary.pages_visited,
    },
    events: events as unknown as IEvent[],
  };
}
