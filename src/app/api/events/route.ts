import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';
import { createEventSchema } from '@/lib/validations/event';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import { generateSlug } from '@/lib/utils';
import type { IEvent, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function GET(): Promise<NextResponse<ApiResponse<IEvent[]>>> {
  try {
    await connectDB();
    const events = await Event.find().sort({ date: -1 }).lean();
    return NextResponse.json({ success: true, data: events as unknown as IEvent[] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<IEvent>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'events', 'create')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();
    const body = (await request.json()) as unknown;
    const validated = createEventSchema.parse(body);

    const slug = validated.slug || generateSlug(validated.name);

    // Check slug uniqueness
    const existing = await Event.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Acara dengan nama / slug ini sudah ada' },
        { status: 400 }
      );
    }

    const event = await Event.create({
      ...validated,
      slug,
      createdBy: session.userId,
    });
    const eventData = event.toObject() as IEvent;

    await logAction(request, session.userId, 'create', 'Event', eventData._id, {
      name: eventData.name,
      slug: eventData.slug,
    });

    return NextResponse.json({
      success: true,
      data: eventData,
      message: 'Event berhasil dibuat!',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || 'Validasi gagal' },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
