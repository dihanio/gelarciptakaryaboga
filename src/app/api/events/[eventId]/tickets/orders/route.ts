import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Ticket } from '@/models/Ticket';
import type { ITicket, ApiResponse } from '@/types';

interface PopulatedTicket extends Omit<ITicket, 'visitor' | 'ticketType' | 'order'> {
  visitor: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    organization?: string;
  } | null;
  ticketType: {
    _id: string;
    name: string;
    price: number;
  } | null;
  order: {
    _id: string;
    orderNumber: string;
    status: string;
    paidAt?: Date;
  } | null;
}

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<PopulatedTicket[]>>> {
  try {
    await connectDB();
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const filter: Record<string, unknown> = { event: eventId, deletedAt: null };

    const tickets = await Ticket.find(filter)
      .populate('visitor', 'name email phone organization')
      .populate('ticketType', 'name price')
      .populate('order', 'orderNumber status paidAt')
      .sort({ issuedAt: -1 })
      .lean();

    const castedTickets = tickets as unknown as PopulatedTicket[];

    const filtered = castedTickets.filter((t) => {
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        t.ticketNumber.toLowerCase().includes(term) ||
        (t.visitor?.name?.toLowerCase().includes(term) ?? false) ||
        (t.visitor?.email?.toLowerCase().includes(term) ?? false)
      );
    });

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
