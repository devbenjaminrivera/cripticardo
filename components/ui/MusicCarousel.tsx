'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { SpotifyIcon } from '@/components/ui/SocialLinks';
import {
  CRIPTICARDO_PLAYLIST,
  DAILY_RECOMMENDATIONS,
  getTodayRecommendation,
  MusicRecommendation,
} from '@/lib/musicData';
import { getChileDateString } from '@/lib/dataService';

// Bloque reutilizable de items musicales para el marquee móvil
function MusicTrackItems({ todayRec }: { todayRec: MusicRecommendation }) {
  return (
    <div className="flex items-center gap-4 flex-shrink-0">
      {/* 1. Recomendación del día */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="inline-flex items-center justify-center text-[#1DB954] flex-shrink-0">
          <SpotifyIcon className="w-3.5 h-3.5" />
        </span>
        <span className="font-sans text-ink-700 font-semibold tracking-tight text-[11px]">
          Recomendación del día:
        </span>
        <a
          href={todayRec.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-serif font-medium text-ink-900 hover:text-[#1DB954] underline decoration-ink-300 hover:decoration-[#1DB954] transition-colors text-xs inline-flex items-center gap-0.5 group"
          title={`Escuchar "${todayRec.title}" de ${todayRec.artist}`}
        >
          <span>{todayRec.title} – {todayRec.artist}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 flex-shrink-0" />
        </a>
      </div>

      <span className="text-ink-400 select-none">•</span>

      {/* 2. Playlist oficial */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="inline-flex items-center justify-center text-[#1DB954] flex-shrink-0">
          <SpotifyIcon className="w-3.5 h-3.5" />
        </span>
        <span className="font-sans text-ink-700 font-semibold tracking-tight text-[11px]">
          Escucha la playlist:
        </span>
        <a
          href={CRIPTICARDO_PLAYLIST.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-serif italic font-semibold text-ink-900 hover:text-[#1DB954] underline decoration-ink-300 hover:decoration-[#1DB954] transition-colors text-xs inline-flex items-center gap-0.5 group"
          title={`Abrir playlist "${CRIPTICARDO_PLAYLIST.title}" en Spotify`}
        >
          <span>{CRIPTICARDO_PLAYLIST.title}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 flex-shrink-0 not-italic" />
        </a>
      </div>

      <span className="text-ink-400 select-none">•</span>
    </div>
  );
}

export default function MusicCarousel() {
  const [todayRec, setTodayRec] = useState<MusicRecommendation>(DAILY_RECOMMENDATIONS[0]);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar recomendación actualizada de la API o localStorage
  const loadActiveRecommendation = useCallback(async () => {
    const todayStr = getChileDateString();

    let localRec: MusicRecommendation | null = null;
    try {
      const local = localStorage.getItem(`cripticardo_rec_${todayStr}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.title && parsed.artist) {
          localRec = parsed;
        }
      }
    } catch {}

    // Consulta API del servidor
    try {
      const res = await fetch(`/api/music/today?date=${todayStr}`);
      if (res.ok) {
        const data: MusicRecommendation = await res.json();
        if (data.title && data.artist) {
          setTodayRec(data);
          return;
        }
      }
    } catch {
      // Mantiene el valor actual si falla la red
    }

    if (localRec) {
      setTodayRec(localRec);
    } else {
      setTodayRec(getTodayRecommendation());
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadActiveRecommendation();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadActiveRecommendation]);

  // Manejo de eventos táctiles en móvil (pausa momentánea al tocar para facilitar el clic en el enlace)
  const handleTouchStart = () => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleTouchEnd = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2500);
  };

  return (
    <div
      className="w-full bg-parchment-200/70 border-t border-ink-200/80 text-ink-800 select-none overflow-hidden"
      role="region"
      aria-label="Recomendaciones y playlist de Spotify"
    >
      {/* ============================================================== */}
      {/* VISTA EN PC (ESCRITORIO): SIN CARRUSEL, JUNTOS Y CENTRADOS     */}
      {/* ============================================================== */}
      <div className="hidden sm:flex max-w-5xl mx-auto px-4 py-1.5 items-center justify-center gap-6 text-xs sm:text-sm">
        {/* Lado A: Playlist oficial */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="inline-flex items-center justify-center text-[#1DB954] flex-shrink-0">
            <SpotifyIcon className="w-4 h-4" />
          </span>
          <span className="font-sans text-ink-700 font-semibold tracking-tight text-xs sm:text-sm">
            Escucha la playlist:
          </span>
          <a
            href={CRIPTICARDO_PLAYLIST.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-serif italic font-semibold text-ink-900 hover:text-[#1DB954] underline decoration-ink-300 hover:decoration-[#1DB954] transition-colors inline-flex items-center gap-1 group text-[13px] sm:text-[14px]"
            title={`Abrir playlist "${CRIPTICARDO_PLAYLIST.title}" en Spotify`}
          >
            <span>{CRIPTICARDO_PLAYLIST.title}</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 flex-shrink-0 not-italic" />
          </a>
        </div>

        {/* Separador central */}
        <span className="text-ink-400 select-none font-serif">•</span>

        {/* Lado B: Recomendación del día */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="inline-flex items-center justify-center text-[#1DB954] flex-shrink-0">
            <SpotifyIcon className="w-4 h-4" />
          </span>
          <span className="font-sans text-ink-700 font-semibold tracking-tight text-xs sm:text-sm">
            Recomendación del día:
          </span>
          <a
            href={todayRec.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-serif font-medium text-ink-900 hover:text-[#1DB954] underline decoration-ink-300 hover:decoration-[#1DB954] transition-colors inline-flex items-center gap-1 group text-[13px] sm:text-[14px]"
            title={`Escuchar "${todayRec.title}" de ${todayRec.artist}`}
          >
            <span className="truncate max-w-[280px]">
              {todayRec.title} – {todayRec.artist}
            </span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 flex-shrink-0" />
          </a>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VISTA EN MÓVIL: MOVIMIENTO CONSTANTE DE DERECHA A IZQ EN BUCLE */}
      {/* ============================================================== */}
      <div
        className="sm:hidden relative w-full overflow-hidden py-1.5 flex items-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Degradados sutiles a los lados para entrada y salida suave */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-parchment-200/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-parchment-200/90 to-transparent z-10 pointer-events-none" />

        {/* Pista de marquesina continua e infinita */}
        <div className="flex w-full overflow-hidden whitespace-nowrap">
          <div className={`animate-marquee-infinite items-center gap-4 pr-4 ${isPaused ? 'paused-marquee' : ''}`}>
            <MusicTrackItems todayRec={todayRec} />
            <MusicTrackItems todayRec={todayRec} />
          </div>
          <div
            className={`animate-marquee-infinite items-center gap-4 pr-4 ${isPaused ? 'paused-marquee' : ''}`}
            aria-hidden="true"
          >
            <MusicTrackItems todayRec={todayRec} />
            <MusicTrackItems todayRec={todayRec} />
          </div>
        </div>
      </div>
    </div>
  );
}
