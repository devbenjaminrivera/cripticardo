'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cryptic } from '@/lib/types';
import { Check, Copy, Share2, Trophy, Clock, Lightbulb, RotateCcw, Archive } from 'lucide-react';
import { generateShareText } from '@/lib/playerStorage';

interface AnatomyBreakdownProps {
  cryptic: Cryptic;
  hintsUsedCount: number;
  timeSpentSeconds: number;
  surrendered: boolean;
  onPlayAgain?: () => void;
}

export default function AnatomyBreakdown({
  cryptic,
  hintsUsedCount,
  timeSpentSeconds,
  surrendered,
  onPlayAgain,
}: AnatomyBreakdownProps) {
  const [copied, setCopied] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleShare = async () => {
    const text = generateShareText(
      cryptic.clueNumber,
      cryptic.scheduledDate,
      hintsUsedCount,
      timeSpentSeconds,
      cryptic.letterCount,
      surrendered
    );

    // Si el navegador soporta compartir nativo (móviles iOS y Android)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Cripticardo Juego #${cryptic.clueNumber}`,
          text: text,
        });
        return;
      } catch (e) {
        // Si el usuario canceló el share sheet, ignoramos silenciosamente
        if ((e as Error).name !== 'AbortError') {
          console.warn('Error con Web Share API, usando portapapeles:', e);
        } else {
          return;
        }
      }
    }

    // Fallback: Copiar al portapapeles
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="mt-6 p-4 sm:p-6 bg-parchment-100 border border-ink-300 rounded-lg shadow-xs space-y-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-parchment-300">
        <div className="flex items-center gap-2">
          {surrendered ? (
            <span className="text-terracotta-dark font-serif font-bold text-base flex items-center gap-1.5">
              <span>📖 Solución revelada:</span>
            </span>
          ) : (
            <span className="text-sage-dark font-serif font-bold text-base sm:text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-sage flex-shrink-0" />
              <span>¡Excelente descifrado!</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onPlayAgain && (
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex-1 sm:flex-initial text-xs font-semibold px-3.5 py-2 bg-white hover:bg-parchment-50 text-ink-900 border border-ink-300 hover:border-ink-800 rounded transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              title="Resolver este enigma de nuevo desde cero"
            >
              <RotateCcw className="w-3.5 h-3.5 text-ink-700" />
              <span>Resolver de nuevo</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="flex-1 sm:flex-initial text-xs font-semibold px-4 py-2 bg-ink-900 text-parchment-50 hover:bg-ink-800 rounded transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-sage-light" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resumen de estadísticas del jugador */}
      {!surrendered && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/80 p-2.5 rounded border border-ink-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-ink-600" />
            <div>
              <span className="text-ink-600 block text-[10px] uppercase font-mono">Tiempo</span>
              <span className="font-mono font-bold text-ink-900">{formatTime(timeSpentSeconds)}</span>
            </div>
          </div>
          <div className="bg-white/80 p-2.5 rounded border border-ink-200 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-ink-600 block text-[10px] uppercase font-mono">Pistas</span>
              <span className="font-mono font-bold text-ink-900">
                {hintsUsedCount === 0 ? 'Sin pistas' : `${hintsUsedCount} usadas`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contenido anatómico */}
      <div className="space-y-3 text-sm text-ink-800">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="font-serif font-semibold text-ink-900 sm:min-w-32 text-xs sm:text-sm">
            Solución:
          </span>
          <span className="font-mono font-bold tracking-widest text-ink-900 bg-white px-3 py-1 rounded border border-ink-300 text-base inline-block w-fit">
            {cryptic.answer}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="font-serif font-semibold text-ink-900 sm:min-w-32 text-xs sm:text-sm">
            Definición directa:
          </span>
          <span className="text-sage-dark font-semibold bg-sage-light/60 px-2 py-0.5 rounded border border-sage/30 text-xs sm:text-sm inline-block w-fit">
            «{cryptic.defPart}»
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className="font-serif font-semibold text-ink-900 sm:min-w-32 text-xs sm:text-sm">
            Explicación:
          </span>
          <span className="text-ink-700 bg-white/70 p-3 rounded border border-parchment-300 text-xs sm:text-sm leading-relaxed">
            {cryptic.mechanismText}
          </span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-ink-600 border-t border-parchment-300/80">
        <span className="italic text-center sm:text-left">
          Siguiente enigma mañana a las 00:00 (hora de Santiago de Chile).
        </span>
        <Link
          href="/archivo"
          className="text-terracotta hover:text-terracotta-dark font-medium underline inline-flex items-center gap-1"
        >
          <Archive className="w-3 h-3" />
          <span>Ver mis crípticos resueltos →</span>
        </Link>
      </div>
    </div>
  );
}
