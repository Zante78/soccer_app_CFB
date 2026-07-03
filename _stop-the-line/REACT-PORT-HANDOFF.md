# React-Port Handoff — Wizard Steps 3-8

**Datum:** 2026-07-03
**Status:** Foundation + Steps 1-2 fertig. Steps 3-8 stehen aus.
**Nächste Session:** Fokus-Sprint ~2h für die 6 verbleibenden Screens.

---

## Was schon steht (nicht mehr anfassen)

### Foundation
- **`apps/frontend/tailwind.config.js`** — Brand-Kit-Tokens: `primary` (Vereinsblau `#004A9F` + dark/light), `accent` (Rheingrün, sparsam), `surface-0/1/2`, `ink`, `amber`. Fonts als CSS-Variablen (`--font-display/accent/body`).
- **`apps/frontend/app/globals.css`** — CSS Custom Properties + wiederverwendbare Component-Klassen: `.eyebrow`, `.headline`, `.section-title`, `.progress-marker`, `.context-chip`, `.btn-primary`, `.btn-back`, `.input`, `.form-label`, `.info-box`. `@keyframes fadeUp` global verfügbar.
- **`apps/frontend/app/layout.tsx`** — Inter raus, drei Brand-Fonts via `next/font/google` mit CSS-Variablen.

### WizardShell
- **`apps/frontend/components/guided-story/wizard-shell.tsx`** — 5 exports:
  - `WizardShell` — Grid rows Layout mit einheitlichem max-width (default 780px, `wide`=1200px für Step 1)
  - `WizardNav` — 72px Vereinsblau Header, akzeptiert `progressLabel` für Step 8
  - `WizardFooter` — Copyright + Legal-Links
  - `WizardActions` — Zurück-Link + Weiter-Button, `nextLabel` immer spezifisch
  - `ContextChip` — Wiederverwendbar in Steps 3-7

### Fertige Steps
- **`step-1-welcome.tsx`** — mit Props `senderName?` + `senderTeam?` für Personalisierung
- **`step-2-player-selection.tsx`** — 3 Radio-Cards (`NEW_PLAYER` / `TRANSFER` / `RE_REGISTRATION`), Sonderfall-Mail-Link, Legacy-Alias `Step2PlayerSelection` exportiert

### Verifiziert
- ✅ `npm install` in `apps/frontend` gelaufen (Deps 251 Packages)
- ✅ `npx tsc --noEmit` grün (0 Errors)
- ✅ `npx next build` kompiliert erfolgreich (6.9s) — der einzige Build-Fehler ist SSR-Prerender der `/not-found`-Seite wegen fehlender Supabase-Env, kein Code-Problem

---

## Was noch zu tun ist

### Steps 3-8 als React portieren

Alle Vorlagen sind unter `_stop-the-line/design-previews/`:

| Step | HTML-Vorlage | Besonderheit |
|---|---|---|
| **3** Spielerdaten | `step-3-spielerdaten-{erstanmeldung,vereinswechsel,wiederanmeldung}-v1.html` | **3 Varianten** — Ein React-Component mit adaptive Rendering basierend auf `registration_reason`-Prop. Vereinswechsel = zusätzliche Vorverein-Sektion (Pflicht). Wiederanmeldung = Herkunfts-Radio + optionale Alt-Passnummer. |
| **4** Foto + Dokumente | `step-4-upload-v1.html` | Adaptive Slots: Foto immer Pflicht · Geburtsurkunde-Slot nur bei Junior (aus `birth_date` berechnet) · Abmeldebestätigung-Slot nur bei `TRANSFER` |
| **5** Spielberechtigung | `step-5-eligibility-{a-sofort,b-sperrfrist,c-abgelaufen,d-einzelfall}-v1.html` | **4 Varianten** — Ein React-Component mit Switch auf Eligibility-Result. Sperrfrist-Variante hat Countdown-Panel, andere sind flacher. |
| **6** Consent + Unterschrift | `step-6-consent-v1.html` | 4 Checkboxes (Mitgliedschaft+Satzung Pflicht · DSGVO Pflicht · Spielbetrieb Pflicht · Foto Optional) + Canvas-Signatur. Bei Junior: Junior-Hinweis-Box. Canvas via `react-signature-canvas` (schon installiert) |
| **7** Zahlung | `step-7-zahlung-v2.html` | Zwei Sektionen (Aufnahmegebühr + Jahresbeitrag). Aufnahmegebühr: 3 Radio-Cards. Jahresbeitrag: SEPA-Toggle Jährlich/Halbjährlich + IBAN + Kontoinhaber. Dynamic CTA-Text je nach Auswahl. |
| **8** Erfolg | `step-8-erfolg-v1.html` | Success-Screen mit Antragsnummer, Timeline (4 States: done/active/future), Magic-Link mit QR-Code, Reassurance-Boxen, 2 Final-Actions (Primary + Secondary). Kein Zurück-Button, `progressLabel="Fertig · 08 / 08"` |

