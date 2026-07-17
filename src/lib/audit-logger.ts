import { AuditLog } from '@/models/AuditLog';
import { connectDB } from '@/lib/db';

export async function logAction(
  request: Request | null,
  userId: string | undefined,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await connectDB();

    let ip = 'unknown';
    let userAgent = 'unknown';

    if (request) {
      // Parse IP from headers
      const xForwardedFor = request.headers.get('x-forwarded-for');
      if (xForwardedFor) {
        ip = xForwardedFor.split(',')[0].trim();
      } else {
        ip = request.headers.get('x-real-ip') || '127.0.0.1';
      }
      // Parse User-Agent
      userAgent = request.headers.get('user-agent') || 'unknown';
    }

    await AuditLog.create({
      user: userId,
      action,
      resource,
      resourceId,
      metadata,
      ip,
      userAgent,
    });
  } catch (_error) {
    // Fail silently in production, or log to process error stream.
    // Avoid throwing to not interrupt the primary HTTP response flow.
  }
}
