# CFB Ford Köln-Niehl — Website Maßnahmenplan
**Projekt:** Website-Relaunch / Optimierung  
**Basis:** Gesamt-Audit 2026-06-28 (Score: 3,3/10)  
**Ziel:** Website als aktives Recruiting-Tool für Mitglieder, Eltern & Sponsoren  
**Stand:** 2026-06-29

---

## Rollen & Verantwortliche

| Kürzel | Rolle | Zuständigkeit |
|---|---|---|
| **[CFB-WEB]** | Vereins-Webmaster (Jimdo-Zugang) | Alle Jimdo-Backend-Änderungen |
| **[CFB-MKT]** | Marketing/Kommunikation | Texte, Social Media, Fotos |
| **[CFB-VOR]** | Vorstand | Freigaben, Datenschutz, DSGVO-Angaben |
| **[CFB-JUG]** | Jugendleitung | Inhalte Jugend-Seiten, Trainingszeiten |
| **[CFB-SEN]** | Sportliche Leitung Senioren | Inhalte Senioren-Seiten |
| **[EXT-DEV]** | Externer Entwickler (optional) | Schema-Markup, technische Umsetzungen |

---

## PHASE 1 — SOFORT-FIXES
**Zeitrahmen:** Diese Woche (bis 2026-07-04)  
**Aufwand gesamt:** ~4 Stunden  
**Budget:** 0 €  
**Verantwortlich:** [CFB-WEB] + [CFB-VOR]

---

### T-01 · Seitentitel "passwesesen" korrigieren
**Priorität:** 🔴 KRITISCH  
**Aufwand:** 5 Minuten  
**Verantwortlich:** [CFB-WEB]  
**Deadline:** Heute

**Problem:** Seitentitel auf `/mitgliedschaft/mitglied-werden/` lautet "passwesesen des cfb ford köln-niehl 09/52" — Rechtschreibfehler + falscher Inhalt auf der wichtigsten Conversion-Seite.

**Umsetzung:**
1. Jimdo-Backend öffnen → Seite `/mitgliedschaft/mitglied-werden/` auswählen
2. Seitentitel ändern auf: `Mitglied werden — CfB Ford Köln-Niehl 09/52 e.V.`
3. H1-Überschrift der Seite prüfen und auf `Mitglied werden beim CfB Ford Niehl` setzen
4. Speichern + Veröffentlichen

**Erfolgskriterium:** Seitentitel korrekt sichtbar im Browser-Tab und in Google-Vorschau.

---

### T-02 · H1-Tag auf der Homepage setzen
**Priorität:** 🔴 KRITISCH  
**Aufwand:** 15 Minuten  
**Verantwortlich:** [CFB-WEB]  
**Deadline:** Heute

**Problem:** Keine H1-Überschrift auf der Root-URL `/` — WCAG-Verstoß + SEO-Nachteil.

**Umsetzung:**
1. Jimdo-Backend → Startseite (News-Seite) bearbeiten
2. Ersten Textblock als H1 formatieren, Text: `CfB Ford Köln-Niehl — Fußball im Kölner Norden`
3. Falls Jimdo keine H1 auf der News-Seite erlaubt: HTML-Widget mit `<h1 class="sr-only">CfB Ford Köln-Niehl — Fußball im Kölner Norden</h1>` einfügen (SEO-wirksam, visuell unsichtbar)
4. Gleichzeitig: H1 auf allen anderen Seiten ohne H1 prüfen (Gaststätte, Informationen, Turniere/Camps)

**Erfolgskriterium:** Browser DevTools → `document.querySelector('h1')` gibt Text zurück.

---

### T-03 · Datenschutzerklärung auf Deutsch + Pflichtangaben
**Priorität:** 🔴 KRITISCH (DSGVO-Verstoß)  
**Aufwand:** 45 Minuten  
**Verantwortlich:** [CFB-VOR] + [CFB-WEB]  
**Deadline:** Diese Woche

**Problem:** Datenschutzerklärung unter `/j/privacy` ist englischsprachige Jimdo-Standardseite — für deutsche Website DSGVO-Verstoß. Außerdem fehlen: Verantwortliche Person, Betroffenenrechte.

