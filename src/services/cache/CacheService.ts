import { openDB, IDBPDatabase } from 'idb';

interface CacheDB {
  assets: {
    key: string;
    value: {
      data: Blob | string;
      timestamp: number;
      type: string;
    };
  };
}

export class CacheService {
  private static instance: CacheService;
  private db: IDBPDatabase<CacheDB> | null = null;
  private initPromise: Promise<void> | null = null;
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  private constructor() {
    this.initPromise = this.initialize();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      this.db = await openDB<CacheDB>('asset-cache', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('assets')) {
            db.createObjectStore('assets');
          }
        },
      });
    } catch (error) {
      console.error('Cache initialization error:', error);
      this.db = null;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
    if (!this.db) {
      throw new Error('Cache not initialized');
    }
  }

  async get(key: string): Promise<Blob | string | null> {
    try {
      await this.ensureInitialized();
      if (!this.db) return null;

      const cached = await this.db.get('assets', key);
      if (!cached) return null;

      // Check if cache is expired
      if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
        await this.delete(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.warn('Cache read error:', error);
      return null;
    }
  }

  async set(key: string, data: Blob | string, type: string): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.db) return;

      await this.db.put('assets', {
        data,
        timestamp: Date.now(),
        type
      }, key);
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.db) return;

      await this.db.delete('assets', key);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.db) return;

      await this.db.clear('assets');
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }
}