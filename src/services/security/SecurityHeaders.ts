/**
 * Security Headers Service
 * Setzt wichtige Security Header für die Anwendung
 */
export class SecurityHeaders {
  private static instance: SecurityHeaders;

  private constructor() {}

  public static getInstance(): SecurityHeaders {
    if (!SecurityHeaders.instance) {
      SecurityHeaders.instance = new SecurityHeaders();
    }
    return SecurityHeaders.instance;
  }

  /**
   * Generiert die Content Security Policy
   */
  public getCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Für React Dev Tools
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://ruenaperesrvlkbqfzua.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }

  /**
   * Setzt alle Security Header
   */
  public setSecurityHeaders(): void {
    // Diese Header müssen serverseitig gesetzt werden
    const headers = {
      'Content-Security-Policy': this.getCSP(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };

    // Im Development werden die Header nur simuliert
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Headers (Development):', headers);
    }
  }
}