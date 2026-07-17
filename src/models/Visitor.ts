import mongoose, { Schema, Document } from 'mongoose';
import type { IVisitor } from '@/types';

export interface VisitorDocument extends Omit<IVisitor, '_id'>, Document {}

const VisitorSchema = new Schema<VisitorDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    organization: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Visitor =
  mongoose.models.Visitor || mongoose.model<VisitorDocument>('Visitor', VisitorSchema);
