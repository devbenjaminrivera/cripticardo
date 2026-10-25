'use client';

import React from 'react';
import { Lightbulb, Shuffle, Search, EyeOff, CheckCircle2 } from 'lucide-react';

interface ClueActionsProps {
  isSolved: boolean;
  definitionRevealed: boolean;
  mechanismRevealed: boolean;
  hint1Used: boolean;
  hint2Used: boolean;
  hint3Used: boolean;
  onToggleDefinition: () => void;
  onToggleMechanism: () => void;
  onRevealLetter: () => void;
  onSurrender: () => void;
  onCheckAnswer: () => void;
  feedbackMessage?: string;
  feedbackType?: 'error' | 'success' | 'info';
}

export default function ClueActions({
  isSolved,
  definitionRevealed,
  mechanismRevealed,
  hint1Used,
  hint2Used,
  hint3Used,
  onToggleDefinition,
  onToggleMechanism,
  onRevealLetter,
  onSurrender,
  onCheckAnswer,
  feedbackMessage,
  feedbackType = 'info',
}: ClueActionsProps) {
  if (isSolved) return null;

  // El botón de rendirse solo aparece si se usaron las 3 pistas progresivas
  const canSurrender = hint1Used && hint2Used && hint3Used;

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
        {/* Pistas progresivas y ayudas */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pista 1: Revelar Definición (siempre disponible de inicio) */}
          <button
            type="button"
            onClick={onToggleDefinition}
            className={`min-h-[42px] text-xs px-2.5 sm:px-3 py-2 rounded font-medium transition-all flex items-center justify-center gap-1.5 border active:scale-95 cursor-pointer shadow-2xs ${
              definitionRevealed
                ? 'bg-sage-light text-sage-dark border-sage/50 font-semibold'
                : 'bg-white hover:bg-parchment-100 text-ink-800 border-ink-300'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>
              {definitionRevealed ? 'Ocultar Definición' : 'Pista 1: Definición'}
            </span>
          </button>

          {/* Pista 2: Revelar Juego de palabras / Anagrama (se desbloquea al pedir la Pista 1) */}
          {hint1Used && (
            <button
              type="button"
              onClick={onToggleMechanism}
              className={`min-h-[42px] text-xs px-2.5 sm:px-3 py-2 rounded font-medium transition-all flex items-center justify-center gap-1.5 border active:scale-95 cursor-pointer shadow-2xs animate-in fade-in duration-300 ${
                mechanismRevealed
                  ? 'bg-orange-100 text-orange-950 border-orange-400 font-semibold'
                  : 'bg-white hover:bg-parchment-100 text-ink-800 border-ink-300'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
              <span>
                {mechanismRevealed ? 'Ocultar Indicador' : 'Pista 2: Indicador'}
              </span>
            </button>
          )}

          {/* Pista 3: Revelar Letra (se desbloquea al pedir la Pista 2) */}
          {hint2Used && (
            <button
              type="button"
              onClick={onRevealLetter}
              className="min-h-[42px] text-xs px-2.5 sm:px-3 py-2 border border-ink-300 hover:border-ink-800 rounded bg-white hover:bg-parchment-100 text-ink-800 font-medium transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer animate-in fade-in duration-300"
            >
              <Search className="w-3.5 h-3.5 text-ink-600 flex-shrink-0" />
              <span>Pista 3: Revelar letra</span>
            </button>
          )}

          {/* Botón de Rendirse (solo aparece cuando se han usado las 3 pistas) */}
          {canSurrender && (
            <button
              type="button"
              onClick={onSurrender}
              className="min-h-[36px] text-xs py-1.5 px-3 text-terracotta hover:text-terracotta-dark hover:underline font-medium transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer animate-in fade-in duration-300 ml-auto sm:ml-0"
              title="Rendirse y consultar la solución completa"
            >
              <EyeOff className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Rendirse</span>
            </button>
          )}
        </div>

        {/* Botón principal de comprobar (Grande y accesible en móvil) */}
        <div>
          <button
            type="button"
            onClick={onCheckAnswer}
            className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 bg-ink-900 hover:bg-ink-800 text-parchment-50 tracking-wide text-sm font-semibold rounded-md shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-parchment-300" />
            <span>Comprobar Solución</span>
          </button>
        </div>
      </div>
    </div>
  );
}
