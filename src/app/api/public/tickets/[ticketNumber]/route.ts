import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Ticket } from '@/models/Ticket';
import type { ITicket, ApiResponse } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticketNumber: string }> }
): Promise<NextResponse<ApiResponse<ITicket>>> {
  try {
    await connectDB();
    const { ticketNumber } = await params;

    const ticket = await Ticket.findOne({ ticketNumber: ticketNumber.toUpperCase(), deletedAt: null })
      .populate('event', 'name date time location theme logo')
      .populate('visitor', 'name email phone organization')
      .populate('ticketType', 'name price benefits')
      .populate('order', 'orderNumber status paidAt')
      .lean();

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Tiket tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket as unknown as ITicket });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
