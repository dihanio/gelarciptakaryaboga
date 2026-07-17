import mongoose, { Schema, Document } from 'mongoose';
import type { ITicket } from '@/types';

export interface TicketDocument extends Omit<ITicket, '_id'>, Document {}

const TicketSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'TicketOrder', required: true, index: true },
    ticketType: { type: Schema.Types.ObjectId, ref: 'TicketType', required: true, index: true },
    visitor: { type: Schema.Types.ObjectId, ref: 'Visitor', required: true, index: true },
    ticketNumber: { type: String, required: true, uppercase: true, trim: true },
    qrCode: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'used', 'cancelled', 'expired'],
      default: 'active',
      index: true,
    },
    issuedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

TicketSchema.index({ event: 1, visitor: 1 });
TicketSchema.index({ ticketNumber: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
TicketSchema.index({ qrCode: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

TicketSchema.index({ event: 1, visitor: 1, status: 1 });

export const Ticket =
  mongoose.models.Ticket || mongoose.model<TicketDocument>('Ticket', TicketSchema);
