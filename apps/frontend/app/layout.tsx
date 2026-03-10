import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CFB Digitale Passstelle",
  description: "Digitale Passstelle des CfB Ford Niehl e.V. - Spielerpass-Anträge schnell, sicher und automatisiert.",
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
