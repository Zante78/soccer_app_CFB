# CFB Ford Köln-Niehl 09/52 — Brand Kit
**Stand:** 2026-07-02
**Quelle:** Extrahiert aus `website/cfb-homepage-mockup.html`
**Zweck:** Einzige Wahrheitsquelle für alle Design-Arbeiten (Homepage, Wizard, Passwart-Dashboard, künftige Materialien)

> Dieses Dokument ist die **Design-Verfassung**. Jede neue Fläche referenziert diese Tokens. Kein Ad-hoc-Design mehr.

---

## 1. Farben

### Primär-Palette (Marken-Farben)

**Verein ist Blau-Weiß.** 💙🤍 ist die selbstgewählte Vereins-Identität (aus News + Team-Posts abgeleitet).
Das Logo verwendet nur zwei Töne: Vereinsblau und Weiß. Grün gibt es im Vereinswappen NICHT.

| Rolle | Token | Hex | Verwendung |
|---|---|---|---|
| **Vereinsblau** | `--primary` | `#004A9F` | Marke, Headlines, Nav-Hintergrund, Logo-Kreis, primäre CTAs, Icons |
| Vereinsblau tief | `--primary-d` | `#003479` | Hover-States auf primären CTAs, Print-Version des Logos, Sub-Nav |
| Vereinsblau hell | `--primary-l` | `#1A6ACC` | Sekundäre Akzente, Info-States, Section-Header-Underlines |
| **Weiß** | `--white` | `#FFFFFF` | Cards auf blauem Grund, Text auf Vereinsblau, große Flächen |
| Rheingrün | `--accent-green` | `#2D9B5A` | **Sparsam:** nur Success/OK-States, Health-Indikatoren, DSGVO-Chip-Icon. NICHT für primäre CTAs. |

> **⚠ Farb-Philosophie-Update 2026-07-03:** Frühere Version hatte Rheingrün als co-primäre Akzent-Farbe für CTAs.
> **Das war falsch.** Der Verein ist konsequent Blau-Weiß. Grün ist ein **funktionaler Farbtupfer** für Success-
> Momente, keine Markenidentität. Primäre CTAs sind ab jetzt **Vereinsblau**.

### Grundfarben

| Rolle | Token | Hex | Verwendung |
|---|---|---|---|
| Dark | `--dark` | `#0A1520` | Overlays auf Hero-Bildern, dunkle Nav-Alternative |
| Dark 2 | `--dark-2` | `#0F1F30` | Alternative dunkle Fläche |
| Text | `--text` | `#111820` | Body-Text auf hellen Flächen (nicht pures Schwarz) |
| Text soft | `--text-soft` | `#4A5568` | Sekundärtext, Meta-Informationen, Timings |

### Surface-Töne (Neutral warm)

| Rolle | Token | Hex | Verwendung |
|---|---|---|---|
| Surface 0 | `--surface-0` | `#F7F9FC` | Page-Background (Standard) — leichter Blau-Stich |
| Surface 1 | `--surface-1` | `#EDF1F7` | Cards, subtile Abhebung |
| Surface 2 | `--surface-2` | `#DDE5F0` | Dividers, Borders, dritte Ebene |

### Farb-Ratio-Zielwerte (grobe Orientierung pro Screen)

- **Vereinsblau:** ~25-35 % (Header + primäre CTAs + Headlines + Logo)
- **Weiß / Surface-0:** ~55-65 % (dominante Flächen, Body, Lesbereich)
- **Text-Farben (Ink/Soft):** ~10-15 % (Body-Text)
- **Rheingrün:** ≤ 3 % (nur Success-Chip, Checkmark, Health-Indikator)

### Anti-Patterns Farben

- ❌ **Kein reines `#000000`** — immer `--text` oder `--dark`
- ❌ **Kein Rheingrün auf primären CTAs** — der CFB-Charakter ist Blau-Weiß
- ❌ **Kein neutrales Grau** — Surface-Töne haben leichten Blau-Stich (kalt-warm)
- ❌ **Kein anderes Grün oder Blau** außer den Tokens — sonst Marken-Bruch
- ❌ **Kein Rot als Error-Farbe** — noch nicht definiert. Für Fehler-States: `--primary-d` Border + Text, kein Rot

> **⚠ Blau-Ton-Notiz:** Das Master-Logo (`brand-assets/cfb-logo-master.jpg`) nutzt einen leicht satteren
> Marineblau-Ton als `#004A9F` — visuell näher an `#1F4B8E` bis `#2450A0`. Der Homepage-Mockup hat den
> Ton bewusst etwas frischer/heller gewählt für Digital-Verwendung. **Beide sind gültig:**
> `#004A9F` für digitale Flächen (Homepage, Wizard, Nav), Original-Logo-Blau bleibt im Logo selbst.
> Kein Re-Coloring des Logos.

