'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX } from 'lucide-react';
import { AUDIO_CONFIG } from '@/lib/audioConfig';

export default function BackgroundAudioPlayer() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // No reproducir música en el panel de administración ni en login
  const isExcludedPage = pathname.startsWith('/admin') || pathname === '/login';

  useEffect(() => {
    if (isExcludedPage) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    // Aplicar volumen y configuración desde lib/audioConfig.ts
    audio.volume = AUDIO_CONFIG.defaultVolume;
    audio.loop = AUDIO_CONFIG.loop;

    const userMuted = localStorage.getItem('cripticardo_audio_muted') === 'true';
    if (userMuted) {
      setIsMuted(true);
      audio.muted = true;
      return;
    }

    // Intentar reproducir automáticamente
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Si el navegador bloquea el autoplay con sonido, se reproduce al primer clic o pulsación de tecla
          const startOnInteraction = () => {
            const currentAudio = audioRef.current;
            if (!currentAudio) return;

            const stillMuted = localStorage.getItem('cripticardo_audio_muted') === 'true';
            if (stillMuted) return;

            currentAudio.play()
              .then(() => {
                setIsPlaying(true);
              })
              .catch(() => {});

            window.removeEventListener('pointerdown', startOnInteraction);
            window.removeEventListener('keydown', startOnInteraction);
          };

          window.addEventListener('pointerdown', startOnInteraction, { once: true });
          window.addEventListener('keydown', startOnInteraction, { once: true });
        });
    }
  }, [isExcludedPage]);

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted || !isPlaying) {
      audio.muted = false;
      audio.play().then(() => {
        setIsPlaying(true);
        setIsMuted(false);
        localStorage.setItem('cripticardo_audio_muted', 'false');
      }).catch(() => {});
    } else {
      audio.muted = true;
      setIsMuted(true);
      localStorage.setItem('cripticardo_audio_muted', 'true');
    }
  };

  if (isExcludedPage) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={AUDIO_CONFIG.src}
        preload="auto"
        loop={AUDIO_CONFIG.loop}
      />

      {/* Botón flotante discreto de control de audio en la esquina inferior */}
      <div className="fixed bottom-3 left-3 z-30">
        <button
          type="button"
          onClick={toggleSound}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shadow-2xs backdrop-blur-xs transition-all active:scale-95 cursor-pointer ${
            isMuted || !isPlaying
              ? 'bg-parchment-100/90 text-ink-500 border-ink-300 hover:text-ink-900 hover:border-ink-500'
              : 'bg-parchment-50/95 text-ink-900 border-ink-400 hover:border-terracotta hover:text-terracotta'
          }`}
          title={isMuted || !isPlaying ? 'Activar música de fondo' : 'Silenciar música de fondo'}
          aria-label={isMuted || !isPlaying ? 'Activar música' : 'Silenciar música'}
        >
          {isMuted || !isPlaying ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" />
              <span className="font-serif italic hidden sm:inline">Música silenciada</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-terracotta flex-shrink-0 animate-pulse" />
              <span className="font-serif italic hidden sm:inline">Música ambiental</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
