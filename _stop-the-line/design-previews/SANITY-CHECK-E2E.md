# E2E Sanity-Check — Wizard 8 Steps
**Datum:** 2026-07-03
**Methode:** Alle 8 Screens gedanklich als User durchgeklickt, Konsistenz + UX-Fehler + Wortlaut-Widersprüche gesucht.

> Diese Datei ist die einzige Wahrheitsquelle für alle Konsistenz-Findings die vor der React-Portierung gefixt werden müssen. Nicht "nice-to-have"-Ideen sondern konkrete Widersprüche + UX-Reibungspunkte.

---

## Zusammenfassung Findings

**Kritisch (muss vor React-Portierung fix):** 4
**Mittel (sollte gefixt werden):** 6
**Kosmetisch (kann später):** 3

---

## 1. CTA-Button-Inkonsistenz (KRITISCH)

**Problem:** Die "Weiter"-Buttons haben unterschiedliche Semantik über die Steps.

| Step | Aktueller Button-Text |
|---|---|
| 2 Anmeldegrund | "Weiter" |
| 3 Spielerdaten | "Weiter" |
| 4 Upload | "Weiter" |
| 5 Spielberechtigung | "Zu den Erklärungen" |
| 6 Consent | "Zur Zahlung" |
| 7 Zahlung | "Aufnahmegebühr bezahlen · 20 €" |

**Bewertung:** Steps 5-7 sind bewusst spezifisch (nächstes Ziel benennen). Steps 2-4 sind faul generisch.

**Fix:** Alle spezifisch machen:
- Step 2 → **"Weiter zu den Spielerdaten"**
- Step 3 → **"Weiter zum Upload"**
- Step 4 → **"Zur Spielberechtigung"**

Ergibt einen sauberen erwartungssteigernden Flow durch den ganzen Wizard.

---

## 2. Headline-Sprech-Register unterschiedlich (KRITISCH)

**Problem:** Ich habe zwischen zwei Register-Töne gewechselt.

| Step | Headline | Ton |
|---|---|---|
| 1 Welcome | *"Hallo. Los geht's."* | Warm-persönlich |
| 2 Anmeldegrund | *"Wie ist die Situation?"* | Frage |
| 3 Erstanmeldung | *"Wer wird angemeldet?"* | Frage |
| 3 Vereinswechsel | *"Wer wechselt zu uns?"* | Frage |
| 3 Wiederanmeldung | *"Willkommen zurück."* | Warm-persönlich |
| 4 Upload | *"Ein Foto, ein Nachweis."* | Sachlich-Verkürzung |
| 5 Sofort/Sperrfrist/Abgelaufen | *"Prüfung abgeschlossen."* | Sachlich |
| 5 Einzelfall | *"Kurze Prüfung nötig."* | Sachlich |
| 6 Consent | *"Kurz durchgehen. Häkchen setzen."* | Aktiv-Aufforderung |
| 7 Zahlung | *"Beitrag & Aufnahme."* | Sachlich-Verkürzung |
| 8 Erfolg | *"Willkommen im Team. Wir kümmern uns."* | Warm-persönlich |

**Bewertung:** Drei Sprech-Modi wild gemischt: Frage / Sachlich-Verkürzung / Warm-Aufforderung. Bricht die Kohärenz.

**Fix-Empfehlung:** Zwei Modi konsequent, drittes vermeiden.

- **Frage** bei Input-Steps (2, 3): passt weil User was tut. **BLEIBT.**
- **Sachlich-Verkürzung** bei Info/Wahl-Steps (4, 5, 7): passt weil Verarbeitung. **BLEIBT.**
- **Warm-persönlich** nur bei Ankunft/Abschluss (1, 8): passt weil Emotion. **BLEIBT.**

**Konkret ändern:**
- Step 3 Wiederanmeldung *"Willkommen zurück."* → *"Wer meldet sich zurück?"* (bleibt bei Frage-Register wie andere Step-3-Varianten)
- Step 6 *"Kurz durchgehen. Häkchen setzen."* → *"Erklärungen & Unterschrift."* (sachlich wie andere Info-Steps)

---

