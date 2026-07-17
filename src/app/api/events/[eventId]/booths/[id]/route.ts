import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Booth } from '@/models/Booth';
import { updateBoothSchema } from '@/lib/validations/booth';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { IBooth, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string; id: string }> }
): Promise<NextResponse<ApiResponse<IBooth>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'booths', 'update')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = (await request.json()) as unknown;
    const validated = updateBoothSchema.parse(body);

    const booth = await Booth.findOneAndUpdate(
      { _id: id, deletedAt: null },
      validated,
      { new: true }
    );

    if (!booth) {
      return NextResponse.json({ success: false, message: 'Booth tidak ditemukan' }, { status: 404 });
    }

    const boothData = booth.toObject() as IBooth;

    await logAction(request, session.userId, 'update', 'Booth', id, {
      number: boothData.number,
      name: boothData.name,
    });

    return NextResponse.json({ success: true, data: boothData, message: 'Booth diperbarui' });
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
    if (!session || !checkPermission(session.role, 'booths', 'delete')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (force) {
      const deleted = await Booth.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ success: false, message: 'Booth tidak ditemukan' }, { status: 404 });
      }
      await logAction(request, session.userId, 'hard_delete', 'Booth', id);
    } else {
      const softDeleted = await Booth.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date(), deletedBy: session.userId },
        { new: true }
      );
      if (!softDeleted) {
        return NextResponse.json({ success: false, message: 'Booth tidak ditemukan atau sudah dihapus' }, { status: 404 });
      }
      await logAction(request, session.userId, 'delete', 'Booth', id);
    }

    return NextResponse.json({
      success: true,
      message: force ? 'Booth dihapus permanen!' : 'Booth berhasil dihapus (soft delete)!',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
