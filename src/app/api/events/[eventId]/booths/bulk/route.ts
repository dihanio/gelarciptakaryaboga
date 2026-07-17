import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Booth } from '@/models/Booth';
import { getSession } from '@/lib/auth';
import { checkPermission } from '@/lib/rbac';
import { logAction } from '@/lib/audit-logger';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !checkPermission(session.role, 'booths', 'create')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { eventId } = await params;
    const body = await request.json();
    const { action, data, ids, status } = body;

    if (action === 'import') {
      if (!Array.isArray(data) || data.length === 0) {
        return NextResponse.json({ success: false, message: 'Data kosong' }, { status: 400 });
      }

      const boothsToInsert = data.map((item) => ({
        event: eventId,
        number: item.number,
        name: item.name || '',
        location: item.location || '',
        category: item.category || '',
        status: item.status || 'available',
      }));

      const result = await Booth.insertMany(boothsToInsert);

      await logAction(request, session.userId, 'import', 'Booth', undefined, {
        count: result.length,
      });

      return NextResponse.json({
        success: true,
        message: `${result.length} booth berhasil diimpor`,
      });
    }
    
    if (action === 'delete') {
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ success: false, message: 'Tidak ada ID yang dipilih' }, { status: 400 });
      }

      const result = await Booth.updateMany(
        { _id: { $in: ids }, event: eventId },
        { $set: { deletedAt: new Date() } }
      );

      await logAction(request, session.userId, 'delete', 'Booth', undefined, {
        ids,
        count: result.modifiedCount,
        bulk: true,
      });

      return NextResponse.json({
        success: true,
        message: `${result.modifiedCount} booth berhasil dihapus`,
      });
    }

    if (action === 'updateStatus') {
      if (!Array.isArray(ids) || ids.length === 0 || !status) {
        return NextResponse.json({ success: false, message: 'Data tidak lengkap' }, { status: 400 });
      }

      const result = await Booth.updateMany(
        { _id: { $in: ids }, event: eventId },
        { $set: { status } }
      );

      await logAction(request, session.userId, 'update', 'Booth', undefined, {
        ids,
        status,
        count: result.modifiedCount,
        bulk: true,
      });

      return NextResponse.json({
        success: true,
        message: `${result.modifiedCount} booth berhasil diperbarui ke status ${status}`,
      });
    }

    return NextResponse.json({ success: false, message: 'Aksi tidak valid' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memproses bulk action';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
