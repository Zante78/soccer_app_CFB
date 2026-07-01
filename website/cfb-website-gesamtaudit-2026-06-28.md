# CFB Ford Köln-Niehl 09/52 e.V. — Website Gesamt-Audit
**URL:** https://www.cfb-fordniehl.de/ | **CMS:** Jimdo | **Analysiert:** 2026-06-28  
**Methodik:** 7 parallele Audit-Agents (SEO · Marketing · UI/UX · CRO · Analytics · Site-Architecture · Competitor)

---

## Score-Card Übersicht

| Dimension | Score | Gewichtung | Gewichtet |
|---|---|---|---|
| **SEO** | 4,2 / 10 | 20% | 0,84 |
| **Marketing & Messaging** | 3,6 / 10 | 20% | 0,72 |
| **UI/UX & Design** | 3,0 / 10 | 20% | 0,60 |
| **Conversion (CRO)** | 2,8 / 10 | 20% | 0,56 |
| **Site-Architecture** | 2,5 / 10 | 10% | 0,25 |
| **Analytics & Tracking** | 4,0 / 10 | 5% | 0,20 |
| **Accessibility** | 2,0 / 10 | 5% | 0,10 |
| **GESAMT** | **3,3 / 10** | 100% | |

> **Kernaussage:** Der CfB Ford Köln-Niehl ist ein substanziell starker Verein (19 Jugendteams, Lizenztrainer, eigene Turniere, Gaststätte) — aber die Website verhält sich wie ein internes Schwarzes Brett. Sie kommuniziert nach innen, nicht nach außen. Die Gap zwischen Vereinssubstanz (≈7/10) und digitaler Darstellung (3,3/10) ist die zentrale Handlungsachse.

---

## Dimension 1: SEO — 4,2 / 10

### Subdimensionen
| Bereich | Note |
|---|---|
| On-Page SEO (Titles, H1, Meta) | 4/10 |
| Lokales SEO (GBP, NAP, Local Keywords) | 3/10 |
| Content-Qualität & Keywords | 5/10 |
| Technisches SEO (Sitemap, Schema, robots.txt) | 4/10 |
| Backlink-Potential | 5/10 |
| Mobile SEO | 6/10 |

### Kritische Findings
- **Kein Google Business Profile** verifiziert — wichtigster Einzelhebel für lokale Suche ("Fußballverein Köln-Niehl")
- **Kein Schema-Markup** (JSON-LD) — kein SportsClub, kein LocalBusiness, kein Event
- **H1 fehlt** auf 4+ Kernseiten; Titles in Kleinbuchstaben (/vorstand/, /über-uns/)
- **Keine Meta-Descriptions** auf keiner einzigen Seite (site-weit)
- **728 URLs in der Sitemap** — davon viele kryptische Platzhalter-Slugs (/ggff/, /z/, /so/) und bestätigte 404-URLs (/soccerwatch-tv/, /gaststaette/)
- **Vereinsname inkonsistent**: "Ford-Niehl" vs. "Ford Köln-Niehl" — Google-Entitätszuordnung gestört
- **Crawl-Delay: 5** in robots.txt — unnötige Crawl-Verlangsamung
- **AI-Crawler nicht konfiguriert** (GPTBot, ClaudeBot, PerplexityBot)
- **Kein FAQ-Content** — weder für Featured Snippets noch AI Overviews

### Top-5 SEO-Maßnahmen
1. **Google Business Profile einrichten/optimieren** — Adresse, Kategorie "Sportverein", Fotos, Posts (1 Woche, kostenlos)
2. **Schema-Markup via Jimdo HTML-Widget** — SportsClub + LocalBusiness JSON-LD (2–3h)
3. **Sitemap bereinigen** — 404-URLs entfernen, Platzhalter-Posts löschen (728 → ~150 URLs)
4. **Titles/H1/Meta-Descriptions** auf allen 13 Hauptseiten optimieren (2–4h)
5. **FAQ-Seite** erstellen: 10 Eltern-Fragen mit vollständigen Antworten (AI + Featured Snippets)

---

## Dimension 2: Marketing & Messaging — 3,6 / 10

### Subdimensionen
| Bereich | Note |
|---|---|
| Messaging & Value Proposition | 3/10 |
| Zielgruppen-Ansprache | 3,5/10 |
| Conversion-Optimierung | 2,5/10 |
| Content-Strategie | 5/10 |
| Community-Bindung & Vereinsidentität | 5/10 |
| Digitale Präsenz & Omnichannel | 3/10 |

