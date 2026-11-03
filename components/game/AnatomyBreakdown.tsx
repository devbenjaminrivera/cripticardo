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
    <div className="mt-6 p-4 sm:p-6 bg-parchment-100 border border-ink-300 rounded-lg shadow-xs space-y-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-parchment-300">
        <div className="flex items-center gap-2">
          {surrendered ? (
            <span className="text-terracotta-dark font-bold text-base flex items-center gap-1.5">
              <span>📖 Solución revelada:</span>
            </span>
          ) : (
            <span className="text-sage-dark font-bold text-base sm:text-lg flex items-center gap-2">
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
      <div className="space-y-3.5 text-sm text-ink-800">
        {showImage ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Columna Izquierda: Solución, Definición directa, Indicador */}
            <div className="grid grid-cols-[auto_1fr] sm:block sm:space-y-3 gap-3 items-start">
              {/* Solución (Izquierda en móvil / Fila 1 en desktop) */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="font-semibold text-ink-900 sm:min-w-32 text-xs sm:text-sm">
                  Solución:
                </span>
                <span className="font-mono font-bold tracking-widest text-ink-900 bg-white px-2.5 sm:px-3 py-1 rounded border border-ink-300 text-sm sm:text-base inline-block w-fit shadow-2xs">
                  {cryptic.answer}
                </span>
              </div>

              {/* Definición e Indicador (Derecha de la solución en móvil / Filas 2 y 3 en desktop) */}
              <div className="space-y-2 sm:space-y-3 border-l border-parchment-300/80 pl-3 sm:border-l-0 sm:pl-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="font-semibold text-ink-900 sm:min-w-32 text-xs sm:text-sm">
                    <span className="sm:hidden">Definición:</span>
                    <span className="hidden sm:inline">Definición directa:</span>
                  </span>
                  <span className="text-sage-dark font-semibold bg-sage-light/60 px-2 py-0.5 rounded border border-sage/30 text-xs sm:text-sm inline-block w-fit">
                    «{cryptic.defPart}»
                  </span>
                </div>

                {cryptic.mechanismPart && (
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                    <span className="font-semibold text-ink-900 sm:min-w-32 text-xs sm:text-sm">
                      Indicador{cryptic.mechanismPart.includes(',') ? 'es' : ''}:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cryptic.mechanismPart
                        .split(',')
                        .map((m) => m.trim())
                        .filter(Boolean)
                        .map((part, idx) => (
                          <span
                            key={idx}
                            className="text-orange-950 font-semibold bg-orange-100 px-2 py-0.5 rounded border border-orange-300 text-xs sm:text-sm inline-block"
                          >
                            «{part}»
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha (Mitad derecha de la tarjeta): Ilustración centrada */}
            <div className="flex flex-col items-center justify-center w-full">
              <div
                onClick={() => setIsZoomed(true)}
                className="relative group cursor-pointer overflow-hidden rounded-lg border border-ink-300/80 bg-ink-900/5 p-1 shadow-2xs hover:shadow-md transition-all inline-flex items-center justify-center max-h-56 sm:max-h-64"
                title="Haz clic para ver la imagen ampliada"
              >
                {/* Esqueleto de carga suave */}
                {!imageLoaded && (
                  <div className="w-36 h-48 sm:w-44 sm:h-56 bg-parchment-200/70 animate-pulse flex flex-col items-center justify-center gap-1.5 text-ink-400 rounded">
                    <ImageIcon className="w-6 h-6 opacity-40" />
                    <span className="text-[10px] font-mono">Cargando...</span>
                  </div>
                )}

                <img
                  src={cryptic.imageUrl}
                  alt={cryptic.imageCaption || `Ilustración de ${cryptic.answer}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageHasError(true)}
                  className={`max-h-52 sm:max-h-60 w-auto max-w-[220px] sm:max-w-[270px] object-contain rounded transition-all duration-300 group-hover:scale-[1.02] ${
                    imageLoaded ? 'block' : 'hidden'
                  }`}
                  loading="lazy"
                />

                {/* Overlay para ampliar */}
                {imageLoaded && (
                  <div className="absolute inset-0 bg-ink-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                    <span className="bg-ink-900/90 text-parchment-50 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                      <Maximize2 className="w-3 h-3" />
                      <span>Ampliar</span>
                    </span>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-ink-600 font-serif italic mt-1 text-center max-w-[240px] truncate">
                {cryptic.imageCaption ? cryptic.imageCaption : 'Toca la imagen para ampliar'}
              </span>
            </div>
          </div>
        ) : (
          /* Disposición si no tiene imagen: en móvil Solución a la izquierda y Definición + Indicadores a la derecha */
          <div className="grid grid-cols-[auto_1fr] sm:block sm:space-y-3 gap-3 items-start">
            {/* Solución (Izquierda en móvil / Fila 1 en desktop) */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className="font-semibold text-ink-900 sm:min-w-32 text-xs sm:text-sm">
                Solución:
              </span>
              <span className="font-mono font-bold tracking-widest text-ink-900 bg-white px-2.5 sm:px-3 py-1 rounded border border-ink-300 text-sm sm:text-base inline-block w-fit shadow-2xs">
                {cryptic.answer}
              </span>
            </div>

            {/* Definición e Indicador (Derecha de la solución en móvil / Filas 2 y 3 en desktop) */}
            <div className="space-y-2 sm:space-y-3 border-l border-parchment-300/80 pl-3 sm:border-l-0 sm:pl-0">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="font-semibold text-ink-900 sm:min-w-32 text-xs sm:text-sm">
                  <span className="sm:hidden">Definición:</span>
                  <span className="hidden sm:inline">Definición directa:</span>
                </span>
                <span className="text-sage-dark font-semibold bg-sage-light/60 px-2 py-0.5 rounded border border-sage/30 text-xs sm:text-sm inline-block w-fit">
                  «{cryptic.defPart}»
                </span>
              </div>

              {cryptic.mechanismPart && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="font-semibold text-ink-900 sm:min-w-32 text-xs sm:text-sm">
                    Indicador{cryptic.mechanismPart.includes(',') ? 'es' : ''}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cryptic.mechanismPart
                      .split(',')
                      .map((m) => m.trim())
                      .filter(Boolean)
                      .map((part, idx) => (
                        <span
                          key={idx}
                          className="text-orange-950 font-semibold bg-orange-100 px-2 py-0.5 rounded border border-orange-300 text-xs sm:text-sm inline-block"
                        >
                          «{part}»
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Explicación (a todo el ancho por debajo) */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 pt-2 border-t border-parchment-300/70">
          <span className="font-semibold text-ink-900 sm:min-w-32 text-xs sm:text-sm">
            Explicación:
          </span>
          <span className="text-ink-700 bg-white/70 p-3 rounded border border-parchment-300 text-xs sm:text-sm leading-relaxed flex-1">
            {cryptic.mechanismText}
          </span>
        </div>
      </div>

      <div className="pt-1 text-[11px] text-ink-600 text-center sm:text-left italic border-t border-parchment-300/80">
        Siguiente enigma mañana a las 00:00 (hora de Santiago de Chile).
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
            className="relative max-w-3xl w-full max-h-[92vh] bg-parchment-50 p-3 sm:p-4 rounded-xl shadow-2xl border border-ink-300 flex flex-col items-center overflow-hidden"
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
