import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Schedule } from '@/models/Schedule';
import { createScheduleSchema } from '@/lib/validations/schedule';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { ISchedule, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<ISchedule[]>>> {
  try {
    await connectDB();
    const { eventId } = await params;
    const items = await Schedule.find({ event: eventId, deletedAt: null })
      .sort({ order: 1, startTime: 1 })
      .lean();
    return NextResponse.json({ success: true, data: items as unknown as ISchedule[] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<ISchedule>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'schedules', 'create')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { eventId } = await params;
    const body = (await request.json()) as unknown;
    const validated = createScheduleSchema.parse(body);

    const item = await Schedule.create({ ...validated, event: eventId });
    const itemData = item.toObject() as ISchedule;

    await logAction(request, session.userId, 'create', 'Schedule', itemData._id, {
      title: itemData.title,
    });

    return NextResponse.json({ success: true, data: itemData, message: 'Jadwal ditambahkan' });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || 'Validasi gagal' },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
