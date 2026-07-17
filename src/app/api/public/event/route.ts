import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { Event } from '@/models/Event';
import type { IEvent, ApiResponse } from '@/types';
import { publicApiRateLimiter } from '@/lib/rate-limiter';

export async function GET(request: Request): Promise<NextResponse<ApiResponse<IEvent>>> {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = publicApiRateLimiter.check(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests', retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000) } as ApiResponse<IEvent>,
        { status: 429, headers: { 'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString() } }
      );
    }

    await connectDB();

    const settings = await WebsiteSettings.findOne().lean();

    if (!settings || !settings.activeEventId) {
      // Fallback: find latest active event
      const event = await Event.findOne({ status: 'active' }).sort({ date: -1 }).lean();
      if (!event) {
        return NextResponse.json(
          { success: false, message: 'Tidak ada acara yang aktif saat ini' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: event as unknown as IEvent });
    }

    const event = await Event.findById(settings.activeEventId).lean();

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Acara tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: event as unknown as IEvent });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
