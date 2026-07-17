import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { Event } from '@/models/Event';
import { TicketType } from '@/models/TicketType';
import { Visitor } from '@/models/Visitor';
import { TicketOrder } from '@/models/TicketOrder';
import { Ticket } from '@/models/Ticket';
import { registerTicketSchema } from '@/lib/validations/ticket';
import { publicApiRateLimiter } from '@/lib/rate-limiter';
import { nanoid } from 'nanoid';
import { createSnapTransaction } from '@/lib/midtrans';
import { sendTicketConfirmationEmail } from '@/lib/email';
import { logAction } from '@/lib/audit-logger';
import type { ITicketOrder, ITicket, ApiResponse } from '@/types';
import { ZodError } from 'zod';

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<Record<string, unknown>>>> {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = publicApiRateLimiter.check(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        } as ApiResponse<Record<string, unknown>>,
        {
          status: 429,
          headers: { 'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString() },
        }
      );
    }

    await connectDB();

    const body = (await request.json()) as unknown;
    const validated = registerTicketSchema.parse(body);

    // 1. Get active event
    const settings = await WebsiteSettings.findOne().lean();
    let eventId = settings?.activeEventId;
    let eventDoc = eventId ? await Event.findById(eventId).lean() : null;

    if (!eventDoc) {
      eventDoc = await Event.findOne({ status: 'active' }).sort({ date: -1 }).lean();
      if (!eventDoc) {
        return NextResponse.json(
          { success: false, message: 'Tidak ada acara aktif untuk pendaftaran tiket' },
          { status: 400 }
        );
      }
      eventId = eventDoc._id as string;
    }

    // 2. Verify ticket type exists & quota available
    const ticketType = await TicketType.findById(validated.ticketTypeId);
    if (!ticketType || !ticketType.isActive || ticketType.deletedAt) {
      return NextResponse.json(
        { success: false, message: 'Jenis tiket tidak valid atau tidak aktif' },
        { status: 400 }
      );
    }

    const requestedQty = validated.quantity || 1;

    if (ticketType.sold + requestedQty > ticketType.quota) {
      return NextResponse.json(
        { success: false, message: 'Kuota tiket ini telah habis' },
        { status: 400 }
      );
    }

    // 3. Find or create Visitor
    let visitor = await Visitor.findOne({ email: validated.email.toLowerCase() });
    if (!visitor) {
      visitor = await Visitor.create({
        name: validated.name,
        email: validated.email.toLowerCase(),
        phone: validated.phone,
        organization: validated.organization || '',
      });
    }

    // 4. Calculate amount & build Order Number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${nanoid(4).toUpperCase()}`;
    const unitPrice = ticketType.price || 0;
    const totalAmount = unitPrice * requestedQty;
    const isFree = totalAmount === 0;

    if (isFree) {
      // FREE TICKET FLOW: Instant Confirmation & Issue Ticket
      const order = await TicketOrder.create({
        event: eventId,
        orderNumber,
        visitor: visitor._id,
        items: [
          {
            ticketType: ticketType._id,
            quantity: requestedQty,
            unitPrice,
            subtotal: 0,
          },
        ],
        totalAmount: 0,
        status: 'confirmed',
        paymentMethod: 'free_registration',
        paidAt: new Date(),
      });

      const orderData = order.toObject() as ITicketOrder;

      // Issue Ticket
      const createdTickets: ITicket[] = [];
      for (let i = 0; i < requestedQty; i++) {
        const ticketNumber = `GC-${nanoid(8).toUpperCase()}`;
        const qrCodeHash = `QR-${ticketNumber}-${nanoid(6)}`;

        const ticket = await Ticket.create({
          event: eventId,
          order: order._id,
          ticketType: ticketType._id,
          visitor: visitor._id,
          ticketNumber,
          qrCode: qrCodeHash,
          status: 'active',
          issuedAt: new Date(),
        });

        createdTickets.push(ticket.toObject() as ITicket);
      }

      // Increment sold quota
      ticketType.sold += requestedQty;
      await ticketType.save();

      // Audit Log
      await logAction(request, undefined, 'ticket_registered_free', 'TicketOrder', order._id.toString(), {
        orderNumber,
        visitorEmail: visitor.email,
        ticketNumber: createdTickets[0].ticketNumber,
      });

      // Send E-Ticket email
      try {
        await sendTicketConfirmationEmail({
          visitor: {
            name: visitor.name,
            email: visitor.email,
            phone: visitor.phone,
            organization: visitor.organization,
          },
          ticket: {
            ticketNumber: createdTickets[0].ticketNumber,
            qrCode: createdTickets[0].qrCode,
            issuedAt: createdTickets[0].issuedAt,
          },
          event: {
            name: eventDoc.name,
            theme: eventDoc.theme,
            date: eventDoc.date,
            time: eventDoc.time,
            location: {
              name: eventDoc.location.name,
              address: eventDoc.location.address,
            },
          },
          ticketType: {
            name: ticketType.name,
            price: 0,
          },
        });
        await logAction(request, undefined, 'email_sent', 'Ticket', createdTickets[0]._id?.toString(), {
          recipient: visitor.email,
          ticketNumber: createdTickets[0].ticketNumber,
        });
      } catch (emailErr) {
        console.error('Failed sending free ticket confirmation email:', emailErr);
      }

      return NextResponse.json({
        success: true,
        data: {
          isFree: true,
          orderNumber: orderData.orderNumber,
          ticketNumber: createdTickets[0].ticketNumber,
        },
        message: 'Pendaftaran tiket gratis berhasil!',
      });
    }

    // PAID TICKET FLOW: Midtrans Snap Transaction Setup
    const snapRes = await createSnapTransaction({
      orderNumber,
      grossAmount: totalAmount,
      customerDetails: {
        first_name: visitor.name,
        email: visitor.email,
        phone: visitor.phone,
      },
      itemDetails: [
        {
          id: ticketType._id.toString(),
          price: unitPrice,
          quantity: requestedQty,
          name: `${ticketType.name} - ${eventDoc.name}`,
        },
      ],
    });

    const order = await TicketOrder.create({
      event: eventId,
      orderNumber,
      visitor: visitor._id,
      items: [
        {
          ticketType: ticketType._id,
          quantity: requestedQty,
          unitPrice,
          subtotal: totalAmount,
        },
      ],
      totalAmount,
      status: 'pending',
      paymentMethod: 'midtrans_snap',
      snapToken: snapRes.token,
      snapRedirectUrl: snapRes.redirect_url,
    });

    await logAction(request, undefined, 'payment_created', 'TicketOrder', order._id.toString(), {
      orderNumber,
      visitorEmail: visitor.email,
      totalAmount,
      snapToken: snapRes.token,
    });

    return NextResponse.json({
      success: true,
      data: {
        isFree: false,
        orderNumber,
        snapToken: snapRes.token,
        redirectUrl: snapRes.redirect_url,
      },
      message: 'Transaksi dibuat, silakan selesaikan pembayaran.',
    });
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
