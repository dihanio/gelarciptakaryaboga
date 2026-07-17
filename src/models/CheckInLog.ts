import mongoose, { Schema, Document } from 'mongoose';
import type { ICheckInLog } from '@/types';

export interface CheckInLogDocument extends Omit<ICheckInLog, '_id'>, Document {}

const CheckInLogSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    visitor: { type: Schema.Types.ObjectId, ref: 'Visitor', required: true },
    checkedInBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    checkedInAt: { type: Date, default: Date.now, index: true },
    method: {
      type: String,
      enum: ['qr_scan', 'manual'],
      default: 'qr_scan',
    },
    location: { type: String, trim: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['success', 'already_used', 'invalid', 'cancelled_ticket'],
      required: true,
    },
  },
  { timestamps: { createdAt: false, updatedAt: false } }
);

CheckInLogSchema.index({ event: 1, ticket: 1 });
CheckInLogSchema.index({ event: 1, checkedInAt: -1 });

export const CheckInLog =
  mongoose.models.CheckInLog ||
  mongoose.model<CheckInLogDocument>('CheckInLog', CheckInLogSchema);
