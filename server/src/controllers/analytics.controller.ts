import { Request, Response, NextFunction } from 'express';
import {
  getOverviewStats,
  getHeatmapData,
  getUniquePages,
} from '../services/analytics.service';

export async function overviewStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await getOverviewStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

export async function heatmap(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pageUrl = req.query.page as string;
    if (!pageUrl) {
      res.status(400).json({ success: false, error: 'page query parameter is required' });
      return;
    }
    const data = await getHeatmapData(pageUrl);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}

export async function pages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pageList = await getUniquePages();
    res.json({ success: true, pages: pageList });
  } catch (err) {
    next(err);
  }
}