---

## 1a. Logo

### Master-Assets

| Datei | Format | Größe | Wann verwenden |
|---|---|---|---|
| `docs/brand-assets/cfb-logo-master.jpg` | JPEG | 813 × 600 | **Master-Referenz** — komplettes Wappen mit "FORD-NIEHL" + "09/52 e.V." |
| `docs/brand-assets/cfb-logo-web-crop.png` | PNG (RGBA, transparent) | 600 × 406 | Web-Version wie auf cfb-fordniehl.de — nur Wappen (ohne Wortmarke unten), transparenter Grund |

### Aufbau des Logos

Das Logo hat drei visuelle Elemente:

1. **Wappen-Rahmen** — abgerundetes Rechteck in Vereinsblau, mit weißem Innenring
2. **Fußball** links — weiß mit blauen Pentagonen (klassisches Muster)
3. **"CfB"-Wortmark** rechts — kondensierte Schrift, weiß auf Blau, das kleine "f" mittig in Mixed-Case
4. **"FORD-NIEHL"** (unter Wappen, nur in Master-Version) — Bebas-Neue-nah, Vereinsblau
5. **"09/52 e.V."** (rechts vertikal, nur in Master-Version) — Gründungs- + Wiedergründungsjahr

### Verwendungsregeln

**Wann welche Version:**

| Kontext | Datei | Grund |
|---|---|---|
| Wizard-Nav (44×44 Kreis-Mark) | Kein Bild — CSS-Logo-Mark aus §6.4 | Bei Mini-Größen ist Rendering des Wappens unklar → weißer Kreis mit "CfB" in Bebas Neue |
| Homepage-Nav (44×44) | Kein Bild — dito | Konsistenz Homepage ↔ Wizard |
| Hero-Bereich, Splash, Print, Vorstands-Präsentation | `cfb-logo-master.jpg` | volle Marke sichtbar, alle Details |
| Web-Icon-Slot (Footer, Kontaktkarte) | `cfb-logo-web-crop.png` | transparent, funktioniert auf hellen und dunklen Flächen, kleiner File |
| Favicon | **noch zu erstellen** — abgeleitet aus web-crop, gecroppt auf Wappen-Kern, 32×32 + 180×180 | separate Task |
| Social-Media OG-Image | **noch zu erstellen** — Master-Logo + Vereinsname auf `--surface-0` Hintergrund, 1200×630 | separate Task |

**Do:**
- ✅ Auf hellem Grund (Surface-0/1) direkt platzieren, Original-Blau des Logos akzeptieren
- ✅ Bei dunklem Grund (Vereinsblau-Nav, Hero-Overlay): Nur die CSS-`logo-mark`-Kreis-Variante nutzen ODER Logo auf weißen Kreis/Rechteck setzen
- ✅ Mindest-Padding um Logo: 25 % der Logo-Höhe rundherum als Clear-Space
- ✅ Minimum-Größe für Master-Version mit Wortmarke: 120 px Breite (kleiner werden Buchstaben unlesbar)

**Don't:**
- ❌ Logo einfärben, Farb-Filter drüberlegen, Duotone-Effekte
- ❌ Logo drehen, spiegeln, kippen
- ❌ Wappen und "FORD-NIEHL" getrennt platzieren
- ❌ Master-Version unter 120 px Breite (dann Web-Crop nutzen oder CSS-Mark)
- ❌ Logo als Wasserzeichen mit reduzierter Opacity — mindert Marken-Wert
- ❌ Neue Text-Zusätze hinzufügen ("Digitale Passstelle" o.ä.) — Brand-Text steht separat neben dem Logo

### CSS-Logo-Mark (für Nav, kleine Kontexte)

Das ist eine **CSS-Abstraktion** wenn das Bild-Logo nicht renderbar ist (Mini-Größen, dynamische Farb-Anpassung). Nicht das echte Logo — der Kreis-Mark:

```css
.logo-mark {
  width: 44px;
  height: 44px;
  background: var(--white);          /* Auf blauem Grund */
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px;
  color: var(--primary);
  letter-spacing: 0.5px;
}
/* Für hellen Grund invertieren: */
.logo-mark--inverted {
  background: var(--primary);
  color: var(--white);
}
```

**Text im Kreis:** immer "CfB" (klein-f wie im echten Logo), nie "CFB", nie "C.f.B."

### Wenn wir eine SVG-Version brauchen

