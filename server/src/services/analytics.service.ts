import { Event } from '../models/Event.model';
import { Session } from '../models/Session.model';

interface OverviewStats {
  totalSessions: number;
  totalEvents: number;
  totalClicks: number;
  totalPageViews: number;
  eventsPerDay: Array<{ date: string; count: number; clicks: number; page_views: number }>;
  eventDistribution: Array<{ type: string; count: number }>;
  topPages: Array<{ page: string; views: number }>;
}

/**
 * All dashboard stats in one aggregation pass.
 */
export async function getOverviewStats(): Promise<OverviewStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [sessionStats, eventsPerDay, eventDistribution, topPages] = await Promise.all([
    // Total sessions, clicks, page_views from sessions collection
    Session.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalClicks: { $sum: '$total_clicks' },
          totalPageViews: { $sum: '$total_page_views' },
          totalEvents: { $sum: '$total_events' },
        },
      },
    ]),

    // Events per day (last 30 days)
    Event.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            event_type: '$event_type',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          total: { $sum: '$count' },
          clicks: {
            $sum: { $cond: [{ $eq: ['$_id.event_type', 'click'] }, '$count', 0] },
          },
          page_views: {
            $sum: { $cond: [{ $eq: ['$_id.event_type', 'page_view'] }, '$count', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: '$total',
          clicks: 1,
          page_views: 1,
        },
      },
    ]),

    // Event type distribution
    Event.aggregate([
      { $group: { _id: '$event_type', count: { $sum: 1 } } },
      { $project: { _id: 0, type: '$_id', count: 1 } },
    ]),

    // Top 10 pages by page_view count
    Event.aggregate([
      { $match: { event_type: 'page_view' } },
      { $group: { _id: '$page_url', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, page: '$_id', views: 1 } },
    ]),
  ]);

  const stats = sessionStats[0] ?? {
    totalSessions: 0,
    totalClicks: 0,
    totalPageViews: 0,
    totalEvents: 0,
  };

  return {
    totalSessions: stats.totalSessions,
    totalEvents: stats.totalEvents,
    totalClicks: stats.totalClicks,
    totalPageViews: stats.totalPageViews,
    eventsPerDay,
    eventDistribution,
    topPages,
  };
}

/**
 * Heatmap: click coordinates for a specific page, normalized by viewport.
 */
export async function getHeatmapData(pageUrl: string): Promise<{
  page_url: string;
  clicks: Array<{ x: number; y: number; nx: number; ny: number }>;
}> {
  const clicks = await Event.find(
    { page_url: pageUrl, event_type: 'click', x: { $ne: null }, y: { $ne: null } },
    { x: 1, y: 1, viewport_width: 1, viewport_height: 1, _id: 0 }
  )
    .limit(5000)
    .lean();

  const normalized = clicks.map((c) => ({
    x: c.x as number,
    y: c.y as number,
    nx: c.viewport_width ? (c.x as number) / c.viewport_width : 0.5,
    ny: c.viewport_height ? (c.y as number) / c.viewport_height : 0.5,
  }));

  return { page_url: pageUrl, clicks: normalized };
}

/**
 * All unique tracked pages.
 */
export async function getUniquePages(): Promise<string[]> {
  const pages = await Event.distinct('page_url');
  return pages.sort();
}
