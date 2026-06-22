import { Router } from 'express';
import { postEvents } from '../controllers/events.controller';
import { listSessions, getSession } from '../controllers/sessions.controller';
import { overviewStats, heatmap, pages } from '../controllers/analytics.controller';

const router = Router();

// Events
router.post('/events', postEvents);

// Sessions
router.get('/sessions', listSessions);
router.get('/sessions/:sessionId', getSession);

// Analytics
router.get('/analytics/overview', overviewStats);
router.get('/heatmap', heatmap);
router.get('/pages', pages);

export default router;
