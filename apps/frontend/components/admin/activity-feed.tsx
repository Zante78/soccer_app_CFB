import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

type AuditLogEntry = {
  id: string;
  action: string;
  timestamp: string;
  user_name: string | null;
  registration_player_name: string | null;
};

type ActivityFeedProps = {
  items: AuditLogEntry[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Letzte Aktivitäten
        </h3>
        <p className="text-gray-600 text-center py-8">
          Noch keine Aktivitäten vorhanden
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Letzte Aktivitäten
      </h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
          >
            <div className="h-2 w-2 bg-[#0055A4] rounded-full mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">
                  {item.user_name || "System"}
                </span>{" "}
                {getActionText(item.action)}{" "}
                {item.registration_player_name && (
                  <span className="font-medium">
                    {item.registration_player_name}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {formatDistanceToNow(new Date(item.timestamp), {
                  addSuffix: true,
                  locale: de,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function getActionText(action: string): string {
  const actionMap: Record<string, string> = {
    created: "hat erstellt",
    updated: "hat aktualisiert",
    deleted: "hat gelöscht",
    status_changed: "hat den Status geändert für",
    payment_verified: "hat die Zahlung bestätigt für",
    bot_executed: "hat den Bot ausgeführt für",
  };

  return actionMap[action] || action;
}
