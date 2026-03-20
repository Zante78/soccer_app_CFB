import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type PlayerDataDisplayProps = {
  registration: {
    player_name: string;
    player_birth_date: string;
    player_dfb_id: string | null;
    registration_reason: string;
    player_data: Record<string, unknown>;
    team: {
      name: string;
      dfbnet_id: string | null;
    } | null;
    created_at: string | null;
    submitted_at: string | null;
  };
};

const registrationReasonLabels: Record<string, string> = {
  NEW_PLAYER: "Neuer Spieler",
  TRANSFER: "Vereinswechsel",
  RE_REGISTRATION: "Wiederanmeldung",
  INTERNATIONAL_TRANSFER: "Internationaler Wechsel",
};

export function PlayerDataDisplay({ registration }: PlayerDataDisplayProps) {
  const playerData = registration.player_data || {};
  const str = (val: unknown): string => (val != null ? String(val) : "-");

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Spieler Basisdaten */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Spieler-Informationen
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <DataField label="Name" value={registration.player_name} />
            <DataField
              label="Geburtsdatum"
              value={format(new Date(registration.player_birth_date), "dd.MM.yyyy", {
                locale: de,
              })}
            />
            <DataField label="DFB-ID" value={registration.player_dfb_id || "-"} />
            <DataField
              label="Registrierungsgrund"
              value={
                registrationReasonLabels[registration.registration_reason] ||
                registration.registration_reason
              }
            />
          </div>
        </div>

        <Separator />

        {/* Team */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Vereinszugehörigkeit
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <DataField label="Team" value={registration.team?.name || "-"} />
            <DataField
              label="DFBnet Team-ID"
              value={registration.team?.dfbnet_id || "-"}
            />
          </div>
        </div>

        <Separator />

        {/* Kontaktdaten */}
        {!!(playerData.email || playerData.phone || playerData.address) && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Kontaktdaten
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {!!playerData.email && (
                  <DataField label="E-Mail" value={str(playerData.email)} />
                )}
                {!!playerData.phone && (
                  <DataField label="Telefon" value={str(playerData.phone)} />
                )}
                {!!playerData.address && (
                  <div className="sm:col-span-2">
                    <DataField label="Adresse" value={str(playerData.address)} />
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Vorverein (falls Transfer) */}
        {!!playerData.previous_club_name && (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Vorverein
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <DataField
                  label="Vereinsname"
                  value={str(playerData.previous_club_name)}
                />
                {!!playerData.previous_club_id && (
                  <DataField
                    label="Vereins-ID"
                    value={str(playerData.previous_club_id)}
                  />
                )}
                {!!playerData.deregistration_date && (
                  <DataField
                    label="Abmeldedatum"
                    value={format(
                      new Date(str(playerData.deregistration_date)),
                      "dd.MM.yyyy",
                      { locale: de }
                    )}
                  />
                )}
                {!!playerData.last_game_date && (
                  <DataField
                    label="Letztes Spiel"
                    value={format(
                      new Date(str(playerData.last_game_date)),
                      "dd.MM.yyyy",
                      { locale: de }
                    )}
                  />
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Zeitstempel */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Zeitstempel
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <DataField
              label="Erstellt am"
              value={registration.created_at
                ? format(new Date(registration.created_at), "dd.MM.yyyy HH:mm", {
                    locale: de,
                  })
                : "—"
              }
            />
            {registration.submitted_at && (
              <DataField
                label="Eingereicht am"
                value={format(
                  new Date(registration.submitted_at),
                  "dd.MM.yyyy HH:mm",
                  { locale: de }
                )}
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-gray-900 mt-1">{value}</p>
    </div>
  );
}
