import mongoose, { Schema, Document } from 'mongoose';
import type { ITicketType } from '@/types';

export interface TicketTypeDocument extends Omit<ITicketType, '_id'>, Document {}

const TicketTypeSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'IDR' },
    quota: { type: Number, required: true, default: 100 },
    sold: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    benefits: [{ type: String }],
    validFrom: { type: Date },
    validUntil: { type: Date },
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

TicketTypeSchema.index({ event: 1, isActive: 1 });

export const TicketType =
  mongoose.models.TicketType ||
  mongoose.model<TicketTypeDocument>('TicketType', TicketTypeSchema);
