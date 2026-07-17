import mongoose, { Schema, Document } from 'mongoose';
import type { IWebsiteSettings } from '@/types';

export interface WebsiteSettingsDocument extends Omit<IWebsiteSettings, '_id'>, Document {}

const WebsiteSettingsSchema = new Schema(
  {
    siteName: { type: String, default: 'Gelar Cipta' },
    siteDescription: { type: String, default: 'Pameran Karya & Inovasi Mahasiswa' },
    siteLogo: { type: String },
    favicon: { type: String },
    contact: {
      phone: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    socialMedia: {
      instagram: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    navigation: [
      {
        label: { type: String, required: true },
        href: { type: String, required: true },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
      },
    ],
    footer: {
      text: { type: String, default: '' },
      links: [{ label: String, href: String }],
      copyright: { type: String, default: '© Gelar Cipta. All rights reserved.' },
    },
    activeEventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const WebsiteSettings =
  mongoose.models.WebsiteSettings ||
  mongoose.model<WebsiteSettingsDocument>('WebsiteSettings', WebsiteSettingsSchema);
