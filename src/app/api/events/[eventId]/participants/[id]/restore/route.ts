import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Participant } from '@/models/Participant';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { IParticipant, ApiResponse } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string; id: string }> }
): Promise<NextResponse<ApiResponse<IParticipant>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'participants', 'delete')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const participant = await Participant.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } },
      { deletedAt: null, deletedBy: null },
      { new: true }
    );

    if (!participant) {
      return NextResponse.json(
        { success: false, message: 'Peserta tidak ditemukan atau tidak dalam status terhapus' },
        { status: 404 }
      );
    }

    const participantData = participant.toObject() as IParticipant;

    await logAction(request, session.userId, 'restore', 'Participant', id, {
      name: participantData.name,
      workName: participantData.workName,
    });

    return NextResponse.json({
      success: true,
      data: participantData,
      message: 'Peserta berhasil dipulihkan!',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
