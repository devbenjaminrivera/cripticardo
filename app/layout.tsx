import type { Metadata, Viewport } from "next";
import { EB_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F9F5EC",
};

export const metadata: Metadata = {
  title: "Cripticardo | El Críptico Diario",
  description: "Resuelve el enigma verbal del día. Pistas crípticas, juegos de palabras y acertijos con anatomía explicada paso a paso.",
  authors: [{ name: "Daniel Fajardo" }],
  creator: "Daniel Fajardo",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "192x192", type: "image/png" },
    ],
  },
  verification: {
    google: "kKjZDt8psR06q1JRmuQO25obNJXeMi2FAIkW38zW6cU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${ebGaramond.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-terracotta-light selection:text-terracotta-dark">
        {children}
      </body>
    </html>
  );
}
