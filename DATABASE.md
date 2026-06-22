# Database Design

MongoDB database: `casualfunnel`

---

## Collections Overview

| Collection | Purpose | Primary Access Pattern |
|------------|---------|------------------------|
| `events` | Raw event log | By session, by page, by time |
| `sessions` | Aggregated session summary | Fast paginated listing |

---

## `events` Collection

### Schema

```js
{
  _id: ObjectId,                    // Auto-generated MongoDB ID

  // ── Deduplication ──────────────────────────────────────────
  event_id: String,                 // "evt_<UUID>" — client-generated, UNIQUE
                                    // Prevents duplicate events on retry

  // ── Core Fields ────────────────────────────────────────────
  session_id: String,               // "sess_<UUID>" — ties events to a user session
  event_type: String,               // Enum: "page_view" | "click"
  page_url: String,                 // Full URL where event occurred
  timestamp: Date,                  // Client-reported event time (ISO 8601)
  createdAt: Date,                  // Server-set insertion time (auto via timestamps:true)
  updatedAt: Date,                  // Auto-managed by Mongoose

  // ── Click Fields (null for page_view) ──────────────────────
  x: Number | null,                 // Raw click X coordinate in pixels
  y: Number | null,                 // Raw click Y coordinate in pixels
  viewport_width: Number | null,    // Browser viewport width at click time
  viewport_height: Number | null,   // Browser viewport height at click time

  // ── Page View Fields (null for click) ──────────────────────
  user_agent: String | null,        // Navigator.userAgent string

  // ── Extensibility ──────────────────────────────────────────
  metadata: Mixed                   // { target_tag, target_id, target_text, ... }
}
```

### Indexes

```js
// Deduplication — prevents duplicate event_id insertion
{ event_id: 1 }  →  unique: true

// Session journey — fetch all events for a session, ordered by time
{ session_id: 1, timestamp: 1 }

// Heatmap — fetch all click events for a specific page
{ page_url: 1, event_type: 1 }

// Time-series analytics — sort events by client time
{ timestamp: -1 }

// Server-side analytics — sort by insertion time (reliable, server-controlled)
{ createdAt: -1 }

// Event type filtering
{ event_type: 1 }
```

### Why Two Timestamps?

| Field | Source | Use Case |
|-------|--------|----------|
| `timestamp` | Client (tracker.js) | User journey ordering — represents when user actually acted |
| `createdAt` | Server (Mongoose auto) | Analytics over time — immune to client clock drift |

---

## `sessions` Collection

### Schema

```js
{
  _id: ObjectId,

  session_id: String,           // UNIQUE — matches events.session_id
  total_events: Number,         // Running count of all events
  total_clicks: Number,         // Running count of click events
  total_page_views: Number,     // Running count of page_view events
  first_seen: Date,             // Earliest event timestamp for this session
  last_seen: Date,              // Latest event timestamp for this session
  user_agent: String | null,    // From the most recent event
  pages_visited: [String],      // Deduplicated array of visited page URLs

  createdAt: Date,              // Auto
  updatedAt: Date               // Auto
}
```

### Indexes

```js
// Primary lookup — find session by ID
{ session_id: 1 }  →  unique: true

// Default sort — newest activity first
{ last_seen: -1 }

// Sort by most active sessions
{ total_events: -1 }
```

### Update Strategy

Sessions are maintained via `findOneAndUpdate` with `upsert: true` on every event ingestion:

```js
// Called for every successfully inserted event
Session.findOneAndUpdate(
  { session_id },
  {
    $inc: { total_events: 1, total_clicks: isClick ? 1 : 0, total_page_views: !isClick ? 1 : 0 },
    $min: { first_seen: eventDate },   // Only set if earlier than existing
    $max: { last_seen: eventDate },    // Only set if later than existing
    $set: { user_agent },
    $addToSet: { pages_visited: page_url },  // No duplicates
  },
  { upsert: true }
)
```

**Why a separate sessions collection?**

Without it, `GET /api/sessions` requires a MongoDB aggregation over the entire `events` collection — expensive as data grows. The sessions collection acts as a materialized view, making session listing O(1) regardless of event volume.

---

## Query Patterns

### Session Journey (most common)

```js
// Uses: { session_id: 1, timestamp: 1 }
Event.find({ session_id: "sess_abc" }).sort({ timestamp: 1 })
```

### Heatmap Data

```js
// Uses: { page_url: 1, event_type: 1 }
Event.find({ page_url: "/products", event_type: "click" }, { x: 1, y: 1, viewport_width: 1, viewport_height: 1 })
```

### Events Per Day (last 30 days)

```js
// Uses: { createdAt: -1 }
Event.aggregate([
  { $match: { createdAt: { $gte: thirtyDaysAgo } } },
  { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
])
```

### Top Pages

```js
// Uses: { event_type: 1 }
Event.aggregate([
  { $match: { event_type: "page_view" } },
  { $group: { _id: "$page_url", views: { $sum: 1 } } },
  { $sort: { views: -1 } },
  { $limit: 10 }
])
```

---

## Data Retention Considerations

For production at scale, consider:

1. **TTL Index** — auto-expire events after N days:
   ```js
   EventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 })
   ```

2. **Sharding** — shard `events` on `{ session_id: 1 }` for horizontal scale.

3. **Archival** — move events older than 90 days to cold storage (S3 + Parquet).
