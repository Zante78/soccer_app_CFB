import { requireRole } from "@/lib/auth-guard";

export default async function RegistrationsPage() {
  await requireRole(["SUPER_ADMIN", "PASSWART", "TRAINER"]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Registrierungen</h1>
        <p className="text-gray-600 mt-2">Verwalte alle Spielerpass-Anträge</p>
      </header>

      <div className="card bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900">Coming Soon: Phase 3.3</h3>
        <p className="text-gray-600 mt-2">
          Registrierungen-Tabelle mit Filtern, Suche und Pagination
        </p>
      </div>
    </div>
  );
}
