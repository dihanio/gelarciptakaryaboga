import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Gallery } from '@/models/Gallery';
import { createGallerySchema } from '@/lib/validations/gallery';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { IGallery, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<IGallery[]>>> {
  try {
    await connectDB();
    const { eventId } = await params;
    const items = await Gallery.find({ event: eventId, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: items as unknown as IGallery[] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<IGallery[]>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'gallery', 'create')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { eventId } = await params;
    const body = (await request.json()) as unknown;

    // Support array of items (multiple upload) or single item
    const items = Array.isArray(body) ? body : [body];
    const created: IGallery[] = [];

    for (const item of items) {
      const validated = createGallerySchema.parse(item);
      const doc = await Gallery.create({
        ...validated,
        event: eventId,
        uploadedBy: session.userId,
      });
      const docData = doc.toObject() as IGallery;
      created.push(docData);

      await logAction(request, session.userId, 'create', 'Gallery', docData._id, {
        title: docData.title,
        type: docData.type,
      });
    }

    return NextResponse.json({ success: true, data: created, message: 'Media galeri berhasil ditambahkan' });
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
