import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { Event } from '@/models/Event';
import { Participant } from '@/models/Participant';
import { Booth } from '@/models/Booth';
import type { IParticipant, ApiResponse } from '@/types';

export async function GET(request: Request): Promise<NextResponse<ApiResponse<IParticipant[]> & { categories?: string[] }>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const boothNumber = searchParams.get('booth') || '';

    // Get active event ID
    const settings = await WebsiteSettings.findOne().lean();
    let eventId = settings?.activeEventId;

    if (!eventId) {
      const activeEvent = await Event.findOne({ status: 'active' }).sort({ date: -1 }).lean();
      if (!activeEvent) {
        return NextResponse.json({ success: true, data: [], categories: [] });
      }
      eventId = activeEvent._id;
    }

    // Build filter
    const filter: Record<string, unknown> = { event: eventId, deletedAt: null };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { workName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (boothNumber) {
      const boothDoc = await Booth.findOne({ event: eventId, number: boothNumber, deletedAt: null }).lean();
      if (boothDoc) {
        filter.booth = boothDoc._id;
      }
    }

    const participants = await Participant.find(filter)
      .populate('booth', 'number name location category')
      .sort({ order: 1, name: 1 })
      .lean();

    // Get unique categories for filter dropdown
    const categories = await Participant.distinct('category', { event: eventId, deletedAt: null });

    return NextResponse.json({
      success: true,
      data: participants as unknown as IParticipant[],
      categories: categories.filter(Boolean),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
