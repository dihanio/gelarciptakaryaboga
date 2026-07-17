import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { updateUserSchema } from '@/lib/validations/user';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { IUser, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<IUser>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'users', 'update')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = (await request.json()) as unknown;
    const validated = updateUserSchema.parse(body);
    const updateData: Record<string, unknown> = { ...validated };

    if (validated.password) {
      updateData.password = await bcrypt.hash(validated.password, 10);
    } else {
      delete updateData.password;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!user) {
       return NextResponse.json({ success: false, message: 'Pengguna tidak ditemukan' }, { status: 404 });
    }
    
    const userData = user.toObject() as IUser;
    
    await logAction(request, session.userId, 'update', 'User', userData._id, {
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });

    return NextResponse.json({ success: true, data: userData, message: 'Pengguna diperbarui' });
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
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'users', 'delete')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const deleted = await User.findByIdAndDelete(id);
    
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Pengguna tidak ditemukan' }, { status: 404 });
    }
    
    await logAction(request, session.userId, 'hard_delete', 'User', id);

    return NextResponse.json({ success: true, message: 'Pengguna dihapus' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
