'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Calendar, HelpCircle, KeyRound, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenGuide?: () => void;
  solvedCount?: number;
}

export default function Navbar({ onOpenGuide, solvedCount }: NavbarProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="border-b border-ink-300 bg-parchment-100/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      {/* Top Banner / Masthead */}
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-semibold text-ink-600 block">
                Cuaderno de Enigmas Verbales
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta"></span>
              <span className="text-[10px] font-mono font-medium text-ink-700">Por Daniel Fajardo</span>
            </div>
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 group-hover:text-terracotta transition-colors">
                CRIPTICARDO
              </h1>
              <span className="text-[10px] px-2 py-0.5 bg-ink-900 text-parchment-50 rounded-xs font-sans uppercase font-medium tracking-wider shadow-xs">
                Edición Diaria
              </span>
            </Link>
          </div>
        </div>

        {/* Right side status & admin access */}
        <div className="flex items-center gap-3 text-sm">
          {typeof solvedCount === 'number' && (
            <div className="flex items-center gap-2 bg-parchment-200/80 px-3 py-1 rounded border border-parchment-300">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-700">Completados:</span>
              <span className="font-mono font-bold text-ink-900">{solvedCount}</span>
            </div>
          )}

          {isAdmin ? (
            <Link
              href="/"
              className="text-xs font-medium text-ink-700 hover:text-ink-900 bg-parchment-200 px-3 py-1.5 rounded border border-ink-300 transition-colors"
            >
              ← Volver al Juego
            </Link>
          ) : (
            <Link
              href="/login"
              title="Ingresar"
              className="text-xs flex items-center gap-1.5 text-ink-600 hover:text-ink-900 py-1 px-2 rounded hover:bg-parchment-200 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-ink-600" />
              <span>Ingresar</span>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      {!isAdmin && (
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between border-t border-ink-300/40 text-xs sm:text-sm font-medium">
          <div className="flex gap-1 sm:gap-4 overflow-x-auto">
            <Link
              href="/"
              className={`px-3 py-2 border-b-2 font-semibold whitespace-nowrap transition-colors ${
                pathname === '/'
                  ? 'border-ink-900 text-ink-900'
                  : 'border-transparent text-ink-600 hover:text-ink-900'
              }`}
            >
              Juego de Hoy
            </Link>

            <Link
              href="/archivo"
              className={`px-3 py-2 border-b-2 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                pathname === '/archivo'
                  ? 'border-ink-900 text-ink-900'
                  : 'border-transparent text-ink-600 hover:text-ink-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Archivo</span>
            </Link>
          </div>

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 text-xs text-terracotta hover:text-terracotta-dark font-medium py-1.5 px-2 rounded hover:bg-terracotta-light/30 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>¿Cómo se juega?</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
