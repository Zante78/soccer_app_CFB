# Dokumente-Pflicht: WDFV-Passwesen für CfB-Wizard

**Stand:** 2026-07-03
**Grundlage:** WDFV Spielberechtigungsantrag (Stand Oktober 2022) + Erstausstellung-Merkblatt

> Dieses Dokument definiert **welche Dokumente der Wizard verlangt** und **welche PFLICHT sind**.
> Es ist die einzige Wahrheitsquelle für Step 4 (Foto + Dokumente Upload) und den Bot-Flow der die
> Dokumente später in DFBnet hochladen wird.

---

## 1. Was der WDFV wirklich verlangt (Verband-Realität)

### Erstausstellung — Senioren (ab 18)
- Ausgefüllter + **original unterschriebener** Spielberechtigungsantrag
- **Keine weiteren Dokumente** (kein Ausweis-Nachweis, keine Geburtsurkunde)

### Erstausstellung — Junioren (unter 18)
- Ausgefüllter + original unterschriebener Spielberechtigungsantrag
- Unterschrift eines **Erziehungsberechtigten** (Original)
- **Nachweis Geburtsdatum** — EINES der folgenden reicht:
  - Original-Geburtsurkunde
  - Bestätigung des Einwohnermeldeamtes
  - Stempel + Unterschrift des Kreisjugendausschusses auf dem Antrag
- **NICHT anerkannt:** Beglaubigte Kopien, Kirche, Polizei, Rechtsanwalt, Schule

### Vereinswechsel (Position B im Antrag)
- Ausgefüllter Antrag mit Angaben zum Vorverein
- **Austrittsdatum** (Position B.3 auf Antrag — "Austritt per Einschreiben am")
- Angabe ob Verbandsstrafe besteht/ausstehend (B.4 / B.5)
- **Vereinsstempel des NEUEN Vereins** (bestätigt Mitgliedschaft) — Original
- **Bei Junioren:** zusätzlich Erziehungsberechtigten-Unterschrift für sportgesundheitliche Eignung
- **Kein separates Abmeldebestätigungs-Dokument** — die Info steht IM Antrag, nicht als Anhang

### Wiederausstellung (nach Pause)
- Wird auf dem WDFV-Merkblatt "Erstausstellung" NICHT als separate Kategorie geführt
- **Verbandsseitig:** Wenn zuvor bereits Spielberechtigung bestand → Vereinswechselantrag stellen (auch bei Pause). Wenn Verein aufgelöst / lange her → im Einzelfall mit Passabteilung klären
- **Praktisch für uns:** Wie Vereinswechsel behandeln oder als Einzelfall an Passwart eskalieren

### International (aus dem Ausland — Position C)
- Rückseite des Antrags ausfüllen (Staatsangehörigkeit, letzter Wohnort im Ausland, Land, Datum in-Deutschland, Vater/Mutter-Namen)
- **Bei Junioren 10-18 ohne deutsche Staatsangehörigkeit:** zusätzlich Erklärung der Erziehungsberechtigten dass Umzug NICHT fußballsport-bezogen ist
- Zusatzdokumente laut FIFA-Regeln (separate PDF laut Merkblatt) — **Passwart-Sache, nicht Wizard**

---

## 2. Wichtige Erkenntnisse für UX

### Der Antrag SELBST ist das zentrale Dokument
Der WDFV-Antrag ist ein einziges Formular, das der Verein ausdruckt, vom Spieler + Erziehungsberechtigten unterschreiben lässt, vereinsseitig stempelt und dann als **Original per Post** einreicht.

**Das heißt für unseren Wizard:**
- Wir sammeln alle Daten die auf den Antrag müssen (Name, Geburtsdatum, PLZ, Wohnort, Straße, Geburtsort, Geschlecht, Nationalität, Vorverein bei Wechsel, Auslandsdaten bei international)
- Wir sammeln die **digitalen Unterschriften** (Spieler oder Erziehungsberechtigter) in Step 6
- Wir generieren den ausgefüllten Antrag als **PDF mit eingebetteten Unterschriften** für den Passwart — der stempelt vereinsseitig und schickt es per Post ein
- **Wir laden das PDF nicht online an den WDFV hoch** — offizieller Prozess ist Postweg

### Das Passfoto ist NICHT vom WDFV gefordert
- Weder auf dem Antrag noch im Merkblatt wird ein Passfoto verlangt
- **Passfoto kommt beim DFBnet-Eintrag rein** (Bot-Flow, Zusatzdaten-Tab, `input[name="ImgTitle"]`)
- Praktisch: DFBnet druckt den späteren Spielerpass aus DFBnet-Daten aus. Da wird das Foto dann sichtbar.
- Also: **Passfoto ist DFBnet-Anforderung**, nicht WDFV-Antragsanforderung — aber praktisch wird's beim Neuanmelden vom Verein gebraucht

### Geburtsdatum-Nachweis — nur bei Junioren
- Für Senioren nicht verlangt
- Für Junioren: Original-Geburtsurkunde ODER Meldeamt-Bestätigung ODER Kreisjugendausschuss-Stempel
- **Praktisch für Wizard:** Bei Minderjährigen (< 18) einen Upload-Slot anbieten mit klarer Erwartung "Geburtsurkunde ODER Meldebescheinigung — als Foto/Scan reicht für die Vorbereitung, Original schickt der Passwart mit dem Antrag mit"

### Unterschriften — digital im Wizard, nicht erneut auf Papier

