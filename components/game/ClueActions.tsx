'use client';

import React from 'react';
import { Lightbulb, Search, EyeOff, CheckCircle2 } from 'lucide-react';

interface ClueActionsProps {
  isSolved: boolean;
  definitionRevealed: boolean;
  onToggleDefinition: () => void;
  onRevealLetter: () => void;
  onSurrender: () => void;
  onCheckAnswer: () => void;
  feedbackMessage?: string;
  feedbackType?: 'error' | 'success' | 'info';
}

export default function ClueActions({
  isSolved,
  definitionRevealed,
  onToggleDefinition,
  onRevealLetter,
  onSurrender,
  onCheckAnswer,
  feedbackMessage,
  feedbackType = 'info',
}: ClueActionsProps) {
  if (isSolved) return null;

  return (
    <div className="space-y-3.5 pt-2">
      {/* Banner de mensaje de feedback */}
      {feedbackMessage && (
        <div
          className={`text-xs sm:text-sm font-medium py-2.5 px-3 rounded-md transition-all flex items-center gap-2 ${
            feedbackType === 'error'
              ? 'bg-red-50 text-terracotta-dark border border-terracotta/30'
              : feedbackType === 'success'
              ? 'bg-sage-light/60 text-sage-dark border border-sage/30'
              : 'bg-parchment-200 text-ink-800 border border-parchment-300'
          }`}
        >
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Controles de botones móviles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-parchment-300">
        {/* Pistas y ayudas */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleDefinition}
            className={`min-h-[42px] text-xs px-2.5 py-2 rounded font-medium transition-all flex items-center justify-center gap-1.5 border active:scale-95 cursor-pointer ${
              definitionRevealed
                ? 'bg-sage-light text-sage-dark border-sage/50'
                : 'bg-white hover:bg-parchment-100 text-ink-800 border-ink-300 shadow-2xs'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="truncate">{definitionRevealed ? 'Ocultar Definición' : 'Pista 1: Definición'}</span>
          </button>

          <button
            type="button"
            onClick={onRevealLetter}
            className="min-h-[42px] text-xs px-2.5 py-2 border border-ink-300 hover:border-ink-800 rounded bg-white hover:bg-parchment-100 text-ink-800 font-medium transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-ink-600 flex-shrink-0" />
            <span className="truncate">Pista 2: Letra</span>
          </button>

          <button
            type="button"
            onClick={onSurrender}
            className="col-span-2 sm:col-span-1 min-h-[36px] text-xs py-1.5 px-3 text-terracotta hover:text-terracotta-dark hover:underline font-medium transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Rendirse y ver solución</span>
          </button>
        </div>

        {/* Botón principal de comprobar (Grande y accesible en móvil) */}
        <div>
          <button
            type="button"
            onClick={onCheckAnswer}
            className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 bg-ink-900 hover:bg-ink-800 text-parchment-50 font-serif tracking-wide text-sm font-semibold rounded-md shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-parchment-300" />
            <span>Comprobar Solución</span>
          </button>
        </div>
      </div>
    </div>
  );
}
