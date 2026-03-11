"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { User } from "@supabase/supabase-js";
import type { RoleType } from "@/lib/auth-types";

const SESSION_TIMEOUT_MS = 10_000;

export type UserProfile = {
  id: string;
  email: string;
  role: RoleType;
  full_name: string | null;
  team_id: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  authError: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Zeitüberschreitung: Server nicht erreichbar.")), ms)
    ),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      try {
        const { data: { session }, error } = await withTimeout(
          supabase.auth.getSession(),
          SESSION_TIMEOUT_MS
        );

        if (cancelled) return;

        if (error) {
          console.error("Session-Fehler:", error);
          setAuthError("Verbindung zum Server fehlgeschlagen. Bitte später erneut versuchen.");
          setIsLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Session-Init-Fehler:", err);
        setAuthError("Verbindung zum Server fehlgeschlagen. Bitte später erneut versuchen.");
        setIsLoading(false);
      }
    }

    initSession();

    // Auth State Changes abonnieren
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthError(null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from("users")
          .select("id, email, role, full_name, team_id")
          .eq("id", userId)
          .maybeSingle(),
        SESSION_TIMEOUT_MS
      );

      if (error) {
        console.error("Profil-Ladefehler:", error);
        setProfile(null);
      } else if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          role: data.role as RoleType,
          full_name: data.full_name,
          team_id: data.team_id,
        });
      }
    } catch (error) {
      console.error("Profil-Ladefehler:", error);
      setProfile(null);
      setAuthError("Verbindung zum Server fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
