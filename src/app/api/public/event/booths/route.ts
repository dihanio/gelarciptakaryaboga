import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { Event } from '@/models/Event';
import { Booth } from '@/models/Booth';
import type { IBooth, ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<IBooth[]>>> {
  try {
    await connectDB();

    const settings = await WebsiteSettings.findOne().lean();
    let eventId = settings?.activeEventId;

    if (!eventId) {
      const activeEvent = await Event.findOne({ status: 'active' }).sort({ date: -1 }).lean();
      if (!activeEvent) {
        return NextResponse.json({ success: true, data: [] });
      }
      eventId = activeEvent._id;
    }

    const booths = await Booth.find({ event: eventId, status: { $ne: 'inactive' }, deletedAt: null })
      .sort({ order: 1, number: 1 })
      .lean();

    return NextResponse.json({ success: true, data: booths as unknown as IBooth[] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
