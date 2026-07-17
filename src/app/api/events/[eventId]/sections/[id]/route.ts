import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PageSection } from '@/models/PageSection';
import { updatePageSectionSchema } from '@/lib/validations/section';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit-logger';
import type { IPageSection, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string; id: string }> }
): Promise<NextResponse<ApiResponse<IPageSection>>> {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const body = (await request.json()) as unknown;
    const validated = updatePageSectionSchema.parse(body);

    const item = await PageSection.findByIdAndUpdate(id, validated, { new: true });
    
    if (!item) {
       return NextResponse.json({ success: false, message: 'Section tidak ditemukan' }, { status: 404 });
    }
    
    const itemData = item.toObject() as IPageSection;
    
    await logAction(request, session.userId, 'update', 'PageSection', itemData._id, {
      sectionType: itemData.sectionType,
      title: itemData.title,
    });

    return NextResponse.json({ success: true, data: itemData, message: 'Section CMS diperbarui' });
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
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await params;
    
    const deleted = await PageSection.findByIdAndDelete(id);
    if (!deleted) {
       return NextResponse.json({ success: false, message: 'Section tidak ditemukan' }, { status: 404 });
    }
    
    await logAction(request, session.userId, 'hard_delete', 'PageSection', id);

    return NextResponse.json({ success: true, message: 'Section CMS dihapus' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