### Kritische Findings
- **Homepage = News-Feed** statt Willkommens-Seite — Erstbesucher sehen "Maus und Apel verlängert", nicht "Wer wir sind"
- **"TalentFörderung im Kölner Norden"** ist ein starker Claim — aber versteckt auf /startseite/, nicht auf der Root-URL
- **Kein Instagram-Link** — wichtigster Kanal für Eltern (25–45J.) und Jugendspieler (13–19J.) nicht vorhanden oder nicht sichtbar
- **Kein Social Proof**: keine Mitgliederzahlen, keine Trainer-Credentials, keine Eltern-Testimonials
- **"Curse of Knowledge"**: Verein weiß, wie gut er ist — Erstbesucher weiß es nicht
- **Gaststätte-Seite = 404** — stärkster Community-Ankerpunkt digital verloren
- **Kein Newsletter**, kein WhatsApp-Kontaktkanal
- **X (Twitter) verlinkt, Instagram nicht** — falsche Kanal-Priorisierung

### Top-5 Marketing-Maßnahmen
1. **Sofort: "passwesesen"-Seitentitel korrigieren** — Konversionsvertrauen auf der wichtigsten Seite
2. **Diese Woche: Homepage-Hero umbauen** — Tagline + Zielgruppen-Boxen + 2 CTAs (Probetraining / Mitglied werden)
3. **Instagram aufbauen & verlinken** — Account @cfbfordniehl, Bio mit Probetraining-Link in Bio
4. **3 Social-Proof-Elemente einbauen** — Mitglieder-Zähler, Eltern-Zitate, Trainer-Lizenzen
5. **Lokale SEO + Google My Business** — Monatliche Posts mit Spielergebnissen

---

## Dimension 3: UI/UX & Design — 3,0 / 10

### Subdimensionen
| Bereich | Note |
|---|---|
| Visuelles Design & Ästhetik | 3/10 |
| Navigation & Informationsarchitektur | 2,5/10 |
| Mobile Usability | 4/10 |
| Conversion-UX | 3,5/10 |
| Accessibility (WCAG) | 2/10 |
| Content-Darstellung | 3,5/10 |

