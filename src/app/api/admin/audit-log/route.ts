import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AuditLog } from '@/models/AuditLog';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'settings', 'read')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || '';
    const resource = searchParams.get('resource') || '';
    const user = searchParams.get('user') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    interface FilterQuery {
      'metadata.summary'?: { $regex: string; $options: string };
      action?: string;
      resource?: string;
      user?: string;
      createdAt?: { $gte?: Date; $lte?: Date };
    }
    const filter: FilterQuery = {};

    if (search) {
      filter['metadata.summary'] = { $regex: search, $options: 'i' };
    }
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (user) filter.user = user;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email role')
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
