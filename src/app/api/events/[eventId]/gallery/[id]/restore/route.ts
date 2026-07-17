import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Gallery } from '@/models/Gallery';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { IGallery, ApiResponse } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string; id: string }> }
): Promise<NextResponse<ApiResponse<IGallery>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'gallery', 'delete')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const item = await Gallery.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } },
      { deletedAt: null, deletedBy: null },
      { new: true }
    );

    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Media galeri tidak ditemukan atau tidak dalam status terhapus' },
        { status: 404 }
      );
    }

    const itemData = item.toObject() as IGallery;

    await logAction(request, session.userId, 'restore', 'Gallery', id, {
      title: itemData.title,
      type: itemData.type,
    });

    return NextResponse.json({
      success: true,
      data: itemData,
      message: 'Media galeri berhasil dipulihkan!',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
