import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Participant } from '@/models/Participant';
import { updateParticipantSchema } from '@/lib/validations/participant';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { IParticipant, ApiResponse } from '@/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string; id: string }> }
): Promise<NextResponse<ApiResponse<IParticipant>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'participants', 'update')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = (await request.json()) as unknown;
    const validated = updateParticipantSchema.parse(body);

    const participant = await Participant.findOneAndUpdate(
      { _id: id, deletedAt: null },
      validated,
      { new: true }
    );

    if (!participant) {
      return NextResponse.json({ success: false, message: 'Peserta tidak ditemukan' }, { status: 404 });
    }

    const participantData = participant.toObject() as IParticipant;

    await logAction(request, session.userId, 'update', 'Participant', id, {
      name: participantData.name,
      workName: participantData.workName,
    });

    return NextResponse.json({
      success: true,
      data: participantData,
      message: 'Data peserta berhasil diperbarui!',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string; id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'participants', 'delete')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (force) {
      const deleted = await Participant.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ success: false, message: 'Peserta tidak ditemukan' }, { status: 404 });
      }
      await logAction(request, session.userId, 'hard_delete', 'Participant', id);
    } else {
      const softDeleted = await Participant.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date(), deletedBy: session.userId },
        { new: true }
      );
      if (!softDeleted) {
        return NextResponse.json({ success: false, message: 'Peserta tidak ditemukan atau sudah dihapus' }, { status: 404 });
      }
      await logAction(request, session.userId, 'delete', 'Participant', id);
    }

    return NextResponse.json({
      success: true,
      message: force ? 'Peserta dihapus permanen!' : 'Peserta berhasil dihapus (soft delete)!',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
