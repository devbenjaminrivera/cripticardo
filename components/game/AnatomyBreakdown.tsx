'use client';

import React, { useState, useEffect } from 'react';
import { Cryptic } from '@/lib/types';
import {
  Check,
  Share2,
  Trophy,
  Clock,
  Lightbulb,
  RotateCcw,
  Maximize2,
  X,
  Image as ImageIcon,
} from 'lucide-react';
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
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageHasError, setImageHasError] = useState(false);

  // Soporte para cerrar modal con Escape y bloquear scroll del fondo
  useEffect(() => {
    if (!isZoomed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomed(false);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isZoomed]);

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

  const showImage = Boolean(cryptic.imageUrl && !imageHasError);

  return (
    <div className="mt-6 p-4 sm:p-6 bg-parchment-100 border border-ink-300 rounded-lg shadow-xs space-y-5 animate-in fade-in duration-300">
      {/* Header sutil con badge de estado y stats discretas en esquina */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-parchment-300">
        <div className="flex items-center gap-2">
          {surrendered ? (
            <span className="text-terracotta-dark font-medium text-sm flex items-center gap-1.5">
              <span>📖 Solución revelada</span>
            </span>
          ) : (
            <span className="text-sage-dark font-medium text-sm sm:text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-sage flex-shrink-0" />
              <span>¡Excelente descifrado!</span>
            </span>
          )}
        </div>

        {/* Stats discretas - solo desktop visible, en móvil van al final */}
        {!surrendered && (
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-ink-500 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(timeSpentSeconds)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-600" />
              <span>{hintsUsedCount === 0 ? 'Sin pistas' : `${hintsUsedCount} pistas`}</span>
            </span>
          </div>
        )}
      </div>

      {/* 1. IMAGEN PRIMERO - Centrada y grande, full width */}
      {showImage && (
        <div className="space-y-2">
          <div
            onClick={() => setIsZoomed(true)}
            className="relative group cursor-pointer overflow-hidden rounded-xl border border-ink-300/80 bg-ink-900/5 p-1.5 shadow-2xs hover:shadow-md transition-all mx-auto max-w-full"
            title="Haz clic para ver la imagen ampliada"
            style={{ maxWidth: '100%' }}
          >
            {/* Esqueleto de carga suave */}
            {!imageLoaded && (
              <div className="w-full aspect-[4/3] sm:aspect-[3/2] bg-parchment-200/70 animate-pulse flex flex-col items-center justify-center gap-2 text-ink-400 rounded-lg">
                <ImageIcon className="w-10 h-10 opacity-40" />
                <span className="text-xs font-mono">Cargando ilustración...</span>
              </div>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cryptic.imageUrl}
              alt={cryptic.imageCaption || `Ilustración de ${cryptic.answer}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageHasError(true)}
              className={`w-full h-auto max-h-[420px] sm:max-h-[520px] object-contain rounded-lg transition-all duration-300 group-hover:scale-[1.01] ${
                imageLoaded ? 'block' : 'hidden'
              }`}
              loading="eager"
            />

            {/* Overlay para ampliar */}
            {imageLoaded && (
              <div className="absolute inset-0 bg-ink-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <span className="bg-ink-900/90 text-parchment-50 text-xs sm:text-sm font-semibold px-3 py-1 rounded flex items-center gap-1.5 shadow-xs">
                  <Maximize2 className="w-4 h-4" />
                  <span>Ampliar imagen</span>
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-ink-600 font-serif italic text-center max-w-2xl mx-auto">
            {cryptic.imageCaption ? cryptic.imageCaption : 'Toca la imagen para ampliar'}
          </p>
        </div>
      )}

      {/* 2. EXPLICACIÓN - Full width, destacada */}
      <div className="bg-white/60 border border-parchment-300 rounded-lg p-4 sm:p-5 space-y-2">
        <span className="text-[10px] uppercase font-mono tracking-wider text-ink-600 block">
          Explicación del mecanismo
        </span>
        <p className="text-ink-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
          {cryptic.mechanismText}
        </p>
      </div>

      {/* 3. SOLUCIÓN, DEFINICIÓN Y MATERIAL */}
      <div className="space-y-3">
        {/* Solución - En PC ocupa todo el ancho */}
        <div className="bg-white/80 border border-ink-300 rounded-lg px-4 py-3 sm:px-5 sm:py-3 w-full shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="font-semibold text-ink-900 text-xs sm:text-sm sm:min-w-[70px] flex-shrink-0">
              Solución:
            </span>
            <span className="font-mono font-bold tracking-widest text-ink-900 bg-parchment-100 px-3 py-1.5 rounded border border-ink-300 text-sm sm:text-base inline-flex items-center gap-2 shadow-2xs whitespace-nowrap">
              {cryptic.answer}
              <span className="text-[10px] text-ink-500 font-normal tracking-normal">
                ({cryptic.letterCount} {cryptic.letterCount === 1 ? 'letra' : 'letras'})
              </span>
            </span>
          </div>
        </div>

        {/* Abajo: Definición y Material (ocupando mitad y mitad en PC; apilados en móvil) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Definición directa - AMARILLO */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 sm:px-5 sm:py-3">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-900 block mb-1">
              Definición directa
            </span>
            <p className="text-amber-950 font-semibold text-sm sm:text-base leading-snug break-words">
              «{cryptic.defPart.replace(/^[«"']|[»"']$/g, '')}»
            </p>
          </div>

          {/* Material (si existe) - AZUL */}
          {cryptic.materialPart && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 sm:px-5 sm:py-3">
              <span className="text-[10px] uppercase font-mono tracking-wider text-blue-900 block mb-1">
                Material
              </span>
              <p className="text-blue-950 font-semibold text-sm sm:text-base leading-snug break-words">
                {cryptic.materialPart.includes(',')
                  ? cryptic.materialPart
                      .split(',')
                      .map((m) => `«${m.trim().replace(/^[«"']|[»"']$/g, '')}»`)
                      .join(', ')
                  : `«${cryptic.materialPart.replace(/^[«"']|[»"']$/g, '')}»`}
              </p>
            </div>
          )}

          {/* Indicadores (si existen) - ROJO */}
          {cryptic.mechanismPart && (
            <div className={`bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 ${
              cryptic.materialPart ? 'sm:col-span-2' : ''
            }`}>
              <span className="text-[10px] uppercase font-mono tracking-wider text-red-900 block mb-1">
                Indicador{cryptic.mechanismPart.includes(',') ? 'es' : ''}
              </span>
              <p className="text-red-950 font-semibold text-sm sm:text-base leading-snug break-words">
                {cryptic.mechanismPart.includes(',')
                  ? cryptic.mechanismPart
                      .split(',')
                      .map((m) => `«${m.trim().replace(/^[«"']|[»"']$/g, '')}»`)
                      .join(', ')
                  : `«${cryptic.mechanismPart.replace(/^[«"']|[»"']$/g, '')}»`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. BOTONES DE ACCIÓN AL FINAL - Full width en móvil, centrados en desktop */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-parchment-300/70">
        {onPlayAgain && (
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:w-auto text-sm font-semibold px-5 py-2.5 bg-white hover:bg-parchment-50 text-ink-900 border border-ink-300 hover:border-ink-800 rounded-lg transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] cursor-pointer"
            title="Resolver este enigma de nuevo desde cero"
          >
            <RotateCcw className="w-4 h-4 text-ink-700" />
            <span>Resolver de nuevo</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleShare}
          className="w-full sm:w-auto text-sm font-semibold px-5 py-2.5 bg-ink-900 text-parchment-50 hover:bg-ink-800 rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-sage-light" />
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Compartir resultado</span>
            </>
          )}
        </button>
      </div>

      {/* Stats en móvil (al final) + nota final */}
      <div className="space-y-2 pt-2 border-t border-parchment-300/50">
        {/* Stats móviles - sutiles */}
        {!surrendered && (
          <div className="sm:hidden flex items-center justify-center gap-4 text-[11px] text-ink-500 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeSpentSeconds)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>{hintsUsedCount === 0 ? 'Sin pistas' : `${hintsUsedCount} pistas`}</span>
            </span>
          </div>
        )}

        <p className="text-[10px] text-ink-500 text-center italic">
          Siguiente enigma mañana a las 00:00 (hora de Santiago de Chile).
        </p>
      </div>

      {/* Modal de imagen en pantalla completa (Lightbox optimizado) */}
      {isZoomed && cryptic.imageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-ink-900/80 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] bg-parchment-50 p-3 sm:p-4 rounded-xl shadow-2xl border border-ink-300 flex flex-col items-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra superior del modal segura para móviles */}
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-parchment-300 text-ink-800 gap-2">
              <div className="min-w-0 pr-2">
                <span className="font-sans font-semibold text-xs sm:text-sm text-ink-900 block truncate">
                  {cryptic.imageCaption ? cryptic.imageCaption : `Ilustración: ${cryptic.answer}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-1 rounded text-ink-700 hover:text-ink-950 hover:bg-parchment-200 transition-colors cursor-pointer flex-shrink-0"
                title="Cerrar (Escape)"
                aria-label="Cerrar ampliación"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenedor de imagen ampliada */}
            <div className="relative flex items-center justify-center w-full flex-1 min-h-0 overflow-auto bg-parchment-100/60 rounded-lg p-2 border border-parchment-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cryptic.imageUrl}
                alt={cryptic.imageCaption || `Ilustración de ${cryptic.answer}`}
                className="max-h-[72vh] w-auto max-w-full object-contain rounded select-none shadow-xs"
              />
            </div>

            {/* Pie con nombre de la obra en Inter y atajo de cierre */}
            <div className="pt-2 text-[11px] font-sans text-ink-600 text-center space-y-0.5">
              {cryptic.imageCaption && (
                <p className="font-sans text-xs text-ink-900 font-medium">
                  {cryptic.imageCaption}
                </p>
              )}
              <p className="text-[10px] text-ink-500">
                <span className="hidden sm:inline">
                  Presiona <kbd className="px-1.5 py-0.5 bg-parchment-200 border border-ink-300 rounded font-mono text-[10px]">Esc</kbd> o haz clic fuera para cerrar
                </span>
                <span className="sm:hidden">Toca fuera para cerrar</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}