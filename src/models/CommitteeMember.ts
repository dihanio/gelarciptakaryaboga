import mongoose, { Schema, Document } from 'mongoose';
import type { ICommitteeMember } from '@/types';

export interface CommitteeMemberDocument extends Omit<ICommitteeMember, '_id'>, Document {}

const CommitteeMemberSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true },
    photo: { type: String, required: true },
    position: { type: String, required: true },
    division: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const CommitteeMember =
  mongoose.models.CommitteeMember ||
  mongoose.model<CommitteeMemberDocument>('CommitteeMember', CommitteeMemberSchema);
