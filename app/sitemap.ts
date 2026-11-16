import type { MetadataRoute } from 'next';
import { fetchAllCrypticsAsync } from '@/lib/dataService';
import { getTodayDateString } from '@/lib/dataService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cripticardo.vercel.app').replace(/\/+$/, '');
  const today = getTodayDateString();

  // Fetch all published cryptics up to today
  const allCryptics = await fetchAllCrypticsAsync();
  const publishedCryptics = allCryptics
    .filter(c => c.status === 'published' && c.scheduledDate <= today)
    .sort((a, b) => b.clueNumber - a.clueNumber);

  const crypticUrls = publishedCryptics.map(cryptic => ({
    url: `${baseUrl}/archivo/${cryptic.id}`,
    lastModified: new Date(cryptic.scheduledDate),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/archivo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...crypticUrls,
  ];
}