### Reihenfolge-Empfehlung

1. **Step 8 zuerst** — einfachster Port (keine Formular-Logik, nur Display), hilft mit dem "letzten Screen"-Anker
2. **Step 4 Upload** — adaptive Slots ohne Zod-Komplexität
3. **Step 3 Spielerdaten** — 3 Varianten konsolidiert mit react-hook-form + Zod, technisch der aufwendigste
4. **Step 5 Spielberechtigung** — 4 Varianten, Display-only, mit Sperrfrist-Rechnung vom Eligibility-Service
5. **Step 6 Consent** — Canvas-Signatur (react-signature-canvas), 4 Checkboxes
6. **Step 7 Zahlung** — Zwei Sektionen, adaptive Beträge (aus Team-Auswahl), SEPA-Toggle

### Aktualisierung `register/page.tsx`

Der Legacy-Alias `Step2PlayerSelection` wird beim finalen Refactor der `register/page.tsx` entfernt. Aktuell hat die Page auch alte Debug-Info-Box, Progress-Bar aus Alt-Design, und Container-Wrapper — der ganze `<div className="min-h-screen py-12 px-4">`-Wrapper muss weg, weil jetzt jeder Step seine eigene `WizardShell` mitbringt.

Neues Muster:
```tsx
// register/page.tsx wird zu einer schmalen Wrapper-Component:
export default function RegisterPage() {
  const { currentStep, formData, nextStep, prevStep, updateFormData } =
    useMultiStepForm({ totalSteps: 8, onComplete: () => {/* TODO Supabase */} });

  const handleStepData = (data: Record<string, any>) => {
    updateFormData(data);
    nextStep();
  };

  // Direkt rendern, kein Wrapper-Div, kein Progress-Bar — Steps haben eigene Nav
  switch (currentStep) {
    case 1: return <Step1Welcome onNext={nextStep} />;
    case 2: return <Step2Anmeldegrund onNext={handleStepData} onBack={prevStep} initialValue={formData.registration_reason} />;
    // ...
  }
}
```

---

## Was in dieser Session gelernt wurde

**Was gut lief:**
- Design-Previews sind so exakt dass der React-Port sich fast anfühlt wie Übersetzen einer Sprache
- WizardShell + WizardActions als reusable Components sparen viel Duplikation
- Brand-Kit im Tailwind-Config zu erweitern ist die einzige richtige Antwort
- Legacy-Aliase (`Step2Anmeldegrund as Step2PlayerSelection`) halten die alte `register/page.tsx` am Leben während der Migration

**Was ich beim nächsten Sprint anders mache:**
- **Types global konsolidieren** — `RegistrationReason`, `EligibilityResult`, `PaymentMethod` in `shared-types` heben, nicht pro Step neu definieren
- **`useMultiStepForm`-Types verschärfen** — aktuell `Record<string, any>`, sollte `WizardFormData` mit Zod-Inferenz sein
- **Register-Page-Refactor als eigenen Commit** — Legacy-Aliase entfernen, Debug-Info raus, saubere Switch/Case
- **Canvas-Signatur früh** — `react-signature-canvas` prüfen bevor Step 6 gebaut wird, evtl. bricht das SSR-Rendering

---

## Nach dem Port (Follow-up)

1. **`npm run dev`** live testen — echte URLs, alle 8 Steps klicken
2. **Register-Page-Refactor** — Legacy-Wrapper entfernen
3. **URL-Parameter-Extraktion** — `?ref=trainer:abate&team=u17b1` in Step 1 auslesen mit `useSearchParams()`
4. **Zod-Schemas** für alle Steps mit `react-hook-form` verbinden
5. **Backend-Anbindung**: `onComplete` echt machen (Supabase Insert), aktuell noch `console.log`

Das ist alles ein eigener Sprint nach dem Port. Design ist visuell komplett — die restliche Arbeit ist Data-Layer + State-Machine.

---

**Sprint-Ende:** 3 Screens portiert (Step 1, Step 2, WizardShell), Foundation solide, 6 Screens folgen. Alle Vorlagen und Muster stehen für schnellen Fortschritt in der nächsten Session.
