'use client';

import React, { useState } from 'react';
import { Cryptic } from '@/lib/types';
import { Check, Copy, Sparkles, Trophy } from 'lucide-react';
import { generateShareText } from '@/lib/playerStorage';

interface AnatomyBreakdownProps {
  cryptic: Cryptic;
  hintsUsedCount: number;
  timeSpentSeconds: number;
  surrendered: boolean;
}

export default function AnatomyBreakdown({
  cryptic,
  hintsUsedCount,
  timeSpentSeconds,
  surrendered,
}: AnatomyBreakdownProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = generateShareText(
      cryptic.clueNumber,
      cryptic.scheduledDate,
      hintsUsedCount,
      timeSpentSeconds,
      cryptic.letterCount,
      surrendered
    );

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
    <div className="mt-8 p-6 bg-parchment-100 border border-ink-300 rounded-lg shadow-xs space-y-5 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-parchment-300">
        <div className="flex items-center gap-2">
          {surrendered ? (
            <span className="text-terracotta-dark font-serif font-bold text-base flex items-center gap-1.5">
              <span>📖 Solución revelada:</span>
            </span>
          ) : (
            <span className="text-sage-dark font-serif font-bold text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-sage" />
              <span>¡Excelente descifrado!</span>
            </span>
          )}
        </div>

        <button
          onClick={handleShare}
          className="text-xs font-semibold px-3 py-1.5 bg-ink-900 text-parchment-50 hover:bg-ink-800 rounded transition-all flex items-center gap-1.5 shadow-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-sage-light" />
              <span>¡Copiado al portapapeles!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Compartir resultado</span>
            </>
          )}
        </button>
      </div>

      {/* Anatomy Content */}
      <div className="space-y-3 text-sm text-ink-800">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-serif font-semibold text-ink-900 min-w-32">Solución:</span>
          <span className="font-mono font-bold tracking-widest text-ink-900 bg-white px-3 py-1 rounded border border-ink-300 text-base">
            {cryptic.answer}
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-serif font-semibold text-ink-900 min-w-32">Definición directa:</span>
          <span className="text-sage-dark font-semibold bg-sage-light/60 px-2 py-0.5 rounded border border-sage/30">
            «{cryptic.defPart}»
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-serif font-semibold text-ink-900 min-w-32">
            Explicación de la resolución:
          </span>
          <span className="text-ink-700 bg-white/60 p-2.5 rounded border border-parchment-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            {cryptic.mechanismText}
          </span>
        </div>
      </div>

      <div className="pt-2 text-xs text-ink-600 flex items-center justify-between flex-wrap gap-2">
        <span className="italic">
          Nuevo críptico diario a las 00:00 (hora de Santiago de Chile).
        </span>
      </div>
    </div>
  );
}
