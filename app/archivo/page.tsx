'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import CrypticGame from '@/components/game/CrypticGame';
import GuideModal from '@/components/guide/GuideModal';
import { fetchAllCrypticsAsync, formatDatePretty } from '@/lib/dataService';
import { getAllSolvedCrypticIds, getPlayerProgress } from '@/lib/playerStorage';
import { Cryptic } from '@/lib/types';
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Filter,
  Trophy,
  BookOpen,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export default function ArchivePage() {
  const [solvedCryptics, setSolvedCryptics] = useState<Cryptic[]>([]);
  const [selectedCryptic, setSelectedCryptic] = useState<Cryptic | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const all = await fetchAllCrypticsAsync();
      const solvedIds = getAllSolvedCrypticIds();
      // Únicamente los crípticos publicados que el usuario ya resolvió
      const resolved = all
        .filter((c) => c.status === 'published' && solvedIds.includes(c.id))
        .sort((a, b) => b.clueNumber - a.clueNumber);

      setSolvedCryptics(resolved);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = solvedCryptics.filter((c) => {
    if (filterDifficulty !== 'all' && c.difficulty !== filterDifficulty) {
      return false;
    }
    return true;
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Fácil':
        return 'bg-sage-light text-sage-dark border-sage/40';
      case 'Difícil':
        return 'bg-terracotta-light text-terracotta-dark border-terracotta/40';
      default:
        return 'bg-parchment-200 text-ink-700 border-ink-300';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenGuide={() => setIsGuideOpen(true)} solvedCount={solvedCryptics.length} />

      <main className="flex-grow max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {selectedCryptic ? (
          <div className="space-y-4 sm:space-y-6">
            <button
              onClick={() => setSelectedCryptic(null)}
              className="text-xs font-semibold flex items-center gap-1.5 text-ink-700 hover:text-ink-900 bg-white hover:bg-parchment-50 px-3 py-1.5 rounded border border-ink-300 transition-colors shadow-2xs active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la lista de resueltos</span>
            </button>

            <CrypticGame cryptic={selectedCryptic} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Encabezado */}
            <div className="border-b border-ink-300 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 flex items-center gap-2">
                    <span>Archivo de Resueltos</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-600 mt-1">
                    Colección de los crípticos que has descifrado con éxito. Puedes repasarlos o resolverlos de nuevo.
                  </p>
                </div>

                {!loading && (
                  <div className="flex items-center gap-1.5 bg-sage-light/60 text-sage-dark px-3 py-1 rounded-full border border-sage/40 text-xs font-semibold font-mono">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>
                      {solvedCryptics.length} {solvedCryptics.length === 1 ? 'enigma resuelto' : 'enigmas resueltos'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-3">
                <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-serif text-sm text-ink-600">Cargando tu archivo de enigmas...</p>
              </div>
            ) : solvedCryptics.length === 0 ? (
              /* Estado vacío si aún no ha resuelto ninguno */
              <div className="bg-parchment-50 border border-ink-300 rounded-xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 mx-auto rounded-full bg-parchment-200 border border-parchment-300 flex items-center justify-center text-ink-700">
                  <Archive className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="font-serif text-xl font-bold text-ink-900">
                    Aún no tienes crípticos en tu archivo
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                    Cada vez que descifres el enigma del día en <strong>Cripticardo</strong>, se guardará automáticamente en este archivo personal para que puedas revisarlo, ver su anatomía o jugarlo de nuevo.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-900 hover:bg-ink-800 text-parchment-50 font-serif text-sm font-semibold rounded-md shadow-xs transition-colors cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-parchment-300" />
                    <span>Ir a resolver el enigma de hoy</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Filtro por dificultad */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-parchment-100 p-2.5 rounded-lg border border-parchment-300">
                  <div className="flex items-center gap-1.5 text-xs text-ink-700 font-medium">
                    <Filter className="w-3.5 h-3.5 text-ink-600" />
                    <span>Dificultad:</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {['all', 'Fácil', 'Medio', 'Difícil'].map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setFilterDifficulty(diff)}
                        className={`text-xs px-2.5 py-1 rounded transition-all cursor-pointer ${
                          filterDifficulty === diff
                            ? 'bg-ink-900 text-parchment-50 font-semibold shadow-2xs'
                            : 'bg-white hover:bg-parchment-50 text-ink-700 border border-ink-300'
                        }`}
                      >
                        {diff === 'all' ? 'Todos' : diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid de Crípticos Resueltos */}
                {filtered.length === 0 ? (
                  <div className="bg-parchment-50 border border-ink-300 rounded-lg p-6 text-center text-xs text-ink-600">
                    No tienes crípticos resueltos con la dificultad seleccionada.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filtered.map((item) => {
                      const progress = getPlayerProgress(item.id);
                      const bestTime = progress?.bestTimeSeconds ?? progress?.timeSpentSeconds;

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedCryptic(item)}
                          className="group bg-parchment-50 hover:bg-white border border-ink-300 hover:border-ink-800 rounded-lg p-4 sm:p-5 cursor-pointer transition-all shadow-xs space-y-3 relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-ink-900 text-base">
                              Juego #{item.clueNumber}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sage-dark flex items-center gap-1 text-[11px] font-semibold bg-sage-light/70 px-2 py-0.5 rounded border border-sage/30">
                                <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                                <span>Resuelto</span>
                              </span>
                              <span
                                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getDifficultyBadge(
                                  item.difficulty
                                )}`}
                              >
                                {item.difficulty}
                              </span>
                            </div>
                          </div>

                          <p className="font-serif text-sm sm:text-base text-ink-900 line-clamp-2 leading-snug">
                            «{item.clue}» ({item.letterCount})
                          </p>

                          <div className="bg-white/80 p-2 rounded border border-parchment-300 text-xs flex items-center justify-between">
                            <span className="text-ink-600">
                              Solución: <strong className="font-mono text-ink-900 tracking-wider">{item.answer}</strong>
                            </span>
                            {typeof bestTime === 'number' && bestTime > 0 && (
                              <span className="flex items-center gap-1 text-[11px] font-mono text-ink-600" title="Mejor tiempo">
                                <Clock className="w-3 h-3 text-ink-500" />
                                <span>{formatTime(bestTime)}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-parchment-200 text-[11px] text-ink-600">
                            <span className="capitalize">{formatDatePretty(item.scheduledDate)}</span>
                            <span className="text-terracotta group-hover:underline font-semibold flex items-center gap-1">
                              <span>Revisar / Jugar</span>
                              <span>→</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer editorial */}
      <footer className="border-t border-ink-300/60 bg-parchment-100/60 py-6 text-center text-xs text-ink-600 mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif">
            Cripticardo — Enigmas verbales diarios creados por <strong>Daniel Fajardo</strong>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-ink-900 underline flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guía de Mecanismos</span>
            </button>
            <Link
              href="/login"
              className="hover:text-ink-900 opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
              title="Acceso panel de creador"
            >
              <KeyRound className="w-3 h-3" />
              <span>Editorial</span>
            </Link>
          </div>
        </div>
      </footer>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