Aktuell haben wir kein SVG. Für skalierbare Nutzung wäre eine Vektor-Version wertvoll (Favicon, Print, sehr große Displays). Zwei Wege:

1. **Beim Verein anfragen** — Michael Dobiat oder Vorstand hat vielleicht die Original-Datei vom Grafiker
2. **Nachtracen** — der Web-Crop-PNG in Illustrator / Figma / Inkscape zu SVG konvertieren, mit den Vereinsblau-Werten des Masters

Bis dahin: `cfb-logo-master.jpg` (813 px breit) reicht für alle absehbaren Digital-Verwendungen.

---

## 2. Typografie

### Font-System (3 Familien)

```
Display: 'Bebas Neue', sans-serif     — Headlines, große Zahlen, Impact
Accent:  'Barlow Condensed', sans-serif — Eyebrows, Nav-Items, Labels, Buttons, Meta
Body:    'DM Sans', sans-serif        — Fließtext, Formularfelder, alles Lange
```

### Font-Weight-Rezept

| Font | Verfügbare Weights | Standard |
|---|---|---|
| Bebas Neue | 400 (nur eine) | 400 |
| Barlow Condensed | 400, 600, 700 | 600 für Eyebrows, 700 für CTAs |
| DM Sans | 300, 400, 500, 600 | 400 Body, 500 Emphasis, 300 Sub |

### Type-Scale

**Headlines (Bebas Neue):**
- Mega-Hero: `clamp(52px, 9vw, 112px)` — Landing-Hero
- Hero (kompakt): `clamp(48px, 8vw, 96px)` — Wizard-Landing, Sub-Pages
- H1: `clamp(40px, 6vw, 72px)` — Section-Headlines
- H2: `clamp(28px, 4vw, 48px)` — Card-Titel, Groß-Zahlen
- Numerik-Marker: `20-32px` — Nummerierungen wie "01" "02" "03"

**Body (DM Sans):**
- Lead: `18-19px` — Intros unter Hero
- Body: `16-17px` — Fließtext (Standard)
- Small: `14px` — Meta-Text
- XS: `12-13px` — Footer, Time-Marker

**Accent (Barlow Condensed):**
- Eyebrow: `12-15px` uppercase, letter-spacing 1-3px
- Button-Label: `14-16px` uppercase, letter-spacing 1px, weight 700
- Nav-Item: `14px` uppercase, letter-spacing 0.8px, weight 600

### Line-Heights

- Headlines: `0.92-1.0` (tight)
- Body: `1.55-1.6` (comfortable)
- Meta/Labels: `1.2-1.4`

