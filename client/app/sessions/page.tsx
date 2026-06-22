'use client';

import { useState } from 'react';
import SessionsTable from '@/components/sessions/SessionsTable';
import SessionDetail from '@/components/sessions/SessionDetail';
import type { SessionListItem } from '@/types';

export default function SessionsPage() {
  const [selectedSession, setSelectedSession] = useState<SessionListItem | null>(null);

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* Table */}
      <div className={`transition-all duration-300 ${selectedSession ? 'w-1/2' : 'w-full'}`}>
        <SessionsTable
          onSelect={setSelectedSession}
          selectedId={selectedSession?.session_id ?? null}
        />
      </div>

      {/* Detail Panel */}
      {selectedSession && (
        <div className="w-1/2 rounded-xl overflow-hidden border border-gray-800">
          <SessionDetail
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
          />
        </div>
      )}
    </div>
  );
}
