import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Participant } from '@/models/Participant';
import { createParticipantSchema } from '@/lib/validations/participant';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { IParticipant, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<IParticipant[]>>> {
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
        { name: { $regex: search, $options: 'i' } },
        { workName: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Participant.countDocuments(filter);
    const participants = await Participant.find(filter)
      .populate('booth', 'number name location')
      .sort({ order: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ 
      success: true, 
      data: participants as unknown as IParticipant[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<IParticipant>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'participants', 'create')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { eventId } = await params;
    const body = (await request.json()) as unknown;
    const validated = createParticipantSchema.parse(body);

    const participant = await Participant.create({
      ...validated,
      event: eventId,
    });

    const participantData = participant.toObject() as IParticipant;

    // Log action to audit log
    await logAction(
      request,
      session.userId,
      'create',
      'Participant',
      participantData._id,
      { name: participantData.name, workName: participantData.workName }
    );

    return NextResponse.json({
      success: true,
      data: participantData,
      message: 'Peserta berhasil ditambahkan!',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || 'Validasi gagal' },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
