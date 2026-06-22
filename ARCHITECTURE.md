# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Any Website / Demo Site                     │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  <script src="tracker.js">                             │     │
│  │    • session_id (localStorage)                         │     │
│  │    • page_view on load / SPA navigate                  │     │
│  │    • click on document click                           │     │
│  │    • batch every 2s or 10 events                       │     │
│  │    • offline queue → retry on reconnect                │     │
│  └──────────────────────────┬─────────────────────────────┘     │
└─────────────────────────────│───────────────────────────────────┘
                              │  POST /api/events  { events: [] }
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Express.js Backend (Port 4000)                 │
│                                                                  │
│  ┌─────────────┐   ┌──────────────┐   ┌────────────────────┐   │
│  │   Helmet    │   │     CORS     │   │   Rate Limiter     │   │
│  │  (headers)  │   │  (whitelist) │   │  (500/15min write) │   │
│  └─────────────┘   └──────────────┘   └────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Route Layer                           │   │
│  │   POST /api/events       → EventsController             │   │
│  │   GET  /api/sessions     → SessionsController           │   │
│  │   GET  /api/sessions/:id → SessionsController           │   │
│  │   GET  /api/heatmap      → AnalyticsController          │   │
│  │   GET  /api/pages        → AnalyticsController          │   │
│  │   GET  /api/analytics/overview → AnalyticsController    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Service Layer                          │   │
│  │   events.service    → ingestEvents(), upsertSession()   │   │
│  │   sessions.service  → getSessions(), getDetail()        │   │
│  │   analytics.service → getOverview(), getHeatmap()       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Mongoose Models                        │   │
│  │   Event   { event_id[unique], session_id, ... }          │   │
│  │   Session { session_id[unique], totals, first/last_seen }│   │
│  └──────────────────────────┬──────────────────────────────┘   │
└─────────────────────────────│───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MongoDB (Atlas / Local)                      │
│   events collection    ←── 6 indexes (dedup, session, heatmap)  │
│   sessions collection  ←── 3 indexes (id, last_seen, total)     │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │  REST API calls
┌─────────────────────────────│───────────────────────────────────┐
│               Next.js 15 Dashboard (Port 3000)                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             TanStack Query (Client Cache)                │   │
│  │   30s staleTime, 60s refetch, 2 retries                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐    │
│  │  /dashboard  │  │  /sessions   │  │  /heatmap         │    │
│  │  Overview    │  │  Table +     │  │  Page selector +  │    │
│  │  Charts      │  │  Timeline    │  │  Canvas render    │    │
│  └──────────────┘  └──────────────┘  └───────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                   /demo (4 pages)                       │    │
│  │   Home • Products • Pricing • Contact                   │    │
│  │   All inject tracker.js for live testing               │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Event Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant T as tracker.js
    participant B as Backend API
    participant DB as MongoDB

    U->>T: Page load
    T->>T: getOrCreateSessionId() → localStorage
    T->>T: buildEvent(page_view)
    T->>T: enqueue(event)

    U->>T: User click
    T->>T: debounce 50ms
    T->>T: buildEvent(click, x, y)
    T->>T: enqueue(event)

    Note over T: Every 2s OR 10 events
    T->>B: POST /api/events { events: [...] }

    alt Success
        B->>DB: Event.insertMany(ordered:false)
        B->>DB: Session.findOneAndUpdate(upsert)
        B->>T: { inserted, duplicates }
    else Network failure
        T->>T: Retry (1s→2s→4s exponential)
        T->>T: Save to localStorage queue
        Note over T: On reconnect → flush queue
    end
```

---

## Tracking Flow (Reliability)

```mermaid
flowchart TD
    A[User Action] --> B[tracker.js captures event]
    B --> C[Generate event_id via crypto.randomUUID]
    C --> D[Add to memory queue]
    D --> E{Queue >= 10 OR 2s timer}
    E --> F[Flush batch to POST /api/events]
    F --> G{HTTP success?}
    G -->|Yes| H[Clear localStorage queue]
    G -->|No| I{Retry count < 3?}
    I -->|Yes| J[Wait 2^n seconds] --> F
    I -->|No| K[Save to localStorage offline queue]
    K --> L{navigator.onLine?}
    L -->|Online| M[Retry from queue]
    L -->|Offline| L

    style H fill:#10b981,color:#fff
    style K fill:#f59e0b,color:#fff
```

---

## Dashboard Data Flow

```mermaid
flowchart LR
    DB[(MongoDB)] -->|Aggregation| API[Express API]
    API -->|GET /api/analytics/overview| TQ[TanStack Query]
    TQ -->|Cached 30s| Dashboard[Dashboard Page]
    Dashboard --> Cards[Stat Cards]
    Dashboard --> LineChart[Events Per Day]
    Dashboard --> PieChart[Event Distribution]
    Dashboard --> BarChart[Top Pages]

    API -->|GET /api/sessions| SessionsTable
    SessionsTable -->|Row Click| SessionDetail
    API -->|GET /api/sessions/:id| SessionDetail

    API -->|GET /api/pages| HeatmapDropdown
    HeatmapDropdown -->|Select| API
    API -->|GET /api/heatmap?page=| Canvas[HTML Canvas]
    Canvas -->|nx * width, ny * height| Dots[Normalized Click Dots]
```

---

## Heatmap Normalization

Raw click coordinates depend on the screen size of the user who clicked. To render heatmaps accurately across different devices, coordinates are normalized:

```
tracker captures:  x=250, y=400, viewport_width=1920, viewport_height=1080

Backend stores:    x, y, viewport_width, viewport_height  (all raw)
Backend returns:   nx = 250/1920 = 0.130
                   ny = 400/1080 = 0.370

Canvas renders:    canvasX = 0.130 * canvasWidth
                   canvasY = 0.370 * canvasHeight
```

This means a click at the center of a 1920×1080 screen and a click at the center of a 375×812 mobile screen both map to the same canvas position — providing accurate cross-device heatmaps.

---

## Deduplication Strategy

The tracker assigns each event a unique `event_id` before sending:

```js
event_id = "evt_" + crypto.randomUUID()
```

The backend uses MongoDB's unique index on `event_id` with `insertMany(ordered: false)`:

- Duplicate events (from retries) are silently rejected
- Non-duplicate events in the same batch are still inserted
- The response reports `{ inserted, duplicates, errors }` for observability

This makes the event ingestion pipeline **idempotent** — safe to retry without data corruption.

---

## Layer Responsibilities

| Layer | Responsibility |
|-------|---------------|
| `tracker.js` | Session ID, event capture, batching, reliability, offline queue |
| `controllers/` | HTTP parsing, validation delegation, response formatting |
| `services/` | Business logic, aggregation queries, database operations |
| `models/` | Schema definition, indexes, data shape |
| `hooks/` | TanStack Query wrappers, cache configuration |
| `services/api.ts` | Typed fetch wrapper, URL construction |
| `components/` | Pure UI — receives data as props, no data fetching |
