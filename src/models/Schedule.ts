import mongoose, { Schema, Document } from 'mongoose';
import type { ISchedule } from '@/types';

export interface ScheduleDocument extends Omit<ISchedule, '_id'>, Document {}

const ScheduleSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    startTime: { type: String, required: true },
    endTime: { type: String },
    speaker: { type: String, trim: true },
    location: { type: String, trim: true },
    type: {
      type: String,
      enum: ['ceremony', 'presentation', 'performance', 'break', 'awarding', 'other'],
      default: 'other',
    },
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ScheduleSchema.index({ event: 1, order: 1 });

export const Schedule =
  mongoose.models.Schedule || mongoose.model<ScheduleDocument>('Schedule', ScheduleSchema);