**Umsetzung:**
1. Jimdo-Einstellungen → Sprache auf Deutsch stellen (falls vorhanden)
2. Eigene Datenschutzseite im Verein anlegen: `/datenschutz/` mit deutschsprachigem Text
3. Pflichtangaben einfügen:
   - **Verantwortlicher:** Name, Adresse, E-Mail des Vorstands
   - **Verarbeitungszwecke:** Jimdo Statistics (anonym), reCAPTCHA, Kontaktformular
   - **Betroffenenrechte:** Auskunft, Löschung, Einschränkung, Widerspruch, Beschwerde bei LfDI NRW
   - **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO
4. Link im Footer sichtbar platzieren: "Datenschutz" + "Impressum"
5. Impressum anlegen falls noch nicht vorhanden (TMG § 5 Pflicht)

**Ressource:** Kostenloser DSGVO-Generator: https://www.datenschutz-generator.de/ (für Vereine geeignet)

**Erfolgskriterium:** Datenschutzerklärung auf Deutsch, alle Pflichtangaben vorhanden, im Footer verlinkt.

---

### T-04 · Sticky CTA "Probetraining" im Header
**Priorität:** 🔴 HOCH  
**Aufwand:** 20 Minuten  
**Verantwortlich:** [CFB-WEB]  
**Deadline:** Diese Woche

**Problem:** Probetraining — die wichtigste Conversion-Aktion — ist nirgendwo in der Navigation verlinkt.

**Umsetzung Option A (einfach):**
- Jimdo-Navigation: Neuen Menüpunkt hinzufügen: "Probetraining ▶" → Link zu `/spielbetrieb-formulare/cfb-probetraining-online-anmelden/`
- Menüpunkt als letzten Punkt platzieren, falls möglich farblich hervorheben

**Umsetzung Option B (besser):**
- Jimdo Header-Bereich: Button-Widget einbauen mit Text "Probetraining anmelden" und Telefonnummer `0221-7121161`
- Hintergrund: Vereinsblau, Text: Weiß, Bold

**Erfolgskriterium:** Von jeder Seite aus ist "Probetraining" mit einem Klick erreichbar.

---

### T-05 · Einen primären Mitgliedschafts-Weg kennzeichnen
**Priorität:** 🔴 HOCH  
**Aufwand:** 15 Minuten  
**Verantwortlich:** [CFB-WEB]  
**Deadline:** Diese Woche

**Problem:** Auf `/mitgliedschaft/` gibt es zwei parallele, widersprüchliche Wege (DFBnet-Online-Antrag vs. PDF-Scans) ohne Erklärung welcher der richtige ist → Decision Paralysis.

**Umsetzung:**
1. `/mitgliedschaft/` bearbeiten
2. DFBnet-Link als primären Weg kennzeichnen: `→ Empfohlen: Online-Mitgliedsantrag (in 5 Minuten)`
3. PDF-Weg als Alternativweg für Nicht-Online-Nutzer kennzeichnen: `Alternative: Formular ausdrucken`
4. Kurze Erklärung ergänzen was beim DFBnet-Weg passiert (Kontextverlust durch externe Seite)

**Erfolgskriterium:** Besucher wissen sofort welchen Weg sie nehmen sollen.

---

## PHASE 2 — DIESE WOCHE
**Zeitrahmen:** 2026-06-30 bis 2026-07-06  
**Aufwand gesamt:** ~2–3 Tage  
**Budget:** 0 €  
**Verantwortlich:** [CFB-WEB] + [CFB-MKT] + [CFB-JUG]

---

### T-06 · Google Business Profile einrichten & optimieren
**Priorität:** 🟠 SEHR HOCH (größter SEO-Einzelhebel)  
**Aufwand:** 2–4 Stunden  
**Verantwortlich:** [CFB-VOR] oder [CFB-MKT]  
**Deadline:** 2026-07-06

**Problem:** Kein verifiziertes Google Business Profile → unsichtbar bei lokalen Suchen ("Fußballverein Köln-Niehl").

