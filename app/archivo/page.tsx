'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import CrypticGame from '@/components/game/CrypticGame';
import GuideModal from '@/components/guide/GuideModal';
import { fetchAllCrypticsAsync, formatDatePretty, getTodayDateString } from '@/lib/dataService';
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
  HelpCircle,
  PlayCircle,
} from 'lucide-react';
import { SocialButtons } from '@/components/ui/SocialLinks';

export default function ArchivePage() {
  const [cryptics, setCryptics] = useState<Cryptic[]>([]);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [selectedCryptic, setSelectedCryptic] = useState<Cryptic | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'solved' | 'pending'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [todayStr, setTodayStr] = useState<string>('');

  const loadData = async () => {
    const today = getTodayDateString();
    setTodayStr(today);
    const all = await fetchAllCrypticsAsync();
    const solved = getAllSolvedCrypticIds();

    // Crípticos publicados desde la fecha actual hacia atrás (excluyendo fechas futuras)
    const available = all
      .filter((c) => c.status === 'published' && c.scheduledDate <= today)
      .sort((a, b) => b.clueNumber - a.clueNumber);

    setCryptics(available);
    setSolvedIds(solved);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBackToList = () => {
    setSelectedCryptic(null);
    // Recargar estado de resueltos por si acaba de resolver el que estaba jugando
    setSolvedIds(getAllSolvedCrypticIds());
  };

  const solvedCount = cryptics.filter((c) => solvedIds.includes(c.id)).length;
  const pendingCount = cryptics.length - solvedCount;

  const filtered = cryptics.filter((c) => {
    const isSolved = solvedIds.includes(c.id);

    if (filterStatus === 'solved' && !isSolved) return false;
    if (filterStatus === 'pending' && isSolved) return false;

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
      case 'Medio':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Difícil':
        return 'bg-terracotta-light text-terracotta-dark border-terracotta/40';
      default:
        return 'bg-parchment-200 text-ink-700 border-ink-300';
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative font-sans">
      {/* Grabado histórico de laúd y tablatura como fondo */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-multiply"
        style={{ backgroundImage: "url('/bg-main.png')" }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenGuide={() => setIsGuideOpen(true)} solvedCount={solvedCount} />

      <main className="flex-grow max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {selectedCryptic ? (
          <div className="space-y-4 sm:space-y-6">
            <button
              onClick={handleBackToList}
              className="text-xs font-semibold flex items-center gap-1.5 text-ink-700 hover:text-ink-900 bg-white hover:bg-parchment-50 px-3.5 py-2 rounded border border-ink-300 transition-colors shadow-2xs active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Archivo</span>
            </button>

            <CrypticGame cryptic={selectedCryptic} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Encabezado */}
            <div className="border-b border-ink-300 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 flex items-center gap-2">
                    <span>Archivo de Crípticos</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-800 mt-1">
                    Colección de los enigmas publicados hasta hoy. Descifra los que te faltan o repasa tus soluciones anteriores.
                  </p>
                </div>

                {!loading && cryptics.length > 0 && (
                  <div className="flex items-center gap-2 bg-sage-light/60 text-sage-dark px-3 py-1.5 rounded-full border border-sage/40 text-xs font-semibold font-mono shadow-2xs">
                    <Trophy className="w-4 h-4 text-sage flex-shrink-0" />
                    <span>
                      {solvedCount} de {cryptics.length} resueltos
                    </span>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-3">
                <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-ink-600">Cargando el archivo de enigmas...</p>
              </div>
            ) : cryptics.length === 0 ? (
              <div className="bg-parchment-50 border border-ink-300 rounded-xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 mx-auto rounded-full bg-parchment-200 border border-parchment-300 flex items-center justify-center text-ink-700">
                  <Archive className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-ink-900">
                    Aún no hay crípticos publicados
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                    Pronto se publicará el primer enigma verbal de música antigua.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-900 hover:bg-ink-800 text-parchment-50 text-sm font-semibold rounded-md shadow-xs transition-colors cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-parchment-300" />
                    <span>Ir a la portada</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Barra de Filtros: Estado y Dificultad */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-parchment-100 p-3 rounded-lg border border-parchment-300">
                  {/* Filtro por estado: Todos / Resueltos / Pendientes */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-ink-600 font-medium mr-1">Estado:</span>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('all')}
                      className={`text-xs px-2.5 py-1 rounded transition-all cursor-pointer font-medium ${
                        filterStatus === 'all'
                          ? 'bg-ink-900 text-parchment-50 font-semibold shadow-2xs'
                          : 'bg-white hover:bg-parchment-50 text-ink-700 border border-ink-300'
                      }`}
                    >
                      Todos ({cryptics.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('solved')}
                      className={`text-xs px-2.5 py-1 rounded transition-all cursor-pointer font-medium flex items-center gap-1 ${
                        filterStatus === 'solved'
                          ? 'bg-sage text-parchment-50 font-semibold shadow-2xs'
                          : 'bg-white hover:bg-parchment-50 text-ink-700 border border-ink-300'
                      }`}
                    >
                      <span>✓ Resueltos</span>
                      <span className="text-[10px] opacity-80">({solvedCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('pending')}
                      className={`text-xs px-2.5 py-1 rounded transition-all cursor-pointer font-medium flex items-center gap-1 ${
                        filterStatus === 'pending'
                          ? 'bg-terracotta text-parchment-50 font-semibold shadow-2xs'
                          : 'bg-white hover:bg-parchment-50 text-ink-700 border border-ink-300'
                      }`}
                    >
                      <span>⏳ Pendientes</span>
                      <span className="text-[10px] opacity-80">({pendingCount})</span>
                    </button>
                  </div>

                  {/* Filtro por dificultad */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-ink-600 font-medium mr-1">
                      <Filter className="w-3.5 h-3.5 text-ink-600" />
                      <span>Dificultad:</span>
                    </div>

                    {['all', 'Fácil', 'Medio', 'Difícil'].map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setFilterDifficulty(diff)}
                        className={`text-xs px-2 py-1 rounded transition-all cursor-pointer ${
                          filterDifficulty === diff
                            ? 'bg-ink-900 text-parchment-50 font-semibold shadow-2xs'
                            : 'bg-white hover:bg-parchment-50 text-ink-700 border border-ink-300'
                        }`}
                      >
                        {diff === 'all' ? 'Todas' : diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid de Crípticos */}
                {filtered.length === 0 ? (
                  <div className="bg-parchment-50 border border-ink-300 rounded-lg p-8 text-center text-xs text-ink-600 space-y-2">
                    <p className="font-medium text-sm text-ink-800">
                      No hay enigmas con los filtros seleccionados.
                    </p>
                    <p>
                      Prueba seleccionando otro estado o dificultad para ver más crípticos.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filtered.map((item) => {
                      const isSolved = solvedIds.includes(item.id);
                      const isToday = item.scheduledDate === todayStr;
                      const progress = getPlayerProgress(item.id);
                      const bestTime = progress?.bestTimeSeconds ?? progress?.timeSpentSeconds;

                      // Enumeración de letras (si es frase: 6, 7)
                      const words = item.answer.trim().split(/\s+/).filter(Boolean);
                      const countLabel =
                        words.length > 1
                          ? `${item.letterCount} letras: ${words.map((w) => w.length).join(', ')}`
                          : `${item.letterCount} letras`;

                      // Formatear fecha limpia con primera letra mayúscula (ej: Martes, 27 de octubre de 2026)
                      const rawDate = formatDatePretty(item.scheduledDate);
                      const displayDate = rawDate ? rawDate.charAt(0).toUpperCase() + rawDate.slice(1) : '';

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedCryptic(item)}
                          className={`group bg-parchment-50 hover:bg-white border rounded-lg p-4 sm:p-5 cursor-pointer transition-all shadow-xs flex flex-col justify-between relative overflow-hidden ${
                            isToday
                              ? 'border-terracotta/70 ring-1 ring-terracotta/20 hover:border-terracotta'
                              : isSolved
                              ? 'border-ink-300 hover:border-ink-800'
                              : 'border-parchment-300 hover:border-ink-700'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Fila superior: Fecha a la izquierda con HOY e Insignias organizadas */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-ink-900 text-sm sm:text-base leading-snug tracking-tight">
                                  {displayDate}
                                </span>
                                {isToday && (
                                  <span className="text-[10px] font-mono font-bold uppercase bg-terracotta text-parchment-50 px-2 py-0.5 rounded shadow-2xs flex-shrink-0">
                                    HOY
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                {isSolved ? (
                                  <span className="text-sage-dark flex items-center gap-1 text-[11px] font-semibold bg-sage-light/70 px-2 py-0.5 rounded border border-sage/30">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                                    <span>Resuelto</span>
                                  </span>
                                ) : (
                                  <span className="text-amber-900 flex items-center gap-1 text-[11px] font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Pendiente</span>
                                  </span>
                                )}

                                <span
                                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getDifficultyBadge(
                                    item.difficulty
                                  )}`}
                                >
                                  {item.difficulty}
                                </span>
                              </div>
                            </div>

                            {/* Enunciado textual */}
                            <p className="font-serif text-sm sm:text-base text-ink-900 line-clamp-2 leading-snug">
                              «{item.clue}» ({countLabel})
                            </p>

                            {/* Caja de Solución: Descubierta si ya se resolvió, Oculta sin spoilers si está pendiente */}
                            <div className="bg-white/80 p-2.5 rounded border border-parchment-300 text-xs flex items-center justify-between">
                              {isSolved ? (
                                <>
                                  <span className="text-ink-600">
                                    Solución:{' '}
                                    <strong className="font-mono text-ink-900 tracking-wider">
                                      {item.answer}
                                    </strong>
                                  </span>
                                  {typeof bestTime === 'number' && bestTime > 0 && (
                                    <span
                                      className="flex items-center gap-1 text-[11px] font-mono text-ink-600"
                                      title="Mejor tiempo de resolución"
                                    >
                                      <Clock className="w-3 h-3 text-ink-500" />
                                      <span>{formatTime(bestTime)}</span>
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-ink-500 italic flex items-center gap-1.5">
                                  <HelpCircle className="w-3.5 h-3.5 text-terracotta flex-shrink-0" />
                                  <span>Solución por descifrar ({item.letterCount} letras)</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Fila inferior: Número correlativo y Acción de juego anclados al fondo */}
                          <div className="flex items-center justify-end pt-2.5 mt-3 border-t border-parchment-200 text-[11px] text-ink-600">
                

                            {isSolved ? (
                              <span className="text-ink-700 group-hover:text-ink-900 font-semibold flex items-center gap-1">
                                <span>Revisar / Jugar de nuevo</span>
                                <span>→</span>
                              </span>
                            ) : (
                              <span className="text-terracotta group-hover:underline font-bold flex items-center gap-1">
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>¡Jugar enigma!</span>
                                <span>→</span>
                              </span>
                            )}
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
      <footer className="border-t border-ink-300/60 bg-parchment-100/80 py-5 sm:py-6 text-xs text-ink-600 mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <p className="leading-snug">
              Crípticos de música antigua por <strong>Daniel Fajardo</strong>
            </p>
            <SocialButtons compact={true} />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-ink-900 underline flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guía de Mecanismos</span>
            </button>
          </div>
        </div>
      </footer>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      </div>
    </div>
  );
}
