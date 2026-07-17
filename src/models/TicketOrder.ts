import mongoose, { Schema, Document } from 'mongoose';
import type { ITicketOrder } from '@/types';

export interface TicketOrderDocument extends Omit<ITicketOrder, '_id'>, Document {}

const TicketOrderSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    orderNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    visitor: { type: Schema.Types.ObjectId, ref: 'Visitor', required: true, index: true },
    items: [
      {
        ticketType: { type: Schema.Types.ObjectId, ref: 'TicketType', required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
      default: 'confirmed',
      index: true,
    },
    paymentMethod: { type: String },
    paymentRef: { type: String },
    snapToken: { type: String },
    snapRedirectUrl: { type: String },
    paymentDetails: { type: Schema.Types.Mixed },
    paidAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

TicketOrderSchema.index({ event: 1, status: 1 });

export const TicketOrder =
  mongoose.models.TicketOrder ||
  mongoose.model<TicketOrderDocument>('TicketOrder', TicketOrderSchema);
