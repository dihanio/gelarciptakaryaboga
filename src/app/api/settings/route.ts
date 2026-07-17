import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { updateWebsiteSettingsSchema } from '@/lib/validations/settings';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';
import type { IWebsiteSettings, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function GET(): Promise<NextResponse<ApiResponse<IWebsiteSettings>>> {
  try {
    await connectDB();
    const settings = await WebsiteSettings.findOne().lean();
    return NextResponse.json({ success: true, data: settings as unknown as IWebsiteSettings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request): Promise<NextResponse<ApiResponse<IWebsiteSettings>>> {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'settings', 'update')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const body = (await request.json()) as unknown;
    const validated = updateWebsiteSettingsSchema.parse(body);

    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create(validated);
    } else {
      Object.assign(settings, validated);
      await settings.save();
    }
    
    const settingsData = settings.toObject() as IWebsiteSettings;
    
    await logAction(request, session.userId, 'update', 'WebsiteSettings', settingsData._id, {
      siteName: settingsData.siteName,
    });

    return NextResponse.json({ success: true, data: settingsData, message: 'Pengaturan disimpam' });
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