## 3. Anrede-Konsistenz — "du" fehlt teilweise (MITTEL)

**Problem:** Wir haben uns aufs Duzen geeinigt, aber einige Screens haben noch **implizites Sie** durch fehlendes Subjekt.

Beispiele wo Neutralität wie "Sie" wirkt:
- Step 4: *"...einen Nachweis des Geburtsdatums. Alles vom Handy fotografiert reicht"* — kein "du", passiv
- Step 5: *"Wir haben die Angaben gegen das DFB-Regelwerk gecheckt"* — nur "wir"
- Step 6: *"Vier Erklärungen, ohne die keine Vereinsmitgliedschaft läuft"* — kein "du"

**Bewertung:** Kein Sie-Verstoß, aber der freundliche du-Ton aus Step 1 flacht ab.

**Fix (klein):** Einmal pro Screen ein "du" reinschmuggeln wo es natürlich passt. Nicht überall.

---

## 4. Progress-Marker verändert sich in Step 8 (MITTEL)

**Problem:** Step 8 zeigt *"Fertig · 08 / 08"* mit grünem Häkchen, alle anderen zeigen *"Schritt 03 von 08"*.

**Bewertung:** Ist bewusst — signalisiert Abschluss. Aber der Sprung zwischen Format-Konvention ist auffällig.

**Alternative:** Auf Step 8 den Marker ganz weglassen (kein Progress mehr sichtbar) und nur den Success-Kreis im Hero die Abschluss-Semantik tragen lassen.

**Empfehlung:** So lassen. Es funktioniert.

---

## 5. Kontext-Chips uneinheitlich (KRITISCH)

**Problem:** Wo zeige ich User was er in vorherigen Steps ausgewählt hat?

| Step | Chip vorhanden? | Zeigt was? |
|---|---|---|
| 1 Welcome | Nein | — |
| 2 Anmeldegrund | Nein | (wäre auch sinnlos, erster Wahl-Step) |
| 3 Erstanmeldung | ✅ *"Erstanmeldung · ändern"* | Aus Step 2 |
| 3 Vereinswechsel | ✅ *"Vereinswechsel · ändern"* | Aus Step 2 |
| 3 Wiederanmeldung | ✅ *"Wiederanmeldung · ändern"* | Aus Step 2 |
| 4 Upload | ✅ *"Vereinswechsel"* + *"Junior · U13"* | Aus Step 2 + Step 3 |
| 5 Spielberechtigung | ❌ FEHLT | Sollte Anmeldegrund + Team zeigen |
| 6 Consent | ❌ FEHLT | Sollte zumindest den Case zeigen |
| 7 Zahlung | ❌ FEHLT | Sollte Mannschaft zeigen (weil Beitrag davon abhängt) |
| 8 Erfolg | ❌ FEHLT | Keine Anwendung mehr, aber Antragsnummer ist der Anker |

**Bewertung:** Chip-Pattern gestartet in Step 3, dann in Step 4 erweitert (2 Chips), dann komplett verloren.

**Fix:** Chips in **allen Steps ab 3** anzeigen, konsistent mit Ändern-Link.

Konkret pro Step:
- Step 5: *"[Anmeldegrund] · [Team]"*
- Step 6: *"[Anmeldegrund]"*
- Step 7: *"[Team] · Aktives Mitglied"* (weil Beitrag daraus folgt)

---

## 6. "Was jetzt kommt"-Info-Box uneinheitlich (MITTEL)

**Problem:** Manche Screens verweisen auf den nächsten Step, manche nicht.

| Step | "Was jetzt kommt"-Info vorhanden? |
|---|---|
| 3 alle | Nein |
| 4 Upload | Info-Box "Was passiert mit den Dokumenten" (nicht was danach kommt) |
| 5 alle | ✅ **"Was jetzt kommt"**-Box |
| 6 Consent | Nein |
| 7 Zahlung | Nein |

**Bewertung:** Nur Step 5 hat die "Was jetzt kommt"-Box. Bei Info-Steps sinnvoll, bei Input-Steps redundant.

