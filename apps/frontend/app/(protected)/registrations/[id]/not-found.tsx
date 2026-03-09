import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-[#0055A4]">404</h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Registrierung nicht gefunden
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Die angeforderte Registrierung existiert nicht oder wurde gelöscht.
          </p>
        </div>

        <Link
          href="/registrations"
          className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0055A4] hover:bg-[#003d7a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0055A4]"
        >
          Zurück zur Übersicht
        </Link>
      </div>
    </div>
  );
}
