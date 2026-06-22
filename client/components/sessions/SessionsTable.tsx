'use client';

import { useState } from 'react';
import { useSessions } from '@/hooks/useSessions';
import { SkeletonRow } from '@/components/ui/Skeletons';
import { ErrorState, EmptyState } from '@/components/ui/States';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Users, Download } from 'lucide-react';
import type { SessionListItem } from '@/types';

interface SessionsTableProps {
  onSelect: (session: SessionListItem) => void;
  selectedId: string | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export default function SessionsTable({ onSelect, selectedId }: SessionsTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<'last_seen' | 'total_events'>('last_seen');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, isError, error, refetch } = useSessions({
    page,
    limit: 20,
    search,
    sortBy,
    sortOrder,
  });

  const handleSort = (field: 'last_seen' | 'total_events') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleExportCSV = () => {
    if (!data?.data || data.data.length === 0) return;
    
    const headers = ['Session ID', 'Total Events', 'Page Views', 'Clicks', 'Started At', 'Last Activity', 'User Agent'];
    const rows = data.data.map(s => [
      s.session_id,
      s.total_events,
      s.total_page_views,
      s.total_clicks,
      new Date(s.started_at).toISOString(),
      new Date(s.last_activity).toISOString(),
      `"${s.user_agent || ''}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sessions_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return <ChevronUp className="w-3 h-3 cf-txt-3" />;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-violet-400" />
    ) : (
      <ChevronDown className="w-3 h-3 text-violet-400" />
    );
  };

  return (
    <div className="cf-card rounded-xl border cf-border flex flex-col h-full theme-transition">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b cf-border theme-transition">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 cf-txt-3" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search session ID..."
              className="w-full pl-9 pr-4 py-2 cf-page border cf-border rounded-lg text-sm cf-txt-1 placeholder:cf-txt-3 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors font-medium"
          >
            Search
          </button>
        </form>
        {data && (
          <div className="flex items-center gap-4">
            <span className="cf-txt-3 text-xs whitespace-nowrap">
              {data.total.toLocaleString()} sessions
            </span>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors"
              title="Export Current Page to CSV"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b cf-border theme-transition">
              <th className="text-left px-5 py-3 cf-txt-3 font-medium text-xs uppercase tracking-wider">
                Session ID
              </th>
              <th
                className="text-left px-4 py-3 cf-txt-3 font-medium text-xs uppercase tracking-wider cursor-pointer hover:cf-txt-2 select-none"
                onClick={() => handleSort('total_events')}
              >
                <div className="flex items-center gap-1">
                  Events {renderSortIcon('total_events')}
                </div>
              </th>
              <th className="text-left px-4 py-3 cf-txt-3 font-medium text-xs uppercase tracking-wider">
                Pages / Clicks
              </th>
              <th className="text-left px-4 py-3 cf-txt-3 font-medium text-xs uppercase tracking-wider">
                Started
              </th>
              <th
                className="text-left px-4 py-3 cf-txt-3 font-medium text-xs uppercase tracking-wider cursor-pointer hover:cf-txt-2 select-none"
                onClick={() => handleSort('last_seen')}
              >
                <div className="flex items-center gap-1">
                  Last Activity {renderSortIcon('last_seen')}
                </div>
              </th>
              <th className="text-left px-4 py-3 cf-txt-3 font-medium text-xs uppercase tracking-wider">
                Duration
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
            {isError && (
              <tr>
                <td colSpan={6}>
                  <ErrorState message={error?.message ?? 'Failed to load sessions'} onRetry={() => refetch()} />
                </td>
              </tr>
            )}
            {!isLoading && !isError && data?.data.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No sessions yet"
                    description="Add the tracker script to your website to start collecting data."
                    icon={<Users className="w-7 h-7 text-gray-600" />}
                  />
                </td>
              </tr>
            )}
            {data?.data.map((session) => (
              <tr
                key={session.session_id}
                onClick={() => onSelect(session)}
                className={`border-b cf-border cursor-pointer transition-colors
                  ${selectedId === session.session_id
                    ? 'bg-violet-500/10 border-l-2 border-l-violet-500'
                    : 'cf-hover'
                  }`}
              >
                <td className="px-5 py-3">
                  <code className="text-violet-400 text-xs font-mono bg-violet-500/10 px-2 py-0.5 rounded">
                    {session.session_id.slice(0, 20)}…
                  </code>
                </td>
                <td className="px-4 py-3">
                  <span className="cf-txt-1 font-semibold">{session.total_events}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <span className="text-emerald-400 text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {session.total_page_views}pv
                    </span>
                    <span className="text-cyan-400 text-xs bg-cyan-500/10 px-1.5 py-0.5 rounded">
                      {session.total_clicks}c
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 cf-txt-2 text-xs">
                  {formatDate(session.started_at)}
                </td>
                <td className="px-4 py-3 cf-txt-2 text-xs">
                  {formatDate(session.last_activity)}
                </td>
                <td className="px-4 py-3 cf-txt-3 text-xs">
                  {formatDuration(session.started_at, session.last_activity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t cf-border theme-transition">
          <span className="cf-txt-3 text-xs">
            Page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg cf-txt-3 hover:cf-txt-1 cf-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="p-1.5 rounded-lg cf-txt-3 hover:cf-txt-1 cf-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
