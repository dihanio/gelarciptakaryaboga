import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TicketType } from '@/models/TicketType';
import { updateTicketTypeSchema } from '@/lib/validations/ticket';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { ITicketType, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string; id: string }> }
): Promise<NextResponse<ApiResponse<ITicketType>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'tickets', 'update')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = (await request.json()) as unknown;
    const validated = updateTicketTypeSchema.parse(body);

    const item = await TicketType.findOneAndUpdate(
      { _id: id, deletedAt: null },
      validated,
      { new: true }
    );

    if (!item) {
      return NextResponse.json({ success: false, message: 'Jenis tiket tidak ditemukan' }, { status: 404 });
    }

    const itemData = item.toObject() as ITicketType;

    await logAction(request, session.userId, 'update', 'TicketType', id, {
      name: itemData.name,
      price: itemData.price,
    });

    return NextResponse.json({ success: true, data: itemData, message: 'Jenis tiket diperbarui' });
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string; id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'tickets', 'delete')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (force) {
      const deleted = await TicketType.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ success: false, message: 'Jenis tiket tidak ditemukan' }, { status: 404 });
      }
      await logAction(request, session.userId, 'hard_delete', 'TicketType', id);
    } else {
      const softDeleted = await TicketType.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date(), deletedBy: session.userId },
        { new: true }
      );
      if (!softDeleted) {
        return NextResponse.json({ success: false, message: 'Jenis tiket tidak ditemukan atau sudah dihapus' }, { status: 404 });
      }
      await logAction(request, session.userId, 'delete', 'TicketType', id);
    }

    return NextResponse.json({
      success: true,
      message: force ? 'Jenis tiket dihapus permanen!' : 'Jenis tiket berhasil dihapus (soft delete)!',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
