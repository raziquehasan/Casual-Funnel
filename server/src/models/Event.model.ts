import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  event_id: string;
  session_id: string;
  event_type: 'page_view' | 'click' | string;
  page_url: string;
  timestamp: Date;
  createdAt: Date;
  x: number | null;
  y: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
}

const EventSchema = new Schema<IEvent>(
  {
    event_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    session_id: {
      type: String,
      required: true,
    },
    event_type: {
      type: String,
      required: true,
      enum: ['page_view', 'click'],
    },
    page_url: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    x: {
      type: Number,
      default: null,
    },
    y: {
      type: Number,
      default: null,
    },
    viewport_width: {
      type: Number,
      default: null,
    },
    viewport_height: {
      type: Number,
      default: null,
    },
    user_agent: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
    versionKey: false,
  }
);

// Compound indexes for query patterns
EventSchema.index({ session_id: 1, timestamp: 1 });
EventSchema.index({ page_url: 1, event_type: 1 });
EventSchema.index({ timestamp: -1 });
EventSchema.index({ createdAt: -1 });
EventSchema.index({ event_type: 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
