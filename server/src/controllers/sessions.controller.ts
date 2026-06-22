import { Request, Response, NextFunction } from 'express';
import { getSessions, getSessionDetail } from '../services/sessions.service';

export async function listSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || undefined;
    const sortBy = (req.query.sortBy as 'last_seen' | 'total_events') || 'last_seen';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const result = await getSessions({ page, limit, search, sortBy, sortOrder });

    res.json({
      success: true,
      ...result,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (err) {
    next(err);
  }
}

export async function getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId } = req.params;
    const detail = await getSessionDetail(sessionId);

    if (!detail) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    res.json({ success: true, ...detail });
  } catch (err) {
    next(err);
  }
}
