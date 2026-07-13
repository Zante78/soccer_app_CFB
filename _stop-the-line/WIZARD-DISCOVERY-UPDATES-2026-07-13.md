# Wizard-Design-Previews · Discovery-Update-Log

**Datum:** 2026-07-13
**Kontext:** Nach V1/V1.2/V1.3-Discovery der DFBnet-Passstelle Änderungen an den 8 Wizard-Design-Preview-HTMLs
**Ordner:** `_stop-the-line/design-previews/`
**Regel:** v1 bleibt als Backup, Änderungen entstehen als v2 (bzw. v3 wenn v2 schon existiert)

---

## Übersicht der neuen Files

| Step | v1 (Backup) | Neue Version | Umfang der Änderung |
|---|---|---|---|
| 3 Erstanmeldung | `step-3-spielerdaten-erstanmeldung-v1.html` | `-v2.html` | Sub-Text präzisiert: Daten landen 1:1 im DFBnet-Mitgliedsantrag |
| 3 Vereinswechsel | `step-3-spielerdaten-vereinswechsel-v1.html` | `-v2.html` | Passnummer als optionales Feld eingeführt (aus V1.3-Erkenntnis: Bot-Suche via Passnummer schneller als 4-Feld-Kombo) |
| 4 Nachweise | `step-4-upload-v1.html` | `-v2.html` | **Passfoto-Slot komplett entfernt** &mdash; Trainer macht Foto im Spielerprofil nach Freigabe. Nur Geburts-Nachweis + optionale Abmeldebestätigung |
| 4a DFB-Übergabe | *(neu)* | `step-4a-dfbnet-uebergabe-v1.html` | **Komplett neuer Screen** &mdash; Popup zu `verein.dfbnet.org/mitgliedsantrag/cfbfordniehl` + Copy-Panel + Return-Check |
| 6 Consent | `step-6-consent-v1.html` | `-v2.html` | **Canvas-Signatur entfernt** &mdash; DFBnet-Passwart-Checkbox reicht rechtlich. Statt Signatur: Papier-Info-Box (WDFV verlangt Papier-Unterschrift bei Passwart-Abgabe) |
| 7 Zahlung | `step-7-zahlung-v2.html` | `-v3.html` | **IBAN/SEPA-Formular umgedeutet** &mdash; SEPA-Erfassung passiert im DFBnet-Mitgliedsantrag Schritt 3, nicht im Wizard. Hier nur noch Beitragsart-Info |
| 8 Erfolg | `step-8-erfolg-v1.html` | `-v2.html` | **Timeline realistisch mit 5 Schritten**: DFB-Antrag abgeschickt · Passwart legt Pass an (Antragsnr. `LO-YY-NNNNNN`) · WDFV prüft · Trainer lädt Foto hoch · Spielberechtigt |

**Unverändert:**
- Step 1 Welcome (v3 bleibt)
- Step 2 Anmeldegrund (v1 bleibt)
- Step 3 Wiederanmeldung (v1 bleibt &mdash; kann später analog zu Vereinswechsel updatet werden)
- Step 5 Eligibility (4 Varianten a/b/c/d, alle v1 bleiben &mdash; werden später auf reine Info-Anzeige reduziert)

---

## Neue Reihenfolge im Zielbild

**Alt (v1, vor Discovery):**
1. Welcome
2. Anmeldegrund
3. Spielerdaten
4. Foto + Dokumente Upload
5. Spielberechtigung/Eligibility
6. Consent + Digitale Signatur
7. SEPA-Zahlung
8. Erfolg

**Neu (v2, mit Discovery-Learnings):**
1. Welcome
2. Anmeldegrund
3. Spielerdaten (mit DFBnet-Feldern)
4. Nachweise (nur noch Geburtsurkunde etc., kein Foto)
5. **NEU:** DFB-Übergabe (Popup + Copy-Panel)
6. Consent (nur DSGVO-Checkboxes, keine Canvas-Signatur)
7. Beitrags-Info (kein SEPA-Formular)
8. Erfolg mit realer 5-Schritt-Timeline

**Effektive Schritt-Zahl:** 8 (unverändert, aber Schritt 4a ist wirklich neu und Schritt 4 stark reduziert)

---

## Was pro Änderung noch zu tun ist

### Für React-Port (Sprint 3+)

