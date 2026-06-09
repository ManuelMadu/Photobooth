import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  JetBrains_Mono,
  Bricolage_Grotesque,
} from "next/font/google";
import "./globals.css";
import { VibeProvider } from "@/components/vibe-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "Booth — pick your vibe",
  description:
    "An install-free, sign-in-free photobooth that re-skins itself to four design languages. Pick a vibe and start shooting.",
};

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${geist.variable} ${geistMono.variable} ${space.variable} ${jetbrains.variable} ${bricolage.variable} min-h-full`}
      >
        <VibeProvider>{children}</VibeProvider>
      </body>
    </html>
  );
}
