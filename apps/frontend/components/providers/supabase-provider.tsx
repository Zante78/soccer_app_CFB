"use client";

import { createContext, useContext, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseContextValue = SupabaseClient;

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => createSupabaseBrowserClient());

  return <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  const context = useContext(SupabaseContext);

  if (!context) {
    throw new Error("useSupabase muss innerhalb des SupabaseProvider verwendet werden.");
  }

  return context;
}