### Kritische Findings
- **Navigation 2-zeilig** durch 16+ Menüpunkte — Hick's Law verletzt, Scan-Kosten extrem hoch
- **Jimdo-Standard-Template ~2016** — kein Design-System, keine Elevation-Hierarchie
- **Kein H1 auf Homepage** — WCAG 1.3.1 kritisch verletzt
- **Keine Alt-Texte** auf Bildern — WCAG 1.1.1 kritisch verletzt
- **Keine ARIA-Labels, kein Skip-Nav** — für Tastatur-/Screen-Reader-Nutzer nahezu unbrauchbar
- **"Mehr lesen"-Links** ohne Kontext — WCAG 2.4.4 verletzt
- **84 Browser-Warnings** (srcset-Attribute) — CLS/LCP Impact
- **Eingebettete PDF-Scans** auf Mitglied-werden-Seite — 2006-UX für 2026
- **Hero-Bild auf /startseite/** mit 10.000px Höhe — unkontrollierter Asset-Upload
- **Zeilenlänge unkontrolliert** — Fließtexte über volle Breite, >100 Zeichen pro Zeile

### Top-5 Quick-Wins UI/UX
1. **Seitentitel-Fehler korrigieren** (5 Minuten)
2. **H1 auf Homepage setzen** (15 Minuten)
3. **"Mitglied werden"-CTA in Hero-Bereich** (20 Minuten)
4. **Navigation auf 6–7 Punkte reduzieren** (1–2h): `News | Über Uns | Teams & Junioren | Turniere | Mitgliedschaft | Kontakt`
5. **Alt-Texte für alle Bilder** nachtragen (1–2h)

### Top-5 Strategische UX-Verbesserungen
1. **Informationsarchitektur-Redesign** nach User Mental Models (4 Personas: Eltern, Jugendspieler, Erwachsene, Aktive Mitglieder)
2. **Über-Uns als visuelles Storytelling** — Timeline, Vereinszahlen, Werte-Block
3. **Mitgliedschaft-Flow** als geführter 3-Schritt-Onboarding-Prozess
4. **WCAG 2.1 AA Baseline** herstellen — H1, Alt-Texte, ARIA, Focus-States
5. **Mobile-First UX** — Bottom-Nav, Quick-Access-Kacheln, Progressive Web App

---

## Dimension 4: Conversion (CRO) — 2,8 / 10

### Subdimensionen
| Bereich | Note |
|---|---|
| Homepage / — Conversion-Potential | 2/10 |
| /startseite/ TalentFörderung | 3/10 |
| Mitgliedschaft-Flow | 1,5/10 |
| Probetraining-Flow | 3/10 |
| Kontakt-Seite | 5/10 |
| Gesamt-Conversion-Architektur | 2/10 |

### Kritische Findings
- **"Inside-Out-Logik"**: Website aus Vereins-Perspektive gebaut, nicht aus Besucher-Perspektive
- **Kein Conversion-Funnel** — kein klarer Pfad von "Ich bin interessiert" zu "Ich habe mich angemeldet"
- **Zwei widersprüchliche Mitgliedschafts-Wege**: DFBnet-Link vs. PDF-Scans auf parallelen URLs → Decision Paralysis
- **H1 "passwesesen"** auf der wichtigsten Conversion-Seite — Trust-Killer
- **Probetraining-Formular = PDF-Download** statt Online-Formular — 5-Schritt-Offline-Hürde
- **Probetraining nirgendwo in Navigation** verlinkt
- **Kein Social Proof** auf Homepage — keine Mitgliederzahlen, keine Erfolge, keine Testimonials
- **Beitragsübersicht nicht sichtbar** — Eltern fragen als Erstes nach den Kosten

### Conversion Quick Wins (Stufe 1 — <2h gesamt)
1. H1 "/mitglied-werden/" korrigieren
2. Beitragsübersicht als HTML-Tabelle auf /mitgliedschaft/ einfügen
3. Sticky Header-Banner: "Probetraining anmelden | Tel: 0221-7121161"
4. Einen primären Mitgliedschafts-Weg kennzeichnen: "Empfohlen: Online-Antrag"
5. Antwortzeit auf Kontaktseite: "Wir antworten innerhalb von 2 Werktagen"

### Conversion High-Impact (Stufe 2 — 1–2 Tage)
6. Hero-Section auf /startseite/ mit Tagline + 2 CTAs
7. "Probetraining anmelden" in Hauptnavigation aufnehmen
8. Quick-Links-Grid erweitern: "MITGLIED WERDEN" + "PROBETRAINING" farbig hervorgehoben
9. Social-Proof-Block: "15 Jugendmannschaften · U10 gewann 5 Turniere 2026"
10. Probetraining-Formular einbetten (4 Felder: Name, Alter, Wunschteam, Telefon)

---

## Dimension 5: Site-Architecture — 2,5 / 10

### Kernproblem
**Organisationsstruktur als Navigation** statt Nutzer-Mental-Models. 13 Top-Nav-Punkte (Ideal: 5–6). Hick's Law verletzt. Primäre Conversion (Probetraining) strukturell nicht verankert.

### IST-Navigation (problematisch)
```
News | Startseite | Über Uns | Leitungen/Mannschaften | Platzbelegungsplan |
Informationen | Turniere/Camps | Vorstand | Kontakt | Spielbetrieb/Formulare |
Mitgliedschaft | Vereinsshop | Mitgliederversammlung 2026 | Gaststätte
```

### SOLL-Navigation (6 Punkte + CTA)
```
Aktuelles | Mannschaften | Sportbetrieb | Mitmachen | Verein | Anlage | [Probetraining →]
```

### Strukturelle Lücken (kritisch)
| # | Fehlendes Element | Impact |
|---|---|---|
| G1 | Probetraining-Seite mit echtem Formular | Kritisch |
| G2 | Impressum + Datenschutz im Footer sichtbar | Rechtspflicht |
| G3 | Spielplan / Ergebnisse (Live-Integration) | Hoch — häufigste Nutzerfrage |
| G4 | FAQ für Eltern/Neumitglieder | Hoch |
| G5 | Trainingszeiten pro Altersgruppe (direkt auffindbar) | Hoch |
| G6 | Einheitlicher Veranstaltungskalender | Mittel |
| G7 | Sponsoren-Seite | Mittel |

### Jugend-URL-Konsolidierung
Von 19 flachen Team-URLs → 4 Altersgruppen-Cluster mit Tab-Navigation:
```
/mannschaften/junioren/ballschule/      → Ballschule + U7 + U8 (3–8 Jahre)
/mannschaften/junioren/kleinjunioren/   → U9 + U10 (8–11 Jahre)
/mannschaften/junioren/mitteljunioren/  → U12 + U13 + U14 (11–14 Jahre)
/mannschaften/junioren/grossjunioren/   → U15 + U16 + U17 + U19 (14–18 Jahre)
```

---

## Dimension 6: Analytics & Tracking — 4,0 / 10

### Tracking-Status
| Tool | Status |
|---|---|
| Google Analytics 4 | ❌ Nicht vorhanden |
| Google Tag Manager | ❌ Nicht vorhanden |
| Facebook/Meta Pixel | ❌ Nicht vorhanden |
| Jimdo Creator Statistics | ✅ Aktiv (anonymisiert, cookie-frei) |
| reCAPTCHA (Kontaktformular) | ✅ Aktiv |
| Cookie-Banner | ✅ Nicht nötig (keine einwilligungspflichtigen Cookies) |

### Befunde
- ✅ **Sauberes Tracking-Profil** — kein GA, kein Pixel, DSGVO-Risiko minimal
- ✅ **Cookie-Banner nicht nötig** — Jimdo Statistics setzt keine pflichtigen Cookies
- 🔴 **KRITISCH: Datenschutzerklärung nur auf Englisch** — DSGVO-Verstoß für deutsche Website
- 🟠 **Verantwortliche Person nicht benannt** in DS-Erklärung
- 🟠 **Betroffenenrechte fehlen** in DS-Erklärung
- **Empfehlung**: Jimdo-Bordmittel behalten, kein GA4 nötig. Sofort: DS-Erklärung auf Deutsch + Pflichtangaben ergänzen.

---

## Gesamt-Priorisierungsmatrix

### 🔴 SOFORT (heute, <2h, kein Budget)
| Maßnahme | Bereich | Aufwand |
|---|---|---|
| Seitentitel "passwesesen" korrigieren | CRO + SEO | 5 Min |
| H1 auf Homepage setzen | SEO + A11y | 15 Min |
| Datenschutzerklärung auf Deutsch | DSGVO | 30 Min |
| Verantwortliche Person in DS-Erklärung | DSGVO | 15 Min |
| Sticky CTA "Probetraining" in Header | CRO | 20 Min |

### 🟠 DIESE WOCHE (1–3 Tage, kein Budget)
| Maßnahme | Bereich | Aufwand |
|---|---|---|
| Google Business Profile einrichten | Local SEO | 2–4h |
| Navigation auf 6 Punkte reduzieren | UX + SEO | 1–2h |
| Alt-Texte für alle Bilder | A11y + SEO | 1–2h |
| Beitragsübersicht als HTML-Tabelle | CRO | 30 Min |
| Meta-Descriptions auf 13 Kernseiten | SEO | 2h |
| Titles + H1 auf Kernseiten optimieren | SEO | 2h |
| Primären Mitgliedschafts-Weg kennzeichnen | CRO | 30 Min |

### 🟡 DIESEN MONAT (1–2 Wochen)
| Maßnahme | Bereich | Aufwand |
|---|---|---|
| Schema-Markup (JSON-LD) via HTML-Widget | SEO | 2–3h |
| FAQ-Seite (10 Fragen) | SEO + CRO | 2–3h |
| Hero-Section auf /startseite/ + CTAs | Marketing + CRO | 4–8h |
| Instagram aufbauen & verlinken | Marketing | laufend |
| Social-Proof-Block (Zahlen, Zitate) | Marketing + CRO | 2–4h |
| Sitemap bereinigen (728 → ~150 URLs) | SEO Technik | 2–3h |
| Probetraining-Seite mit Kontaktformular | CRO + UX | 1–2 Tage |
| Jugend-URLs in 4 Cluster zusammenführen | IA + SEO | 1–2 Tage |

### 🟢 NÄCHSTES QUARTAL (strategisch, ggf. Agentur/Plattformwechsel)
| Maßnahme | Bereich |
|---|---|
| Vollständiges IA-Redesign (SOLL-Architektur) | UX + IA |
| Mitgliedschafts-Flow als 3-Schritt-Onboarding | CRO + UX |
| Über-Uns als visuelles Storytelling | Marketing + UX |
| WCAG 2.1 AA Baseline vollständig herstellen | A11y |
| Mobile-First Redesign + Bottom-Nav | UX |
| Spielplan-Integration (Fussball.de Widget) | Feature |
| Plattformwechsel evaluieren (Jimdo → WordPress/Next.js) | Technik |

---

## Was der CfB wirklich hat — vs. was die Website zeigt

| Vereinsrealität | Website-Darstellung | Gap |
|---|---|---|
| 19 Jugendteams (Ballschule bis U19) | Vergraben in 3-Ebenen-Navigation | Sollte Homepage-Headline sein |
| Lizenzierte Trainer | Erwähnt im PDF-Kontext | Sollte mit Foto + Credentials stehen |
| Ballschule ab 3 Jahren | Im Mannschaftsverzeichnis | Sollte eigenem Eltern-CTA haben |
| U10 gewann 5 Turniere 2026 | News-Listenitem | Muss als Trophy auf Jugend-Seite stehen |
| Eigene Turniere (Pfingstcup, Herbstcup) | News-Meldungen | Sollte als "Wir sind ein Heim-Turnierverein" positioniert sein |
| Gaststätte + Community-Raum | 404-Seite | Völlig verloren |
| Aktiver News-Feed (mehrmals/Woche) | Gut! | Instagram-Übertrag fehlt |
| Sportanlage mit Kunstrasenplätzen | Nur im Platzbelegungsplan | Infrastruktur-Stolz fehlt |
| 117 Jahre Vereinsgeschichte | Fließtext auf /über-uns/ | Sollte Timeline, Meilensteine, Stolz sein |

---

## Dimension 7: Competitor-Check — Best Practice Benchmark

### Feature-Vergleich: CfB vs. moderner Vereinsstandard NRW

| Feature | CfB Ford Niehl (IST) | Best Practice Standard |
|---|---|---|
| Hero mit CTA | ❌ Kein CTA | ✅ "Mitglied werden"-Button in 5 Sek sichtbar |
| Spielplan & Ergebnisse | ❌ Fehlt | ✅ FuPa/fußball.de-Widget live eingebettet |
| Online-Mitgliedschaft | ❌ PDF-Scan ausdrucken | ✅ Digitales Formular + SEPA-Lastschrift online |
| Trainingszeiten pro Mannschaft | ⚠️ Nur Platzbelegungsplan | ✅ Klare Tabelle pro Altersklasse direkt auffindbar |
| Social Media Integration | ❌ Kein Feed, kein Instagram-Link | ✅ Instagram-Feed oder Link-Hub auf Homepage |
| Vereinsgeschichte | ⚠️ Fließtext | ✅ Zeitleiste, Fotos, emotionale Story |
| Google Maps eingebettet | ❌ Nur Adresstext | ✅ Widget auf Kontakt- und Anfahrtsseite |
| WhatsApp-Kontakt | ❌ Fehlt | ✅ Direktlink Header/Probetraining-Seite |
| Sponsoren-Seite | ❌ Fehlt | ✅ Pakete Bronze/Silber/Gold mit Anfrage-Formular |
| News-Frequenz | ✅ Mehrmals/Woche | ✅ Standard bei aktiven Vereinen |
| Mobile responsiv | ⚠️ Jimdo-Baseline | ✅ Touch-CTAs ≥44px, Mobile-First |

### Top 5 Features die moderne Vereinswebsites haben — CFB nicht

1. **Live-Spielplan-Widget (FuPa / fußball.de)** — Ergebnisse automatisch synchronisiert, Besuchermagnet Nr. 1
2. **Online-Mitgliederantrag mit SEPA** — Konversionsrate steigt nachweislich um 40–60% vs. PDF
3. **WhatsApp-CTA im Header** — Direktlink zur Vereins-WhatsApp, organische Reichweite ohne Budget
4. **Trainingszeiten-Übersicht pro Mannschaft** — häufigster Suchgrund für Eltern neuer Spieler
5. **Sponsoren-Paket-Seite** — "Werden Sie unser Partner" mit Paketen → Anfragen ohne Kaltakquise

> **Kernbefund:** CfB Ford Niehl hat eine digitale Visitenkarte. Moderne Vereinswebsites sind aktive Recruiting- und Bindungs-Tools, die Mitglieder gewinnen, Eltern informieren und Sponsoren ansprechen.

---

## Fazit

> Der CfB Ford Köln-Niehl hat eine Website, die für die Menschen gebaut wurde, die schon drin sind — nicht für die, die noch nicht drin sind. Mit einem Sofort-Paket von ~4 Stunden Arbeit (alle 🔴-Maßnahmen) lässt sich das Vertrauen und die Konversion spürbar verbessern. Mit dem Wochen-Paket (~2–3 Tage) wird die Website zu einem echten Akquisitions-Instrument. Ein vollständiges Redesign (nächstes Quartal) würde die Substanz des Vereins würdig in der digitalen Welt repräsentieren.

---

*Erstellt: 2026-06-28/29 | 7 parallele Audit-Agents: SEO · Marketing · UI/UX · CRO · Analytics · Site-Architecture · Competitor*  
*Methodik: Playwright-CLI DOM-Crawl + Screenshot-Analyse + WebFetch HTML-Audit + Skill-Suite: seo-audit · ai-seo · schema-markup · ui-ux-pro-max · frontend-design · impeccable · page-cro · form-cro · content-strategy · marketing-psychology · brand-guidelines · analytics-tracking · site-architecture*
