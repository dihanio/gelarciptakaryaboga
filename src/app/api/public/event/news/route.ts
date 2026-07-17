import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { Event } from '@/models/Event';
import { News } from '@/models/News';
import type { INews, ApiResponse } from '@/types';

export async function GET(request: Request): Promise<NextResponse<ApiResponse<INews[]>>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    const settings = await WebsiteSettings.findOne().lean();
    let eventId = settings?.activeEventId;

    if (!eventId) {
      const activeEvent = await Event.findOne({ status: 'active' }).sort({ date: -1 }).lean();
      if (!activeEvent) {
        return NextResponse.json({ success: true, data: [] });
      }
      eventId = activeEvent._id;
    }

    const filter: Record<string, unknown> = { event: eventId, status: 'published', deletedAt: null };

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    const newsList = await News.find(filter)
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: newsList as unknown as INews[] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
