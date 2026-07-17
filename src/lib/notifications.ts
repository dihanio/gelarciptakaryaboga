export interface NotificationPayload {
  to: string;
  subject?: string;
  message: string;
  type: 'email' | 'whatsapp' | 'push';
  data?: Record<string, unknown>;
}

export class NotificationService {
  /**
   * Send an email notification (mock implementation for future integration)
   */
  static async sendEmail(payload: NotificationPayload): Promise<boolean> {
    console.log(`[EMAIL] Sending to ${payload.to}`);
    console.log(`[EMAIL] Subject: ${payload.subject}`);
    console.log(`[EMAIL] Body: ${payload.message}`);
    // TODO: Integrate with Resend / SendGrid / Nodemailer
    return true;
  }

  /**
   * Send an E-Ticket email with QR Code
   */
  static async sendTicketEmail(to: string, ticketNumber: string, qrCode: string, eventName: string): Promise<boolean> {
    const htmlBody = `
      <h1>E-Ticket Anda untuk ${eventName}</h1>
      <p>Nomor Tiket: <strong>${ticketNumber}</strong></p>
      <p>Tunjukkan QR Code ini pada saat masuk.</p>
      <img src="${qrCode}" alt="QR Code Ticket" />
    `;

    return this.sendEmail({
      to,
      subject: `E-Ticket: ${eventName}`,
      message: htmlBody,
      type: 'email',
    });
  }

  /**
   * Send a WhatsApp message (future placeholder)
   */
  static async sendWhatsApp(payload: NotificationPayload): Promise<boolean> {
    console.log(`[WHATSAPP] Sending to ${payload.to}`);
    console.log(`[WHATSAPP] Message: ${payload.message}`);
    // TODO: Integrate with WhatsApp Business API / Twilio
    return true;
  }

  /**
   * Send a generic notification based on type
   */
  static async send(payload: NotificationPayload): Promise<boolean> {
    try {
      switch (payload.type) {
        case 'email':
          return await this.sendEmail(payload);
        case 'whatsapp':
          return await this.sendWhatsApp(payload);
        case 'push':
          console.log(`[PUSH] To: ${payload.to}, Message: ${payload.message}`);
          return true;
        default:
          console.warn(`Unknown notification type: ${payload.type}`);
          return false;
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }
}
