import { SecurityService } from './security/SecurityService';
import { ServiceWorkerManager } from './ServiceWorkerManager';
import { CacheService } from './cache/CacheService';
import { EventBus } from './events/EventBus';

export class AppInitializer {
  private static instance: AppInitializer;
  private securityService: SecurityService;
  private serviceWorkerManager: ServiceWorkerManager;
  private cacheService: CacheService;
  private eventBus: EventBus;

  private constructor() {
    this.securityService = SecurityService.getInstance();
    this.serviceWorkerManager = ServiceWorkerManager.getInstance();
    this.cacheService = CacheService.getInstance();
    this.eventBus = EventBus.getInstance();
  }

  public static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer();
    }
    return AppInitializer.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Initialisiere Security Features
      this.securityService.initialize();

      // Initialisiere Cache
      await this.cacheService.initialize();

      // Registriere Service Worker
      await this.serviceWorkerManager.register();

      // Emittiere Event für erfolgreiche Initialisierung
      this.eventBus.emit('app:initialized');
    } catch (error) {
      console.error('Fehler bei der Initialisierung:', error);
      throw error;
    }
  }
}