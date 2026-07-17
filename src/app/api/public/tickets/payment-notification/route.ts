import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TicketOrder } from '@/models/TicketOrder';
import { Ticket } from '@/models/Ticket';
import { TicketType } from '@/models/TicketType';
import { Visitor } from '@/models/Visitor';
import { Event } from '@/models/Event';
import { verifySignature } from '@/lib/midtrans';
import { sendTicketConfirmationEmail, sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/email';
import { logAction } from '@/lib/audit-logger';
import { nanoid } from 'nanoid';
import type { ApiResponse, ITicket } from '@/types';

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<Record<string, unknown>>>> {
  try {
    await connectDB();

    const payload = (await request.json()) as Record<string, unknown>;

    const orderId = String(payload.order_id || '');
    const statusCode = String(payload.status_code || '');
    const grossAmount = String(payload.gross_amount || '');
    const signatureKey = String(payload.signature_key || '');
    const transactionStatus = String(payload.transaction_status || '');
    const fraudStatus = String(payload.fraud_status || '');
    const transactionId = String(payload.transaction_id || '');

    // 1. Audit Log Webhook Received
    await logAction(request, undefined, 'webhook_received', 'MidtransNotification', orderId, {
      orderId,
      transactionStatus,
      fraudStatus,
      statusCode,
    });

    // 2. Signature Validation
    const isSignatureValid = verifySignature(orderId, statusCode, grossAmount, signatureKey);
    if (!isSignatureValid) {
      console.warn(`[Midtrans Webhook] Invalid signature key for order: ${orderId}`);
      return NextResponse.json(
        { success: false, error: 'Signature key verification failed' },
        { status: 400 }
      );
    }

    // 3. Find TicketOrder
    const order = await TicketOrder.findOne({ orderNumber: orderId });
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Ticket order not found' },
        { status: 404 }
      );
    }

    // 4. Idempotency Check: if already processed & ticket issued, return success
    const existingTicket = await Ticket.findOne({ order: order._id });
    if (order.status === 'confirmed' && existingTicket) {
      return NextResponse.json({
        success: true,
        message: 'Notification already processed. Order confirmed.',
      });
    }

    // 5. Fetch Visitor, Event, TicketType details for notifications
    const visitor = await Visitor.findById(order.visitor);
    const eventDoc = await Event.findById(order.event);

    if (transactionStatus === 'settlement' || (transactionStatus === 'capture' && fraudStatus === 'accept')) {
      // SUCCESSFUL PAYMENT PROCESSING
      order.status = 'confirmed';
      order.paymentRef = transactionId;
      order.paidAt = new Date();
      order.paymentDetails = payload;
      await order.save();

      // Create Tickets & Update Quota
      const createdTickets: ITicket[] = [];
      for (const item of order.items) {
        const ticketTypeDoc = await TicketType.findById(item.ticketType);
        if (ticketTypeDoc) {
          ticketTypeDoc.sold += item.quantity;
          await ticketTypeDoc.save();
        }

        for (let i = 0; i < item.quantity; i++) {
          const ticketNumber = `GC-${nanoid(8).toUpperCase()}`;
          const qrCodeHash = `QR-${ticketNumber}-${nanoid(6)}`;

          const ticket = await Ticket.create({
            event: order.event,
            order: order._id,
            ticketType: item.ticketType,
            visitor: order.visitor,
            ticketNumber,
            qrCode: qrCodeHash,
            status: 'active',
            issuedAt: new Date(),
          });

          createdTickets.push(ticket.toObject() as ITicket);
        }
      }

      await logAction(request, undefined, 'payment_success', 'TicketOrder', order._id.toString(), {
        orderNumber: order.orderNumber,
        transactionId,
        ticketCount: createdTickets.length,
      });

      // Send Email Notifications
      if (visitor && eventDoc && createdTickets.length > 0) {
        const primaryTicket = createdTickets[0];
        const ticketTypeDoc = await TicketType.findById(primaryTicket.ticketType);

        try {
          await sendTicketConfirmationEmail({
            visitor: {
              name: visitor.name,
              email: visitor.email,
              phone: visitor.phone,
              organization: visitor.organization,
            },
            ticket: {
              ticketNumber: primaryTicket.ticketNumber,
              qrCode: primaryTicket.qrCode,
              issuedAt: primaryTicket.issuedAt,
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
              name: ticketTypeDoc?.name || 'Tiket Eksklusif',
              price: order.totalAmount,
            },
          });

          await sendPaymentSuccessEmail({
            visitor: {
              name: visitor.name,
              email: visitor.email,
            },
            order: {
              orderNumber: order.orderNumber,
              totalAmount: order.totalAmount,
              paidAt: order.paidAt,
            },
            ticket: {
              ticketNumber: primaryTicket.ticketNumber,
            },
          });

          await logAction(request, undefined, 'email_sent', 'Ticket', primaryTicket._id?.toString(), {
            recipient: visitor.email,
            ticketNumber: primaryTicket.ticketNumber,
          });
        } catch (emailError) {
          console.error('Failed to dispatch payment success emails:', emailError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Pembayaran berhasil dikonfirmasi dan E-Ticket telah diterbitkan.',
      });
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      // FAILED / CANCELLED / EXPIRED PAYMENT
      order.status = 'cancelled';
      order.paymentDetails = payload;
      await order.save();

      await logAction(request, undefined, 'payment_failed', 'TicketOrder', order._id.toString(), {
        orderNumber: order.orderNumber,
        transactionStatus,
        fraudStatus,
      });

      if (visitor) {
        try {
          await sendPaymentFailedEmail({
            visitor: {
              name: visitor.name,
              email: visitor.email,
            },
            order: {
              orderNumber: order.orderNumber,
              totalAmount: order.totalAmount,
            },
            reason: `Status transaksi: ${transactionStatus}`,
          });
        } catch (emailError) {
          console.error('Failed to send payment failed notification email:', emailError);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Transaksi pembayaran ber-status ${transactionStatus}.`,
      });
    }

    // Pending or unhandled status
    return NextResponse.json({
      success: true,
      message: `Notification received with status: ${transactionStatus}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    console.error('Webhook notification error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
