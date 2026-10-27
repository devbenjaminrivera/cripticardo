'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BookOpen, Archive, ArrowLeft } from 'lucide-react';
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
    <header className="w-full border-b border-ink-300 bg-parchment-100/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        {/* Lado izquierdo: Logo, Título y Frase de Música Antigua */}
        <div className="min-w-0 flex-shrink-0">
          <Link href="/" className="group flex items-center gap-2 sm:gap-2.5">
            {/* Logo de Cripticardo (sin_fondo.png) */}
            <div className="relative flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/sin_fondo.png"
                alt="Logo Cripticardo"
                width={56}
                height={56}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-xs"
                priority
              />
            </div>

            <div className="min-w-0">
              {/* Frase visible en desktop con fuente Garamond */}
              <div className="hidden sm:flex items-center gap-1.5 mb-0.5 font-serif text-xs text-ink-700">
                <span>Crípticos de Música Antigua</span>
                <span className="inline-block w-1 h-1 rounded-full bg-terracotta"></span>
                <span>Por Daniel Fajardo</span>
              </div>

              <div className="inline-flex items-baseline gap-2">
                {/* Título CRIPTICARDO en EB Garamond itálico */}
                <h1 className="font-serif italic text-xl sm:text-2xl md:text-3xl tracking-tight text-ink-900 group-hover:text-terracotta transition-colors whitespace-nowrap">
                  Cripticardo
                </h1>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 bg-ink-900 text-parchment-50 rounded-xs font-sans uppercase font-medium tracking-wider shadow-xs not-italic">
                  Edición Diaria
                </span>
              </div>

              {/* Frase visible en móvil con fuente Garamond */}
              <div className="sm:hidden font-serif text-[11px] text-ink-700 leading-tight">
                Crípticos de Música Antigua
              </div>
            </div>
          </Link>
        </div>

        {/* Lado derecho: Acciones optimizadas para móvil sin botón de ingresar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Botón de Archivo o Volver al Juego de hoy */}
          {!isAdmin && (
            isArchive ? (
              <Link
                href="/"
                className="flex items-center gap-1 text-[11px] sm:text-xs text-ink-800 hover:text-ink-900 font-medium py-1.5 px-2 sm:px-2.5 rounded border border-ink-300 hover:border-ink-800 bg-white hover:bg-parchment-50 transition-colors flex-shrink-0 active:scale-95 shadow-2xs"
                title="Volver al juego de hoy"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-ink-700 flex-shrink-0" />
                <span className="font-semibold">Juego de hoy</span>
              </Link>
            ) : (
              <Link
                href="/archivo"
                className="flex items-center gap-1 text-[11px] sm:text-xs text-ink-800 hover:text-ink-900 font-medium py-1.5 px-2 sm:px-2.5 rounded border border-ink-300 hover:border-ink-800 bg-white hover:bg-parchment-50 transition-colors flex-shrink-0 active:scale-95 shadow-2xs"
                title="Ver archivo de crípticos"
              >
                <Archive className="w-3.5 h-3.5 text-ink-700 flex-shrink-0" />
                <span className="font-semibold">Archivo</span>
              </Link>
            )
          )}

          {/* Botón ¿Cómo jugar? (En móvil solo el icono del libro, en desktop icono + texto) */}
          {onOpenGuide && !isAdmin && (
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 text-xs text-terracotta hover:text-terracotta-dark font-medium py-1.5 px-2 sm:px-2.5 rounded border border-terracotta/30 bg-terracotta-light/25 hover:bg-terracotta-light/40 transition-colors cursor-pointer active:scale-95 flex-shrink-0"
              title="Manual: Cómo resolver un críptico"
              aria-label="¿Cómo jugar?"
            >
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline font-semibold">¿Cómo jugar?</span>
            </button>
          )}

          {/* Si es vista de admin, botón para salir al juego */}
          {isAdmin && (
            <Link
              href="/"
              className="text-xs font-medium text-ink-700 hover:text-ink-900 bg-parchment-200 px-2.5 py-1.5 rounded border border-ink-300 transition-colors flex-shrink-0"
            >
              ← Volver
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