**Umsetzung:**
1. https://business.google.com aufrufen, Konto erstellen/einloggen
2. Verein suchen — falls bereits vorhanden: Eigentümerschaft beanspruchen
3. Vollständig ausfüllen:
   - **Name:** `CfB Ford Köln-Niehl 09/52 e.V.` (exakt konsistent mit Website!)
   - **Kategorie:** Sportverein / Fußballverein
   - **Adresse:** Pastor-Wolff-Straße 11a, 50735 Köln
   - **Telefon:** 0221-7121161
   - **Website:** https://www.cfb-fordniehl.de/
   - **Öffnungszeiten:** Büro- / Trainingszeiten eintragen
   - **Beschreibung:** "Fußballverein in Köln-Niehl seit 1909. 19 Jugendmannschaften von der Ballschule (ab 3 Jahren) bis U19, Senioren und Alte Herren. Eigene Turniere: Pfingstcup und Herbstcup."
4. **Fotos hochladen:** Mindestens 5 (Sportanlage, Mannschaftsfoto, Logo, Gaststätte, Training)
5. **Verifizierung:** Per Postkarte (dauert 1–2 Wochen) oder Telefon/E-Mail falls angeboten
6. **Wöchentliche Posts:** Spielergebnisse, News, Termine direkt über GBP veröffentlichen

**Erfolgskriterium:** GBP erscheint in Google Maps und lokaler Suche für "Fußballverein Köln-Niehl".

---

### T-07 · Navigation auf 6 Hauptpunkte reduzieren
**Priorität:** 🟠 HOCH  
**Aufwand:** 1–2 Stunden  
**Verantwortlich:** [CFB-WEB]  
**Deadline:** 2026-07-05

**Problem:** 16+ Top-Nav-Punkte erzwingen 2-zeiligen Umbruch, Scan-Kosten extrem hoch.

**Neue Navigation:**
```
News | Mannschaften | Informationen | Mitmachen | Verein | Kontakt | [Probetraining →]
```

**Zuordnung der bisherigen Seiten:**
| Bisheriger Menüpunkt | Neuer Ort |
|---|---|
| Startseite | → Unter "Verein" oder als Unter-Link von "News" |
| Über Uns | → Unter "Verein" |
| Leitungen / Mannschaften | → "Mannschaften" (Top-Level) |
| Platzbelegungsplan | → Unter "Mannschaften" oder "Informationen" |
| Informationen | → "Informationen" (Top-Level, mit Dropdown) |
| Turniere/Camps | → Unter "Mannschaften" oder "Informationen" |
| Vorstand | → Unter "Verein" |
| Kontakt | → "Kontakt" (Top-Level) |
| Spielbetrieb/Formulare | → Unter "Mitmachen" |
| Mitgliedschaft | → Unter "Mitmachen" |
| Vereinsshop JAKO | → Footer |
| Mitgliederversammlung 2026 | → Footer oder News-Artikel |
| Gaststätte | → Unter "Informationen" (nach T-12 Reparatur) |
| Sitemap | → Footer |

**Erfolgskriterium:** Navigation ist 1-zeilig auf Desktop, max. 6 Top-Level-Punkte.

---

### T-08 · Alt-Texte für alle Bilder nachtragen
**Priorität:** 🟠 HOCH (Accessibility + SEO)  
**Aufwand:** 1–2 Stunden  
**Verantwortlich:** [CFB-WEB] + [CFB-MKT]  
**Deadline:** 2026-07-06

**Problem:** Keine Alt-Texte auf Bildern — WCAG 1.1.1 verletzt, Google Bilder-SEO verloren.

**Umsetzung:**
1. Jimdo-Backend → Jedes Bild anklicken → Alt-Text-Feld ausfüllen
2. Naming-Konvention: `[Beschreibung] — CfB Ford Köln-Niehl`
   - Spielerfoto: `Spieler beim Training — CfB Ford Köln-Niehl`
   - Mannschaftsfoto: `U10 Mannschaft CfB Ford Niehl 2026`
   - Logo: `CfB Ford Köln-Niehl 09/52 e.V. Logo`
3. News-Bilder: Bildunterschrift = Alt-Text des Artikelthemas
4. Ab sofort: Jedes neue Bild direkt beim Upload mit Alt-Text versehen (Workflow etablieren)

**Erfolgskriterium:** Alle sichtbaren Bilder haben beschreibende Alt-Texte.

---

