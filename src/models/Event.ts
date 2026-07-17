import mongoose, { Schema, Document } from 'mongoose';
import type { IEvent } from '@/types';

export interface EventDocument extends Omit<IEvent, '_id'>, Document {}

const EventSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    theme: { type: String, required: true },
    logo: { type: String },
    banner: { type: String },
    date: { type: Date, required: true },
    endDate: { type: Date },
    time: { type: String, required: true },
    location: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      mapUrl: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'active', 'completed', 'archived'],
      default: 'draft',
      index: true,
    },
    registration: {
      isOpen: { type: Boolean, default: false },
      startDate: { type: Date },
      endDate: { type: Date },
      maxCapacity: { type: Number, default: 0 },
    },
    countdown: {
      enabled: { type: Boolean, default: true },
      targetDate: { type: Date, required: true },
    },
    about: {
      content: { type: String, default: '' },
      images: [{ type: String }],
    },
    faq: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        order: { type: Number, default: 0 },
      },
    ],
    sponsors: [
      {
        name: { type: String, required: true },
        logo: { type: String, required: true },
        url: { type: String },
        tier: {
          type: String,
          enum: ['platinum', 'gold', 'silver', 'bronze'],
          default: 'gold',
        },
        order: { type: Number, default: 0 },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

EventSchema.index({ slug: 1 });
EventSchema.index({ status: 1 });

export const Event = mongoose.models.Event || mongoose.model<EventDocument>('Event', EventSchema);
