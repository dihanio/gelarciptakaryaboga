import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Gallery } from '@/models/Gallery';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { ApiResponse } from '@/types';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string; id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'gallery', 'delete')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (force) {
      const deleted = await Gallery.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ success: false, message: 'Media galeri tidak ditemukan' }, { status: 404 });
      }
      await logAction(request, session.userId, 'hard_delete', 'Gallery', id);
    } else {
      const softDeleted = await Gallery.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date(), deletedBy: session.userId },
        { new: true }
      );
      if (!softDeleted) {
        return NextResponse.json({ success: false, message: 'Media galeri tidak ditemukan atau sudah dihapus' }, { status: 404 });
      }
      await logAction(request, session.userId, 'delete', 'Gallery', id);
    }

    return NextResponse.json({
      success: true,
      message: force ? 'Media galeri dihapus permanen!' : 'Media galeri berhasil dihapus (soft delete)!',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
