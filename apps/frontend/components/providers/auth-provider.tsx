"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { User } from "@supabase/supabase-js";
import { RoleType } from "@/config/roles";

type UserProfile = {
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
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial Session abrufen
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Auth State Changes abonnieren
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, role, full_name, team_id")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error loading user profile:", error);
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
      console.error("Error loading user profile:", error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, isLoading }}>
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
