# SL-4: Vorstandsmandat + AVV-Klärung

**Anleitung:** Beide Dokumente in der nächsten Vorstandssitzung vorlegen. Beschluss protokollieren. Ohne Beschluss kein Live-Go.

---

# DOKUMENT 1: Vorstandsbeschluss (Vorlage)

## Beschluss-Vorlage zur Mitgliederversammlung / Vorstandssitzung

**Tagesordnungspunkt:** Beschluss über die Einführung des digitalen Spielerpass-Antrags-Systems "CFB Pass-Automation"

### Sachverhalt

Der CfB Ford Köln-Niehl 09/52 e.V. erhält pro Saison ca. 80–120 Spielerpass-Anträge für seine 19 Jugendmannschaften und 4 Seniorenteams. Die manuelle Bearbeitung jedes Antrags dauert ca. 15 Minuten, was den ehrenamtlichen Passwart mit über 25 Stunden pro Saison belastet.

Ein Tech-Team aus 1-2 ehrenamtlichen Helfern hat in den vergangenen Monaten ein digitales System entwickelt, das den Antragsprozess teilweise automatisiert:

- **Webseite passstelle.cfb-fordniehl.de** für die Eltern/Antragsteller (Daten-Eingabe in 8 Schritten)
- **Datenspeicherung** in einer Cloud-Datenbank (Supabase, EU-Hosting)
- **Technisches Hilfsmittel** zur Erstellung von Entwürfen im DFBnet (keine automatische Einreichung)
- **DSGVO-Schutz** durch automatische Löschung der Antragsfotos nach 48 Stunden

### Risiken und Maßnahmen

| Risiko | Maßnahme |
|---|---|
| Vorstandshaftung nach §26 BGB bei fehlerhaften Anträgen | Tool erstellt nur Entwürfe, der Passwart prüft jeden Antrag manuell vor Einreichung |
| DSGVO-Verstoß (Minderjährigen-Daten) | Auftragsverarbeitungsvertrag (AVV) mit Supabase wird abgeschlossen; Datenschutzerklärung auf Deutsch wird erstellt; 48h-Löschpflicht ist im Tool umgesetzt |
| DFB-Regelverstoß durch Automation | Schriftliche Anfrage an den FVM wurde gestellt; Live-Betrieb erst nach positiver Antwort |
| Wegfall des Tech-Teams | Vollständige Dokumentation (Runbook) wird erstellt; manueller Fallback bleibt funktionsfähig |

### Beschluss

Der Vorstand beschließt:

1. Die Einführung des Systems "CFB Pass-Automation" wird **genehmigt**, vorbehaltlich
   - der positiven Antwort des FVM zur DFB-Konformität,
   - des Abschlusses eines Auftragsverarbeitungsvertrags (AVV) mit Supabase,
   - der vollständigen Datenschutzerklärung auf Deutsch.

2. **[Name Vorstandsmitglied]** wird als **Verantwortlicher** im Sinne des §26 BGB für dieses Projekt benannt. Er/sie ist Hauptansprechpartner für rechtliche und datenschutzrechtliche Fragen.

3. **[Name Tech-Lead]** wird als **technischer Hauptverantwortlicher** benannt. Er/sie sichert den Code in einem Verein-eigenen Repository und führt eine vollständige technische Dokumentation (Runbook).

4. Vor jedem Versionssprung (Major Release) ist eine Risiko-Abschätzung im Vorstand vorzulegen.

5. Bei vollständigem Wegfall des Tech-Teams wird der manuelle Fallback aktiviert; das System darf nicht von einer einzigen Person abhängig sein (Bus-Faktor ≥ 2).

6. Die Datenschutzerklärung und das Impressum auf der Webseite werden bis zum **___.___.2026** in deutscher Sprache überarbeitet.

**Abstimmung:**
- Dafür: ___
- Dagegen: ___
- Enthaltungen: ___

**Beschluss angenommen / abgelehnt am ___.___.2026**

________________________________________
[Vorsitzende/r]                                                    [Schriftführer/in]

---

# DOKUMENT 2: AVV-Klärung Supabase (Checkliste)

## Auftragsverarbeitungsvertrag (AVV) mit Supabase Inc.

**Anbieter:** Supabase Inc., 970 Toa Payoh North, #07-04, Singapur (Hauptsitz) / EU-Datacenter über AWS Frankfurt

### Schritt 1: AVV-Vorlage abrufen

