'use client';

import React from 'react';
import { Cryptic } from '@/lib/types';
import { formatDatePretty } from '@/lib/dataService';
import { Calendar, Sparkles } from 'lucide-react';

interface ClueCardProps {
  cryptic: Cryptic;
  showDefinition: boolean;
}

export default function ClueCard({ cryptic, showDefinition }: ClueCardProps) {
  // Renderizar el texto de la pista resaltando la definición si la pista 1 está activa
  const renderClueText = () => {
    if (!showDefinition || !cryptic.defPart) {
      return (
        <span className="font-serif text-xl sm:text-2xl md:text-3xl text-ink-900 leading-snug sm:leading-relaxed font-medium">
          {cryptic.clue}
        </span>
      );
    }

    const clue = cryptic.clue;
    const def = cryptic.defPart;
    const lowerClue = clue.toLowerCase();
    const lowerDef = def.toLowerCase();
    const index = lowerClue.indexOf(lowerDef);

    if (index === -1) {
      return (
        <span className="font-serif text-xl sm:text-2xl md:text-3xl text-ink-900 leading-snug sm:leading-relaxed font-medium">
          {cryptic.clue}
        </span>
      );
    }

    const before = clue.slice(0, index);
    const highlighted = clue.slice(index, index + def.length);
    const after = clue.slice(index + def.length);

    return (
      <span className="font-serif text-xl sm:text-2xl md:text-3xl text-ink-900 leading-snug sm:leading-relaxed font-medium">
        {before}
        <mark
          title="Definición directa"
          className="bg-sage-light/90 text-sage-dark px-1.5 py-0.5 rounded border-b-2 border-sage font-semibold not-italic shadow-2xs"
        >
          {highlighted}
        </mark>
        {after}
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

  return (
    <div className="bg-parchment-50 border border-ink-300 rounded-lg p-4 sm:p-7 shadow-xs relative overflow-hidden">
      {/* Marca de agua editorial */}
      <div className="absolute -right-4 -bottom-6 sm:-right-6 sm:-bottom-8 opacity-5 font-serif text-7xl sm:text-9xl select-none pointer-events-none">
        ¶
      </div>

      {/* Fila superior de metadatos */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-4 sm:mb-6 border-b border-ink-300/60">
        <div className="flex items-center gap-2">
          <span className="font-serif text-base sm:text-lg font-bold text-ink-900">
            Juego #{cryptic.clueNumber}
          </span>
          <span
            className={`text-[10px] sm:text-xs uppercase font-mono font-bold px-2 py-0.5 rounded border ${getDifficultyBadge(
              cryptic.difficulty
            )}`}
          >
            {cryptic.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-ink-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-ink-600 flex-shrink-0" />
          <span className="capitalize">{formatDatePretty(cryptic.scheduledDate)}</span>
        </div>
      </div>

      {/* Enunciado */}
      <div className="mb-2">
        <span className="text-[10px] sm:text-xs font-mono uppercase text-ink-600 tracking-wider block mb-1.5 font-medium">
          Enunciado ({cryptic.letterCount} letras)
        </span>
        <div className="py-1">{renderClueText()}</div>

        {showDefinition && (
          <p className="mt-3 text-xs text-sage-dark font-medium flex items-start gap-1.5 bg-sage-light/40 p-2.5 rounded border border-sage/20 leading-relaxed">
            <Sparkles className="w-3.5 h-3.5 text-sage flex-shrink-0 mt-0.5" />
            <span>
              <strong>Pista activa:</strong> La parte resaltada en verde es la{' '}
              <em>definición directa</em> de la palabra. El resto es el mecanismo de construcción.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
