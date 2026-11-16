'use client';

import React from 'react';
import { Lightbulb, Shuffle, Search, EyeOff, CheckCircle2, Package } from 'lucide-react';

interface ClueActionsProps {
  isSolved: boolean;
  definitionRevealed: boolean;
  mechanismRevealed: boolean;
  materialRevealed: boolean;
  hint1Used: boolean;
  hint2Used: boolean;
  hint3Used: boolean;
  hint4Used: boolean;
  onToggleDefinition: () => void;
  onToggleMechanism: () => void;
  onToggleMaterial: () => void;
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
  materialRevealed,
  hint1Used,
  hint2Used,
  hint3Used,
  hint4Used,
  onToggleDefinition,
  onToggleMechanism,
  onToggleMaterial,
  onRevealLetter,
  onSurrender,
  onCheckAnswer,
  feedbackMessage,
  feedbackType = 'info',
}: ClueActionsProps) {
  if (isSolved) return null;

  // El botón de rendirse solo aparece si se usaron las 4 pistas progresivas
  const canSurrender = hint1Used && hint2Used && hint3Used && hint4Used;

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
        {/* Pistas - LAS 4 SIEMPRE DISPONIBLES DESDE EL INICIO - Grid 2x2 en móvil, fila en desktop */}
        <div className="flex flex-col gap-2 w-full">
          {/* Grid 2x2 para las 4 pistas */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:flex sm:items-center w-full">
            {/* Pista 1: Revelar Definición - AMARILLO */}
            <button
              type="button"
              onClick={onToggleDefinition}
              className={`w-full sm:w-auto min-h-[42px] text-xs px-2.5 sm:px-3 py-2 rounded font-medium transition-all flex items-center justify-center gap-1.5 border active:scale-95 cursor-pointer shadow-2xs ${
                definitionRevealed
                  ? 'bg-amber-100 text-amber-950 border-amber-400 font-semibold'
                  : 'bg-white hover:bg-parchment-100 text-ink-800 border-ink-300'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Definición</span>
            </button>

            {/* Pista 2: Revelar Indicador - ROJO */}
            <button
              type="button"
              onClick={onToggleMechanism}
              className={`w-full sm:w-auto min-h-[42px] text-xs px-2.5 sm:px-3 py-2 rounded font-medium transition-all flex items-center justify-center gap-1.5 border active:scale-95 cursor-pointer shadow-2xs ${
                mechanismRevealed
                  ? 'bg-red-100 text-red-950 border-red-400 font-semibold'
                  : 'bg-white hover:bg-parchment-100 text-ink-800 border-ink-300'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span>Indicador</span>
            </button>

            {/* Pista 3: Revelar Material - AZUL */}
            <button
              type="button"
              onClick={onToggleMaterial}
              className={`w-full sm:w-auto min-h-[42px] text-xs px-2.5 sm:px-3 py-2 rounded font-medium transition-all flex items-center justify-center gap-1.5 border active:scale-95 cursor-pointer shadow-2xs ${
                materialRevealed
                  ? 'bg-blue-100 text-blue-950 border-blue-400 font-semibold'
                  : 'bg-white hover:bg-parchment-100 text-ink-800 border-ink-300'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>Material</span>
            </button>

            {/* Pista 4: Revelar Letra (solo se permite 1 letra por enigma) */}
            <button
              type="button"
              onClick={onRevealLetter}
              disabled={hint4Used}
              className={`w-full sm:w-auto min-h-[42px] text-xs px-2.5 sm:px-3 py-2 border rounded font-medium transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                hint4Used
                  ? 'bg-parchment-100 text-ink-500 border-parchment-300 cursor-not-allowed opacity-75'
                  : 'border-ink-300 hover:border-ink-800 bg-white hover:bg-parchment-100 text-ink-800 active:scale-95 cursor-pointer'
              }`}
            >
              {hint4Used ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-sage flex-shrink-0" />
              ) : (
                <Search className="w-3.5 h-3.5 text-ink-600 flex-shrink-0" />
              )}
              <span>Revelar letra</span>
            </button>
          </div>

          {/* Botón de Rendirse (solo aparece cuando se han usado las 4 pistas) - debajo del grid en móvil */}
          {canSurrender && (
            <div className="w-full sm:w-auto animate-in fade-in duration-300">
              <button
                type="button"
                onClick={onSurrender}
                className="w-full sm:w-auto min-h-[36px] text-xs py-1.5 px-3 text-terracotta hover:text-terracotta-dark hover:underline font-medium transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                title="Rendirse y consultar la solución completa"
              >
                <EyeOff className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Rendirse</span>
              </button>
            </div>
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