Supabase stellt einen Standard-AVV (DPA = Data Processing Agreement) bereit:
- URL: https://supabase.com/legal/dpa
- Stand prüfen: aktuell unterzeichnungsbereit?

### Schritt 2: Vertragsbestandteile prüfen

Folgende Punkte MUSS der AVV enthalten:

- [ ] **Verantwortlicher:** CfB Ford Köln-Niehl 09/52 e.V. (mit ladungsfähiger Adresse)
- [ ] **Auftragsverarbeiter:** Supabase Inc.
- [ ] **Datenkategorien:** Mitgliedsdaten, Spielerpass-Daten (inkl. Minderjährige), Fotos, Dokumente, Audit-Logs
- [ ] **Verarbeitungszweck:** Bereitstellung der CFB Pass-Automation-Anwendung
- [ ] **EU-Datenstandort:** AWS Frankfurt (eu-central-1) — Bestätigung im Supabase-Dashboard unter Project Settings > Region
- [ ] **EU-Standardvertragsklauseln (SCC):** Da Supabase US-Unternehmen ist, ist EU-US Data Privacy Framework oder SCCs zwingend
- [ ] **Subunternehmer-Liste:** AWS, Stripe (Billing), GitHub (Auth), etc. — Supabase listet aktuelle Sub-Processors unter https://supabase.com/privacy
- [ ] **Löschverpflichtung:** Bei Vertragsende werden Daten gelöscht
- [ ] **Auskunftspflicht:** Supabase muss Auskunfts-Anfragen unterstützen
- [ ] **Audit-Rechte:** Vereinsvorstand kann Audit-Berichte anfordern (SOC 2 Type II liegt bei Supabase vor)

### Schritt 3: Unterzeichnung

- [ ] Vorlage durch Supabase auf Vereinsdaten anpassen lassen (Support-Ticket)
- [ ] Vorstandsvorsitzende/r unterschreibt
- [ ] Beide Unterschriften sammeln (digital via DocuSign ist akzeptabel)
- [ ] AVV als PDF in `_compliance/avv-supabase-signed.pdf` ablegen
- [ ] In Datenschutzerklärung erwähnen: "Wir nutzen Supabase Inc. als Auftragsverarbeiter; ein AVV ist abgeschlossen."

### Schritt 4: Datenschutzerklärung auf Deutsch

Aktuelle Lage (laut Analytics-Audit 2026-06-28):
- Datenschutzerklärung unter `/j/privacy` ist Jimdo-Standard **auf Englisch**
- Verantwortliche Person nicht benannt
- Betroffenenrechte fehlen

**Action-Items:**
- [ ] Eigene Datenschutzseite in Jimdo auf Deutsch anlegen
- [ ] Vorstandsperson + Anschrift als Verantwortlicher eintragen
- [ ] Verarbeitungszwecke listen (Spielerpass-Antrag, Foto-Upload, Audit-Logging)
- [ ] Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) + lit. f (berechtigtes Interesse)
- [ ] Betroffenenrechte ergänzen: Auskunft, Löschung, Einschränkung, Widerspruch, Beschwerde bei LfDI NRW
- [ ] Supabase als Auftragsverarbeiter nennen + AVV erwähnen
- [ ] reCAPTCHA-Abschnitt in Deutsch + Opt-out-Link zu Google

### Schritt 5: Datenschutzbeauftragter

Bei 400 Mitgliedern und automatisierter Datenverarbeitung ist ein **Datenschutzbeauftragter (DSB) Pflicht** nach BDSG §38.

- [ ] Internen DSB benennen ODER
- [ ] Externen DSB beauftragen (Kosten ca. 100-200€/Monat für Kleinvereine)
- [ ] DSB-Kontaktdaten in Datenschutzerklärung aufnehmen

---

## Was nach Beschluss & AVV zu tun ist

- AVV-PDF in OneDrive `_compliance/` ablegen
- Beschluss-Protokoll als PDF speichern
- Datenschutzerklärung deployen
- DSB-Kontakt in Vereinsregister hinterlegen
- Bei der nächsten Vorstandssitzung Status-Update einplanen

## Eskalation falls Vorstand nicht zustimmt

- Projekt pausieren (nicht killen — Code als Lern-Artefakt erhalten)
- Manueller Fallback aktivieren
- Alternative: Pre-Filled Web-Formular nur als PDF-Generator (kein Bot, kein AVV-Bedarf außer Hosting)
