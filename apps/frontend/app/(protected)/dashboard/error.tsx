"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md p-8 text-center space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Dashboard konnte nicht geladen werden
        </h2>
        <p className="text-sm text-gray-600">
          {error.message || "Ein unerwarteter Fehler ist aufgetreten."}
        </p>
        <Button
          onClick={reset}
          variant="outline"
          className="min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          Erneut versuchen
        </Button>
      </Card>
    </div>
  );
}
