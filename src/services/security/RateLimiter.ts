/**
 * Rate Limiter Service
 * Implementiert Client-seitiges Rate Limiting
 */
export class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number = 100;
  private timeWindow: number = 60000; // 1 Minute

  private constructor() {}

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Prüft ob eine Anfrage erlaubt ist
   */
  public isAllowed(endpoint: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(endpoint) || [];
    
    // Entferne alte Timestamps
    const validTimestamps = timestamps.filter(time => now - time < this.timeWindow);
    
    if (validTimestamps.length >= this.maxRequests) {
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(endpoint, validTimestamps);
    return true;
  }

  /**
   * Führt einen Request mit Rate Limiting aus
   */
  public async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input.url;
    
    if (!this.isAllowed(url)) {
      throw new Error('Rate limit exceeded');
    }

    return fetch(input, init);
  }

  /**
   * Setzt die Rate Limit Konfiguration
   */
  public configure(maxRequests: number, timeWindowMs: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }
}