import type { Metadata, Viewport } from "next";
import { Nunito, Lexend } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

// Lexend stands in as a dyslexia-friendly fallback (OpenDyslexic isn't on Google Fonts).
const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-dyslexic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Extraordinary — turn lectures into study magic",
  description:
    "Record a lecture and get simplified notes, flashcards, and a quiz — made for kids and neurodivergent learners.",
};

export const viewport: Viewport = {
  themeColor: "#FFF7E6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${lexend.variable}`}>
      <body>{children}</body>
    </html>
  );
}
