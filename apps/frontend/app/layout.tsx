import type { Metadata } from "next";
import { Bebas_Neue, Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

// Brand-Kit Fonts (docs/brand-kit-cfb.md §2)
// Display: Bebas Neue — Headlines, Impact-Zahlen
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

// Accent: Barlow Condensed — Eyebrows, Buttons, Nav, Labels
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-accent",
});

// Body: DM Sans — Fließtext, Forms, alles Lange
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://passstelle.cfb-fordniehl.de",
  ),
  title: "CFB Digitale Passstelle",
  description:
    "Digitale Anmeldung für den CfB Ford Köln-Niehl 09/52 e.V. — vom ersten Klick bis zum aktiven Spielerpass in wenigen Minuten. Sicher, DSGVO-konform, ohne Papier.",
  applicationName: "CfB Digitale Passstelle",
  authors: [{ name: "CfB Ford Köln-Niehl 09/52 e.V." }],
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/brand/apple-touch-icon-180.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "CfB Digitale Passstelle",
    description:
      "Vom ersten Klick bis zum aktiven Spielerpass in wenigen Minuten. Sicher, DSGVO-konform, ohne Papier.",
    siteName: "CfB Ford Köln-Niehl 09/52 e.V.",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/brand/og-image-1200x630.png",
        width: 1200,
        height: 630,
        alt: "CfB Ford Köln-Niehl 09/52 e.V. — Anmeldung. Digital.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CfB Digitale Passstelle",
    description:
      "Vom ersten Klick bis zum aktiven Spielerpass in wenigen Minuten.",
    images: ["/brand/og-image-1200x630.png"],
  },
  robots: {
    // Wizard-Anmeldung ist eine private App-Fläche — nicht indexieren
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${bebasNeue.variable} ${barlowCondensed.variable} ${dmSans.variable} font-body antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
