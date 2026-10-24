export interface DailyProgress {
  crypticId: string;
  solved: boolean;
  userLetters: string[];
  revealedIndices: number[];
  definitionRevealed: boolean;
  timeSpentSeconds: number;
  solvedAt?: string;
  surrendered?: boolean;
}

const PLAYER_PROGRESS_KEY = 'cripticardo_player_progress_v1';
const PLAYER_STREAK_KEY = 'cripticardo_player_streak_v1';

export function getPlayerProgress(crypticId: string): DailyProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${PLAYER_PROGRESS_KEY}_${crypticId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePlayerProgress(crypticId: string, progress: DailyProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${PLAYER_PROGRESS_KEY}_${crypticId}`, JSON.stringify(progress));
  } catch (err) {
    console.error('Error saving progress:', err);
  }
}

export function generateShareText(
  clueNumber: number,
  dateStr: string,
  hintsUsed: number,
  timeSeconds: number,
  letterCount: number,
  surrendered: boolean
): string {
  const mins = Math.floor(timeSeconds / 60);
  const secs = timeSeconds % 60;
  const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  if (surrendered) {
    return `Cripticardo Juego #${clueNumber} 🧩\n` +
      `📅 ${dateStr}\n` +
      `📖 Solución vista con ayuda\n` +
      `https://cripticardo.vercel.app`;
  }

  const greenBoxes = '🟩'.repeat(letterCount);
  const hintText = hintsUsed === 0 ? 'Sin pistas 🧠' : `${hintsUsed} ${hintsUsed === 1 ? 'pista' : 'pistas'} 💡`;

  return `Cripticardo Juego #${clueNumber} 🧩\n` +
    `📅 ${dateStr}\n` +
    `⏱️ ${timeFormatted} | ${hintText}\n` +
    `${greenBoxes}\n` +
    `https://cripticardo.vercel.app`;
}
