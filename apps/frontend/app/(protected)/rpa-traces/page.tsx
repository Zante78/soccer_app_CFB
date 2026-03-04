import { requireRole } from "@/lib/auth-guard";

export default async function RPATracesPage() {
  await requireRole(["SUPER_ADMIN", "PASSWART"]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">RPA Visual Regression</h1>
        <p className="text-gray-600 mt-2">
          Bot-Ausführungen überwachen und Visual Diffs überprüfen
        </p>
      </header>

      <div className="card bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900">Coming Soon: Phase 3.5</h3>
        <p className="text-gray-600 mt-2">
          Visual Diff Viewer mit Side-by-Side Screenshot-Vergleich
        </p>
      </div>
    </div>
  );
}
