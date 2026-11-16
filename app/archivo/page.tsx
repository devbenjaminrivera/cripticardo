import type { Metadata } from 'next';
import { fetchAllCrypticsAsync } from '@/lib/dataService';
import { getTodayDateString } from '@/lib/dataService';
import ArchivePageClient from '@/components/game/ArchivePageClient';

export const metadata: Metadata = {
  title: 'Archivo de Crípticos',
  description: 'Explora el archivo completo de crípticos de música antigua publicados. Filtra por dificultad, estado de resolución y revisa tus mejores tiempos.',
  openGraph: {
    title: 'Cripticardo - Archivo de Crípticos',
    description: 'Explora el archivo completo de crípticos de música antigua publicados.',
    type: 'website',
    locale: 'es_CL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cripticardo - Archivo de Crípticos',
    description: 'Explora el archivo completo de crípticos de música antigua publicados.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function ArchivePage() {
  const allCryptics = await fetchAllCrypticsAsync();
  const today = getTodayDateString();
  const cryptics = allCryptics
    .filter((c) => c.status === 'published' && c.scheduledDate <= today)
    .sort((a, b) => b.clueNumber - a.clueNumber);

  return <ArchivePageClient initialCryptics={cryptics} />;
}