"use client";

import { PropsWithChildren } from "react";

import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProviderWrapper>
      <SupabaseProvider>
        <AuthProvider>{children}</AuthProvider>
      </SupabaseProvider>
    </QueryClientProviderWrapper>
  );
}
