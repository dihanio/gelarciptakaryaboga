import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { Event } from '@/models/Event';
import { Gallery } from '@/models/Gallery';
import type { IGallery, ApiResponse } from '@/types';

export async function GET(request: Request): Promise<NextResponse<ApiResponse<IGallery[]> & { albums?: string[] }>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const album = searchParams.get('album') || '';
    const type = searchParams.get('type') || '';

    const settings = await WebsiteSettings.findOne().lean();
    let eventId = settings?.activeEventId;

    if (!eventId) {
      const activeEvent = await Event.findOne({ status: 'active' }).sort({ date: -1 }).lean();
      if (!activeEvent) {
        return NextResponse.json({ success: true, data: [], albums: [] });
      }
      eventId = activeEvent._id;
    }

    const filter: Record<string, unknown> = { event: eventId, deletedAt: null };
    if (album) filter.album = album;
    if (type) filter.type = type;

    const galleryItems = await Gallery.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    const albums = await Gallery.distinct('album', { event: eventId, deletedAt: null });

    return NextResponse.json({
      success: true,
      data: galleryItems as unknown as IGallery[],
      albums: albums.filter(Boolean),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
