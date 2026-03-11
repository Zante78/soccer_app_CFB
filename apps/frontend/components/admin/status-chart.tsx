import { Card } from "@/components/ui/card";
import type { RegistrationStatus } from "@packages/shared-types";

type StatusChartProps = {
  data: Record<RegistrationStatus, number>;
};

const statusConfig: Record<
  RegistrationStatus,
  { label: string; color: string; bgColor: string }
> = {
  DRAFT: { label: "Entwurf", color: "text-gray-700", bgColor: "bg-gray-100" },
  SUBMITTED: { label: "Eingereicht", color: "text-blue-700", bgColor: "bg-blue-100" },
  VALIDATION_PENDING: {
    label: "Validierung",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  READY_FOR_BOT: {
    label: "Bereit für Bot",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  BOT_IN_PROGRESS: {
    label: "Bot läuft",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
  },
  COMPLETED: {
    label: "Abgeschlossen",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  ERROR: { label: "Fehler", color: "text-red-700", bgColor: "bg-red-100" },
  MANUALLY_PROCESSED: {
    label: "Manuell",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  VISUAL_REGRESSION_ERROR: {
    label: "Visual Regression",
    color: "text-pink-700",
    bgColor: "bg-pink-100",
  },
};

export function StatusChart({ data }: StatusChartProps) {
  const entries = Object.entries(data)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Status Verteilung
        </h3>
        <p className="text-gray-600 text-center py-8">
          Noch keine Registrierungen vorhanden
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Status Verteilung
      </h3>
      <div className="space-y-3">
        {entries.map(([status, count]) => {
          const config = statusConfig[status as RegistrationStatus];
          const percentage = Math.round((count / total) * 100);

          return (
            <div key={status} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {config.label}
                </span>
                <span className="text-gray-600">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`${config.bgColor} h-2 rounded-full transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
