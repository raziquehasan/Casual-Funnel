'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import StatCard from '@/components/ui/StatCard';
import { SkeletonCard, SkeletonChart } from '@/components/ui/Skeletons';
import { ErrorState } from '@/components/ui/States';
import EventsPerDayChart from '@/components/dashboard/EventsPerDayChart';
import EventDistributionChart from '@/components/dashboard/EventDistributionChart';
import TopPagesChart from '@/components/dashboard/TopPagesChart';
import { Activity, MousePointer, Globe, Users } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useAnalytics();
  const stats = data?.data;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : isError ? (
          <div className="col-span-4">
            <ErrorState
              message={error?.message ?? 'Failed to load analytics'}
              onRetry={() => refetch()}
            />
          </div>
        ) : (
          <>
            <StatCard
              title="Total Sessions"
              value={stats?.totalSessions ?? 0}
              icon={Users}
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            />
            <StatCard
              title="Total Events"
              value={stats?.totalEvents ?? 0}
              icon={Activity}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Total Clicks"
              value={stats?.totalClicks ?? 0}
              icon={MousePointer}
              gradient="bg-gradient-to-br from-cyan-500 to-teal-600"
            />
            <StatCard
              title="Total Page Views"
              value={stats?.totalPageViews ?? 0}
              icon={Globe}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
            />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          {isLoading ? (
            <SkeletonChart />
          ) : (
            <EventsPerDayChart data={stats?.eventsPerDay ?? []} />
          )}
        </div>
        <div>
          {isLoading ? (
            <SkeletonChart />
          ) : (
            <EventDistributionChart data={stats?.eventDistribution ?? []} />
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div>
        {isLoading ? (
          <SkeletonChart />
        ) : (
          <TopPagesChart data={stats?.topPages ?? []} />
        )}
      </div>
    </div>
  );
}
