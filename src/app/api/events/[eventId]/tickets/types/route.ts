import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TicketType } from '@/models/TicketType';
import { createTicketTypeSchema } from '@/lib/validations/ticket';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { ITicketType, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<ITicketType[]>>> {
  try {
    await connectDB();
    const { eventId } = await params;
    const items = await TicketType.find({ event: eventId, deletedAt: null })
      .sort({ order: 1 })
      .lean();
    return NextResponse.json({ success: true, data: items as unknown as ITicketType[] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<ITicketType>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'tickets', 'create')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { eventId } = await params;
    const body = (await request.json()) as unknown;
    const validated = createTicketTypeSchema.parse(body);

    const item = await TicketType.create({ ...validated, event: eventId });
    const itemData = item.toObject() as ITicketType;

    await logAction(request, session.userId, 'create', 'TicketType', itemData._id, {
      name: itemData.name,
      price: itemData.price,
    });

    return NextResponse.json({ success: true, data: itemData, message: 'Jenis tiket ditambahkan' });
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
