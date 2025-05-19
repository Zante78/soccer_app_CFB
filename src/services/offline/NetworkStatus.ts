type NetworkStatusCallback = (online: boolean) => void;

export class NetworkStatus {
  private callbacks: NetworkStatusCallback[] = [];
  private online: boolean;

  constructor() {
    this.online = navigator.onLine;
    this.setupListeners();
  }

  private setupListeners() {
    window.addEventListener('online', () => {
      this.online = true;
      this.notifyCallbacks();
    });

    window.addEventListener('offline', () => {
      this.online = false;
      this.notifyCallbacks();
    });
  }

  isOnline(): boolean {
    return this.online;
  }

  onStatusChange(callback: NetworkStatusCallback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback(this.online));
  }
}