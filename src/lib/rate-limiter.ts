interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Periodically clean up the store to prevent memory leaks
    setInterval(() => this.cleanup(), this.windowMs);
  }

  /**
   * Check if a given identifier (e.g., IP address) has exceeded the rate limit.
   * @param identifier - The unique identifier to track (e.g., IP).
   * @returns An object indicating success, current count, and when the limit resets.
   */
  public check(identifier: string): { success: boolean; count: number; resetAt: number } {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record) {
      const resetAt = now + this.windowMs;
      this.store.set(identifier, { count: 1, resetAt });
      return { success: true, count: 1, resetAt };
    }

    if (now > record.resetAt) {
      const resetAt = now + this.windowMs;
      this.store.set(identifier, { count: 1, resetAt });
      return { success: true, count: 1, resetAt };
    }

    record.count += 1;

    if (record.count > this.maxRequests) {
      return { success: false, count: record.count, resetAt: record.resetAt };
    }

    return { success: true, count: record.count, resetAt: record.resetAt };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

// Global instances for different routes
export const authRateLimiter = new RateLimiter(60 * 1000, 5); // 5 requests per minute for auth
export const uploadRateLimiter = new RateLimiter(60 * 1000, 10); // 10 uploads per minute
export const checkinRateLimiter = new RateLimiter(60 * 1000, 30); // 30 checkins per minute
export const publicApiRateLimiter = new RateLimiter(60 * 1000, 100); // 100 requests per minute
