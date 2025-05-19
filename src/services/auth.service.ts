import { supabase } from './database';
import { User } from '../types/core/user';

export class AuthService {
  private static instance: AuthService;
  private sessionCheckTimeout = 10000; // 10 Sekunden
  private refreshInterval: NodeJS.Timeout | null = null;
  private sessionChangeHandler: ((session: boolean) => void) | null = null;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  
  private constructor() {
    this.setupAuthListener();
    this.startSessionRefresh();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private setupAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (this.sessionChangeHandler) {
        this.sessionChangeHandler(!!session);
      }

      if (event === 'SIGNED_OUT') {
        this.stopSessionRefresh();
      } else if (event === 'SIGNED_IN') {
        this.startSessionRefresh();
      }
    });
  }

  onSessionChange(handler: (session: boolean) => void) {
    this.sessionChangeHandler = handler;
  }

  private startSessionRefresh() {
    this.stopSessionRefresh(); // Clear any existing interval first

    // Refresh session every 4 minutes
    this.refreshInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.auth.refreshSession();
        }
      } catch (error) {
        console.warn('Session refresh failed:', error);
      }
    }, 4 * 60 * 1000);
  }

  private stopSessionRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async getCurrentSession() {
    try {
      this.retryCount = 0; // Reset retry count
      
      // First try to get from localStorage
      const storedSession = localStorage.getItem('supabase.auth.token');
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          if (parsed?.currentSession?.access_token) {
            return parsed.currentSession;
          }
        } catch (e) {
          console.warn('Failed to parse stored session:', e);
        }
      }

      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Session check timed out'));
        }, this.sessionCheckTimeout);
      });

      const sessionPromise = supabase.auth.getSession();
      
      try {
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as Awaited<ReturnType<typeof supabase.auth.getSession>>;

        if (error) throw error;
        
        if (session?.expires_at && new Date(session.expires_at * 1000) < new Date()) {
          const { data: { session: newSession } } = await supabase.auth.refreshSession();
          return newSession;
        }

        return session;
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    } catch (error) {
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
        return this.getCurrentSession();
      }
      console.error('Session check error:', error);
      return null;
    }
  }

  async signIn(email: string, password: string) {
    try {
      this.retryCount = 0; // Reset retry count
      
      if (!email || !password) {
        throw new Error('Bitte geben Sie Email und Passwort ein');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email oder Passwort ist falsch');
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') && this.retryCount < this.MAX_RETRIES) {
          this.retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
          return this.signIn(email, password);
        }
      }
      console.error('Sign in error:', error);
      throw error instanceof Error ? error : new Error('Anmeldung fehlgeschlagen');
    }
  }

  async signOut() {
    try {
      this.stopSessionRefresh();
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  destroy() {
    this.stopSessionRefresh();
    this.sessionChangeHandler = null;
  }
}