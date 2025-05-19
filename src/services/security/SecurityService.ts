import { CSRFProtection } from './CSRFProtection';
import { RateLimiter } from './RateLimiter';
import { SecurityHeaders } from './SecurityHeaders';

export class SecurityService {
  private static instance: SecurityService;
  private csrfProtection: CSRFProtection;
  private rateLimiter: RateLimiter;
  private securityHeaders: SecurityHeaders;

  private constructor() {
    this.csrfProtection = CSRFProtection.getInstance();
    this.rateLimiter = RateLimiter.getInstance();
    this.securityHeaders = SecurityHeaders.getInstance();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  public initialize(): void {
    // Setze Security Header
    this.securityHeaders.setSecurityHeaders();
  }

  public async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    // Im Development Mode einfach den normalen fetch durchführen
    if (process.env.NODE_ENV === 'development') {
      return fetch(input, init);
    }

    try {
      // Rate Limiting Check
      if (!this.rateLimiter.isAllowed(typeof input === 'string' ? input : input.url)) {
        throw new Error('Zu viele Anfragen. Bitte warten Sie einen Moment.');
      }

      // CSRF Protection
      return await this.csrfProtection.fetch(input, init);
    } catch (error) {
      console.error('Security error:', error);
      throw error;
    }
  }
}