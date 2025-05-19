/**
 * CSRF Protection Service
 * Implementiert Double Submit Cookie Pattern
 */
export class CSRFProtection {
  private static instance: CSRFProtection;
  private tokenName = 'XSRF-TOKEN';
  private headerName = 'X-XSRF-TOKEN';

  private constructor() {}

  public static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  /**
   * Generiert ein neues CSRF Token
   */
  private generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Setzt das CSRF Token als Cookie
   */
  public setToken(): string {
    const token = this.generateToken();
    document.cookie = `${this.tokenName}=${token}; path=/; SameSite=Strict`;
    return token;
  }

  /**
   * Holt das aktuelle CSRF Token aus dem Cookie
   */
  public getToken(): string | null {
    const match = document.cookie.match(new RegExp(`(^| )${this.tokenName}=([^;]+)`));
    return match ? match[2] : null;
  }

  /**
   * Fügt das CSRF Token zu einem Fetch Request hinzu
   */
  public async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const token = this.getToken() || this.setToken();
    
    const headers = new Headers(init?.headers || {});
    headers.set(this.headerName, token);

    return fetch(input, {
      ...init,
      headers,
      credentials: 'include'
    });
  }
}