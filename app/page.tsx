import type { Metadata } from 'next';
import { fetchDailyCrypticAsync } from '@/lib/dataService';
import { Cryptic } from '@/lib/types';
import HomePageClient from '@/components/game/HomePageClient';

export const metadata: Metadata = {
  title: 'El Críptico Diario',
  description: 'Resuelve el enigma verbal de hoy. Un nuevo críptico de música antigua cada día con pistas progresivas, solución y anatomía explicada paso a paso.',
  openGraph: {
    title: 'Cripticardo - Críptico del Día',
    description: 'Resuelve el enigma verbal de hoy. Un nuevo críptico de música antigua cada día.',
    type: 'website',
    locale: 'es_CL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cripticardo - Críptico del Día',
    description: 'Resuelve el enigma verbal de hoy. Un nuevo críptico de música antigua cada día.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function HomePage() {
  const cryptic = await fetchDailyCrypticAsync();

  return <HomePageClient initialCryptic={cryptic} />;
}