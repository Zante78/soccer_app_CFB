import { openDB, IDBPDatabase } from 'idb';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheDB {
  cache: {
    key: string;
    value: CacheEntry<any>;
  };
}

export class CacheManager {
  private static instance: CacheManager;
  private db: IDBPDatabase<CacheDB> | null = null;
  private readonly DB_NAME = 'app-cache';
  private readonly STORE_NAME = 'cache';
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<CacheDB>(this.DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache');
        }
      },
    });
  }

  async set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Cache not initialized');

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };

    await this.db.put(this.STORE_NAME, entry, key);
  }

  async get<T>(key: string): Promise<T | null> {
    await this.initialize();
    if (!this.db) throw new Error('Cache not initialized');

    const entry = await this.db.get(this.STORE_NAME, key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      await this.delete(key);
      return null;
    }

    return entry.data;
  }

  async delete(key: string): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Cache not initialized');

    await this.db.delete(this.STORE_NAME, key);
  }

  async clear(): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Cache not initialized');

    await this.db.clear(this.STORE_NAME);
  }

  async clearExpired(): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Cache not initialized');

    const now = Date.now();
    const keys = await this.db.getAllKeys(this.STORE_NAME);
    
    for (const key of keys) {
      const entry = await this.db.get(this.STORE_NAME, key) as CacheEntry<any>;
      if (entry.expiresAt < now) {
        await this.delete(key);
      }
    }
  }
}