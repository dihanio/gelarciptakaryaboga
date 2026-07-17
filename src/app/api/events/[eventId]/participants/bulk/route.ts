import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Participant } from '@/models/Participant';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'participants', 'create')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { eventId } = await params;
    const body = await request.json();
    const { action, data, ids } = body;

    if (action === 'import') {
      if (!Array.isArray(data) || data.length === 0) {
        return NextResponse.json({ success: false, message: 'Data kosong' }, { status: 400 });
      }

      const participantsToInsert = data.map((item) => ({
        event: eventId,
        name: item.name,
        workName: item.workName,
        category: item.category || '',
        description: item.description || '',
      }));

      const result = await Participant.insertMany(participantsToInsert);

      await logAction(request, session.userId, 'import', 'Participant', undefined, {
        count: result.length,
      });

      return NextResponse.json({
        success: true,
        message: `${result.length} peserta berhasil diimpor`,
      });
    }
    
    if (action === 'delete') {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ success: false, message: 'Tidak ada ID yang dipilih' }, { status: 400 });
      }

      const result = await Participant.updateMany(
        { _id: { $in: ids }, event: eventId },
        { $set: { deletedAt: new Date() } }
      );

      await logAction(request, session.userId, 'delete', 'Participant', undefined, {
        ids,
        count: result.modifiedCount,
        bulk: true,
      });

      return NextResponse.json({
        success: true,
        message: `${result.modifiedCount} peserta berhasil dihapus`,
      });
    }

    return NextResponse.json({ success: false, message: 'Aksi tidak valid' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memproses bulk action';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
