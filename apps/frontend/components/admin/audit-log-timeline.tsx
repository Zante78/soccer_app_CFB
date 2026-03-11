import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { User, FileEdit, Check, XCircle } from "lucide-react";

type AuditLogEntry = {
  id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  timestamp: string | null;
  user: {
    full_name: string | null;
    role: string;
  } | null;
};

type AuditLogTimelineProps = {
  logs: AuditLogEntry[];
};

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  created: FileEdit,
  updated: FileEdit,
  status_changed: Check,
  deleted: XCircle,
  payment_verified: Check,
};

const actionLabels: Record<string, string> = {
  created: "Erstellt",
  updated: "Aktualisiert",
  status_changed: "Status geändert",
  deleted: "Gelöscht",
  payment_verified: "Zahlung bestätigt",
  bot_executed: "Bot ausgeführt",
};

export function AuditLogTimeline({ logs }: AuditLogTimelineProps) {
  if (logs.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Änderungsverlauf
        </h3>
        <p className="text-gray-600 text-center py-8">
          Noch keine Änderungen vorhanden
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Änderungsverlauf
      </h3>
      <div className="space-y-4">
        {logs.map((log, index) => {
          const Icon = actionIcons[log.action] || User;
          const isLast = index === logs.length - 1;

          return (
            <div key={log.id} className="relative">
              {/* Timeline Line */}
              {!isLast && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
              )}

              {/* Log Entry */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 relative z-10">
                  <div className="h-8 w-8 rounded-full bg-[#0055A4] bg-opacity-10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[#0055A4]" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {actionLabels[log.action] || log.action}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {log.user?.full_name || "System"} •{" "}
                        <span className="text-gray-600">
                          {getRoleLabel(log.user?.role)}
                        </span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">
                      {log.timestamp
                        ? format(new Date(log.timestamp), "dd.MM.yyyy HH:mm", {
                            locale: de,
                          })
                        : "—"}
                    </p>
                  </div>

                  {/* Value Changes */}
                  {(log.old_value || log.new_value) && (
                    <div className="mt-2 text-xs">
                      {log.old_value && (
                        <p className="text-gray-600">
                          <span className="font-medium">Alt:</span>{" "}
                          {typeof log.old_value === 'string'
                            ? log.old_value
                            : JSON.stringify(log.old_value)}
                        </p>
                      )}
                      {log.new_value && (
                        <p className="text-gray-700">
                          <span className="font-medium">Neu:</span>{" "}
                          {typeof log.new_value === 'string'
                            ? log.new_value
                            : JSON.stringify(log.new_value)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function getRoleLabel(role: string | undefined): string {
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    PASSWART: "Passwart",
    TRAINER: "Trainer",
    ANTRAGSTELLER: "Antragsteller",
  };
  return role ? roleLabels[role] || role : "Unbekannt";
}
