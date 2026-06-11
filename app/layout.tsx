import type { Metadata, Viewport } from "next";
import {
  Geist,
  DM_Serif_Display,
  Courier_Prime,
  Fredoka,
  Quicksand,
  Caveat,
} from "next/font/google";
import "./globals.css";
import { VibeProvider } from "@/components/vibe-provider";

// Neutral body + picker.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
// Vintage: an elegant display serif + a typewriter mono for the stamps.
const serif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});
const typewriter = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-typewriter",
});
// Purikura: rounded bubbly display + a soft rounded body.
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-rounded" });
// Polaroid: a handwritten marker for the caption scrawled under the photo.
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Booth — pick your vibe",
  description:
    "An install-free, sign-in-free photobooth that re-skins itself to different design languages. Pick a vibe and start shooting.",
};

export const viewport: Viewport = {
  themeColor: "#efe6d4",
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
        className={`${geist.variable} ${serif.variable} ${typewriter.variable} ${fredoka.variable} ${quicksand.variable} ${caveat.variable} min-h-full`}
      >
        <VibeProvider>{children}</VibeProvider>
      </body>
    </html>
  );
}
