'use client';

import React from 'react';
import { Cryptic } from '@/lib/types';
import { formatDatePretty } from '@/lib/dataService';
import { Calendar, Sparkles } from 'lucide-react';

interface ClueCardProps {
  cryptic: Cryptic;
  showDefinition: boolean;
  showMechanism?: boolean;
}

// Función robusta para encontrar coincidencias de fragmentos textuales en el enunciado
// Tolera mayúsculas/minúsculas, tildes/acentos y elimina comillas perimetrales
export function findSubstringIntervals(
  fullText: string,
  searchStr: string
): { start: number; end: number }[] {
  const intervals: { start: number; end: number }[] = [];
  if (!fullText || !searchStr) return intervals;

  const cleanSearch = searchStr
    .replace(/^["'«“]/, '')
    .replace(/["'»”]$/, '')
    .trim();
  if (!cleanSearch) return intervals;

  const lowerFull = fullText.toLowerCase();
  const lowerSearch = cleanSearch.toLowerCase();

  // 1. Intento exacto insensible a mayúsculas
  let searchFrom = 0;
  while (searchFrom < lowerFull.length) {
    const idx = lowerFull.indexOf(lowerSearch, searchFrom);
    if (idx === -1) break;
    intervals.push({ start: idx, end: idx + cleanSearch.length });
    searchFrom = idx + cleanSearch.length;
  }

  if (intervals.length > 0) return intervals;

  // 2. Fallback tolerante a tildes (ej: al reves vs al revés)
  const stripDiacritics = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const normFull = stripDiacritics(fullText);
  const normSearch = stripDiacritics(cleanSearch);

  if (normFull.length === fullText.length) {
    searchFrom = 0;
    while (searchFrom < normFull.length) {
      const idx = normFull.indexOf(normSearch, searchFrom);
      if (idx === -1) break;
      intervals.push({ start: idx, end: idx + normSearch.length });
      searchFrom = idx + normSearch.length;
    }
  } else {
    try {
      const escaped = normSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const accentPattern = escaped
        .replace(/a/g, '[aáàäâã]')
        .replace(/e/g, '[eéèëê]')
        .replace(/i/g, '[iíìïî]')
        .replace(/o/g, '[oóòöôõ]')
        .replace(/u/g, '[uúùüû]')
        .replace(/n/g, '[nñ]');
      const regex = new RegExp(accentPattern, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(fullText)) !== null) {
        intervals.push({ start: match.index, end: match.index + match[0].length });
      }
    } catch {
      // Ignorar fallback regex
    }
  }

  return intervals;
}

export default function ClueCard({ cryptic, showDefinition, showMechanism = false }: ClueCardProps) {
  // Renderizar el texto de la pista resaltando definición (verde) y/o juego de palabras (naranja)
  const renderClueText = () => {
    const clue = cryptic.clue;
    const def = cryptic.defPart;
    const mech = cryptic.mechanismPart;

    const intervals: { start: number; end: number; kind: 'def' | 'mech' }[] = [];

    // 1. Definición (verde)
    if (showDefinition && def) {
      const defParts = def
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);

      for (const dPart of defParts) {
        const matches = findSubstringIntervals(clue, dPart);
        for (const m of matches) {
          intervals.push({ start: m.start, end: m.end, kind: 'def' });
        }
      }
    }

    // 2. Indicadores (naranja): separados por comas
    if (showMechanism && mech) {
      const indicators = mech
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);

      for (const indicator of indicators) {
        const matches = findSubstringIntervals(clue, indicator);
        for (const m of matches) {
          intervals.push({ start: m.start, end: m.end, kind: 'mech' });
        }
      }
    }

    if (intervals.length === 0) {
      return (
        <span className="font-serif text-xl sm:text-2xl md:text-3xl text-ink-900 leading-snug sm:leading-relaxed font-medium">
          {clue}
        </span>
      );
    }

    // Ordenar por posición de inicio en el enunciado
    intervals.sort((a, b) => a.start - b.start);

    const segments: { text: string; type: 'plain' | 'def' | 'mech' }[] = [];
    let curr = 0;

    for (const item of intervals) {
      const realStart = Math.max(item.start, curr);
      if (realStart > curr) {
        segments.push({ text: clue.slice(curr, realStart), type: 'plain' });
      }
      if (item.end > realStart) {
        segments.push({ text: clue.slice(realStart, item.end), type: item.kind });
        curr = item.end;
      }
    }

    if (curr < clue.length) {
      segments.push({ text: clue.slice(curr), type: 'plain' });
    }

    return (
      <span className="font-serif text-xl sm:text-2xl md:text-3xl text-ink-900 leading-snug sm:leading-relaxed font-medium">
        {segments.map((seg, i) => {
          if (seg.type === 'def') {
            return (
              <mark
                key={i}
                title="Pista 1: Definición directa"
                className="bg-sage-light/90 text-sage-dark px-1.5 py-0.5 rounded border-b-2 border-sage font-semibold not-italic shadow-2xs"
              >
                {seg.text}
              </mark>
            );
          }
          if (seg.type === 'mech') {
            return (
              <mark
                key={i}
                title="Pista 2: Indicador"
                className="bg-orange-100 text-orange-950 px-1.5 py-0.5 rounded border-b-2 border-orange-500 font-semibold not-italic shadow-2xs"
              >
                {seg.text}
              </mark>
            );
          }
          return <React.Fragment key={i}>{seg.text}</React.Fragment>;
        })}
      </span>
    );
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Fácil':
        return 'bg-sage-light text-sage-dark border-sage/40';
      case 'Medio':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Difícil':
        return 'bg-terracotta-light text-terracotta-dark border-terracotta/40';
      default:
        return 'bg-parchment-200 text-ink-700 border-ink-300';
    }
  };

  // Enumeración de letras y desglose si la solución es una frase con espacios
  const answerWords = cryptic.answer ? cryptic.answer.trim().split(/\s+/).filter(Boolean) : [];
  const wordLengths = answerWords.map((w) => w.length);
  const enumerationText =
    wordLengths.length > 1
      ? `${cryptic.letterCount} letras: ${wordLengths.join(', ')}`
      : `${cryptic.letterCount} letras`;

  const hasMultipleIndicators = Boolean(
    cryptic.mechanismPart && cryptic.mechanismPart.includes(',')
  );

  return (
    <div className="bg-parchment-50 border border-ink-300 rounded-lg p-4 sm:p-7 shadow-xs relative overflow-hidden">
      
      {/* Fila superior de metadatos */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-4 sm:mb-6 border-b border-ink-300/60">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-ink-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-ink-600 flex-shrink-0" />
          <span className="capitalize">{formatDatePretty(cryptic.scheduledDate)}</span>
        </div>
          <span
            className={`text-[10px] sm:text-xs uppercase font-mono font-bold px-2 py-0.5 rounded border items-center justify-end ${
              getDifficultyBadge(cryptic.difficulty)
            }`}
          >
            {cryptic.difficulty}
          </span>
        </div>
      </div>

      {/* Enunciado */}
      <div className="mb-2">
        <div className="py-1 text-center">{renderClueText()}</div>

        {/* Explicación de pistas activas */} 
        {(showDefinition || showMechanism) && (
          <div className="mt-3.5 text-xs space-y-1.5 bg-parchment-100/90 p-2.5 sm:p-3 rounded-md border border-parchment-300 leading-relaxed animate-in fade-in duration-200">
            {showDefinition && (
              <p className="text-sage-dark font-medium flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sage flex-shrink-0"></span>
                <span>
                  <strong>Verde (Pista 1):</strong> Definición directa de la palabra.
                </span>
              </p>
            )}
            {showMechanism && (
              <p className="text-orange-950 font-medium flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0"></span>
                <span>
                  <strong>Naranja (Pista 2):</strong>{' '}
                  {hasMultipleIndicators
                    ? 'Indicadores separados del mecanismo.'
                    : 'Indicador del mecanismo.'}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
