# SL-2: Schriftliche Anfrage an FVM / DFBnet — Compliance-Klärung

**Anleitung:** Diesen Text als Email kopieren ODER als Brief drucken + unterschreiben + per Post senden.

---

## Empfänger
- **Primär:** Fußball-Verband Mittelrhein e.V. (FVM)
  - Geschäftsstelle: Sankt-Sebastianus-Straße 182, 50735 Köln
  - E-Mail: info@fvm.de
  - Web: www.fvm.de
- **Optional CC:** DFBnet-Support (servicedesk@dfbnet.org), Kreis Köln Geschäftsstelle

## Betreff
Anfrage: Zulässigkeit eines technischen Hilfsmittels für Spielerpass-Anträge (CfB Ford Köln-Niehl 09/52 e.V., Vereinsnummer XXXXX)

---

## Brief-Text

Sehr geehrte Damen und Herren,

der CfB Ford Köln-Niehl 09/52 e.V. (Vereinsnummer XXXXX, Pastor-Wolff-Straße 11a, 50735 Köln) plant den Einsatz eines internen technischen Hilfsmittels, um die wachsende Anzahl an Spielerpass-Anträgen unserer 19 Jugendmannschaften und 4 Seniorenteams effizienter zu bearbeiten.

**Geplantes Vorgehen:**

Unser Passwart soll künftig ein webbasiertes internes Formular nutzen, in das die Eltern bzw. Antragsteller die für einen Spielerpass-Antrag erforderlichen Daten (Name, Geburtsdatum, vorheriger Verein, Passfoto, etc.) eingeben. Anschließend übernimmt ein technisches Hilfsmittel diese Daten und füllt die entsprechenden Felder im DFBnet-Vereinsportal (Mitgliederverwaltung) automatisiert aus.

**Wichtig dabei:**

1. Das technische Hilfsmittel erstellt im DFBnet ausschließlich **Entwürfe** ("Drafts"). Es führt **keine automatische Einreichung** und keine endgültige Speicherung durch.
2. Die finale Prüfung, Vervollständigung und das tatsächliche Einreichen erfolgt **manuell durch den Passwart** ("Human-in-the-Loop").
3. Es werden **keine** Massen-Anträge erstellt, keine Suchanfragen abgefeuert, und keine fremden Datensätze gelesen — das Tool agiert ausschließlich im Namen unseres Vereins und nur auf den Mitglieds-Anlage-Formularen.
4. Der Login erfolgt mit dem regulären Vereins-Account (CfB_Passwesen, Kundennummer XXXXX), wie er auch heute manuell genutzt wird.
5. Pro Werktag werden voraussichtlich **maximal 1-3 Anträge** auf diesem Weg erstellt; in Saisonbeginn-Wochen (Juli/August) bis zu 10 pro Tag.

**Unsere Fragen:**

1. Ist eine solche technische Unterstützung des Passwarts mit der DFBnet-Nutzungsbedingungen vereinbar, solange das Tool ausschließlich Entwürfe erstellt und die finale Einreichung manuell durch eine berechtigte Person erfolgt?
2. Falls ja, gibt es Auflagen, Mengenbegrenzungen oder eine Anmeldepflicht, die wir zu beachten haben?
3. Falls nein, welche Alternativen empfehlen Sie für Vereine unserer Größenordnung, um den administrativen Aufwand bei Spielerpass-Anträgen zu reduzieren?

Hintergrund unserer Anfrage ist, dass die manuelle Bearbeitung pro Antrag ca. 15 Minuten dauert und unseren ehrenamtlichen Passwart mit über 25 Stunden pro Saison belastet. Wir möchten die Entlastung des Ehrenamts auf rechtlich einwandfreiem Wege erreichen.

Für eine Rückmeldung danken wir Ihnen im Voraus. Gerne können wir die technische Architektur des geplanten Hilfsmittels auch in einem persönlichen Gespräch oder per Videocall vorstellen.

Mit sportlichen Grüßen

________________________________________
[Name Vorstand], Vorsitzende/r CfB Ford Köln-Niehl 09/52 e.V.
[Email]
[Telefon]

Köln, den ___.___.2026

---

## Was nach Versand zu dokumentieren ist

- **Versanddatum:** ___________________
- **Versandweg:** [ ] Email [ ] Einschreiben [ ] Persönliche Übergabe
- **Erwartete Antwortfrist:** 4 Wochen
- **Eskalationspfad falls keine Antwort:** DFB-Hauptverband (info@dfb.de), Westdeutscher Fußball- und Leichtathletikverband (info@wdfv.de)

## Bei positiver Antwort
Antwortschreiben einscannen, in `_compliance/dfb-zustimmung.pdf` ablegen. Zusatz: explizite Erwähnung in der Datenschutzerklärung, dass Antragsdaten durch technisches Hilfsmittel an DFBnet übermittelt werden.

## Bei negativer Antwort
- Stack-Plan B aktivieren: Frontend bleibt (Antragsteller-UI), Passwart kopiert manuell ins DFBnet (Wegfall des Bots, ~50% Zeitersparnis bleibt durch Pre-Filled Web-Formular)
- Bot-Code archivieren, nicht löschen — eventuell mit DFB-Zustimmung später aktivierbar
- Bot-VPS-Hosting nicht beauftragen
