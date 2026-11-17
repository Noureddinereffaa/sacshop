import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis for rate limiting
// Using Upstash Redis (free tier available)
// Fallback to in-memory if no Redis URL is provided
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limit configurations for different endpoints
export const rateLimiters = {
  // General API rate limiting: 100 requests per minute
  general: redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
      })
    : null,

  // Admin auth: 5 attempts per minute
  adminAuth: redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
      })
    : null,

  // Customer endpoint: 30 requests per minute
  customer: redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
      })
    : null,

  // Order creation: 20 requests per minute per IP
  createOrder: redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(20, "1 m"),
      })
    : null,
};

// Simple in-memory rate limiter fallback (for development)
class InMemoryRatelimit {
  private store: Map<string, { count: number; resetAt: number }> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async limit(ip: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now();
    const key = `rl:${ip}`;
    
    const record = this.store.get(key);
    
    if (!record || now > record.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: Math.floor((now + this.windowMs) / 1000),
      };
    }

    if (record.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: Math.floor(record.resetAt / 1000),
      };
    }

    record.count++;
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.count,
      reset: Math.floor(record.resetAt / 1000),
    };
  }
}

// In-memory fallbacks (for development without Redis)
export const fallbackRateLimiters = {
  general: new InMemoryRatelimit(100, 60 * 1000),
  adminAuth: new InMemoryRatelimit(5, 60 * 1000),
  customer: new InMemoryRatelimit(30, 60 * 1000),
  createOrder: new InMemoryRatelimit(20, 60 * 1000),
};

// Get rate limiter (prefer Redis, fallback to in-memory)
export function getRateLimiter(type: keyof typeof rateLimiters) {
  return rateLimiters[type] || fallbackRateLimiters[type];
}

// Get client IP from request
export function getClientIP(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  const xRealIP = request.headers.get("x-real-ip");
  const ip = xForwardedFor?.split(",")[0] || xRealIP;
  return ip || "127.0.0.1";
}

// Rate limit middleware for Next.js API routes
export async function rateLimitMiddleware(
  request: Request,
  type: keyof typeof rateLimiters = "general"
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const ip = getClientIP(request);
  const limiter = getRateLimiter(type);
  const result = await limiter.limit(ip);
  return result;
}
