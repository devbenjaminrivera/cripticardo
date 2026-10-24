import { Cryptic } from './types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'cripticardo_cryptics_v1';
export const CHILE_TIMEZONE = 'America/Santiago';

// Obtiene la fecha actual en zona horaria Santiago de Chile (formato YYYY-MM-DD)
export function getChileDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CHILE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

export function getTodayDateString(): string {
  return getChileDateString();
}

export function formatDatePretty(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: CHILE_TIMEZONE,
    });
  } catch {
    return dateStr;
  }
}

// Tiempo restante hasta la medianoche en Santiago de Chile (próxima pista)
export function getTimeUntilNextChileMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const chileNowStr = now.toLocaleString('en-US', { timeZone: CHILE_TIMEZONE });
  const chileNow = new Date(chileNowStr);

  const nextMidnight = new Date(chileNow);
  nextMidnight.setHours(24, 0, 0, 0);

  const diffMs = nextMidnight.getTime() - chileNow.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
}

// Calcula automáticamente la siguiente fecha disponible en Chile (sin solapar días)
export function getNextAvailableDate(): string {
  const all = getAllCryptics();
  const existingDates = new Set(all.map((c) => c.scheduledDate));
  const chileToday = getChileDateString();

  if (!existingDates.has(chileToday)) {
    return chileToday;
  }

  const [year, month, day] = chileToday.split('-').map(Number);
  const cursor = new Date(year, month - 1, day);

  while (true) {
    cursor.setDate(cursor.getDate() + 1);
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    if (!existingDates.has(dateStr)) {
      return dateStr;
    }
  }
}

// Convertidor de base de datos snake_case a frontend camelCase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRowToCryptic(row: any): Cryptic {
  return {
    id: row.id,
    clueNumber: row.clue_number,
    scheduledDate: row.scheduled_date,
    clue: row.clue,
    answer: row.answer,
    letterCount: row.letter_count,
    difficulty: row.difficulty,
    category: row.category || '',
    defPart: row.def_part,
    mechanismPart: row.mechanism_part,
    mechanismText: row.mechanism_text,
    status: row.status || 'published',
    createdAt: row.created_at,
  };
}

// Obtener todas las pistas almacenadas
export function getAllCryptics(): Cryptic[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Obtener todas las pistas (asíncrono con soporte de Supabase)
export async function fetchAllCrypticsAsync(): Promise<Cryptic[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cryptics')
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (!error && data) {
        const mapped = data.map(mapRowToCryptic);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }
        return mapped;
      }
    } catch (e) {
      console.warn('Error conectando a Supabase, usando respaldo local:', e);
    }
  }

  return getAllCryptics();
}

/**
 * REGLA DE SELECCIÓN Y REPETICIÓN:
 * 1. Todos en el mundo ven el mismo críptico durante 24 horas (sincronizado con Santiago de Chile).
 * 2. Si hay un críptico explícitamente programado para hoy, se muestra ese.
 * 3. Si no hay una fecha específica asignada para hoy:
 *    - Si hay suficientes pistas únicas para cubrir los días transcurridos, NO se repite ninguna.
 *    - ÚNICAMENTE si no son suficientes (ej. hay 3 pistas y estamos en el día 4),
 *      la lista cicla determinísticamente (% total de pistas) para que nunca se quede vacía.
 */
export function getDailyCryptic(targetDate?: string): Cryptic | null {
  const chileDate = targetDate || getChileDateString();
  const all = getAllCryptics();
  
  const published = all
    .filter((c) => c.status === 'published')
    .sort((a, b) => a.clueNumber - b.clueNumber);

  if (published.length === 0) {
    return null;
  }

  // Prioridad 1: Coincidencia explícita para la fecha en Chile
  const exactMatch = published.find((c) => c.scheduledDate === chileDate);
  if (exactMatch) {
    return exactMatch;
  }

  // Prioridad 2: Cálculo de rotación si faltan pistas para el día actual
  const earliestDateStr = published.reduce((earliest, c) => {
    return c.scheduledDate < earliest ? c.scheduledDate : earliest;
  }, published[0].scheduledDate);

  const [tYear, tMonth, tDay] = chileDate.split('-').map(Number);
  const [eYear, eMonth, eDay] = earliestDateStr.split('-').map(Number);

  const todayUtc = Date.UTC(tYear, tMonth - 1, tDay);
  const earliestUtc = Date.UTC(eYear, eMonth - 1, eDay);

  const dayDifference = Math.floor((todayUtc - earliestUtc) / (1000 * 60 * 60 * 24));

  if (dayDifference <= 0) {
    return published[0];
  }

  // Si hay suficientes pistas (dayDifference < published.length), entrega una nueva sin repetir.
  // Si no son suficientes (dayDifference >= published.length), cicla determinísticamente.
  const targetIndex = dayDifference % published.length;
  return published[targetIndex];
}

