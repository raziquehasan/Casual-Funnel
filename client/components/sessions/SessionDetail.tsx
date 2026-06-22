'use client';

import { useState } from 'react';
import { useSessionDetail } from '@/hooks/useSessions';
import { X, Globe, MousePointer, Clock, Monitor, Copy, Check } from 'lucide-react';
import type { SessionListItem, Event } from '@/types';

interface SessionDetailProps {
  session: SessionListItem;
  onClose: () => void;
}

function EventBadge({ type }: { type: string }) {
  if (type === 'page_view') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/15 border border-emerald-500/25 rounded-full">
        <Globe className="w-3 h-3 text-emerald-400" />
        <span className="text-emerald-400 text-xs font-medium">page_view</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500/15 border border-cyan-500/25 rounded-full">
      <MousePointer className="w-3 h-3 text-cyan-400" />
      <span className="text-cyan-400 text-xs font-medium">click</span>
    </div>
  );
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatRelativeTime(dateStr: string, baseStr: string) {
  const ms = new Date(dateStr).getTime() - new Date(baseStr).getTime();
  if (ms < 0) return '+0s';
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  if (mins > 0) return `+${mins}m${secs % 60}s`;
  return `+${secs}s`;
}

function TimelineItem({ event, baseTime }: { event: Event; baseTime: string }) {
  const isPageView = event.event_type === 'page_view';

  return (
    <div className="flex gap-3 group">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ring-2 ring-offset-2 ring-offset-[var(--bg-page)]
          ${isPageView ? 'bg-emerald-400 ring-emerald-500/40' : 'bg-cyan-400 ring-cyan-500/40'}`}
        />
        <div className="w-px flex-1 cf-border border-l mt-1 min-h-[20px]" />
      </div>

      {/* Content */}
      <div className="pb-4 flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <EventBadge type={event.event_type} />
          <span className="cf-txt-2 text-xs mt-1">
            {formatTime(event.timestamp)}
          </span>
          <span className="cf-txt-3 text-xs mt-1 font-mono">
            {formatRelativeTime(event.timestamp, baseTime)}
          </span>
        </div>

        {event.event_type === 'page_view' && (
          <p className="cf-txt-2 text-xs mt-1.5 truncate font-mono bg-gray-800/10 dark:bg-gray-800/50 px-2 py-1 rounded">
            {event.page_url}
          </p>
        )}

        {event.event_type === 'click' && event.x !== null && event.y !== null && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="cf-txt-3 text-xs font-mono bg-gray-800/10 dark:bg-gray-800/50 px-2 py-1 rounded">
              ({event.x}, {event.y})
            </span>
            {event.viewport_width && event.viewport_height && (
              <span className="cf-txt-3 text-xs">
                on {event.viewport_width}×{event.viewport_height}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionDetail({ session, onClose }: SessionDetailProps) {
  const { data, isLoading } = useSessionDetail(session.session_id);
  const [filter, setFilter] = useState<'all' | 'page_view' | 'click'>('all');
  const [copied, setCopied] = useState(false);

  const startTime = session.started_at;

  const handleCopy = () => {
    navigator.clipboard.writeText(session.session_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredEvents = data?.events?.filter(e => filter === 'all' || e.event_type === filter) || [];

  return (
    <div className="flex flex-col h-full cf-card border-l cf-border theme-transition">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b cf-border theme-transition">
        <div>
          <h3 className="cf-txt-1 font-semibold text-sm mb-1">Session Detail</h3>
          <div className="flex items-center gap-2">
            <code className="text-violet-400 text-xs font-mono bg-violet-500/10 px-2 py-0.5 rounded">
              {session.session_id.slice(0, 24)}…
            </code>
            <button
              onClick={handleCopy}
              className="p-1 rounded text-violet-400 hover:bg-violet-500/20 transition-colors"
              title="Copy full Session ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg cf-txt-3 hover:cf-txt-1 cf-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 px-5 py-4 border-b cf-border theme-transition">
        <div className="text-center">
          <p className="cf-txt-1 font-bold text-lg">{session.total_events}</p>
          <p className="cf-txt-3 text-xs">Events</p>
        </div>
        <div className="text-center">
          <p className="text-emerald-400 font-bold text-lg">{session.total_page_views}</p>
          <p className="cf-txt-3 text-xs">Page Views</p>
        </div>
        <div className="text-center">
          <p className="text-cyan-400 font-bold text-lg">{session.total_clicks}</p>
          <p className="cf-txt-3 text-xs">Clicks</p>
        </div>
      </div>

      {/* Meta */}
      <div className="px-5 py-3 border-b cf-border theme-transition space-y-2">
        <div className="flex items-center gap-2 text-xs cf-txt-2">
          <Clock className="w-3 h-3" />
          <span>
            {new Date(session.started_at).toLocaleString()} →{' '}
            {new Date(session.last_activity).toLocaleString()}
          </span>
        </div>
        {session.user_agent && (
          <div className="flex items-start gap-2 text-xs cf-txt-2">
            <Monitor className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="truncate">{session.user_agent}</span>
          </div>
        )}
      </div>

      {/* Timeline Controls */}
      <div className="px-5 py-3 border-b cf-border flex items-center justify-between theme-transition">
        <h4 className="cf-txt-3 text-xs font-semibold uppercase tracking-wider">
          Journey Timeline
        </h4>
        <div className="flex items-center gap-1 bg-gray-800/10 dark:bg-gray-800/50 p-1 rounded-lg">
          {(['all', 'page_view', 'click'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-md transition-all
                ${filter === f 
                  ? 'bg-violet-600 text-white shadow-sm' 
                  : 'cf-txt-3 hover:cf-txt-1'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-800 mt-1 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredEvents.length > 0 && (
          <div>
            {filteredEvents.map((event) => (
              <TimelineItem key={event.event_id ?? event._id} event={event} baseTime={startTime} />
            ))}
          </div>
        )}

        {!isLoading && filteredEvents.length === 0 && (
          <p className="cf-txt-3 text-sm text-center py-8">
            {data?.events?.length ? 'No events match filter' : 'No events recorded'}
          </p>
        )}
      </div>
    </div>
  );
}
