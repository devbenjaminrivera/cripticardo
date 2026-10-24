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
    <div className="space-y-4 pt-2">
      {/* Feedback message banner */}
      {feedbackMessage && (
        <div
          className={`text-sm font-medium py-2 px-3 rounded transition-all flex items-center gap-2 ${
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

      {/* Button controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-parchment-300">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleDefinition}
            className={`text-xs px-3 py-2 rounded font-medium transition-all flex items-center gap-1.5 border ${
              definitionRevealed
                ? 'bg-sage-light text-sage-dark border-sage/50'
                : 'bg-parchment-100 hover:bg-parchment-200 text-ink-800 border-ink-300'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>{definitionRevealed ? 'Ocultar Definición' : 'Pista 1: Separar Definición'}</span>
          </button>

          <button
            type="button"
            onClick={onRevealLetter}
            className="text-xs px-3 py-2 border border-ink-300 hover:border-ink-800 rounded bg-parchment-100 hover:bg-parchment-200 text-ink-800 font-medium transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5 text-ink-600" />
            <span>Pista 2: Revelar letra</span>
          </button>

          <button
            type="button"
            onClick={onSurrender}
            className="text-xs px-3 py-2 text-terracotta hover:text-terracotta-dark hover:underline font-medium transition-all flex items-center gap-1"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Rendirse</span>
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={onCheckAnswer}
            className="w-full sm:w-auto px-6 py-2.5 bg-ink-900 hover:bg-ink-800 text-parchment-50 font-serif tracking-wide text-sm font-semibold rounded shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-parchment-300" />
            <span>Comprobar Solución</span>
          </button>
        </div>
      </div>
    </div>
  );
}
