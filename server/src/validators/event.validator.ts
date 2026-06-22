import { z } from 'zod';

export const SingleEventSchema = z.object({
  event_id: z.string().min(1, 'event_id is required'),
  session_id: z.string().min(1, 'session_id is required'),
  event_type: z.enum(['page_view', 'click'], {
    errorMap: () => ({ message: 'event_type must be page_view or click' }),
  }),
  page_url: z.string().url('page_url must be a valid URL').or(z.string().startsWith('/')),
  timestamp: z.string().datetime({ message: 'timestamp must be ISO 8601' }),
  x: z.number().nullable().optional(),
  y: z.number().nullable().optional(),
  viewport_width: z.number().positive().nullable().optional(),
  viewport_height: z.number().positive().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const BatchEventsSchema = z.object({
  events: z
    .array(SingleEventSchema)
    .min(1, 'events array must have at least one event')
    .max(100, 'events array cannot exceed 100 events per batch'),
});

export type SingleEventInput = z.infer<typeof SingleEventSchema>;
export type BatchEventsInput = z.infer<typeof BatchEventsSchema>;
