import { useState, useCallback } from 'react';
import { AuthService } from '../services/auth.service';
import { User } from '../types/core/user';

const authService = new AuthService();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!email || !password) {
        throw new Error('Bitte geben Sie Email und Passwort ein');
      }

      const { user } = await authService.signIn(email, password);
      setUser(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen';
      setError(message);
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!email || !password) {
        throw new Error('Bitte geben Sie Email und Passwort ein');
      }

      if (password.length < 6) {
        throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein');
      }

      const { user } = await authService.signUp(email, password);
      setUser(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registrierung fehlgeschlagen';
      setError(message);
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Abmeldung fehlgeschlagen';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut
  };
}