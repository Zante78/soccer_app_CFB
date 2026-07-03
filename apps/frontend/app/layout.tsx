import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
