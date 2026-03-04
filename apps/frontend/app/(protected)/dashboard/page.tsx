import { requireRole } from "@/lib/auth-guard";

export default async function DashboardPage() {
  // Auth Guard: Nur SUPER_ADMIN und PASSWART dürfen zugreifen
  const user = await requireRole(["SUPER_ADMIN", "PASSWART"]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Willkommen zurück, {user.full_name || user.email}!
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Placeholder Metric Cards */}
        <div className="card bg-white p-6">
          <h3 className="text-sm font-medium text-gray-600">Gesamt Registrierungen</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          <p className="text-sm text-gray-500 mt-1">Coming soon...</p>
        </div>

        <div className="card bg-white p-6">
          <h3 className="text-sm font-medium text-gray-600">Bezahlt</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          <p className="text-sm text-gray-500 mt-1">Coming soon...</p>
        </div>

        <div className="card bg-white p-6">
          <h3 className="text-sm font-medium text-gray-600">Bot Erfolgsrate</h3>
          <p className="text-3xl font-bold text-[#0055A4] mt-2">0%</p>
          <p className="text-sm text-gray-500 mt-1">Coming soon...</p>
        </div>

        <div className="card bg-white p-6">
          <h3 className="text-sm font-medium text-gray-600">Offen</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
          <p className="text-sm text-gray-500 mt-1">Coming soon...</p>
        </div>
      </section>

      <div className="card bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Phase 3.1: Auth & Layout Foundation ✅
        </h2>
        <p className="text-gray-600">
          Die Authentifizierung und das Admin-Layout sind erfolgreich eingerichtet.
          In den nächsten Phasen werden wir:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
          <li>Phase 3.2: Dashboard Metriken implementieren</li>
          <li>Phase 3.3: Registrierungen Liste mit Filtern</li>
          <li>Phase 3.4: Detailansicht mit Audit Logs</li>
          <li>Phase 3.5: Visual Diff Viewer (RPA Traces)</li>
          <li>Phase 3.6: PDF Export & Polish</li>
        </ul>
      </div>
    </div>
  );
}
