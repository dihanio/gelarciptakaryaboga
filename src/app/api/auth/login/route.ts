import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { signToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth';
import { logAction } from '@/lib/audit-logger';
import { authRateLimiter } from '@/lib/rate-limiter';
import { ZodError } from 'zod';
import type { ApiResponse } from '@/types';

export async function POST(request: Request): Promise<NextResponse<ApiResponse<Record<string, unknown>>>> {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = authRateLimiter.check(ip);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests', retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000) } as ApiResponse<Record<string, unknown>>,
        { status: 429, headers: { 'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString() } }
      );
    }

    await connectDB();

    const body = (await request.json()) as unknown;
    const validated = loginSchema.parse(body);

    // Find user with password field included
    const user = await User.findOne({ email: validated.email.toLowerCase() }).select('+password');

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah / Akun nonaktif' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(validated.password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Create JWT Token
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = await signToken(payload);
    await setAuthCookie(token);

    await logAction(request, user._id.toString(), 'login', 'User', user._id.toString(), {
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
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
