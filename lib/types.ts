export type Difficulty = 'Fácil' | 'Medio' | 'Difícil';

export interface Cryptic {
  id: string;
  clueNumber: number;
  scheduledDate: string; // YYYY-MM-DD (hora de Chile)
  title?: string;
  clue: string;
  answer: string; // UPPERCASE, trimmed
  letterCount: number;
  difficulty: Difficulty;
  category?: string; // Opcional / oculto para que el usuario deduzca el mecanismo
  defPart: string; // Fragmento de definición para la Pista 1
  mechanismPart: string; // Fragmento del juego de palabras
  mechanismText: string; // Explicación de la resolución
  status?: 'published' | 'draft';
  createdAt?: string;
}

export interface PlayerStats {
  solvedCount: number;
  streak: number;
  lastPlayedDate: string;
  hintsUsedCount: number;
}
