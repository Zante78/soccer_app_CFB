import { EventEmitter } from 'events';

export enum Events {
  DATA_SYNCED = 'data:synced',
  ERROR_OCCURRED = 'error:occurred',
  APP_INITIALIZED = 'app:initialized'
}

export class EventBus {
  private static instance: EventBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this.emitter.on(event, listener);
  }

  public off(event: string, listener: (...args: any[]) => void): void {
    this.emitter.off(event, listener);
  }

  public emit(event: string, ...args: any[]): void {
    this.emitter.emit(event, ...args);
  }
}