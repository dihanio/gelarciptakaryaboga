import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Ticket } from '@/models/Ticket';
import { CheckInLog } from '@/models/CheckInLog';
import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit-logger';
import { checkinRateLimiter } from '@/lib/rate-limiter';
import type { IVisitor, ITicketType, ApiResponse } from '@/types';

interface CheckInRequest {
  qrCode?: string;
  ticketNumber?: string;
  method?: 'qr_scan' | 'manual';
  location?: string;
  notes?: string;
}

interface CheckInQuery {
  event: string;
  qrCode?: string;
  ticketNumber?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<Record<string, unknown>>>> {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkinRateLimiter.check(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests', retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000) } as ApiResponse<Record<string, unknown>>,
        { status: 429, headers: { 'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString() } }
      );
    }

    await connectDB();
    const { eventId } = await params;

    // Session check
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CheckInRequest;
    const { qrCode, ticketNumber, method = 'qr_scan', location = 'Gate Utama', notes } = body;

    if (!qrCode && !ticketNumber) {
      return NextResponse.json(
        { success: false, message: 'QR Code atau Nomor Tiket wajib diisi' },
        { status: 400 }
      );
    }

    // Find ticket
    const query: CheckInQuery = { event: eventId };
    if (qrCode) {
      query.qrCode = qrCode;
    } else if (ticketNumber) {
      query.ticketNumber = ticketNumber.toUpperCase();
    }

    const ticket = await Ticket.findOne(query)
      .populate('visitor', 'name email phone organization')
      .populate('ticketType', 'name price')
      .exec();

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: 'invalid', // use error for status string to match ApiResponse structure loosely or use custom field
          message: '❌ Tiket tidak ditemukan / Tidak valid untuk acara ini',
        },
        { status: 404 }
      );
    }

    // Check if already used or cancelled
    if (ticket.status === 'used') {
      // Find previous check-in log
      const lastLog = await CheckInLog.findOne({ ticket: ticket._id, status: 'success' }).sort({ checkedInAt: -1 }).lean();

      await CheckInLog.create({
        event: eventId,
        ticket: ticket._id,
        visitor: ticket.visitor._id,
        checkedInBy: session.userId,
        checkedInAt: new Date(),
        method,
        location,
        notes,
        status: 'already_used',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'already_used',
          message: `⚠️ Tiket sudah pernah digunakan check-in pada ${lastLog?.checkedInAt ? new Date(lastLog.checkedInAt).toLocaleString('id-ID') : 'sebelumnya'}`,
          data: {
            visitor: ticket.visitor as unknown as IVisitor,
            ticketNumber: ticket.ticketNumber,
          }
        },
        { status: 400 }
      );
    }

    if (ticket.status === 'cancelled' || ticket.status === 'expired') {
      await CheckInLog.create({
        event: eventId,
        ticket: ticket._id,
        visitor: ticket.visitor._id,
        checkedInBy: session.userId,
        checkedInAt: new Date(),
        method,
        location,
        notes,
        status: 'cancelled_ticket',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'invalid',
          message: `❌ Tiket berada dalam status ${ticket.status.toUpperCase()}`,
        },
        { status: 400 }
      );
    }

    // Perform successful check-in
    ticket.status = 'used';
    await ticket.save();

    const checkInLog = await CheckInLog.create({
      event: eventId,
      ticket: ticket._id,
      visitor: ticket.visitor._id,
      checkedInBy: session.userId,
      checkedInAt: new Date(),
      method,
      location,
      notes,
      status: 'success',
    });

    await logAction(request, session.userId, 'checkin', 'Ticket', ticket._id.toString(), { 
      ticketNumber: ticket.ticketNumber, 
      method, 
      location 
    });

    return NextResponse.json({
      success: true,
      message: '✅ Check-In Berhasil!',
      data: {
        ticketNumber: ticket.ticketNumber,
        visitor: ticket.visitor as unknown as IVisitor,
        ticketType: ticket.ticketType as unknown as ITicketType,
        checkedInAt: checkInLog.checkedInAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