**Fix:** Konsistent nur bei Info-Screens (Step 5). Weglassen wo's ist inkonsistent macht keinen Sinn.

**Also: KEIN Fix nötig, aktueller Zustand ok.**

---

## 7. Container-Breite variiert (MITTEL)

**Problem:** `max-width` der Main-Section variiert zwischen Screens.

| Step | max-width |
|---|---|
| 1 Welcome | 1200px (weil zweispaltig Hero + Erwartungen) |
| 2 Anmeldegrund | 900px |
| 3 alle | 720px |
| 4 Upload | 780px |
| 5 alle | 780px |
| 6 Consent | 780px |
| 7 Zahlung | 780px |
| 8 Erfolg | 780px |

**Bewertung:** Step 1 (Zweispaltig) und Step 2 (Center-Cards) rechtfertigen ihre eigenen Breiten. Aber Step 3 mit 720px vs. Step 4-8 mit 780px ist **unnötige Inkonsistenz**.

**Fix:** Step 3 alle drei Varianten auf **780px** angleichen (60px mehr, Formular hat mehr Luft rechts).

---

## 8. Zurück-Button auf Step 8 fehlt (KRITISCH)

**Problem:** Alle Steps 2-7 haben "← Zurück"-Button in den Actions. Step 8 nicht.

**Bewertung:** Absicht — Antrag ist eingereicht, User soll nicht in Step 7 zurückfallen können. Backend-seitig wäre das auch inkonsistent (Zahlung schon durch).

**Aber:** User könnte Browser-Zurück nutzen und dabei Verwirrung stiften.

**Fix:** Beim Backend prüfen: bei Step 8 Zurück-Navigation blocken (per Reload/Session-Check). Kein UI-Element nötig.

**Empfehlung:** So lassen (kein Zurück-Button auf Step 8), aber Backend-Schutz einbauen.

---

## 9. Optional-Tag-Konsistenz (KOSMETISCH)

**Problem:** "Optional" Tag hat zwei visuelle Varianten.

- Step 2 Sonderfall International-Chip: Text-Link mit `mailto:`
- Step 3 Wiederanmeldung "Alte DFB-Passnummer" Label: `<span class="opt">— falls bekannt</span>`
- Step 4 Slot 3 (Abmeldebestätigung): `<span class="slot-tag tag-optional">Optional</span>` (grauer Pill)
- Step 6 Consent 4 (Foto): `<span class="req" style="...">Optional</span>` (inline-Style-Override)

**Bewertung:** Drei verschiedene Muster für "das ist optional".

**Fix:** Konsequent das **graue Pill** aus Step 4 überall nutzen wo Optional-Kennzeichnung gebraucht wird.

---

## 10. Zahl-Formate: Trennzeichen inkonsistent (KOSMETISCH)

**Problem:** Deutsche Zahlen-Konvention nicht überall gleich.

| Step | Beispiel |
|---|---|
| 5 Countdown | *"in 63 Tagen"* (kein Trennzeichen) |
| 7 Beträge | *"320,00 €"* (Komma) — korrekt DE |
| 5 Rechenweg | *"14. September 2026"* — Voll-Datum |
| 8 Antragsnummer | *"REG-2026-0042"* — internal ID |

**Bewertung:** Alle für sich okay. Datumsformate durchgehend deutsch, Beträge mit Komma korrekt.

**Fix:** Kein Handlungsbedarf. Nur beobachten dass tabular-nums in allen Zahlungs-Anzeigen ist (ist ✅).

---

## 11. Bild-Icons semantisch teilweise unklar (KOSMETISCH)

**Problem:** Manche SVG-Icons machen bei Screen-Reader wenig Sinn.

- Step 5B Timeline-Icon = Uhr — passt (Sperrfrist läuft)
- Step 5D Verdikt-Icon = Fragezeichen — passt (Prüfung nötig)
- Step 6 signature-note-Icon = Schild (DSGVO) — passt aber... Signatur-Kontext-Icon wäre "Feder" oder "Stift" idealer
- Step 8 Erfolgs-Kreis = Häkchen — passt

**Bewertung:** Alle funktional. Screen-Reader-User bekommen `aria-hidden` was ausblendet. Schild-vs-Feder ist Detail-Frage.

