'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, KeyRound, Archive, ArrowLeft } from 'lucide-react';
import { getSolvedCount } from '@/lib/playerStorage';

interface NavbarProps {
  onOpenGuide?: () => void;
  solvedCount?: number;
}

export default function Navbar({ onOpenGuide, solvedCount: propSolvedCount }: NavbarProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isArchive = pathname === '/archivo';
  const [solvedCount, setSolvedCount] = useState<number | undefined>(propSolvedCount);

  useEffect(() => {
    if (typeof propSolvedCount === 'number') {
      setSolvedCount(propSolvedCount);
    } else {
      setSolvedCount(getSolvedCount());
    }
  }, [propSolvedCount]);

  return (
    <header className="w-full border-b border-ink-300 bg-parchment-100/95 backdrop-blur-md sticky top-0 z-30 shadow-xs overflow-hidden">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Lado izquierdo: Título y Autor */}
        <div className="min-w-0 flex-1">
          <div className="hidden sm:flex items-center gap-2 mb-0.5">
            <span className="text-[10px] tracking-widest uppercase font-semibold text-ink-600 block">
              Cuaderno de Enigmas Verbales
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta"></span>
            <span className="text-[10px] font-mono font-medium text-ink-700">
              Por Daniel Fajardo
            </span>
          </div>

          <Link href="/" className="group inline-flex items-baseline gap-2 max-w-full">
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-ink-900 group-hover:text-terracotta transition-colors truncate">
              CRIPTICARDO
            </h1>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 bg-ink-900 text-parchment-50 rounded-xs font-sans uppercase font-medium tracking-wider shadow-xs">
              Edición Diaria
            </span>
          </Link>

          {/* Subtítulo visible en móvil para que el autor esté presente sin ocupar espacio lateral */}
          <div className="sm:hidden text-[10px] font-mono text-ink-600 leading-tight">
            Por Daniel Fajardo
          </div>
        </div>

        {/* Lado derecho: Acciones compactas y seguras que nunca desbordan la pantalla */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Botón de Archivo o Volver al Juego de hoy */}
          {!isAdmin && (
            isArchive ? (
              <Link
                href="/"
                className="flex items-center gap-1 text-xs text-ink-700 hover:text-ink-900 font-medium py-1.5 px-2 sm:px-2.5 rounded border border-ink-300 hover:border-ink-700 bg-white/70 hover:bg-white transition-colors flex-shrink-0 active:scale-95 shadow-2xs"
                title="Volver al juego de hoy"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-ink-700 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs">Juego de hoy</span>
              </Link>
            ) : (
              <Link
                href="/archivo"
                className="flex items-center gap-1 text-xs text-ink-700 hover:text-ink-900 font-medium py-1.5 px-2 sm:px-2.5 rounded border border-ink-300 hover:border-ink-700 bg-white/70 hover:bg-white transition-colors flex-shrink-0 active:scale-95 shadow-2xs"
                title="Ver archivo de crípticos resueltos"
              >
                <Archive className="w-3.5 h-3.5 text-ink-700 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs">Archivo</span>
                {typeof solvedCount === 'number' && solvedCount > 0 && (
                  <span className="bg-sage-dark text-parchment-50 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                    {solvedCount}
                  </span>
                )}
              </Link>
            )
          )}

          {onOpenGuide && !isAdmin && (
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1 text-xs text-terracotta hover:text-terracotta-dark font-medium py-1.5 px-2 sm:px-2.5 rounded border border-terracotta/30 bg-terracotta-light/25 hover:bg-terracotta-light/40 transition-colors cursor-pointer active:scale-95 flex-shrink-0"
              title="Manual: Cómo resolver un críptico"
            >
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs">¿Cómo jugar?</span>
            </button>
          )}

          {isAdmin ? (
            <Link
              href="/"
              className="text-xs font-medium text-ink-700 hover:text-ink-900 bg-parchment-200 px-2.5 py-1.5 rounded border border-ink-300 transition-colors flex-shrink-0"
            >
              ← Volver
            </Link>
          ) : (
            <Link
              href="/login"
              title="Ingresar al panel"
              className="text-xs flex items-center gap-1 text-ink-700 hover:text-ink-900 py-1.5 px-2 sm:px-2.5 rounded border border-ink-300 hover:border-ink-700 bg-white/70 hover:bg-white transition-colors font-medium flex-shrink-0 active:scale-95 shadow-2xs"
            >
              <KeyRound className="w-3.5 h-3.5 text-ink-600 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs">Ingresar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
