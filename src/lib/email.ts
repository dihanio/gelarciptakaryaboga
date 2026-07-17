import nodemailer from 'nodemailer';
import { formatDate, formatCurrency } from '@/lib/utils';

export interface EmailRecipient {
  name: string;
  email: string;
}

export interface TicketEmailData {
  visitor: {
    name: string;
    email: string;
    phone: string;
    organization?: string;
  };
  ticket: {
    ticketNumber: string;
    qrCode: string;
    issuedAt: Date | string;
  };
  event: {
    name: string;
    theme?: string;
    date: Date | string;
    time: string;
    location: {
      name: string;
      address: string;
    };
  };
  ticketType: {
    name: string;
    price: number;
  };
}

export interface PaymentSuccessEmailData {
  visitor: {
    name: string;
    email: string;
  };
  order: {
    orderNumber: string;
    totalAmount: number;
    paidAt?: Date | string;
  };
  ticket: {
    ticketNumber: string;
  };
}

export interface PaymentFailedEmailData {
  visitor: {
    name: string;
    email: string;
  };
  order: {
    orderNumber: string;
    totalAmount: number;
  };
  reason?: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const portStr = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'Gelar Cipta UNESA <no-reply@gelarcipta.unesa.ac.id>';

  if (!host || !user || !pass) {
    throw new Error(
      'Konfigurasi SMTP Email (SMTP_HOST, SMTP_USER, SMTP_PASS) belum disetel di environment variables.'
    );
  }

  const port = portStr ? parseInt(portStr, 10) : 587;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return { transporter, from };
}

/**
 * Sends official E-Ticket confirmation email with QR Code pass link & event details.
 */
export async function sendTicketConfirmationEmail(data: TicketEmailData): Promise<boolean> {
  const { transporter, from } = getTransporter();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ticketViewUrl = `${baseUrl}/tiket/${data.ticket.ticketNumber}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    data.ticket.qrCode
  )}`;

  const formattedDate = formatDate(data.event.date);
  const formattedPrice = data.ticketType.price === 0 ? 'GRATIS' : formatCurrency(data.ticketType.price);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>E-Ticket Resmi ${data.event.name}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#0B0B0B; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color:#F5EBDD;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed; background-color:#0B0B0B; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color:#141414; border: 1px solid #33281E; border-radius: 8px; overflow: hidden;">
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 30px 20px; background-color: #1A100C; border-bottom: 2px solid #C8A96A;">
                  <h1 style="margin:0; font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #C8A96A; text-transform: uppercase;">
                    ${data.event.name}
                  </h1>
                  <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 3px; color: #F5EBDD; text-transform: uppercase;">
                    S1 PENDIDIKAN TATA BOGA 2023 — UNESA
                  </p>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 30px 30px 20px 30px;">
                  <p style="margin:0 0 16px 0; font-size: 14px; color: #E0D5C5;">
                    Yth. <strong>${data.visitor.name}</strong>,
                  </p>
                  <p style="margin:0 0 24px 0; font-size: 13px; line-height: 1.6; color: #A89C8C;">
                    Pendaftaran tiket pameran Anda telah resmi dikonfirmasi. Berikut adalah data E-Ticket ber-QR Code untuk akses masuk di lokasi acara:
                  </p>

                  <!-- Ticket Pass Box -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0A0A; border: 1px solid #C8A96A; margin-bottom: 24px; border-radius: 6px;">
                    <tr>
                      <td align="center" style="padding: 24px 20px;">
                        <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #C8A96A; text-transform: uppercase;">
                          PASS RESTER # ${data.ticket.ticketNumber}
                        </p>
                        <img src="${qrImageUrl}" alt="QR Code E-Ticket" width="160" height="160" style="display:block; margin:0 auto; border: 4px solid #FFFFFF; border-radius: 4px;" />
                        <p style="margin: 12px 0 0 0; font-size: 10px; color: #8C8070; letter-spacing: 1px; text-transform: uppercase;">
                          Tunjukkan QR Code ini pada meja registrasi
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Event & Visitor Meta -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 12px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 8px 0; color: #8C8070; border-bottom: 1px solid #241D17;">Kategori Tiket:</td>
                      <td align="right" style="padding: 8px 0; font-weight: bold; color: #C8A96A; border-bottom: 1px solid #241D17;">${data.ticketType.name} (${formattedPrice})</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #8C8070; border-bottom: 1px solid #241D17;">Tanggal Acara:</td>
                      <td align="right" style="padding: 8px 0; color: #F5EBDD; border-bottom: 1px solid #241D17;">${formattedDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #8C8070; border-bottom: 1px solid #241D17;">Waktu:</td>
                      <td align="right" style="padding: 8px 0; color: #F5EBDD; border-bottom: 1px solid #241D17;">${data.event.time}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #8C8070; border-bottom: 1px solid #241D17;">Lokasi:</td>
                      <td align="right" style="padding: 8px 0; color: #F5EBDD; border-bottom: 1px solid #241D17;">${data.event.location.name}, ${data.event.location.address}</td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                    <tr>
                      <td align="center">
                        <a href="${ticketViewUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #C8A96A; color: #0B0B0B; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; border-radius: 4px;">
                          Buka &amp; Simpan E-Ticket Digital
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding: 20px; background-color: #0A0A0A; border-top: 1px solid #241D17; font-size: 10px; color: #736757; line-height: 1.5;">
                  <p style="margin:0 0 4px 0; font-weight: bold; color: #8C8070;">
                    S1 PENDIDIKAN TATA BOGA 2023 — UNIVERSITAS NEGERI SURABAYA
                  </p>
                  <p style="margin:0;">
                    Email dikirimkan secara otomatis oleh sistem Gelar Cipta EMS.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from,
    to: data.visitor.email,
    subject: `E-Ticket Resmi #${data.ticket.ticketNumber} — ${data.event.name}`,
    html: htmlContent,
  });

  return true;
}

