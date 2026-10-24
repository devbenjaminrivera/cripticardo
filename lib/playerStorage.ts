export interface DailyProgress {
  crypticId: string;
  solved: boolean;
  userLetters: string[];
  revealedIndices: number[];
  definitionRevealed: boolean;
  timeSpentSeconds: number;
  solvedAt?: string;
  surrendered?: boolean;
  completedBefore?: boolean;
  bestTimeSeconds?: number;
  timesSolvedCount?: number;
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
    const existing = getPlayerProgress(crypticId);
    const completedBefore = Boolean(existing?.completedBefore || existing?.solved || progress.solved);
    let bestTime = existing?.bestTimeSeconds;
    if (progress.solved && !progress.surrendered) {
      bestTime = bestTime !== undefined ? Math.min(bestTime, progress.timeSpentSeconds) : progress.timeSpentSeconds;
    }
    const timesSolvedCount = (existing?.timesSolvedCount || 0) + (progress.solved && !existing?.solved ? 1 : 0);

    const merged: DailyProgress = {
      ...progress,
      completedBefore,
      bestTimeSeconds: bestTime,
      timesSolvedCount,
    };
    localStorage.setItem(`${PLAYER_PROGRESS_KEY}_${crypticId}`, JSON.stringify(merged));
  } catch (err) {
    console.error('Error saving progress:', err);
  }
}

export function resetDailyProgress(crypticId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getPlayerProgress(crypticId);
    if (existing) {
      const resetPayload: DailyProgress = {
        ...existing,
        solved: false,
        surrendered: false,
        userLetters: [],
        revealedIndices: [],
        definitionRevealed: false,
        timeSpentSeconds: 0,
        completedBefore: Boolean(existing.completedBefore || existing.solved),
      };
      localStorage.setItem(`${PLAYER_PROGRESS_KEY}_${crypticId}`, JSON.stringify(resetPayload));
    }
  } catch (err) {
    console.error('Error resetting progress:', err);
  }
}

export function getAllSolvedCrypticIds(): string[] {
  if (typeof window === 'undefined') return [];
  const solvedIds = new Set<string>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${PLAYER_PROGRESS_KEY}_`)) {
        const id = key.substring(`${PLAYER_PROGRESS_KEY}_`.length);
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.completedBefore || parsed.solved)) {
            solvedIds.add(id);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error reading solved cryptics:', err);
  }
  return Array.from(solvedIds);
}

export function isCrypticSolved(crypticId: string): boolean {
  const p = getPlayerProgress(crypticId);
  return Boolean(p?.completedBefore || p?.solved);
}

export function getSolvedCount(): number {
  return getAllSolvedCrypticIds().length;
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
