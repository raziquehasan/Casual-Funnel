/**
 * CausalFunnel Analytics Tracker v1.0.0
 *
 * Embeddable script for tracking user sessions, page views, and clicks.
 * Configure via:
 *   window.CF_TRACKER_URL = 'https://your-backend.com/api/events'
 *
 * Usage:
 *   <script src="tracker.js"></script>
 */
(function (window, document) {
  'use strict';

  // ─── Configuration ────────────────────────────────────────────────────────
  var BACKEND_URL =
    window.CF_TRACKER_URL || 'http://localhost:4000/api/events';
  var SESSION_KEY = 'cf_session_id';
  var QUEUE_KEY = 'cf_event_queue';
  var BATCH_INTERVAL_MS = 2000;
  var BATCH_MAX_SIZE = 10;
  var MAX_RETRIES = 3;
  var CLICK_DEBOUNCE_MS = 50;

  // ─── Session Management ───────────────────────────────────────────────────
  function generateUUID() {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getOrCreateSessionId() {
    try {
      var stored = localStorage.getItem(SESSION_KEY);
      if (stored) return stored;
      var newId = 'sess_' + generateUUID();
      localStorage.setItem(SESSION_KEY, newId);
      return newId;
    } catch (_) {
      return 'sess_' + generateUUID();
    }
  }

  var sessionId = getOrCreateSessionId();

  // ─── Offline Queue ────────────────────────────────────────────────────────
  function loadQueue() {
    try {
      var raw = localStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveQueue(queue) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (_) {
      // Storage might be full — clear and try again
      try {
        localStorage.removeItem(QUEUE_KEY);
      } catch (__) {}
    }
  }

  function clearQueue() {
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch (_) {}
  }

  var memoryQueue = loadQueue(); // In-memory batch buffer

  // ─── Event Building ───────────────────────────────────────────────────────
  function buildBaseEvent(eventType) {
    return {
      event_id: 'evt_' + generateUUID(),
      session_id: sessionId,
      event_type: eventType,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      viewport_width: window.innerWidth || document.documentElement.clientWidth,
      viewport_height: window.innerHeight || document.documentElement.clientHeight,
      metadata: {},
    };
  }

  // ─── HTTP Sender with Retry ───────────────────────────────────────────────
  function sendBatch(events, retries) {
    if (!events || events.length === 0) return;
    retries = retries || 0;

    var payload = JSON.stringify({ events: events });

    // Use navigator.sendBeacon for page-unload scenarios
    if (document.visibilityState === 'hidden' && navigator.sendBeacon) {
      var blob = new Blob([payload], { type: 'application/json' });
      var sent = navigator.sendBeacon(BACKEND_URL, blob);
      if (sent) return;
      // sendBeacon failed — fall through to fetch
    }

    fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        clearQueue();
      })
      .catch(function () {
        if (retries < MAX_RETRIES) {
          var delay = Math.pow(2, retries) * 1000;
          setTimeout(function () {
            sendBatch(events, retries + 1);
          }, delay);
        } else {
          // Persist failed events to localStorage
          var current = loadQueue();
          var merged = current.concat(events);
          // Cap queue at 200 to avoid storage overflow
          if (merged.length > 200) merged = merged.slice(merged.length - 200);
          saveQueue(merged);
        }
      });
  }

  // ─── Batch Flush ─────────────────────────────────────────────────────────
  function flush() {
    // First try to resend any queued (previously failed) events
    var queued = loadQueue();
    if (queued.length > 0) {
      clearQueue();
      sendBatch(queued, 0);
    }

    if (memoryQueue.length === 0) return;
    var batch = memoryQueue.splice(0, memoryQueue.length);
    sendBatch(batch, 0);
  }

  // Auto-flush interval
  setInterval(flush, BATCH_INTERVAL_MS);

  // Flush on page hide (tab close, navigate away)
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush();
  });

  // Retry queued events when back online
  window.addEventListener('online', function () {
    setTimeout(flush, 500);
  });

  // ─── Event Tracking ───────────────────────────────────────────────────────
  function enqueue(event) {
    memoryQueue.push(event);
    if (memoryQueue.length >= BATCH_MAX_SIZE) flush();
  }

  // Page View
  function trackPageView() {
    var event = buildBaseEvent('page_view');
    event.x = null;
    event.y = null;
    enqueue(event);
  }

  // Click — debounced
  var clickTimeout = null;
  var pendingClick = null;

  function trackClick(e) {
    pendingClick = {
      event: buildBaseEvent('click'),
      clientX: e.clientX,
      clientY: e.clientY,
    };

    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(function () {
      if (!pendingClick) return;
      var clickEvent = pendingClick.event;
      clickEvent.x = pendingClick.clientX;
      clickEvent.y = pendingClick.clientY;
      clickEvent.metadata = {
        target_tag: e.target ? e.target.tagName : null,
        target_id: e.target ? e.target.id : null,
        target_text:
          e.target && e.target.innerText
            ? e.target.innerText.substring(0, 100)
            : null,
      };
      enqueue(clickEvent);
      pendingClick = null;
    }, CLICK_DEBOUNCE_MS);
  }

  // ─── Attach Listeners ─────────────────────────────────────────────────────
  trackPageView();
  document.addEventListener('click', trackClick, { passive: true });

  // SPA route change support (History API)
  var _pushState = history.pushState;
  history.pushState = function () {
    _pushState.apply(history, arguments);
    setTimeout(trackPageView, 0);
  };
  window.addEventListener('popstate', function () {
    setTimeout(trackPageView, 0);
  });

  // ─── Public API ───────────────────────────────────────────────────────────
  window.CausalFunnel = {
    sessionId: sessionId,
    flush: flush,
    track: function (eventType, metadata) {
      var event = buildBaseEvent(eventType);
      event.metadata = metadata || {};
      enqueue(event);
    },
  };

  console.log('[CausalFunnel] Tracker initialized. Session:', sessionId);
})(window, document);
