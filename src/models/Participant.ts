import mongoose, { Schema, Document } from 'mongoose';
import type { IParticipant } from '@/types';

export interface ParticipantDocument extends Omit<IParticipant, '_id'>, Document {}

const ParticipantSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true, trim: true },
    photo: { type: String },
    workName: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    booth: { type: Schema.Types.ObjectId, ref: 'Booth' },
    category: { type: String, trim: true },
    members: [
      {
        name: { type: String, required: true },
        role: { type: String },
      },
    ],
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

ParticipantSchema.index({ event: 1, category: 1 });
ParticipantSchema.index({ event: 1, booth: 1 });

ParticipantSchema.index({ event: 1 });
ParticipantSchema.index({ event: 1, deletedAt: 1, category: 1 });

export const Participant =
  mongoose.models.Participant ||
  mongoose.model<ParticipantDocument>('Participant', ParticipantSchema);