**Fix:** Später beim React-Port mit Lucide-Icons konsistent auswählen.

---

## 12. Wortlaut-Widerspruch "Papier" (BEREITS GEFIXT ✅)

**Vorher:** Step 6 hatte "Digitale Vor-Unterschrift, Papier folgt", `dokumente-pflicht.md` hatte "Original-Unterschriften auf Papier".

**Fix:** Beide korrigiert zu "rechtsgültig digital, kein zweites Papier nötig" (Commit `c032306`).

**Status:** OK.

---

## 13. Neutralitäts-Sweep vollständig? (KRITISCH)

**Check:** Habe ich "Kind"-Kontext in Steps 4-8 wirklich raus?

**Findings:**
- Step 4 (Upload): *"wenn der Spieler unter 18 ist"* ✅ neutral
- Step 5 alle: *"der Spieler"* ✅ neutral
- Step 6 Consent 1: *"Ich beantrage die Aufnahme in den CfB Ford Köln-Niehl 09/52 e.V."* ✅ subject-frei
- Step 6 Consent 3: *"Der Spieler darf am offiziellen Trainings- und Spielbetrieb..."* ✅ neutral
- Step 6 Consent 4 Foto: *"Fotos und Videos aus dem Trainings- und Spielbetrieb"* ✅ neutral (kein "Kind")
- Step 6 Junior-Hinweis: *"bei Junioren unter 18 Jahren"* ✅ neutral
- Step 7 alle: *"Aktives Mitglied (U15)"* ✅ neutral
- Step 8 alle: *"dein Antrag"*, *"Willkommen im Team"* ✅ neutral

**Bewertung:** **Vollständig neutral.**

---

## Zusammenfassung Handlungsplan (priorisiert)

### Vor React-Portierung fixen (Kritisch)

1. **CTA-Text spezifisch machen** in Steps 2-4 (aus "Weiter" wird "Weiter zu ..."):
   - Step 2 → *"Weiter zu den Spielerdaten"*
   - Step 3 → *"Weiter zum Upload"*
   - Step 4 → *"Zur Spielberechtigung"*
2. **Kontext-Chips** in Steps 5, 6, 7 nachziehen (Anmeldegrund + ggf. Team)
3. **Container-Breite Step 3** von 720px auf 780px (Konsistenz zu 4-8)
4. **Step 3 Wiederanmeldung** Headline aus *"Willkommen zurück."* auf Frage-Register: *"Wer meldet sich zurück?"*
5. **Step 6** Headline aus *"Kurz durchgehen. Häkchen setzen."* auf sachlich: *"Erklärungen & Unterschrift."*

### Nach React-Port polish (Mittel)

6. **du-Ton verstärken** in Step 4, 5, 6 (je 1 natürliches "du" reinschmuggeln)
7. **Optional-Pill konsistent** in Step 3 (Wiederanmeldung "Alte DFB-Passnummer") + Step 6 (Fotoerlaubnis) — das graue Pill aus Step 4 überall
8. **Zurück-Button Step 8** backend-blockieren

### Nice-to-have (Kosmetisch)

9. Icon-Auswahl mit Lucide beim React-Port harmonisieren
10. Zahlen-Format tabular-nums überall (aktuell bereits gut)

---

## Was gut ist (nicht ändern)

- ✅ Progress-Marker durchgehend "Schritt XX von 08" bis Step 7, Step 8 mit "Fertig" (bewusster Bruch)
- ✅ Farb-System Blau-Weiß + Rheingrün ≤3% konsequent
- ✅ Info-Box-Pattern (blaue Border-Left + Vereinsblau-Icon) durchgehend
- ✅ Erwartungsmanagement in jedem Screen (Zeitangaben, "was passiert danach")
- ✅ Neutrales Wording (Spieler/Mitglied) über alle Screens
- ✅ Adaptive Screens funktionieren (Step 3 x 3, Step 4 x 3-Slot-Adaption, Step 5 x 4)

---

**Nach Fixen der 5 kritischen Punkte ist der Wizard bereit für React-Portierung.**
