import type { Metadata } from "next";
import { DM_Serif_Display, IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono-plex",
});

const manrope = Manrope({
  weight: ["300", "400", "500", "600", "800"],
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "MediVault — Confidential Health Records On Chain",
  description:
    "Secure, immutable, patient-controlled health records on the Stellar/Soroban ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${ibmPlexMono.variable} ${manrope.variable} antialiased`}
    >
      <body className="min-h-screen bg-obsidian text-parchment font-manrope">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