// Obtener el críptico del día (asíncrono con Supabase)
export async function fetchDailyCrypticAsync(targetDate?: string): Promise<Cryptic | null> {
  const chileDate = targetDate || getChileDateString();

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Intentar buscar el del día
      const { data: exactMatch } = await supabase
        .from('cryptics')
        .select('*')
        .eq('scheduled_date', chileDate)
        .eq('status', 'published')
        .maybeSingle();

      if (exactMatch) {
        return mapRowToCryptic(exactMatch);
      }

      // 2. Si no hay exacto para hoy, cargar publicados para la rotación condicional
      const { data: allPublished } = await supabase
        .from('cryptics')
        .select('*')
        .eq('status', 'published')
        .order('clue_number', { ascending: true });

      if (allPublished && allPublished.length > 0) {
        const mapped = allPublished.map(mapRowToCryptic);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }

        const earliestDateStr = mapped[0].scheduledDate;
        const [tYear, tMonth, tDay] = chileDate.split('-').map(Number);
        const [eYear, eMonth, eDay] = earliestDateStr.split('-').map(Number);

        const todayUtc = Date.UTC(tYear, tMonth - 1, tDay);
        const earliestUtc = Date.UTC(eYear, eMonth - 1, eDay);
        const dayDifference = Math.floor((todayUtc - earliestUtc) / (1000 * 60 * 60 * 24));

        if (dayDifference <= 0) {
          return mapped[0];
        }

        return mapped[dayDifference % mapped.length];
      }
    } catch (e) {
      console.warn('Error al consultar Supabase:', e);
    }
  }

  return getDailyCryptic(targetDate);
}

// Guardar nueva pista (asíncrono con Supabase)
export async function saveCrypticAsync(
  newClue: Omit<Cryptic, 'id' | 'clueNumber'> & { id?: string }
): Promise<Cryptic> {
  const cleanAnswer = newClue.answer.trim().toUpperCase();
  const letterCount = cleanAnswer.replace(/\s+/g, '').length;

  if (isSupabaseConfigured && supabase) {
    try {
      if (newClue.id && !newClue.id.startsWith('cr-')) {
        // Actualizar existente
        const { data, error } = await supabase
          .from('cryptics')
          .update({
            scheduled_date: newClue.scheduledDate,
            clue: newClue.clue.trim(),
            answer: cleanAnswer,
            letter_count: letterCount,
            difficulty: newClue.difficulty,
            category: newClue.category || '',
            def_part: newClue.defPart.trim(),
            mechanism_part: newClue.mechanismPart.trim(),
            mechanism_text: newClue.mechanismText.trim(),
            status: 'published',
          })
          .eq('id', newClue.id)
          .select()
          .single();

        if (!error && data) {
          const updated = mapRowToCryptic(data);
          saveCrypticLocal(updated);
          return updated;
        }
      } else {
        // Calcular el siguiente número de juego correlativo
        const { data: maxRow } = await supabase
          .from('cryptics')
          .select('clue_number')
          .order('clue_number', { ascending: false })
          .limit(1)
          .maybeSingle();

        const nextClueNumber = maxRow?.clue_number ? maxRow.clue_number + 1 : 1;

        // Insertar nuevo con el número calculado
        const { data, error } = await supabase
          .from('cryptics')
          .insert({
            scheduled_date: newClue.scheduledDate,
            clue_number: nextClueNumber,
            clue: newClue.clue.trim(),
            answer: cleanAnswer,
            letter_count: letterCount,
            difficulty: newClue.difficulty,
            category: newClue.category || '',
            def_part: newClue.defPart.trim(),
            mechanism_part: newClue.mechanismPart.trim(),
            mechanism_text: newClue.mechanismText.trim(),
            status: 'published',
          })
          .select()
          .single();

        if (!error && data) {
          const created = mapRowToCryptic(data);
          saveCrypticLocal(created);
          return created;
        }
      }
    } catch (e) {
      console.warn('Error guardando en Supabase, guardando localmente:', e);
    }
  }

  return saveCrypticLocal(newClue);
}

// Guardar localmente
export function saveCryptic(newClue: Omit<Cryptic, 'id' | 'clueNumber'> & { id?: string }): Cryptic {
  return saveCrypticLocal(newClue);
}

function saveCrypticLocal(newClue: Omit<Cryptic, 'id' | 'clueNumber'> & { id?: string }): Cryptic {
  const all = getAllCryptics();
  
  if (newClue.id) {
    const index = all.findIndex((c) => c.id === newClue.id);
    if (index !== -1) {
      const updated: Cryptic = {
        ...all[index],
        ...newClue,
        id: newClue.id,
        answer: newClue.answer.trim().toUpperCase(),
        letterCount: newClue.answer.trim().replace(/\s+/g, '').length,
      };
      all[index] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      }
      return updated;
    }
  }

  const nextNum = all.length > 0 ? Math.max(...all.map((c) => c.clueNumber || 0)) + 1 : 1;
  const created: Cryptic = {
    ...newClue,
    id: newClue.id || `cr-${Date.now()}`,
    clueNumber: nextNum,
    answer: newClue.answer.trim().toUpperCase(),
    letterCount: newClue.answer.trim().replace(/\s+/g, '').length,
    status: 'published',
    createdAt: new Date().toISOString(),
  };

  const updatedList = [created, ...all];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  }
  return created;
}

// Eliminar pista
export async function deleteCrypticAsync(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('cryptics').delete().eq('id', id);
    } catch (e) {
      console.warn('Error eliminando en Supabase:', e);
    }
  }
  return deleteCryptic(id);
}

export function deleteCryptic(id: string): boolean {
  const all = getAllCryptics();
  const filtered = all.filter((c) => c.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
  return true;
}