### Import-Snippet

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
```

### Anti-Patterns Typografie

- ❌ **Kein Inter, kein Roboto, kein Open Sans** — bricht CFB-Charakter
- ❌ **Keine Serif-Fonts** — Verein ist modern-athletisch, kein Print-Editorial
- ❌ **Bebas Neue niemals klein** (< 20px) — es ist ein Impact-Font, klein wird es unleserlich
- ❌ **DM Sans niemals in Caps** — für Uppercase gibt es Barlow Condensed

---

## 3. Radius-System

| Rolle | Token | Wert | Verwendung |
|---|---|---|---|
| Klein | `--radius-sm` | `4px` | Buttons, Chips, kleine Cards |
| Mittel | `--radius-md` | `8px` | Cards, Modals, Input-Felder |
| Groß | `--radius-lg` | `16px` | Hero-Cards, Illustrationen, große Container |

**Konsistenzregel:** Auf einer Fläche EIN Radius-System — nicht mischen. Wizard nutzt konsequent `--radius-md` für Cards, `--radius-sm` für Buttons.

---

## 4. Spacing & Layout

### Nav-Höhe

- Desktop: `--nav-h: 72px`

### Horizontal-Padding (responsive)

```css
padding-left/right: clamp(16px, 5vw, 80px);
```

Mobile: 16px · Tablet: ~40px · Desktop: 80px

### Vertikale Rhythmus

- Section-Padding vertikal: `clamp(48px, 8vh, 100px)`
- Card-Padding: `24-32px`
- Element-Gap in Stack: `12px, 16px, 24px, 32px, 48px` (Fibonacci-nah)

---

## 5. Motion & Transition

### Standard-Transition

```css
--transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
```

### Erlaubte Motion

- **Fade + Slide-Up** auf Content-Blöcke (200-400ms, stagger 100ms zwischen Elementen)
- **Hover Translate** `translateY(-1px)` auf CTAs
- **Hero-Zoom** `scale(1.05 → 1.0)` in 20s alternate — nur für Hero-Bilder
- **Backdrop-Blur** auf sticky Nav bei Scroll

### Verboten

- ❌ Bouncing / Spring-Animations auf produktiven Flächen
- ❌ Parallax-Scrolling
- ❌ Auto-Play-Karussells länger als 4s
- ❌ Rotate/Skew-Effekte auf Inhalt

### Reduced-Motion

Immer mit `@media (prefers-reduced-motion: reduce)` respektieren.

---

## 6. Kern-Komponenten (Ready-to-use CSS-Rezepte)

### 6.1 Primary Button

```css
.btn-primary {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: #004A9F;              /* Vereinsblau — primäre Marken-Farbe */
  color: #FFFFFF;
  border: none;
  cursor: pointer;
  padding: 14px 32px;
  border-radius: 4px;
  transition: background 0.25s, transform 0.25s;
}
.btn-primary:hover {
  background: #003479;              /* Vereinsblau tief */
  transform: translateY(-2px);
}
.btn-primary:focus-visible {
  outline: 3px solid rgba(0, 74, 159, 0.4);
  outline-offset: 2px;
}
```

**Warum Blau statt Grün?** Der Verein ist Blau-Weiß. Grüne CTAs würden fremdwirken.
Rheingrün bleibt reserviert für Success-Chips + Health-Indikatoren (§1 Farb-Ratio).

### 6.2 Outline Button (auf dunklem Grund)

```css
.btn-outline {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: transparent;
  color: #FFFFFF;
  border: 2px solid rgba(255,255,255,0.5);
  cursor: pointer;
  padding: 13px 32px;
  border-radius: 4px;
}
.btn-outline:hover {
  border-color: #FFFFFF;
  background: rgba(255,255,255,0.1);
}
```

### 6.3 Eyebrow-Label

```css
.eyebrow {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #004A9F;              /* Vereinsblau */
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.eyebrow::before {
  content: '';
  display: inline-block;
  width: 32px;
  height: 2px;
  background: #004A9F;         /* Vereinsblau — passt zum Ton */
}
/* Optional-Variante mit grünem Strich für Health/OK-Momente */
.eyebrow--ok::before {
  background: #2D9B5A;         /* Rheingrün nur wenn es einen Success-Kontext gibt */
}
```

Das **blaue Strich-Element** vor dem Eyebrow ist das CFB-Signature-Detail (angelehnt an Homepage).
Grüne Variante nur bei "geschafft"-Kontexten wie Bestätigungs-Seiten oder Success-States.

### 6.4 Logo-Mark (Kreis mit CFB)

```css
.logo-mark {
  width: 44px;
  height: 44px;
  background: #FFFFFF;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px;
  color: #004A9F;
  letter-spacing: 0.5px;
}
```

Auf **hellem** Grund invertieren: `background: #004A9F`, `color: #FFFFFF`.

### 6.5 Navigation-Bar (Vereinsblau, sticky)

```css
.nav {
  position: fixed; top: 0; left: 0; right: 0;
  height: 72px;
  background: rgba(0, 74, 159, 0.96);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  z-index: 100;
}
```

---

## 7. Tonalität & Copywriting-Regeln

### Anrede

**Duzen konsequent.** "Du wurdest eingeladen", "Dein Team wartet", "Los geht's".

### Ton

- **Direkt, ehrlich, warm** — nicht Marketing-Sprech
- **Aktive Sprache** — "Wir prüfen automatisch" statt "Die Prüfung erfolgt"
- **Zeitangaben ehrlich** — "Dauert 8 Minuten" statt "Schnell und einfach"
- **Kinder-Kontext bewusst** — "dein Kind anmelden", nicht "Antragsteller registrieren"

### Vokabular-Grundstock aus Homepage

- "Team wartet." "Los geht's." "Einfach vorbeikommen."
- "Kostenlos, unverbindlich"
- "Verein" (nicht "Organisation")
- "Mannschaft" (nicht "Team" wenn Verein-intern gemeint)
- "Passwart" (nicht "Administrator")
- "Antragsteller" ist Backoffice-Sprache — vermeiden in User-facing Text

### Anti-Wörter

- ❌ "digitaler Assistent", "SaaS", "Platform", "User", "Dashboard" (im User-Bereich)
- ❌ "Herzlich willkommen" (zu formal)
- ❌ "Bitte tragen Sie ein" (zu behördlich)
- ❌ Fremdwörter wo Deutsch reicht

---

## 8. Wizard-Spezifische Adaption

Der Wizard steht **auf hellem Grund** (nicht dunkler Hero wie Homepage), aber nutzt exakt dasselbe Farb-, Font- und Radius-System.

**Wizard-Header:**
- Vereinsblau `logo-mark` links, Brand-Text kurz (nicht komplettes Nav)
- Rechts: DSGVO-Chip oder Progress-Indicator
- Kein voller Nav mit "Verein / Mannschaften / Neuigkeiten" — der Wizard ist fokussiert

**Wizard-CTAs:**
- Primary: `btn-primary` in **Vereinsblau** (`#004A9F`, Hover `#003479`)
- Sekundär "Zurück": Barlow Condensed 600, transparent, Vereinsblau-Text mit Underline-Hover

**Wizard-Progress:**
- Barlow Condensed uppercase "SCHRITT 03 VON 08" links oder als schmale Progress-Bar oben
- Farbe: `--text-soft`, gefüllter Teil in `--primary` (Vereinsblau)

**Wizard-Success-Momente (Step 5 Sperrfrist-OK, Step 8 Fertig):**
- Hier darf **Rheingrün** funktional als Success-Indikator auftreten (Checkmark, Chip-Icon)
- Nicht als Flächenfarbe. Blau bleibt strukturell dominant.

---

## 9. Accessibility Non-Negotiables

- **Kontrast:** Vereinsblau auf Weiß = 15:1 · Weiß auf Vereinsblau = 15:1 · Rheingrün auf Weiß = 4.7:1 (AA) — Rheingrün nur für Small-UI (Icons, Chips), nicht für Body-Text
- **Touch-Ziele:** Minimum 44×44px auf allen interaktiven Elementen
- **Focus-Ring:** Alle `:focus-visible` bekommen `outline: 3px solid rgba(0, 74, 159, 0.4)` mit `outline-offset: 2px`
- **Semantic HTML:** Bei Wizard-Steps `<fieldset>` + `<legend>` für Gruppen, `<label>` immer sichtbar
- **Screen-Reader:** Progress-Indikator mit `aria-live="polite"` bei Step-Wechsel

---

## 10. Referenz-Assets

- **Live-Anker Homepage-Mockup:** `website/cfb-homepage-mockup.html` (die authoritative visuelle Referenz)
- **Logo Master:** `docs/brand-assets/cfb-logo-master.jpg` (813×600 JPEG — komplettes Wappen mit "FORD-NIEHL" + "09/52 e.V.")
- **Logo Web-Crop:** `docs/brand-assets/cfb-logo-web-crop.png` (600×406 PNG mit transparentem Grund — Wappen ohne Wortmarke)
- **Wizard-Impl aktuell:** `apps/frontend/components/guided-story/step-*.tsx`
- **Historisches Mockup (überholt):** `CFB Projekt/mockup.html` — Apple-Demo-Style, NICHT als Referenz nutzen
- **Vorstands-Präsentation:** `CFB Projekt/praesentation.html` — nutzt teilweise anderes Farb-Set, ist Historie

---

## 11. Werkzeug-Kasten für Design-Arbeit

**Wenn ein neuer Screen entsteht, lade dieses File in den DESIGN_CONTEXT:**

```
BRAND_KIT: docs/brand-kit-cfb.md
PALETTE: { primary: #004A9F, accent: #2D9B5A, ... }
TYPOGRAPHY: { display: Bebas Neue, accent: Barlow Condensed, body: DM Sans }
TONE: warm-direkt, geduzt, ehrlich in Zeitangaben
BANNED: Inter · reines Schwarz · Serifen · Marketing-Sprech
```

Nächste Iteration wenn Homepage-Redesign live geht: Konsolidierung dieses Kits in `apps/frontend/app/globals.css` als CSS-Custom-Properties und Tailwind v4 `@theme`-Block, damit alle Frontend-Komponenten direkt darauf zugreifen.

---

**Änderungshistorie:**
- 2026-07-02 — Erste Version, extrahiert aus `cfb-homepage-mockup.html`
- 2026-07-03 — Logo-Sektion §1a hinzugefügt. Master-JPG (813×600) aus Downloads-Backup wiederhergestellt, Web-Crop-PNG (600×406) mit transparentem Grund von cfb-fordniehl.de geladen. Anti-Patterns + Verwendungsregeln + CSS-Fallback-Mark dokumentiert.
- 2026-07-03 — **Farb-Philosophie korrigiert:** Rheingrün war fälschlich als co-primäre Akzentfarbe geführt. Vereins-Identität ist konsequent **Blau-Weiß** (💙🤍 in Vereins-Kommunikation). Rheingrün jetzt ≤ 3 % Farb-Ratio, nur für Success/Health-Momente. Primäre CTAs = Vereinsblau. Component-Rezepte (Button, Eyebrow, Focus-Ring) entsprechend angepasst. Wizard-Adaption §8 klargestellt.
