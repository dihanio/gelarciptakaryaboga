import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { News } from '@/models/News';
import { updateNewsSchema } from '@/lib/validations/news';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { INews, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string; id: string }> }
): Promise<NextResponse<ApiResponse<INews>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'news', 'update')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = (await request.json()) as unknown;
    const validated = updateNewsSchema.parse(body);

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.status === 'published') {
      updateData.publishedAt = new Date();
    }

    const item = await News.findOneAndUpdate(
      { _id: id, deletedAt: null },
      updateData,
      { new: true }
    );

    if (!item) {
      return NextResponse.json({ success: false, message: 'Berita tidak ditemukan' }, { status: 404 });
    }

    const itemData = item.toObject() as INews;

    await logAction(request, session.userId, 'update', 'News', id, {
      title: itemData.title,
      slug: itemData.slug,
    });

    return NextResponse.json({ success: true, data: itemData, message: 'Berita diperbarui' });
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
    if (!session || !checkPermission(session.role, 'news', 'delete')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (force) {
      const deleted = await News.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ success: false, message: 'Berita tidak ditemukan' }, { status: 404 });
      }
      await logAction(request, session.userId, 'hard_delete', 'News', id);
    } else {
      const softDeleted = await News.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date(), deletedBy: session.userId },
        { new: true }
      );
      if (!softDeleted) {
        return NextResponse.json({ success: false, message: 'Berita tidak ditemukan atau sudah dihapus' }, { status: 404 });
      }
      await logAction(request, session.userId, 'delete', 'News', id);
    }

    return NextResponse.json({
      success: true,
      message: force ? 'Berita dihapus permanen!' : 'Berita berhasil dihapus (soft delete)!',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
