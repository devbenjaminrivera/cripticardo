import type { Metadata, Viewport } from "next";
import { EB_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BackgroundAudioPlayer from "@/components/audio/BackgroundAudioPlayer";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cripticardo.vercel.app'),
  title: {
    default: "Cripticardo | El Críptico Diario de Música Antigua",
    template: "%s | Cripticardo",
  },
  description: "Resuelve el enigma verbal diario de música antigua. Pistas crípticas, anagramas, juegos de palabras y acertijos con anatomía explicada paso a paso. Nuevo críptico cada día.",
  keywords: [
    "críptico",
    "enigmas",
    "juegos de palabras",
    "música antigua",
    "anagramas",
    "acertijos diarios",
    "puzzles verbales",
    "Daniel Fajardo",
    "pasatiempos",
    "ejercicio mental",
  ],
  authors: [{ name: "Daniel Fajardo", url: "https://daniel-fajardo.com" }],
  creator: "Daniel Fajardo",
  publisher: "Cripticardo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'es': '/',
      'es-CL': '/',
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: '/',
    siteName: 'Cripticardo',
    title: 'Cripticardo | El Críptico Diario de Música Antigua',
    description: 'Resuelve el enigma verbal del día. Pistas crípticas, juegos de palabras y acertijos con anatomía explicada paso a paso.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cripticardo - Críptico diario de música antigua',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cripticardo | El Críptico Diario de Música Antigua',
    description: 'Resuelve el enigma verbal del día. Pistas crípticas, juegos de palabras y acertijos con anatomía explicada paso a paso.',
    images: ['/og-image.png'],
    creator: '@daniel_fajardo',
    site: '@cripticardo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "kKjZDt8psR06q1JRmuQO25obNJXeMi2FAIkW38zW6cU",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    other: [
      {
        rel: "manifest",
        url: "/manifest.json",
      },
    ],
  },
  manifest: "/manifest.json",
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
        <BackgroundAudioPlayer />
      </body>
    </html>
  );
}
