"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Etwas ist schiefgelaufen
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error.message || "Ein unerwarteter Fehler ist aufgetreten"}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full flex justify-center py-2 px-4 min-h-[44px] border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0055A4] hover:bg-[#003d7a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0055A4]"
          >
            Erneut versuchen
          </button>

          <a
            href="/registrations"
            className="block w-full py-2 px-4 min-h-[44px] border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0055A4]"
          >
            Zurück zur Übersicht
          </a>
        </div>
      </div>
    </div>
  );
}
