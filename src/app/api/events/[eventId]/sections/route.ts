import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PageSection } from '@/models/PageSection';
import { createPageSectionSchema } from '@/lib/validations/section';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit-logger';
import type { IPageSection, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<IPageSection[]>>> {
  try {
    await connectDB();
    const { eventId } = await params;
    const items = await PageSection.find({ event: eventId }).sort({ order: 1 }).lean();
    return NextResponse.json({ success: true, data: items as unknown as IPageSection[] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<IPageSection>>> {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { eventId } = await params;
    const body = (await request.json()) as unknown;
    const validated = createPageSectionSchema.parse(body);

    const item = await PageSection.create({ ...validated, event: eventId });
    const itemData = item.toObject() as IPageSection;
    
    await logAction(request, session.userId, 'create', 'PageSection', itemData._id, {
      sectionType: itemData.sectionType,
      title: itemData.title,
    });

    return NextResponse.json({ success: true, data: itemData, message: 'Section CMS ditambahkan' });
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
