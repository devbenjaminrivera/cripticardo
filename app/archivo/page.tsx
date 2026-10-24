'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import CrypticGame from '@/components/game/CrypticGame';
import GuideModal from '@/components/guide/GuideModal';
import { fetchAllCrypticsAsync, formatDatePretty } from '@/lib/dataService';
import { getPlayerProgress } from '@/lib/playerStorage';
import { Cryptic } from '@/lib/types';
import { Calendar, CheckCircle2, Filter, ArrowLeft } from 'lucide-react';

export default function ArchivePage() {
  const [cryptics, setCryptics] = useState<Cryptic[]>([]);
  const [selectedCryptic, setSelectedCryptic] = useState<Cryptic | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const all = await fetchAllCrypticsAsync();
      setCryptics(all.filter((c) => c.status === 'published'));
    }
    load();
  }, []);

  const filtered = cryptics.filter((c) => {
    if (filterDifficulty !== 'all' && c.difficulty !== filterDifficulty) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenGuide={() => setIsGuideOpen(true)} />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-6 sm:py-8">
        {selectedCryptic ? (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedCryptic(null)}
              className="text-xs font-semibold flex items-center gap-1.5 text-ink-700 hover:text-ink-900 bg-parchment-200 px-3 py-1.5 rounded border border-ink-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la lista del archivo</span>
            </button>

            <CrypticGame cryptic={selectedCryptic} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-ink-300 pb-4">
              <h2 className="font-serif text-2xl font-bold text-ink-900">
                Archivo de Crípticos
              </h2>
              <p className="text-xs sm:text-sm text-ink-600 mt-1">
                Revive y resuelve los enigmas publicados anteriormente.
              </p>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-ink-600 font-medium">
                <Filter className="w-3.5 h-3.5" />
                <span>Filtrar por dificultad:</span>
              </div>

              <div className="flex items-center gap-1.5">
                {['all', 'Fácil', 'Medio', 'Difícil'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setFilterDifficulty(diff)}
                    className={`text-xs px-3 py-1 rounded border transition-colors ${
                      filterDifficulty === diff
                        ? 'bg-ink-900 text-parchment-50 border-ink-900 font-medium'
                        : 'bg-parchment-100 hover:bg-parchment-200 text-ink-700 border-ink-300'
                    }`}
                  >
                    {diff === 'all' ? 'Todos' : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Crípticos */}
            {filtered.length === 0 ? (
              <div className="bg-parchment-50 border border-ink-300 rounded-lg p-8 text-center space-y-2">
                <p className="font-serif text-lg font-bold text-ink-900">
                  No hay crípticos archivados aún.
                </p>
                <p className="text-xs text-ink-600">
                  A medida que se publiquen pistas en las diferentes fechas, podrás encontrarlas aquí.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((item) => {
                const progress = getPlayerProgress(item.id);
                const isCompleted = progress?.solved;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCryptic(item)}
                    className="group bg-parchment-50 hover:bg-white border border-ink-300 hover:border-ink-800 rounded-lg p-5 cursor-pointer transition-all shadow-xs space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-ink-900">
                        Pista #{item.clueNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <span
                            title="Resuelto"
                            className="text-sage-dark flex items-center gap-1 text-xs font-semibold"
                          >
                            <CheckCircle2 className="w-4 h-4 text-sage" />
                            <span>Hecho</span>
                          </span>
                        )}
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-ink-300 bg-parchment-200 text-ink-700">
                          {item.difficulty}
                        </span>
                      </div>
                    </div>

                    <p className="font-serif text-sm text-ink-800 line-clamp-2">
                      «{item.clue}» ({item.letterCount})
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-parchment-200 text-[11px] text-ink-600">
                      <span className="capitalize">{formatDatePretty(item.scheduledDate)}</span>
                      <span className="text-terracotta group-hover:underline font-medium">
                        Resolver →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}
      </main>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