- `components/guided-story/step-4-upload.tsx` &rarr; Passfoto-Slot entfernen
- `components/guided-story/step-6-consent.tsx` &rarr; Canvas-Signatur (SignaturePad-Komponente) entfernen, nur Consent-Checkboxes lassen
- `components/guided-story/step-7-payment.tsx` &rarr; IBAN-Feld + SEPA-Formular entfernen, nur Beitragsart-Anzeige lassen
- `components/guided-story/step-8-completion.tsx` &rarr; Timeline auf 5-Schritt-Version updaten
- **Neu:** `components/guided-story/step-4a-dfbnet-handoff.tsx` &rarr; komplett neu, mit `window.open()` zu DFBnet-URL + Clipboard-API für Copy-Buttons + Bot-Status-Poll für Return-Check
- `app/(registration)/register/page.tsx` &rarr; Wizard-Shell um step-4a erweitern (Reihenfolge)

### Für Bot-Integration (Sprint 3+)

Neuer Endpoint im Wizard-Backend:
- `POST /api/dfbnet/check-antrag` &rarr; Bot pollt DFBnet-Antragsübersicht mit CSRF-Pagehash-Pattern
- Response: `{ found: boolean, antragsnummer: string, status: string }`
- Wird von `step-4a` beim "DFB-Anmeldung fertig"-Klick aufgerufen

### Rechts-Text-Prüfung

- Step 6 v2 sagt jetzt "Ausdrucken und beim Passwart abgeben" &mdash; das ist die konservative Auslegung
- Alternative wenn WDFV das nicht zwingend verlangt: PDF-Download + digitale Übergabe möglich?
- Zu klären mit WDFV Passstelle Duisburg (SL-2 Follow-up)

---

## Warum diese Änderungen (Discovery-Belege)

**Foto-Upload entfällt** &mdash; V1.3-User-Feedback:
> "Foto-Upload ist ein separates Modul... das wird durch den Trainer erstellt und hoch geladen, nachdem ein Mitglied angelegt wurde... Damit ist das Bild dann in der Mitgliederliste in dem jeweiligen Spielerprofil."

**SEPA entfällt aus Wizard** &mdash; V1.2-Discovery:
DFBnet-Mitgliedsantrag Schritt 3 fragt IBAN + Kontoinhaber + SEPA-Mandats-Checkbox direkt ab. Doppelerfassung würde nur Verwirrung stiften. Alle IBAN-Daten laufen über DFBnet.

**Canvas-Signatur entfällt** &mdash; V1.2 + V1.3-Discovery:
Der DFBnet-Antrag hat keine digitale Signatur-Fläche. Rechtlich reicht die Passwart-Bestätigungs-Checkbox im DFBnet-Antrag: *"Hiermit bestätigen wir, dass uns der Antrag auf Spielerlaubnis vom Spieler bzw. einem gesetzlichen Vertreter unterschrieben vorliegt..."* Papier-Unterschrift bleibt beim Passwart.

**Antragsnummer-Format `LO-YY-NNNNNN`** &mdash; V1.3-Discovery:
Aus Antragsübersicht verifiziert. Beispiel-Wert im Timeline-Screen ist ein realer aus einer DFBnet-Session.

**W1-Popup-Weg** (Wizard bleibt offen + DFBnet in zweitem Tab) &mdash; V1.3-Discovery:
Weil DFBnet-Mitgliedsantrag:
- FriendlyCaptcha hat &rarr; kein Bot-Automation-Weg möglich
- `X-Frame-Options: sameorigin` sendet &rarr; kein iFrame-Embed möglich
- Session-Token `iStep` &rarr; kein URL-Deep-Link-Autofill möglich

Deshalb Copy-Panel-Ansatz: User klickt manuell durch DFB-Formular, Wizard hilft mit copy-fähigen Feldwerten.

---

## Verwandt

- V1.3-Discovery-Report: `_stop-the-line/V1.3-DISCOVERY-2026-07-10.md`
- V1.2-Discovery-Report: `_stop-the-line/V1.2-DISCOVERY-2026-07-10.md`
- Backend v2 Master-Doc: `_stop-the-line/BACKEND-ARCHITEKTUR-v2-HYBRID.md`
- Memory: `memory/cfb-passstelle-discovery-komplett-2026-07-10.md`
