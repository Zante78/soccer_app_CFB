import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type RegistrationForPDF = {
  player_name: string;
  player_birth_date: string;
  player_dfb_id: string | null;
  status: string;
  registration_reason: string;
  team: {
    name: string;
    dfbnet_id: string | null;
  } | null;
  eligibility_date: string | null;
  sperrfrist_start: string | null;
  sperrfrist_end: string | null;
  finance_status: {
    is_paid: boolean;
    payment_method: string | null;
    paid_amount: number | null;
    paid_at: string | null;
  } | null;
  player_data: Record<string, any>;
  created_at: string;
  submitted_at: string | null;
};

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  SUBMITTED: "Eingereicht",
  VALIDATION_PENDING: "Validierung läuft",
  READY_FOR_BOT: "Bereit für Bot",
  BOT_IN_PROGRESS: "Bot läuft",
  COMPLETED: "Abgeschlossen",
  ERROR: "Fehler",
  MANUALLY_PROCESSED: "Manuell bearbeitet",
  VISUAL_REGRESSION_ERROR: "Visual Regression Error",
};

const reasonLabels: Record<string, string> = {
  NEW_PLAYER: "Neuer Spieler",
  TRANSFER: "Vereinswechsel",
  RE_REGISTRATION: "Wiederanmeldung",
  INTERNATIONAL_TRANSFER: "Internationaler Wechsel",
};

const paymentMethodLabels: Record<string, string> = {
  PAYPAL: "PayPal",
  CASH: "Bar",
  BANK_TRANSFER: "Überweisung",
  EXEMPT: "Befreit",
};

/**
 * Generiert ein PDF für eine Spielerpass-Registrierung
 * @param registration - Die Registration-Daten
 */
export function generateRegistrationPDF(registration: RegistrationForPDF): void {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 85, 164); // DFB Blau
  doc.text("Spielerpass-Antrag", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Exportiert am ${format(new Date(), "dd.MM.yyyy HH:mm", { locale: de })} Uhr`,
    14,
    27
  );

  // Spieler Basisdaten
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Spieler-Informationen", 14, 40);

  autoTable(doc, {
    startY: 45,
    head: [["Feld", "Wert"]],
    body: [
      ["Name", registration.player_name],
      [
        "Geburtsdatum",
        format(new Date(registration.player_birth_date), "dd.MM.yyyy", {
          locale: de,
        }),
      ],
      ["DFB-ID", registration.player_dfb_id || "Noch keine"],
      ["Status", statusLabels[registration.status] || registration.status],
      [
        "Registrierungsgrund",
        reasonLabels[registration.registration_reason] ||
          registration.registration_reason,
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [0, 85, 164] },
    margin: { left: 14 },
  });

  // Team
  const lastY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text("Vereinszugehörigkeit", 14, lastY);

  autoTable(doc, {
    startY: lastY + 5,
    head: [["Feld", "Wert"]],
    body: [
      ["Team", registration.team?.name || "Kein Team zugeordnet"],
      [
        "DFBnet Team-ID",
        registration.team?.dfbnet_id || "Noch keine",
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [0, 85, 164] },
    margin: { left: 14 },
  });

  // Sperrfrist
  const lastY2 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text("Spielberechtigung", 14, lastY2);

  autoTable(doc, {
    startY: lastY2 + 5,
    head: [["Feld", "Wert"]],
    body: [
      [
        "Spielberechtigt ab",
        registration.eligibility_date
          ? format(new Date(registration.eligibility_date), "dd.MM.yyyy", {
              locale: de,
            })
          : "Sofort",
      ],
      [
        "Sperrfrist Start",
        registration.sperrfrist_start
          ? format(new Date(registration.sperrfrist_start), "dd.MM.yyyy", {
              locale: de,
            })
          : "Keine",
      ],
      [
        "Sperrfrist Ende",
        registration.sperrfrist_end
          ? format(new Date(registration.sperrfrist_end), "dd.MM.yyyy", {
              locale: de,
            })
          : "Keine",
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [0, 85, 164] },
    margin: { left: 14 },
  });

  // Zahlungsinformationen
  const lastY3 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text("Zahlungsinformationen", 14, lastY3);

  autoTable(doc, {
    startY: lastY3 + 5,
    head: [["Feld", "Wert"]],
    body: [
      [
        "Bezahlstatus",
        registration.finance_status?.is_paid ? "Bezahlt ✓" : "Offen",
      ],
      [
        "Zahlungsmethode",
        registration.finance_status?.payment_method
          ? paymentMethodLabels[registration.finance_status.payment_method] ||
            registration.finance_status.payment_method
          : "-",
      ],
      [
        "Betrag",
        registration.finance_status?.paid_amount
          ? `${registration.finance_status.paid_amount.toFixed(2)} €`
          : "-",
      ],
      [
        "Bezahlt am",
        registration.finance_status?.paid_at
          ? format(new Date(registration.finance_status.paid_at), "dd.MM.yyyy", {
              locale: de,
            })
          : "-",
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [0, 85, 164] },
    margin: { left: 14 },
  });

  // Vorverein (falls vorhanden)
  if (registration.player_data.previous_club_name) {
    const lastY4 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Vorverein", 14, lastY4);

    autoTable(doc, {
      startY: lastY4 + 5,
      head: [["Feld", "Wert"]],
      body: [
        ["Vereinsname", registration.player_data.previous_club_name || "-"],
        ["Vereins-ID", registration.player_data.previous_club_id || "-"],
        [
          "Abmeldedatum",
          registration.player_data.deregistration_date
            ? format(
                new Date(registration.player_data.deregistration_date),
                "dd.MM.yyyy",
                { locale: de }
              )
            : "-",
        ],
        [
          "Letztes Spiel",
          registration.player_data.last_game_date
            ? format(
                new Date(registration.player_data.last_game_date),
                "dd.MM.yyyy",
                { locale: de }
              )
            : "-",
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [0, 85, 164] },
      margin: { left: 14 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Seite ${i} von ${pageCount} | CFB Niehl Spielerpass-System`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save
  const fileName = `Spielerpass_${registration.player_name.replace(/\s+/g, "_")}_${format(
    new Date(),
    "yyyyMMdd"
  )}.pdf`;
  doc.save(fileName);
}
