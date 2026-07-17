import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TicketOrder } from '@/models/TicketOrder';
import { Ticket } from '@/models/Ticket';
import type { ApiResponse } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
): Promise<NextResponse<ApiResponse<Record<string, unknown>>>> {
  try {
    await connectDB();

    const { orderNumber } = await params;

    const order = await TicketOrder.findOne({ orderNumber: orderNumber.toUpperCase() }).lean();
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Pesanan tiket tidak ditemukan' },
        { status: 404 }
      );
    }

    const ticket = await Ticket.findOne({ order: order._id }).lean();

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        orderStatus: order.status,
        paymentStatus: order.status === 'confirmed' ? 'settlement' : order.status,
        ticketStatus: ticket ? ticket.status : 'none',
        ticketNumber: ticket ? ticket.ticketNumber : null,
        paidAt: order.paidAt || null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
