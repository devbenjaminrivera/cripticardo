'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import CrypticGame from '@/components/game/CrypticGame';
import GuideModal from '@/components/guide/GuideModal';
import { fetchDailyCrypticAsync } from '@/lib/dataService';
import { Cryptic } from '@/lib/types';
import { BookOpen } from 'lucide-react';

export default function HomePage() {
  const [cryptic, setCryptic] = useState<Cryptic | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const daily = await fetchDailyCrypticAsync();
      setCryptic(daily);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenGuide={() => setIsGuideOpen(true)} />

      <main className="flex-grow max-w-3xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
            <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-serif text-sm text-ink-600">Preparando el enigma de hoy...</p>
          </div>
        ) : cryptic ? (
          <div className="space-y-6">
            <CrypticGame cryptic={cryptic} />
          </div>
        ) : (
          <div className="bg-parchment-50 border border-ink-300 rounded-lg p-8 text-center space-y-3">
            <p className="font-serif text-xl font-bold text-ink-900">
              No hay un críptico programado para hoy todavía.
            </p>
            <p className="text-xs text-ink-600">
              Pronto se publicará una nueva edición.
            </p>
          </div>
        )}
      </main>

      {/* Footer editorial */}
      <footer className="border-t border-ink-300/60 bg-parchment-100/60 py-6 text-center text-xs text-ink-600">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif">
            Cripticardo — Enigmas verbales diarios creados por <strong>Daniel Fajardo</strong>.
          </p>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="hover:text-ink-900 underline flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guía de Mecanismos</span>
          </button>
        </div>
      </footer>

      {/* Modal de instrucciones */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
