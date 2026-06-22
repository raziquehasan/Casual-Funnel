# API Reference

Base URL: `http://localhost:4000`

All responses follow this shape:
```json
{ "success": true, "data": "..." }
```

Error responses:
```json
{ "success": false, "error": "Descriptive message" }
```

---

## POST /api/events

Ingest a batch of analytics events.

**Rate Limit:** 500 requests / 15 minutes

### Request Body

```json
{
  "events": [
    {
      "event_id": "evt_550e8400-e29b-41d4-a716-446655440000",
      "session_id": "sess_f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "event_type": "page_view",
      "page_url": "http://localhost:3000/demo",
      "timestamp": "2024-01-15T09:00:00.000Z",
      "user_agent": "Mozilla/5.0 ...",
      "viewport_width": 1920,
      "viewport_height": 1080,
      "x": null,
      "y": null,
      "metadata": {}
    },
    {
      "event_id": "evt_6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "session_id": "sess_f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "event_type": "click",
      "page_url": "http://localhost:3000/demo",
      "timestamp": "2024-01-15T09:00:05.000Z",
      "x": 250,
      "y": 400,
      "viewport_width": 1920,
      "viewport_height": 1080,
      "metadata": {
        "target_tag": "BUTTON",
        "target_id": "hero-cta-primary"
      }
    }
  ]
}
```

### Validation Rules

| Field | Required | Type | Constraints |
|-------|----------|------|-------------|
| `event_id` | ✅ | string | Unique UUID, prefixed `evt_` |
| `session_id` | ✅ | string | Non-empty |
| `event_type` | ✅ | enum | `page_view` or `click` |
| `page_url` | ✅ | string | Valid URL or path starting with `/` |
| `timestamp` | ✅ | string | ISO 8601 format |
| `events[]` | ✅ | array | 1–100 items per batch |

### Response

```json
{
  "success": true,
  "inserted": 2,
  "duplicates": 0,
  "errors": 0
}
```

### cURL Example

```bash
curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "event_id": "evt_test-001",
      "session_id": "sess_test-001",
      "event_type": "page_view",
      "page_url": "http://localhost:3000/demo",
      "timestamp": "2024-01-15T09:00:00.000Z"
    }]
  }'
```

---

## GET /api/sessions

Paginated list of sessions from the sessions summary collection.

**Rate Limit:** 300 requests / 15 minutes

### Query Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | `1` | Page number (1-indexed) |
| `limit` | `20` | Items per page (max 100) |
| `search` | — | Filter by session_id (regex) |
| `sortBy` | `last_seen` | `last_seen` or `total_events` |
| `sortOrder` | `desc` | `asc` or `desc` |

### Response

```json
{
  "success": true,
  "data": [
    {
      "session_id": "sess_f47ac10b-...",
      "total_events": 35,
      "total_clicks": 25,
      "total_page_views": 10,
      "started_at": "2024-01-15T09:00:00.000Z",
      "last_activity": "2024-01-15T09:15:32.000Z",
      "user_agent": "Mozilla/5.0 ...",
      "pages_visited": [
        "http://localhost:3000/demo",
        "http://localhost:3000/demo/products"
      ]
    }
  ],
  "total": 142,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

### cURL Example

```bash
curl "http://localhost:4000/api/sessions?page=1&limit=20&sortBy=total_events&sortOrder=desc"
```

---

## GET /api/sessions/:sessionId

Full session detail — summary + all events ordered by timestamp.

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `sessionId` | The session_id string |

### Response

```json
{
  "success": true,
  "session_id": "sess_f47ac10b-...",
  "summary": {
    "session_id": "sess_f47ac10b-...",
    "total_events": 35,
    "total_clicks": 25,
    "total_page_views": 10,
    "started_at": "...",
    "last_activity": "...",
    "user_agent": "...",
    "pages_visited": ["..."]
  },
  "events": [
    {
      "_id": "...",
      "event_id": "evt_...",
      "session_id": "sess_...",
      "event_type": "page_view",
      "page_url": "...",
      "timestamp": "...",
      "x": null,
      "y": null,
      "viewport_width": 1920,
      "viewport_height": 1080,
      "user_agent": "...",
      "metadata": {}
    }
  ]
}
```

### Error (404)

```json
{ "success": false, "error": "Session not found" }
```

---

## GET /api/analytics/overview

Aggregated dashboard stats — all charts in one call.

### Response

```json
{
  "success": true,
  "data": {
    "totalSessions": 120,
    "totalEvents": 3500,
    "totalClicks": 2200,
    "totalPageViews": 1300,
    "eventsPerDay": [
      { "date": "2024-01-01", "count": 120, "clicks": 80, "page_views": 40 }
    ],
    "eventDistribution": [
      { "type": "click", "count": 2200 },
      { "type": "page_view", "count": 1300 }
    ],
    "topPages": [
      { "page": "http://localhost:3000/demo", "views": 400 },
      { "page": "http://localhost:3000/demo/products", "views": 250 }
    ]
  }
}
```

**Notes:**
- `eventsPerDay` covers the last 30 days based on server `createdAt`
- `topPages` returns top 10 by `page_view` count

---

## GET /api/heatmap

Click coordinates for a specific page, normalized by viewport.

### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `page` | ✅ | Full page URL to query |

### Response

```json
{
  "success": true,
  "page_url": "http://localhost:3000/demo",
  "clicks": [
    {
      "x": 250,
      "y": 400,
      "nx": 0.130,
      "ny": 0.370
    }
  ]
}
```

**Notes:**
- `nx` = `x / viewport_width` — normalized X coordinate [0, 1]
- `ny` = `y / viewport_height` — normalized Y coordinate [0, 1]
- Max 5,000 click records returned
- Frontend renders `nx * canvasWidth`, `ny * canvasHeight` for device-independent positioning

### cURL Example

```bash
curl "http://localhost:4000/api/heatmap?page=http%3A%2F%2Flocalhost%3A3000%2Fdemo"
```

---

## GET /api/pages

All unique tracked page URLs. Used by heatmap page selector.

### Response

```json
{
  "success": true,
  "pages": [
    "http://localhost:3000/demo",
    "http://localhost:3000/demo/contact",
    "http://localhost:3000/demo/pricing",
    "http://localhost:3000/demo/products"
  ]
}
```

---

## GET /health

Health check endpoint.

```json
{ "status": "ok", "timestamp": "2024-01-15T09:00:00.000Z" }
```
