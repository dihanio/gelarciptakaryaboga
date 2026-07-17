import mongoose, { Schema, Document } from 'mongoose';
import type { IUser } from '@/types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String },
    role: {
      type: String,
      enum: ['super_admin', 'admin_event', 'ticket_officer', 'checkin_officer', 'content_editor', 'media', 'viewer'],
      default: 'viewer',
      index: true,
    },
    assignedEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