/**
 * Sends email notification upon successful Midtrans payment.
 */
export async function sendPaymentSuccessEmail(data: PaymentSuccessEmailData): Promise<boolean> {
  const { transporter, from } = getTransporter();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ticketViewUrl = `${baseUrl}/tiket/${data.ticket.ticketNumber}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head><meta charset="UTF-8"><title>Pembayaran Berhasil</title></head>
    <body style="margin:0; padding:20px; background-color:#0B0B0B; font-family:sans-serif; color:#F5EBDD;">
      <div style="max-width:550px; margin:0 auto; background:#141414; border:1px solid #C8A96A; padding:30px; border-radius:8px;">
        <h2 style="color:#C8A96A; margin-top:0;">PEMBAYARAN DITERIMA</h2>
        <p>Halo <strong>${data.visitor.name}</strong>,</p>
        <p>Pembayaran untuk order <strong>#${data.order.orderNumber}</strong> sebesar <strong>${formatCurrency(data.order.totalAmount)}</strong> telah berhasil kami terima.</p>
        <p>E-Ticket digital Anda kini telah diterbitkan dengan nomor <strong>#${data.ticket.ticketNumber}</strong>.</p>
        <div style="margin-top:24px;">
          <a href="${ticketViewUrl}" style="background:#C8A96A; color:#0B0B0B; padding:12px 24px; text-decoration:none; font-weight:bold; letter-spacing:1px; font-size:12px; display:inline-block;">LIHAT E-TICKET SEKARANG</a>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from,
    to: data.visitor.email,
    subject: `Pembayaran Berhasil #${data.order.orderNumber} — Gelar Cipta Karya Boga 2026`,
    html: htmlContent,
  });

  return true;
}

/**
 * Sends notification email when payment fails or expires.
 */
export async function sendPaymentFailedEmail(data: PaymentFailedEmailData): Promise<boolean> {
  const { transporter, from } = getTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head><meta charset="UTF-8"><title>Status Pembayaran</title></head>
    <body style="margin:0; padding:20px; background-color:#0B0B0B; font-family:sans-serif; color:#F5EBDD;">
      <div style="max-width:550px; margin:0 auto; background:#141414; border:1px solid #732626; padding:30px; border-radius:8px;">
        <h2 style="color:#E55353; margin-top:0;">PEMBAYARAN BELUM TERVERIFIKASI / KADALUARSA</h2>
        <p>Halo <strong>${data.visitor.name}</strong>,</p>
        <p>Pembayaran untuk order <strong>#${data.order.orderNumber}</strong> belum dapat diproses atau telah kadaluarsa.</p>
        ${data.reason ? `<p style="color:#A89C8C;">Keterangan: ${data.reason}</p>` : ''}
        <p>Silakan melakukan pemesanan ulang tiket melalui website Gelar Cipta Karya Boga 2026.</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from,
    to: data.visitor.email,
    subject: `Pemberitahuan Transaksi Tiket #${data.order.orderNumber} — Gelar Cipta Karya Boga 2026`,
    html: htmlContent,
  });

  return true;
}
