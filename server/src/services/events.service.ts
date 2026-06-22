import { Event } from '../models/Event.model';
import { Session } from '../models/Session.model';
import type { SingleEventInput } from '../validators/event.validator';

/**
 * Upsert session summary when new events arrive.
 */
async function upsertSession(event: SingleEventInput): Promise<void> {
  const eventDate = new Date(event.timestamp);
  const isClick = event.event_type === 'click';

  await Session.findOneAndUpdate(
    { session_id: event.session_id },
    {
      $inc: {
        total_events: 1,
        total_clicks: isClick ? 1 : 0,
        total_page_views: isClick ? 0 : 1,
      },
      $min: { first_seen: eventDate },
      $max: { last_seen: eventDate },
      $set: {
        user_agent: event.user_agent ?? null,
      },
      $addToSet: { pages_visited: event.page_url },
    },
    { upsert: true, new: true }
  );
}

/**
 * Ingest a batch of events. Deduplicates via event_id unique index.
 * Returns counts of inserted vs duplicate events.
 */
export async function ingestEvents(events: SingleEventInput[]): Promise<{
  inserted: number;
  duplicates: number;
  errors: number;
}> {
  let inserted = 0;
  let duplicates = 0;
  let errors = 0;

  const sessionUpserts: Promise<void>[] = [];

  const docs = events.map((e) => ({
    event_id: e.event_id,
    session_id: e.session_id,
    event_type: e.event_type,
    page_url: e.page_url,
    timestamp: new Date(e.timestamp),
    x: e.x ?? null,
    y: e.y ?? null,
    viewport_width: e.viewport_width ?? null,
    viewport_height: e.viewport_height ?? null,
    user_agent: e.user_agent ?? null,
    metadata: e.metadata ?? {},
  }));

  // Use ordered: false to continue on duplicate key errors
  try {
    const result = await Event.insertMany(docs, { ordered: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inserted = (result as any).length ?? docs.length;
  } catch (err: unknown) {
    // BulkWriteError — some inserted, some dupes
    const bulkErr = err as {
      code?: number;
      result?: { nInserted?: number; writeErrors?: Array<{ code: number }> };
    };
    if (bulkErr.code === 11000 || bulkErr.result) {
      inserted = bulkErr.result?.nInserted ?? 0;
      const writeErrors = bulkErr.result?.writeErrors ?? [];
      for (const we of writeErrors) {
        if (we.code === 11000) duplicates++;
        else errors++;
      }
    } else {
      errors = docs.length;
    }
  }

  // Upsert sessions for successfully inserted events (best effort)
  for (const event of events) {
    sessionUpserts.push(upsertSession(event));
  }
  await Promise.allSettled(sessionUpserts);

  return { inserted, duplicates, errors };
}
