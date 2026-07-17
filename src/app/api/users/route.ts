import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { createUserSchema } from '@/lib/validations/user';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import { ZodError } from 'zod';
import type { IUser, ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<IUser[]>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'users', 'read')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: users as unknown as IUser[] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<IUser>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'users', 'create')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const body = (await request.json()) as unknown;
    const validated = createUserSchema.parse(body);

    const existing = await User.findOne({ email: validated.email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const user = await User.create({
      ...validated,
      email: validated.email.toLowerCase(),
      password: hashedPassword,
    });
    
    const userData = user.toObject() as IUser;
    
    await logAction(request, session.userId, 'create', 'User', userData._id, {
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });

    return NextResponse.json({ success: true, data: userData, message: 'Pengguna baru dibuat' });
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
