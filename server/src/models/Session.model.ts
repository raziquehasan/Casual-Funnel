import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  session_id: string;
  total_events: number;
  total_clicks: number;
  total_page_views: number;
  first_seen: Date;
  last_seen: Date;
  user_agent: string | null;
  pages_visited: string[];
}

const SessionSchema = new Schema<ISession>(
  {
    session_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    total_events: {
      type: Number,
      default: 0,
    },
    total_clicks: {
      type: Number,
      default: 0,
    },
    total_page_views: {
      type: Number,
      default: 0,
    },
    first_seen: {
      type: Date,
      required: true,
    },
    last_seen: {
      type: Date,
      required: true,
    },
    user_agent: {
      type: String,
      default: null,
    },
    pages_visited: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Sort newest first
SessionSchema.index({ last_seen: -1 });
SessionSchema.index({ total_events: -1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