### T-09 · Beitragsübersicht als HTML-Tabelle
**Priorität:** 🟠 HOCH (Conversion)  
**Aufwand:** 30 Minuten  
**Verantwortlich:** [CFB-VOR] + [CFB-WEB]  
**Deadline:** 2026-07-04

**Problem:** Mitgliedsbeiträge sind nicht sichtbar — Eltern suchen als Erstes nach den Kosten.

**Umsetzung:**
1. Aktuelle Beitragsstruktur vom Vorstand erfragen (Werte ab 01.07.2026 gemäß letzter Erhöhung)
2. Auf `/mitgliedschaft/` vor dem Mitgliedsantrag-Link einfügen:

```
| Mitgliedskategorie       | Monatsbeitrag |
|--------------------------|---------------|
| Kinder/Jugendliche       | X,XX €        |
| Erwachsene               | X,XX €        |
| Ermäßigt (auf Anfrage)   | X,XX €        |
| Passive Mitglieder       | X,XX €        |
```

3. Hinweis ergänzen: "Einmaliger Aufnahme-Beitrag: X,XX €"

**Erfolgskriterium:** Beitragsübersicht direkt sichtbar auf `/mitgliedschaft/` ohne PDF-Download.

---

### T-10 · Meta-Descriptions + Titles auf 13 Kernseiten optimieren
**Priorität:** 🟠 HOCH (SEO)  
**Aufwand:** 2 Stunden  
**Verantwortlich:** [CFB-WEB] + [CFB-MKT]  
**Deadline:** 2026-07-06

**Problem:** Keine Meta-Descriptions site-weit, Titles teilweise in Kleinbuchstaben oder inhaltsleer.

**Optimierte Titles & Meta-Descriptions (Vorlage):**

| Seite | Neuer Title (max. 60 Zeichen) | Meta-Description (max. 155 Zeichen) |
|---|---|---|
| `/` | CfB Ford Köln-Niehl 09/52 e.V. — Fußball in Niehl | Fußballverein im Kölner Norden. 19 Jugendteams von der Ballschule bis U19 + Senioren. Probetraining jederzeit möglich. |
| `/startseite/` | Talentförderung im Kölner Norden — CfB Ford Niehl | Vom Bambini bis zum Seniorenspieler — der CfB Ford Niehl bietet Fußball für jedes Alter in Köln-Niehl. |
| `/über-uns/` | Über den CfB Ford Köln-Niehl — Seit 1909 | Der CfB Ford Köln-Niehl ist seit über 100 Jahren ein fester Bestandteil des Kölner Nordens. Erfahre mehr über unsere Geschichte. |
| `/leitungen-mannschaften/` | Mannschaften & Leitung — CfB Ford Köln-Niehl | Alle Mannschaften des CfB Ford Niehl: Senioren, Junioren U7–U19 und Ballschule ab 3 Jahren. |
| `/mitgliedschaft/` | Mitglied werden — CfB Ford Köln-Niehl | Jetzt Mitglied beim CfB Ford Köln-Niehl werden. Online-Antrag in 5 Minuten. Alle Beitragsinformationen auf einen Blick. |
| `/kontakt/` | Kontakt — CfB Ford Köln-Niehl | Fragen zum Verein, Probetraining oder zur Mitgliedschaft? Schreib uns — wir antworten innerhalb von 2 Werktagen. |
| `/vorstand/` | Vorstand — CfB Ford Köln-Niehl 09/52 e.V. | Der Vorstand des CfB Ford Köln-Niehl: Ansprechpartner für alle Vereinsangelegenheiten. |
| `/informationen/` | Informationen — CfB Ford Köln-Niehl | Satzung, Chronik, Anfahrt, Kinder-Jugendschutzkonzept und mehr Informationen über den CfB Ford Köln-Niehl. |
| `/platzbelegungsplan/` | Trainingszeiten 2025/2026 — CfB Ford Köln-Niehl | Alle Trainingszeiten und Platzbelegungen für alle Mannschaften des CfB Ford Köln-Niehl 2025/2026. |
| `/turniere-camps/` | Turniere & Camps — CfB Ford Köln-Niehl | Eigene Turniere des CfB Ford Niehl: U9-Pfingstcup und U10-Herbstcup. Alle Infos, Ergebnisse und Tabellen. |
| `/spielbetrieb-formulare/` | Formulare & Spielbetrieb — CfB Ford Köln-Niehl | Online-Formulare für Probetraining, Materialbestellung, Busplan und mehr. Alles auf einen Blick. |
| `/vereinsshop-des-cfb-bei-jako/` | Vereinsshop — CfB Ford Köln-Niehl bei JAKO | Offizieller Vereinsshop des CfB Ford Köln-Niehl bei JAKO. Trikots, Trainingskleidung und mehr. |
| `/gaststätte/` | Gaststätte — CfB Ford Köln-Niehl | Die Vereinsgaststätte des CfB Ford Köln-Niehl — Treffpunkt nach dem Spiel und für Vereinsveranstaltungen. |

