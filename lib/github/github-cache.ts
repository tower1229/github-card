import { createClient } from "@vercel/edge-config";

// Create Edge Config client
const edgeConfig = process.env.EDGE_CONFIG
  ? createClient(process.env.EDGE_CONFIG)
  : null;

// Cache metrics class for tracking performance
export class CacheMetrics {
  hits = 0;
  misses = 0;
  items = 0;

  hitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.items = 0;
  }
}

// Create global metrics instance
export const githubCacheMetrics = new CacheMetrics();

// Memory cache implementation
interface CacheItem<T> {
  value: T;
  expiry: number;
  lastAccessed: number;
}

export class MemoryCacheManager {
  private cache: Map<string, CacheItem<unknown>> = new Map();
  private maxItems: number;

  constructor(maxItems = 1000) {
    this.maxItems = maxItems;
  }

  set<T>(key: string, value: T, ttl: number): void {
    // Check if cache is full
    if (this.cache.size >= this.maxItems && !this.cache.has(key)) {
      this.evictLRU();
    }

    const expiry = Date.now() + ttl;
    this.cache.set(key, {
      value,
      expiry,
      lastAccessed: Date.now(),
    });

    githubCacheMetrics.items = this.cache.size;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      githubCacheMetrics.misses += 1;
      return null;
    }

    // Check if expired
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      githubCacheMetrics.misses += 1;
      githubCacheMetrics.items = this.cache.size;
      return null;
    }

    // Update last access time
    item.lastAccessed = Date.now();
    githubCacheMetrics.hits += 1;
    return item.value as T;
  }

  // Clear expired items
  cleanup(): number {
    const now = Date.now();
    let deleted = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.expiry < now) {
        this.cache.delete(key);
        deleted += 1;
      }
    }

    githubCacheMetrics.items = this.cache.size;
    return deleted;
  }

  // LRU eviction strategy
  private evictLRU(): void {
    let oldest: [string, CacheItem<unknown>] | null = null;

    for (const entry of this.cache.entries()) {
      if (!oldest || entry[1].lastAccessed < oldest[1].lastAccessed) {
        oldest = entry;
      }
    }

    if (oldest) {
      this.cache.delete(oldest[0]);
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      hitRate: githubCacheMetrics.hitRate(),
      hits: githubCacheMetrics.hits,
      misses: githubCacheMetrics.misses,
    };
  }
}

// Create global memory cache instance
export const memoryCache = new MemoryCacheManager();

// Main cache manager that abstracts Edge Config and memory cache
export class CacheManager {
  private prefix: string;
  private useMemoryCache: boolean;

  constructor(prefix = "github-cache:") {
    this.prefix = prefix;
    this.useMemoryCache = !edgeConfig;

    if (this.useMemoryCache) {
      console.log(
        "Edge Config not available, using memory cache for GitHub data"
      );
    }
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const fullKey = this.prefix + key;

    if (this.useMemoryCache) {
      // Use memory cache as fallback
      memoryCache.set(fullKey, value, ttl);
      return;
    }

    try {
      if (!edgeConfig) {
        return;
      }

      // Set cache value in Edge Config
      await edgeConfig.set(fullKey, {
        value,
        expiry: Date.now() + ttl,
      });
      console.log(`Cache set in Edge Config: ${fullKey}`);
    } catch (error) {
      console.error("Edge Config set error:", error);
      // Fallback to memory cache on error
      memoryCache.set(fullKey, value, ttl);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.prefix + key;

    if (this.useMemoryCache) {
      // Use memory cache as fallback
      return memoryCache.get<T>(fullKey);
    }

    try {
      if (!edgeConfig) {
        return null;
      }

      const cacheItem = await edgeConfig.get(fullKey);

      if (!cacheItem) {
        githubCacheMetrics.misses += 1;
        return null;
      }

      // Check if expired
      const item = cacheItem as { value: T; expiry: number };
      if (item.expiry < Date.now()) {
        // Try to delete expired item
        try {
          await edgeConfig.delete(fullKey);
        } catch {
          // Ignore deletion errors
        }
        githubCacheMetrics.misses += 1;
        return null;
      }

      githubCacheMetrics.hits += 1;
      return item.value;
    } catch (error) {
      console.error("Edge Config get error:", error);
      // Try memory cache as fallback
      return memoryCache.get<T>(fullKey);
    }
  }

  // Clean up expired items
  async cleanup(): Promise<void> {
    // Always clean memory cache
    const memoryDeleted = memoryCache.cleanup();
    if (memoryDeleted > 0) {
      console.log(
        `Cleaned up ${memoryDeleted} expired items from memory cache`
      );
    }

    if (this.useMemoryCache) {
      return;
    }

    try {
      if (!edgeConfig) {
        return;
      }

      // Get all keys from Edge Config
      const items = await edgeConfig.getAll();
      const now = Date.now();
      const expiredKeys = [];

      // Find all expired keys
      for (const [key, value] of Object.entries(items)) {
        if (key.startsWith(this.prefix)) {
          const item = value as { expiry?: number };
          if (item.expiry && item.expiry < now) {
            expiredKeys.push(key);
          }
        }
      }

      // Delete expired items
      if (expiredKeys.length > 0) {
        for (const key of expiredKeys) {
          await edgeConfig.delete(key);
        }
        console.log(
          `Cleaned up ${expiredKeys.length} expired items from Edge Config`
        );
      }
    } catch (error) {
      console.error("Edge Config cleanup error:", error);
    }
  }
}

// Create cache manager instance
export const githubCacheManager = new CacheManager();
