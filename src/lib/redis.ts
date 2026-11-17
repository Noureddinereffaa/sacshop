import { Redis } from "@upstash/redis";

// Initialize Redis client
// Using Upstash Redis (free tier: 10,000 commands/day)
let redisClient: Redis | null = null;

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (url && token) {
    return new Redis({
      url: url,
      token: token,
    });
  }
  return null;
}

// Initialize client
try {
  redisClient = createRedisClient();
  
  // Test connection
  if (redisClient) {
    redisClient.ping().catch(() => {
      console.warn("[Redis] Connection failed, falling back to in-memory cache");
      redisClient = null;
    });
  }
} catch (error) {
  console.warn("[Redis] Initialization failed:", error);
  redisClient = null;
}

// In-memory cache fallback
export class InMemoryCache {
  private store: Map<string, { value: any; expiresAt: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  async get(key: string): Promise<any> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async flush(): Promise<void> {
    this.store.clear();
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Create in-memory cache instance
const inMemoryCache = new InMemoryCache();

// Cache wrapper that uses Redis if available, otherwise falls back to in-memory
export class Cache {
  private prefix: string;

  constructor(prefix: string = "sacshop") {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get(key: string): Promise<any> {
    if (redisClient) {
      try {
        const value = await redisClient.get<string>(this.getKey(key));
        return value != null ? JSON.parse(value) : null;
      } catch (error) {
        console.error("[Redis] Get error:", error);
        return inMemoryCache.get(this.getKey(key));
      }
    }
    return inMemoryCache.get(this.getKey(key));
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    const cacheKey = this.getKey(key);
    const cacheValue = JSON.stringify(value);
    
    if (redisClient) {
      try {
        await redisClient.set(cacheKey, cacheValue, { ex: ttl });
      } catch (error) {
        console.error("[Redis] Set error:", error);
        await inMemoryCache.set(cacheKey, value, ttl);
      }
    } else {
      await inMemoryCache.set(cacheKey, value, ttl);
    }
  }

  async delete(key: string): Promise<void> {
    const cacheKey = this.getKey(key);
    if (redisClient) {
      try {
        await redisClient.del(cacheKey);
      } catch (error) {
        console.error("[Redis] Delete error:", error);
        await inMemoryCache.delete(cacheKey);
      }
    } else {
      await inMemoryCache.delete(cacheKey);
    }
  }

  async flush(): Promise<void> {
    // Note: Can't flush all Redis keys with prefix without scanning
    // For now, just flush in-memory cache
    await inMemoryCache.flush();
  }

  // Get raw Redis client for advanced operations
  getRawClient(): Redis | null {
    return redisClient;
  }
}

// Export cache instances for different purposes
export const cache = new Cache("sacshop");
export const productsCache = new Cache("products");
export const ordersCache = new Cache("orders");
export const customersCache = new Cache("customers");
export const settingsCache = new Cache("settings");

// Export Redis client for direct access
export { redisClient };

// Graceful shutdown
process.on("SIGTERM", () => {
  inMemoryCache.destroy();
});
