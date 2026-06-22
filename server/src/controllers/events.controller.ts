import { Request, Response, NextFunction } from 'express';
import { BatchEventsSchema } from '../validators/event.validator';
import { ingestEvents } from '../services/events.service';

export async function postEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = BatchEventsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await ingestEvents(parsed.data.events);

    res.status(201).json({
      success: true,
      inserted: result.inserted,
      duplicates: result.duplicates,
      errors: result.errors,
    });
  } catch (err) {
    next(err);
  }
}
