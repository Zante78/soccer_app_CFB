"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function RPATracesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card role="alert" className="w-full max-w-md p-8 text-center space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          RPA Traces konnten nicht geladen werden
        </h2>
        <p className="text-sm text-gray-700">
          {error.message || "Ein unerwarteter Fehler ist aufgetreten."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            variant="outline"
            className="min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            Erneut versuchen
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            Zum Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
