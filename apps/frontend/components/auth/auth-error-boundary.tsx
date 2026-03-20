"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  const { isLoading, authError } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md space-y-4 px-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mx-auto" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto" />
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Verbindungsfehler</h2>
          <p className="text-sm text-gray-700">{authError}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-2"
          >
            Erneut versuchen
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
