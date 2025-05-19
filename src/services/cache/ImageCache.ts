import { CacheService } from './CacheService';

export class ImageCache {
  private static instance: ImageCache;
  private cacheService: CacheService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  async getImage(url: string): Promise<string | null> {
    try {
      // Try to get from cache first
      const cached = await this.cacheService.get(url);
      if (cached) {
        return cached as string;
      }

      // If not in cache, fetch and cache
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);
      
      // Cache the image
      await this.cacheService.set(url, base64, blob.type);
      return base64;
    } catch (error) {
      console.warn('Image fetch error:', error);
      // Return original URL as fallback
      return url;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}