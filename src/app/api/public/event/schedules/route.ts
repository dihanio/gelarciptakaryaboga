import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { Event } from '@/models/Event';
import { Schedule } from '@/models/Schedule';
import type { ISchedule, ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<ISchedule[]>>> {
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

    const schedules = await Schedule.find({ event: eventId, deletedAt: null })
      .sort({ order: 1, startTime: 1 })
      .lean();

    return NextResponse.json({ success: true, data: schedules as unknown as ISchedule[] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
