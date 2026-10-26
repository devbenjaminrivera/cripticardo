'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import CrypticGame from '@/components/game/CrypticGame';
import GuideModal from '@/components/guide/GuideModal';
import { fetchDailyCrypticAsync } from '@/lib/dataService';
import { Cryptic } from '@/lib/types';
import Link from 'next/link';
import { BookOpen, KeyRound, Archive } from 'lucide-react';
import { SocialButtons } from '@/components/ui/SocialLinks';

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
    <div className="min-h-screen flex flex-col relative">
      {/* Grabado histórico de laúd y tablatura como fondo */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-multiply"
        style={{ backgroundImage: "url('/bg-main.png')" }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenGuide={() => setIsGuideOpen(true)} />

        <main className="flex-grow max-w-3xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
            <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-ink-600">Preparando el enigma de hoy...</p>
          </div>
        ) : cryptic ? (
          <div className="space-y-6">
            <CrypticGame cryptic={cryptic} />
          </div>
        ) : (
          <div className="bg-parchment-50 border border-ink-300 rounded-lg p-8 text-center space-y-3">
            <p className="text-xl font-bold text-ink-900">
              No hay un críptico programado para hoy todavía.
            </p>
            <p className="text-xs text-ink-600">
              Pronto se publicará una nueva edición.
            </p>
          </div>
        )}
      </main>

      {/* Footer editorial con redes de Daniel Fajardo */}
      <footer className="border-t border-ink-300/60 bg-parchment-100/80 py-5 sm:py-6 text-xs text-ink-600">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <p className="leading-snug">
              Crípticos de música antigua por <strong>Daniel Fajardo</strong>
            </p>
            <SocialButtons compact={true} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
            <Link
              href="/archivo"
              className="hover:text-ink-900 underline flex items-center gap-1 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Mi Archivo</span>
            </Link>
            <span className="text-ink-300 hidden sm:inline">•</span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-ink-900 underline flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guía de Mecanismos</span>
            </button>
            <span className="text-ink-300 hidden sm:inline">•</span>
            <Link
              href="/login"
              className="hover:text-ink-900 opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
              title="Acceso panel de creador"
            >
              <KeyRound className="w-3 h-3" />
              <span>Ingresar</span>
            </Link>
          </div>
        </div>
      </footer>
      </div>

      {/* Modal de instrucciones */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
