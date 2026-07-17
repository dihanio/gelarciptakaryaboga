import mongoose, { Schema, Document } from 'mongoose';
import type { IBooth } from '@/types';

export interface BoothDocument extends Omit<IBooth, '_id'>, Document {}

const BoothSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    number: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    location: { type: String, trim: true },
    category: { type: String, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['available', 'assigned', 'inactive'],
      default: 'available',
    },
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

BoothSchema.index({ event: 1, number: 1 }, { unique: true });
BoothSchema.index({ event: 1, deletedAt: 1 });

export const Booth = mongoose.models.Booth || mongoose.model<BoothDocument>('Booth', BoothSchema);
