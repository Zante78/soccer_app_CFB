interface AuditEvent {
  type: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
  timestamp: number;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private readonly MAX_EVENTS = 1000;
  private readonly STORAGE_KEY = 'audit_log';

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: Date.now()
    };

    let events = await this.getEvents();
    events.unshift(auditEvent);
    
    // Limit the number of stored events
    if (events.length > this.MAX_EVENTS) {
      events = events.slice(0, this.MAX_EVENTS);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));

    // Optional: Send to server if online
    if (navigator.onLine) {
      try {
        await this.syncToServer(auditEvent);
      } catch (error) {
        console.warn('Failed to sync audit event:', error);
      }
    }
  }

  async getEvents(
    filter?: {
      type?: string;
      userId?: string;
      entityType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<AuditEvent[]> {
    const eventsJson = localStorage.getItem(this.STORAGE_KEY);
    let events: AuditEvent[] = eventsJson ? JSON.parse(eventsJson) : [];

    if (filter) {
      events = events.filter(event => {
        if (filter.type && event.type !== filter.type) return false;
        if (filter.userId && event.userId !== filter.userId) return false;
        if (filter.entityType && event.entityType !== filter.entityType) return false;
        if (filter.startDate && event.timestamp < filter.startDate.getTime()) return false;
        if (filter.endDate && event.timestamp > filter.endDate.getTime()) return false;
        return true;
      });
    }

    return events;
  }

  async clearEvents(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private async syncToServer(event: AuditEvent): Promise<void> {
    // Implement server sync logic here
    // This could use the Supabase client to store events in a dedicated audit table
  }
}