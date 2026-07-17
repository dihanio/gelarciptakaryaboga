import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { SectionRenderer } from '@/components/public/sections/SectionRenderer';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { Event } from '@/models/Event';
import { PageSection } from '@/models/PageSection';
import type { IPageSection } from '@/types';

import { Metadata } from 'next';

export const revalidate = 60; // SSR with 60s revalidation

export async function generateMetadata(): Promise<Metadata> {
  const { settings, event } = await getData();

  const title = event ? `${event.name} | ${settings?.siteName || 'Gelar Cipta'}` : settings?.siteName || 'Gelar Cipta';
  const description = event?.description || settings?.siteDescription || 'Platform manajemen acara dan pameran karya.';
  const image = event?.banner || settings?.siteLogo || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

async function getData() {
  try {
    await connectDB();

    const settingsDoc = await WebsiteSettings.findOne().lean();
    let activeEventId = settingsDoc?.activeEventId;

    if (!activeEventId) {
      const activeEvent = await Event.findOne({ status: 'active' }).sort({ date: -1 }).lean();
      activeEventId = activeEvent?._id;
    }

    let event = null;
    let sections: IPageSection[] = [];

    if (activeEventId) {
      event = await Event.findById(activeEventId).lean();
      sections = await PageSection.find({ event: activeEventId, page: 'landing', isVisible: true })
        .sort({ order: 1 })
        .lean();
    }

    return {
      settings: settingsDoc ? JSON.parse(JSON.stringify(settingsDoc)) : null,
      event: event ? JSON.parse(JSON.stringify(event)) : null,
      sections: JSON.parse(JSON.stringify(sections)),
    };
  } catch (error) {
    console.error('Failed to fetch home page data:', error);
    return {
      settings: null,
      event: null,
      sections: [],
    };
  }
}

export default async function HomePage() {
  const { settings, event, sections } = await getData();

  return (
    <PublicLayout settings={settings}>
      <SectionRenderer sections={sections} event={event} />
    </PublicLayout>
  );
}
