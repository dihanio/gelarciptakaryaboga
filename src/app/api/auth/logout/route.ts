import { NextResponse } from 'next/server';
import { removeAuthCookie, getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit-logger';
import type { ApiResponse } from '@/types';

export async function POST(request: Request): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const session = await getSession();
    
    if (session) {
      await logAction(request, session.userId, 'logout', 'User', session.userId);
    }
    
    await removeAuthCookie();
    return NextResponse.json({ success: true, message: 'Logout berhasil' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
