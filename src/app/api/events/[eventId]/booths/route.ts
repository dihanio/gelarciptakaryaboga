import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Booth } from '@/models/Booth';
import { createBoothSchema } from '@/lib/validations/booth';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { IBooth, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<IBooth[]>>> {
  try {
    await connectDB();
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { event: eventId, deletedAt: null };
    if (search) {
      filter.$or = [
        { number: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Booth.countDocuments(filter);
    const booths = await Booth.find(filter)
      .sort({ order: 1, number: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    return NextResponse.json({ 
      success: true, 
      data: booths as unknown as IBooth[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<IBooth>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'booths', 'create')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { eventId } = await params;
    const body = (await request.json()) as unknown;
    const validated = createBoothSchema.parse(body);

    const booth = await Booth.create({ ...validated, event: eventId });
    const boothData = booth.toObject() as IBooth;

    await logAction(request, session.userId, 'create', 'Booth', boothData._id, {
      number: boothData.number,
      name: boothData.name,
    });

    return NextResponse.json({ success: true, data: boothData, message: 'Booth berhasil dibuat' });
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
