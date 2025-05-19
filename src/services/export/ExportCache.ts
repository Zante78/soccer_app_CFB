import { ExportMetricsCollector } from '../monitoring/ExportMetrics';

interface CacheEntry {
  data: Blob;
  timestamp: number;
  size: number;
}

export class ExportCache {
  private static instance: ExportCache;
  private cache: Map<string, CacheEntry> = new Map();
  private metrics: ExportMetricsCollector;
  
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly MAX_ENTRY_AGE = 30 * 60 * 1000; // 30 Minuten
  private currentSize = 0;

  private constructor() {
    this.metrics = ExportMetricsCollector.getInstance();
    setInterval(() => this.cleanup(), 60 * 1000); // Cleanup jede Minute
  }

  public static getInstance(): ExportCache {
    if (!ExportCache.instance) {
      ExportCache.instance = new ExportCache();
    }
    return ExportCache.instance;
  }

  async get(key: string): Promise<Blob | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.recordCacheMiss();
      return null;
    }

    if (Date.now() - entry.timestamp > this.MAX_ENTRY_AGE) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
      this.metrics.recordCacheMiss();
      return null;
    }

    this.metrics.recordCacheHit();
    return entry.data;
  }

  async set(key: string, data: Blob): Promise<void> {
    const size = data.size;

    // Prüfe ob neuer Eintrag in Cache passt
    while (this.currentSize + size > this.MAX_CACHE_SIZE && this.cache.size > 0) {
      this.evictOldest();
    }

    // Wenn Eintrag zu groß ist, nicht cachen
    if (size > this.MAX_CACHE_SIZE) {
      return;
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      size
    };

    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!;
      this.currentSize -= oldEntry.size;
    }

    this.cache.set(key, entry);
    this.currentSize += size;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey)!;
      this.cache.delete(oldestKey);
      this.currentSize -= entry.size;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.MAX_ENTRY_AGE) {
        this.cache.delete(key);
        this.currentSize -= entry.size;
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  getStats() {
    return {
      entries: this.cache.size,
      totalSize: this.currentSize,
      maxSize: this.MAX_CACHE_SIZE,
      utilization: this.currentSize / this.MAX_CACHE_SIZE
    };
  }
}