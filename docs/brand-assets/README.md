# Brand Assets — Verwendung

Dieses Verzeichnis enthält alle bild-basierten Marken-Assets für digitale Kanäle.
Regeln + Farbwerte + Do/Don't liegen im übergeordneten `docs/brand-kit-cfb.md`.

## Datei-Übersicht

| Datei | Größe | Zweck |
|---|---|---|
| `cfb-logo-master.jpg` | 813×600 JPEG | **Master-Logo** — komplettes Wappen mit "FORD-NIEHL" + "09/52 e.V." Nutzung: Hero, Vorstands-Präsentation, Print, OG-Image. |
| `cfb-logo-web-crop.png` | 600×406 PNG (transparent) | Web-Version (nur Wappen ohne Wortmarke). Nutzung: Kontakt-Cards, Footer, Icon-Slots. |
| `favicon-32.png` | 64×64 PNG @2x → 32 gerendert | Browser-Tab-Icon (`<link rel="icon">`) |
| `apple-touch-icon-180.png` | 360×360 PNG @2x → 180 gerendert | iOS-Homescreen-Icon (`<link rel="apple-touch-icon">`) |
| `og-image-1200x630.png` | 2400×1260 PNG @2x → 1200×630 gerendert | Social-Media-Preview (Facebook / LinkedIn / Twitter Card) |

## HTML-Snippet für den `<head>`

Direkt in `apps/frontend/app/layout.tsx` (oder in einem Metadata-Objekt) einbauen:

```tsx
export const metadata: Metadata = {
  title: 'CfB Digitale Passstelle',
  description: 'Digitale Anmeldung für den CfB Ford Köln-Niehl 09/52 e.V.',
  icons: {
    icon: '/brand/favicon-32.png',
    apple: '/brand/apple-touch-icon-180.png',
  },
  openGraph: {
    title: 'CfB Digitale Passstelle',
    description: 'Vom ersten Klick bis zum aktiven Spielerpass in wenigen Minuten. Sicher, DSGVO-konform, ohne Papier.',
    url: 'https://passstelle.cfb-fordniehl.de',
    siteName: 'CfB Ford Köln-Niehl 09/52 e.V.',
    images: [
      {
        url: '/brand/og-image-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'CfB Ford Köln-Niehl 09/52 e.V. — Anmeldung. Digital.',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CfB Digitale Passstelle',
    description: 'Vom ersten Klick bis zum aktiven Spielerpass in wenigen Minuten.',
    images: ['/brand/og-image-1200x630.png'],
  },
};
```

**Deployment-Hinweis:** Die Bilder müssen unter `apps/frontend/public/brand/` liegen. Copy-Command
sobald das Frontend-Deploy vorbereitet wird:

```bash
cp docs/brand-assets/favicon-32.png       apps/frontend/public/brand/
cp docs/brand-assets/apple-touch-icon-180.png apps/frontend/public/brand/
cp docs/brand-assets/og-image-1200x630.png apps/frontend/public/brand/
```

## HTML-Snippet für die Jimdo-Homepage (falls das dort einbindbar ist)

```html
<link rel="icon" type="image/png" sizes="32x32" href="/brand/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/brand/apple-touch-icon-180.png">
<meta property="og:title" content="CfB Ford Köln-Niehl 09/52 e.V.">
<meta property="og:description" content="Traditionsverein aus Köln-Niehl · 21 Mannschaften von Bambini bis Alte Herren.">
<meta property="og:image" content="https://cfb-fordniehl.de/brand/og-image-1200x630.png">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

## Neu generieren nach Design-Änderungen

Wenn Templates im `_source/`-Ordner geändert werden:

```bash
node docs/brand-assets/_source/render-assets.mjs
```

Voraussetzung: `playwright` und Chromium installiert (bei Bot-Repair-Sprint sowieso geschehen).

## Was noch fehlt (siehe brand-kit-cfb.md §1a To-Do)

- **SVG-Vektor-Version** — für Print und sehr große Displays. Beim Vorstand anfragen ob Grafiker-Datei vorhanden.
- **Favicon-Varianten** — 16×16, 48×48 wenn wir alte Browser-Tabs supporten wollen. Aktuell reicht 32×32 + apple-touch-180.
