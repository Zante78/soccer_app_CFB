import { Badge } from "@/components/ui/badge";
import type { RegistrationStatus } from "@packages/shared-types";

type StatusBadgeProps = {
  status: RegistrationStatus;
};

const statusConfig: Record<
  RegistrationStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  DRAFT: { label: "Entwurf", variant: "secondary" },
  SUBMITTED: { label: "Eingereicht", variant: "default" },
  VALIDATION_PENDING: { label: "Validierung", variant: "outline" },
  READY_FOR_BOT: { label: "Bereit", variant: "default" },
  BOT_IN_PROGRESS: { label: "Bot läuft", variant: "default" },
  COMPLETED: { label: "Abgeschlossen", variant: "default" },
  ERROR: { label: "Fehler", variant: "destructive" },
  MANUALLY_PROCESSED: { label: "Manuell", variant: "outline" },
  VISUAL_REGRESSION_ERROR: { label: "Visual Error", variant: "destructive" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