- Der WDFV-Antrag verlangt formal *"ausgefüllt und original unterschrieben"* — Spieler (bei Volljährigen), Erziehungsberechtigter (bei Minderjährigen), Vereinsvertreter mit Stempel.
- **Diese Unterschriften erfassen wir digital im Wizard Step 6** (Canvas-Signatur) und binden sie ins generierte Antrags-PDF ein.
- Der Passwart druckt den vorbereiteten Antrag mit den bereits eingebetteten digitalen Unterschriften **plus Vereinsstempel** und schickt ihn ein — keine weiteren Handschriften auf Papier nötig.
- Für den Verein (Consent, DSGVO, Fotoerlaubnis) sind die digitalen Unterschriften ohnehin rechtsverbindlich (Textform nach BGB § 126b).
- Konzept-Grundlage aus Februar 2026 (mockup.html Step 5): *"Digitale Unterschrift (Erziehungsberechtigte/r) — Mit dem Finger oder der Maus unterschreiben"*.

---

## 3. Was der Wizard konkret verlangt (Ableitung)

### PFLICHT-Dokumente pro Fall

| Dokument | Erstanmeldung Senior | Erstanmeldung Junior | Vereinswechsel Senior | Vereinswechsel Junior | Wiederanmeldung | International |
|---|---|---|---|---|---|---|
| **Passfoto** (biometrisch, aktuell) | Pflicht | Pflicht | Pflicht | Pflicht | Pflicht | Pflicht |
| **Geburtsurkunde / Meldebescheinigung** (Foto/Scan) | — | Pflicht | — | Pflicht | Junior-abhängig | Pflicht (Junior) |
| **Abmeldebestätigung Vorverein** (falls vorhanden) | — | — | Optional (hilfreich) | Optional (hilfreich) | Nur wenn Vorverein bekannt | — |
| **Alter Spielerpass / Passnummer** | — | — | Optional | Optional | Optional (hilfreich) | — |

**Erklärung "Passfoto Pflicht auch für Senioren":** WDFV verlangt es formal nicht, aber DFBnet trägt es später in den ausgedruckten Pass ein — praktisch immer nötig.

**Erklärung "Abmeldebestätigung optional":** WDFV benötigt nur die Angaben AUF dem Antrag (Austrittsdatum). Aber wenn der Spieler die Bestätigung eh hat, hilft es dem Passwart bei der Verifikation.

**Erklärung "Geburtsurkunde für Junioren":** Für den WDFV-Antrag ist EIN Nachweis nötig. Optionen sind Original-Geburtsurkunde ODER Meldeamt-Bestätigung ODER Kreisjugendausschuss-Stempel. Unser Wizard nimmt Foto/Scan der Geburtsurkunde ODER Meldebescheinigung — den Rest (Original zur Post) übernimmt der Passwart.

### Alter-basierte Logik

- **Volljährigkeit** = ab 18 Jahren am Anmeldetag
- Der Wizard weiß das Geburtsdatum aus Step 3 → kann berechnen ob Junior
- Bei Junior: **Geburtsurkunde-Upload wird Pflicht-Feld**
- Bei Senior: **Nur Passfoto ist Pflicht**

### Was wir bewusst NICHT verlangen

- **Personalausweis-Foto** — WDFV verlangt keinen Ausweisnachweis (die alte Konzeption aus mockup.html war überzogen)
- **Meldezettel als Freitext** — die konkrete Adresse geben wir schon in Step 3 als Formfeld ab
- **Sportgesundheits-Attest** — wird durch Unterschrift des Erziehungsberechtigten in Step 6 mit-bestätigt
- **Vereinsaustritt-PDF** — Optional, keine Pflicht

---

## 4. Was passiert nach Wizard-Ende

1. Wizard sammelt Daten + Foto + (bei Junior) Geburtsurkunde + **digitale Unterschriften** in Supabase Storage
2. System generiert **ausgefüllten WDFV-Antrag als PDF** mit eingebetteten digitalen Unterschriften (später zu bauen — nicht Teil MVP)
3. Passwart bekommt Notification: "Neuer Antrag bereit"
4. Passwart prüft PDF, stempelt vereinsseitig (physisch oder digital) und druckt aus
5. Bot startet parallel: Trägt Spieler in DFBnet ein (Draft-Modus) + lädt Passfoto in DFBnet hoch
6. Passwart schickt Antrags-PDF an WDFV Duisburg (`Postfach 10 15 12, 47015 Duisburg`)
7. Verband bearbeitet, DFBnet-Status springt auf "aktiv" → Spieler ist offiziell spielberechtigt

**Wichtig für Vision:** Der Papier-Postweg zum WDFV ist Verbandsrealität. Der Wizard reduziert den Papierkram-Aufwand des Antragstellers auf **null Blätter** und den Passwart auf **einmal drucken + stempeln + einwerfen** — statt Stunden manueller Formularpflege.

---

## 5. Referenz-Dateien

- **`docs/wdfv-referenz/wdfv-spielberechtigungsantrag.pdf`** — Original-Antrag (Grundlage für spätere PDF-Generierung im Backend)
- **`docs/wdfv-referenz/wdfv-erstausstellung-merkblatt.pdf`** — Merkblatt (Referenz für Support-Anfragen und Wizard-Wording)
- Verband-Kontakt: **`pass@wdfv.de` · Postfach 10 15 12 · 47015 Duisburg · 0203 7172-0**

---

**Änderungshistorie:**
- 2026-07-03 — Erste Version. Grundlage: WDFV-PDFs von wdfv.de/service/downloads (Erstausstellung + Spielberechtigungsantrag, Stand 10/2022) direkt gelesen und in Wizard-Kontext übersetzt.
- 2026-07-03 — **Korrektur "Unterschriften"**: Nicht Papier-Sache, sondern digital im Wizard (Step 6 Canvas-Signatur) mit Einbettung ins generierte Antrags-PDF. Ursprünglich falsch dokumentiert — Konzept-Grundlage aus Februar-Mockup war schon damals "Digitale Unterschrift".
