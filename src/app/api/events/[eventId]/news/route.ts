import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { News } from '@/models/News';
import { createNewsSchema } from '@/lib/validations/news';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import { generateSlug } from '@/lib/utils';
import type { INews, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<INews[]>>> {
  try {
    await connectDB();
    const { eventId } = await params;
    const items = await News.find({ event: eventId, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: items as unknown as INews[] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<INews>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'news', 'create')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { eventId } = await params;
    const body = (await request.json()) as unknown;
    const validated = createNewsSchema.parse(body);

    const slug = generateSlug(validated.title);

    const item = await News.create({
      ...validated,
      event: eventId,
      slug,
      author: session.userId,
      publishedAt: validated.status === 'published' ? new Date() : undefined,
    });
    const itemData = item.toObject() as INews;

    await logAction(request, session.userId, 'create', 'News', itemData._id, {
      title: itemData.title,
      slug: itemData.slug,
    });

    return NextResponse.json({ success: true, data: itemData, message: 'Artikel berita ditambahkan' });
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
