export interface MusicRecommendation {
  id?: string;
  title: string;
  artist: string;
  spotifyUrl: string;
  scheduledDate?: string;
  isCustom?: boolean;
}

/**
 * Enlace a la playlist oficial de Spotify para Cripticardo.
 */
export const CRIPTICARDO_PLAYLIST = {
  title: 'Cripticardo Soundtrack',
  url: 'https://open.spotify.com/playlist/0IP4tBjAhhhjmCs9IeMXJQ?si=n4Y88dPLTvmCCxWadVRoEA&utm_source=copy-link&pi=sRLxEmFsTriBC',
};

/**
 * Repertorio predeterminado de recomendaciones de música antigua, laúd y renacimiento.
 * Se rotan automáticamente día a día si no hay una recomendación personalizada asignada por el autor.
 */
export const DAILY_RECOMMENDATIONS: MusicRecommendation[] = [
  {
    title: 'Flow, My Tears',
    artist: 'John Dowland',
    spotifyUrl: 'https://open.spotify.com/search/Flow%20My%20Tears%20John%20Dowland',
  },
  {
    title: 'Canarios',
    artist: 'Gaspar Sanz, Hopkinson Smith',
    spotifyUrl: 'https://open.spotify.com/search/Canarios%20Gaspar%20Sanz',
  },
  {
    title: 'Greensleeves to a Ground',
    artist: 'Jordi Savall, Hespèrion XXI',
    spotifyUrl: 'https://open.spotify.com/search/Greensleeves%20Jordi%20Savall',
  },
  {
    title: 'Mille Regretz',
    artist: 'Josquin des Prez',
    spotifyUrl: 'https://open.spotify.com/search/Mille%20Regretz%20Josquin',
  },
  {
    title: 'Spem in alium',
    artist: 'Thomas Tallis',
    spotifyUrl: 'https://open.spotify.com/search/Spem%20in%20alium%20Thomas%20Tallis',
  },
  {
    title: 'La Folia',
    artist: 'Arcangelo Corelli, Jordi Savall',
    spotifyUrl: 'https://open.spotify.com/search/La%20Folia%20Jordi%20Savall',
  },
  {
    title: 'Pavana Lachrymae',
    artist: 'William Byrd',
    spotifyUrl: 'https://open.spotify.com/search/Pavana%20Lachrymae%20William%20Byrd',
  },
  {
    title: 'Chaconne en sol mayor',
    artist: 'Robert de Visée',
    spotifyUrl: 'https://open.spotify.com/search/Chaconne%20Robert%20de%20Visee',
  },
  {
    title: 'Ondas do mar de Vigo',
    artist: 'Martín Codax',
    spotifyUrl: 'https://open.spotify.com/search/Ondas%20do%20mar%20de%20Vigo',
  },
  {
    title: 'Cuncti simus concanentes',
    artist: 'Llibre Vermell de Montserrat',
    spotifyUrl: 'https://open.spotify.com/search/Cuncti%20simus%20concanentes',
  },
];

/**
 * Genera una URL de búsqueda directa en Spotify a partir del título y el artista.
 */
export function buildSpotifySearchUrl(title: string, artist: string): string {
  const query = encodeURIComponent(`${title.trim()} ${artist.trim()}`);
  return `https://open.spotify.com/search/${query}`;
}

/**
 * Obtiene la recomendación musical predeterminada según la fecha (YYYY-MM-DD o día del año).
 */
export function getDefaultRecommendationForDate(dateStr?: string): MusicRecommendation {
  if (dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const date = new Date(year, month - 1, day);
      const startOfYear = new Date(year, 0, 0);
      const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      const index = Math.abs(dayOfYear) % DAILY_RECOMMENDATIONS.length;
      return { ...DAILY_RECOMMENDATIONS[index], scheduledDate: dateStr, isCustom: false };
    }
  }

  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayOfYear) % DAILY_RECOMMENDATIONS.length;
  return { ...DAILY_RECOMMENDATIONS[index], isCustom: false };
}

/**
 * Obtiene la recomendación de hoy (alias rápido)
 */
export function getTodayRecommendation(): MusicRecommendation {
  return getDefaultRecommendationForDate();
}
