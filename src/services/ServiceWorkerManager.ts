import { Workbox } from 'workbox-window';

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private wb: Workbox | null = null;

  private constructor() {}

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  async register() {
    if ('serviceWorker' in navigator) {
      try {
        this.wb = new Workbox('/service-worker.js');

        // Event Listener für Updates
        this.wb.addEventListener('waiting', () => {
          // Zeige Update-Dialog
          if (confirm('Neue Version verfügbar. Jetzt aktualisieren?')) {
            this.wb?.messageSkipWaiting();
            window.location.reload();
          }
        });

        // Event Listener für Offline/Online Status
        this.wb.addEventListener('activated', () => {
          // Prüfe Netzwerkstatus
          if (!navigator.onLine) {
            console.log('Offline-Modus aktiv');
          }
        });

        // Registriere Service Worker
        await this.wb.register();
        console.log('Service Worker erfolgreich registriert');
      } catch (error) {
        console.error('Service Worker Registrierungsfehler:', error);
      }
    }
  }

  async unregister() {
    if (this.wb) {
      try {
        await this.wb.unregister();
        console.log('Service Worker erfolgreich deregistriert');
      } catch (error) {
        console.error('Service Worker Deregistrierungsfehler:', error);
      }
    }
  }
}