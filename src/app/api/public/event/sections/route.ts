import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { Event } from '@/models/Event';
import { PageSection } from '@/models/PageSection';
import type { IPageSection, ApiResponse } from '@/types';

export async function GET(request: Request): Promise<NextResponse<ApiResponse<IPageSection[]>>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'landing';

    const settings = await WebsiteSettings.findOne().lean();
    let eventId = settings?.activeEventId;

    if (!eventId) {
      const activeEvent = await Event.findOne({ status: 'active' }).sort({ date: -1 }).lean();
      if (!activeEvent) {
        return NextResponse.json({ success: true, data: [] });
      }
      eventId = activeEvent._id;
    }

    const sections = await PageSection.find({
      event: eventId,
      page,
      isVisible: true,
    })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ success: true, data: sections as unknown as IPageSection[] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