**Umsetzung:** Jimdo-Backend → Jede Seite → SEO-Einstellungen → Title + Description eintragen.

---

## PHASE 3 — DIESEN MONAT
**Zeitrahmen:** 2026-07-07 bis 2026-07-31  
**Aufwand gesamt:** ~1–2 Wochen  
**Budget:** 0–100 € (optional: Foto-Shooting)  
**Verantwortlich:** [CFB-WEB] + [CFB-MKT] + [CFB-JUG] + [EXT-DEV optional]

---

### T-11 · Schema-Markup (JSON-LD) via Jimdo HTML-Widget
**Priorität:** 🟡 HOCH (SEO + AI-Sichtbarkeit)  
**Aufwand:** 2–3 Stunden  
**Verantwortlich:** [EXT-DEV] oder [CFB-WEB] mit technischer Anleitung  
**Deadline:** 2026-07-15

**Problem:** Kein strukturiertes Schema-Markup → keine Rich Results, kein Google Knowledge Panel, keine AI-Overview-Zitierungen.

**Umsetzung:**
1. Jimdo-Backend → Startseite → HTML-Widget einfügen
2. Folgenden JSON-LD-Code einfügen (Platzhalter ersetzen):

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SportsClub", "LocalBusiness"],
      "@id": "https://www.cfb-fordniehl.de/#organization",
      "name": "CfB Ford Köln-Niehl 09/52 e.V.",
      "url": "https://www.cfb-fordniehl.de/",
      "logo": "https://www.cfb-fordniehl.de/[LOGO-URL]",
      "description": "Fußballverein in Köln-Niehl mit 19 Jugendmannschaften von der Ballschule bis U19 sowie Senioren. Gegründet 1909.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Pastor-Wolff-Straße 11a",
        "addressLocality": "Köln",
        "postalCode": "50735",
        "addressCountry": "DE"
      },
      "telephone": "+49-221-7121161",
      "email": "info@cfbfordniehl.de",
      "sport": "Fußball",
      "foundingDate": "1909",
      "areaServed": "Köln-Niehl",
      "sameAs": ["https://www.facebook.com/[FB-SEITE]"]
    }
  ]
}
</script>
```

3. Validierung: https://search.google.com/test/rich-results — URL der Homepage eingeben

**Erfolgskriterium:** Rich Results Test zeigt gültige SportsClub-Entität ohne Fehler.

---

### T-12 · Gaststätte-Seite reparieren (404 beheben)
**Priorität:** 🟡 MITTEL  
**Aufwand:** 1 Stunde  
**Verantwortlich:** [CFB-WEB] + [CFB-VOR]  
**Deadline:** 2026-07-15

**Problem:** `/gaststätte/` gibt 404 zurück — stärkster Community-Ankerpunkt digital verloren.

**Umsetzung:**
1. Seite in Jimdo neu anlegen unter `/gaststätte/`
2. Mindestinhalt:
   - Kurzbeschreibung der Gaststätte
   - Öffnungszeiten
   - Kontakt / Reservierung
   - 1–2 Fotos
   - Hinweis auf Veranstaltungen
3. In Navigation unter "Informationen" oder neuer Kategorie "Anlage" verlinken

---

### T-13 · FAQ-Seite erstellen (SEO + Eltern-Conversion)
**Priorität:** 🟡 HOCH  
**Aufwand:** 2–3 Stunden  
**Verantwortlich:** [CFB-MKT] + [CFB-JUG]  
**Deadline:** 2026-07-20

**Problem:** Häufigste Fragen von Eltern und Interessierten werden nirgendwo beantwortet → SEO-Potential ungenutzt, AI-Overviews verpassen den Verein.

**Umsetzung:** Neue Jimdo-Seite `/mitmachen/faq/` oder `/informationen/faq/` mit mindestens diesen Fragen:

1. Wie melde ich mein Kind beim CfB Ford Köln-Niehl an?
2. Ab welchem Alter kann mein Kind Fußball spielen?
3. Was kostet die Mitgliedschaft beim CfB Ford Niehl?
4. Wie läuft ein Probetraining ab?
5. Wo liegt der Sportplatz des CfB Ford Niehl in Köln?
6. Welche Mannschaften hat der CfB Ford Köln-Niehl?
7. Wann und wo findet das Training statt?
8. Braucht mein Kind besondere Ausrüstung für das Probetraining?
9. Wie kann ich als Erwachsener beim CfB Ford Niehl mitspielen?
10. Gibt es eine Gaststätte beim CfB Ford Niehl?

**Format:** Jede Frage als H2 oder H3, direkte Antwort im ersten Satz.

---

### T-14 · Hero-Section auf /startseite/ mit CTAs
**Priorität:** 🟡 SEHR HOCH (Marketing + Conversion)  
**Aufwand:** 4–8 Stunden  
**Verantwortlich:** [CFB-WEB] + [CFB-MKT]  
**Deadline:** 2026-07-20

**Problem:** Die beste Seite der Website (`/startseite/`) hat keinen Conversion-CTA — "Mitglied werden" und "Probetraining" fehlen im Quick-Links-Grid vollständig.

**Umsetzung:**
1. `/startseite/` Hero-Text optimieren:
   - **H1:** `Fußball für Kinder, Jugendliche und Erwachsene im Kölner Norden`
   - **Subline:** `Von der Ballschule (ab 3 Jahren) bis zu den Senioren — 19 Jugendteams, lizenzierte Trainer, Ihre Heimat in Köln-Niehl.`
2. Quick-Links-Grid erweitern auf 6 Kacheln:
   - NEWS | ÜBER UNS | TEAMS | TURNIERE | **PROBETRAINING** ⭐ | **MITGLIED WERDEN** ⭐
   - Die zwei neuen Kacheln farblich hervorheben (z.B. Goldton oder helleres Blau)
3. Social-Proof-Zeile darunter: `500+ Mitglieder · 19 Jugendteams · U10: 5 Turniersiege 2026`
4. `/startseite/` als Redirect-Ziel von `/` setzen (oder Hero-Block auf `/` duplizieren)

---

### T-15 · Sitemap bereinigen (728 → ~150 URLs)
**Priorität:** 🟡 MITTEL (SEO Technik)  
**Aufwand:** 2–3 Stunden  
**Verantwortlich:** [CFB-WEB]  
**Deadline:** 2026-07-25

**Problem:** 728 URLs in der Sitemap, davon viele kryptische Platzhalter-Posts (`/ggff/`, `/z/`, `/uuu/`) und bestätigte 404-URLs — schlechtes Crawling-Signal an Google.

**Umsetzung:**
1. Jimdo-Backend → Alle Seiten/Posts anzeigen
2. Alle Posts mit kryptischen Slugs (ein-/zweistellige Slugs ohne Bedeutung) prüfen:
   - Ist es ein versehentlich veröffentlichter Entwurf? → Auf "Entwurf" zurücksetzen
   - Ist die Seite leer oder Duplikat? → Löschen
3. Veraltete Seiten (`/soccerwatch-tv/`, `/mannschaften/`) löschen oder auf aktive URLs weiterleiten
4. Ziel: Nur echte, indexierungswürdige Seiten in der Sitemap
5. Nach Bereinigung: Sitemap in Google Search Console einreichen (falls noch nicht vorhanden)

---

### T-16 · Instagram aufbauen & auf Website verlinken
**Priorität:** 🟡 HOCH (Marketing)  
**Aufwand:** 2h Setup + laufend  
**Verantwortlich:** [CFB-MKT]  
**Deadline:** Setup bis 2026-07-15, dann wöchentlich

**Problem:** Instagram fehlt — wichtigster Kanal für Eltern (25–45J.) und Jugendspieler (13–19J.) nicht bespielt oder nicht verlinkt.

**Umsetzung Setup:**
1. Account erstellen: `@cfbfordniehl` (oder nächste verfügbare Variante)
2. Bio: `Fußball im Kölner Norden ⚽ | Ballschule bis Senioren | 19 Jugendteams | Probetraining: [Link]`
3. Link in Bio → direkt zur Probetraining-Seite
4. Profilbild: CfB-Logo
5. Auf Website verlinken: Footer + /startseite/ Social-Icons ergänzen

**Content-Kalender (Minimalversion):**
| Rhythmus | Content-Typ |
|---|---|
| Nach jedem Spiel | Ergebnis-Post mit Mannschaftsfoto + Score |
| 1× pro Woche | Trainingsblick — Foto oder kurzes Video (15s) |
| 1× pro Monat | "Spieler des Monats" — Name, Team, Kurzzitat |
| Turniersaison | Tägliche Stories mit Live-Updates |

---

### T-17 · Probetraining-Seite mit Online-Formular
**Priorität:** 🟡 SEHR HOCH (Conversion)  
**Aufwand:** 1–2 Tage  
**Verantwortlich:** [CFB-WEB] + [CFB-JUG]  
**Deadline:** 2026-07-31

**Problem:** Probetraining-Seite hat nur PDF-Download — 5-Schritt-Offline-Hürde für die niedrigschwelligste Aktion des Vereins.

**Umsetzung:**
1. Neue Seite anlegen: `/mitmachen/probetraining/`
2. Seitenstruktur:
   - **H1:** `Probetraining beim CfB Ford Niehl — Komm einfach vorbei`
   - **Selling Points** (3 Stück, konkret): lizenzierte Trainer, neue Kunstrasenplätze, U10 gewann 5 Turniere 2026
   - **Online-Formular** (4 Felder): Name des Kindes, Geburtsjahr, gewünschte Altersgruppe (Dropdown), Telefon der Eltern
   - **Alternativ:** Direktlink zu WhatsApp Business: "Lieber per WhatsApp? Schreib uns direkt →"
   - **Hinweis zum Ablauf:** "Wir melden uns innerhalb von 24 Stunden für einen Termin"
   - Bürokratie-Hinweis (bisherige Vereinsgenehmigung) ans **Ende** der Seite
3. Formular-Option A (kostenlos): Jimdo-eigenes Kontaktformular
4. Formular-Option B (besser): Google Forms einbetten (kostenlos, Antworten in Google Sheets)

---

## PHASE 4 — NÄCHSTES QUARTAL
**Zeitrahmen:** Q3 2026 (August–September)  
**Aufwand:** Mehrere Wochen  
**Budget:** Je nach Umsetzungsweg: 0 € (Eigenleistung) bis ~2.000–5.000 € (Agentur)  
**Entscheidung:** Jimdo weiter optimieren vs. Plattformwechsel evaluieren

---

### T-18 · Spielplan-Integration (Live-Widget)
**Priorität:** 🟢 HOCH  
**Aufwand:** 1–2 Tage  
**Verantwortlich:** [EXT-DEV] oder [CFB-WEB]

**Umsetzung:**
- FuPa-Widget oder fußball.de-Widget für alle Mannschaften einbetten
- Neue Seite `/spielbetrieb/spielplan/` mit Live-Tabelle + nächste Spiele
- Widget auf jeweiligen Mannschaftsseiten einbetten

---

### T-19 · Vollständiges Informationsarchitektur-Redesign
**Priorität:** 🟢 STRATEGISCH  
**Verantwortlich:** [EXT-DEV] + [CFB-VOR]

Umsetzung der SOLL-Navigation (aus Site-Architecture-Audit):
```
Aktuelles | Mannschaften | Sportbetrieb | Mitmachen | Verein | Anlage | [Probetraining →]
```
Jugend-URLs von 19 flach → 4 Altersgruppen-Cluster mit Tab-Navigation.  
301-Redirects für alle geänderten URLs.

---

### T-20 · Plattformwechsel evaluieren
**Priorität:** 🟢 STRATEGISCH  
**Verantwortlich:** [CFB-VOR]

**Frage:** Jimdo erreicht seine Grenzen bei Schema-Markup, Custom Code, WCAG-Compliance und Mobile-First. Evaluation: WordPress + Vereins-Theme (z.B. ClubPress) vs. statischer Site-Generator vs. spezialisierte Vereins-Software (z.B. e-motion.software, VereinOnline).

**Entscheidungskriterien:**
- Kann der Verein die Website selbst pflegen?
- Budget für einmalige Entwicklung + laufende Kosten?
- Soll Mitgliederverwaltung integriert werden?

---

## Fortschritts-Tracker

| Task | Status | Verantwortlich | Deadline | Erledigt am |
|---|---|---|---|---|
| T-01 "passwesesen" korrigieren | ⬜ Offen | [CFB-WEB] | Heute | |
| T-02 H1 Homepage | ⬜ Offen | [CFB-WEB] | Heute | |
| T-03 Datenschutz auf Deutsch | ⬜ Offen | [CFB-VOR]+[CFB-WEB] | Diese Woche | |
| T-04 Probetraining-CTA in Header | ⬜ Offen | [CFB-WEB] | Diese Woche | |
| T-05 Mitgliedschafts-Weg kennzeichnen | ⬜ Offen | [CFB-WEB] | Diese Woche | |
| T-06 Google Business Profile | ⬜ Offen | [CFB-MKT] | 2026-07-06 | |
| T-07 Navigation reduzieren | ⬜ Offen | [CFB-WEB] | 2026-07-05 | |
| T-08 Alt-Texte Bilder | ⬜ Offen | [CFB-WEB] | 2026-07-06 | |
| T-09 Beitragsübersicht HTML | ⬜ Offen | [CFB-VOR]+[CFB-WEB] | 2026-07-04 | |
| T-10 Titles + Meta-Descriptions | ⬜ Offen | [CFB-WEB]+[CFB-MKT] | 2026-07-06 | |
| T-11 Schema-Markup JSON-LD | ⬜ Offen | [EXT-DEV] | 2026-07-15 | |
| T-12 Gaststätte 404 reparieren | ⬜ Offen | [CFB-WEB]+[CFB-VOR] | 2026-07-15 | |
| T-13 FAQ-Seite erstellen | ⬜ Offen | [CFB-MKT]+[CFB-JUG] | 2026-07-20 | |
| T-14 Hero-Section /startseite/ | ⬜ Offen | [CFB-WEB]+[CFB-MKT] | 2026-07-20 | |
| T-15 Sitemap bereinigen | ⬜ Offen | [CFB-WEB] | 2026-07-25 | |
| T-16 Instagram aufbauen | ⬜ Offen | [CFB-MKT] | 2026-07-15 | |
| T-17 Probetraining Online-Formular | ⬜ Offen | [CFB-WEB]+[CFB-JUG] | 2026-07-31 | |
| T-18 Spielplan Live-Widget | ⬜ Offen | [EXT-DEV] | Q3 2026 | |
| T-19 IA-Redesign | ⬜ Offen | [EXT-DEV]+[CFB-VOR] | Q3 2026 | |
| T-20 Plattformwechsel Evaluation | ⬜ Offen | [CFB-VOR] | Q3 2026 | |

---

## Erwarteter Score nach Umsetzung

| Phase | Score nach Abschluss | Wichtigste Verbesserungen |
|---|---|---|
| IST (heute) | 3,3 / 10 | Ausgangslage |
| Nach Phase 1 (Sofort) | ~4,5 / 10 | Vertrauen, DSGVO, Basis-SEO |
| Nach Phase 2 (Diese Woche) | ~5,5 / 10 | Local SEO, Navigation, Accessibility |
| Nach Phase 3 (Diesen Monat) | ~6,5 / 10 | Conversion, Content, Social Media |
| Nach Phase 4 (Quartal) | ~7,5 / 10 | Vollständige moderne Vereinswebsite |

---

*Erstellt: 2026-06-29 | Basis: CFB Website Gesamt-Audit 2026-06-28*  
*Dateipfad: C:\Users\D062515\Desktop\CFB-Projekt\cfb-massnahmenplan.md*
