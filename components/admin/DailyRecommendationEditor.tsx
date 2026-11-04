'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Check, RefreshCw, ExternalLink, Calendar, RotateCcw } from 'lucide-react';
import { SpotifyIcon } from '@/components/ui/SocialLinks';
import { getChileDateString, formatDatePretty } from '@/lib/dataService';
import {
  MusicRecommendation,
  buildSpotifySearchUrl,
  getDefaultRecommendationForDate,
} from '@/lib/musicData';

interface Props {
  onRecommendationSaved?: () => void;
}

export default function DailyRecommendationEditor({ onRecommendationSaved }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(getChileDateString);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadRecommendation = useCallback(async (dateStr: string) => {
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/music?date=${encodeURIComponent(dateStr)}`);
      if (res.ok) {
        const data: MusicRecommendation = await res.json();
        setTitle(data.title || '');
        setArtist(data.artist || '');
        setSpotifyUrl(data.spotifyUrl || '');
        setIsCustom(Boolean(data.isCustom));
        return;
      }
    } catch (e) {
      console.warn('Error al cargar recomendación:', e);
    }

    // Fallback: revisar en localStorage
    try {
      const local = localStorage.getItem(`cripticardo_rec_${dateStr}`);
      if (local) {
        const parsed: MusicRecommendation = JSON.parse(local);
        setTitle(parsed.title);
        setArtist(parsed.artist);
        setSpotifyUrl(parsed.spotifyUrl);
        setIsCustom(true);
        return;
      }
    } catch {}

    // Fallback: rotación por defecto
    const def = getDefaultRecommendationForDate(dateStr);
    setTitle(def.title);
    setArtist(def.artist);
    setSpotifyUrl(def.spotifyUrl);
    setIsCustom(false);
  }, []);

  useEffect(() => {
    const today = getChileDateString();
    const timer = setTimeout(() => {
      void loadRecommendation(today);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRecommendation]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    loadRecommendation(newDate);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor ingresa tanto el título como el artista.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    const finalUrl = spotifyUrl.trim() || buildSpotifySearchUrl(title, artist);

    const payload = {
      scheduledDate: selectedDate,
      title: title.trim(),
      artist: artist.trim(),
      spotifyUrl: finalUrl,
    };

    try {
      const res = await fetch('/api/admin/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsCustom(true);
        setSpotifyUrl(finalUrl);
        setStatusMessage({
          type: 'success',
          text: `¡Recomendación guardada exitosamente para el ${formatDatePretty(selectedDate)}!`,
        });
        // Sincronizar en localStorage como respaldo local
        localStorage.setItem(`cripticardo_rec_${selectedDate}`, JSON.stringify({ ...payload, isCustom: true }));
        if (onRecommendationSaved) onRecommendationSaved();
        setIsSaving(false);
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al guardar en el servidor');
      }
    } catch {
      // Guardado local de emergencia
      localStorage.setItem(`cripticardo_rec_${selectedDate}`, JSON.stringify({ ...payload, isCustom: true }));
      setIsCustom(true);
      setSpotifyUrl(finalUrl);
      setStatusMessage({
        type: 'info',
        text: `Guardada localmente. Nota: Si aún no ejecutas el SQL en Supabase, recuerda copiar la Sección E de supabase_schema.sql.`,
      });
      if (onRecommendationSaved) onRecommendationSaved();
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('¿Deseas restablecer esta fecha a la recomendación automática predeterminada?')) {
      return;
    }

    setIsSaving(true);
    try {
      await fetch(`/api/admin/music?date=${encodeURIComponent(selectedDate)}`, { method: 'DELETE' });
    } catch {}

    localStorage.removeItem(`cripticardo_rec_${selectedDate}`);
    const def = getDefaultRecommendationForDate(selectedDate);
    setTitle(def.title);
    setArtist(def.artist);
    setSpotifyUrl(def.spotifyUrl);
    setIsCustom(false);
    setStatusMessage({ type: 'success', text: 'Restablecido a la recomendación automática de repertorio.' });
    setIsSaving(false);
    if (onRecommendationSaved) onRecommendationSaved();
  };

  const previewUrl = spotifyUrl.trim() || (title && artist ? buildSpotifySearchUrl(title, artist) : '');

  return (
    <div className="bg-parchment-50 border border-ink-300 rounded-lg p-4 sm:p-5 shadow-xs transition-all">
      {/* Encabezado colapsable */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/30">
            <SpotifyIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-ink-900">
                Recomendación Musical del Día
              </h3>
              {isCustom ? (
                <span className="text-[10px] font-mono uppercase bg-sage text-parchment-50 px-2 py-0.5 rounded font-bold">
                  Personalizada
                </span>
              ) : (
                <span className="text-[10px] font-mono uppercase bg-parchment-200 text-ink-600 px-2 py-0.5 rounded">
                  Automática
                </span>
              )}
            </div>
            <p className="text-xs text-ink-600 mt-0.5">
              Aparece en el carrusel superior para todos los lectores de Cripticardo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold px-3 py-1.5 rounded border border-ink-300 hover:border-ink-800 bg-white text-ink-800 hover:bg-parchment-100 transition-colors cursor-pointer self-start sm:self-center"
        >
          {isOpen ? 'Cerrar editor' : 'Editar recomendación'}
        </button>
      </div>

      {/* Vista previa compacta si está cerrado */}
      {!isOpen && (
        <div className="mt-3 pt-3 border-t border-ink-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-serif italic text-ink-600">Recomendación activa:</span>
            <span className="font-semibold text-ink-900 truncate">
              {title} – {artist}
            </span>
          </div>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1DB954] hover:underline inline-flex items-center gap-1 font-medium text-[11px]"
            >
              <span>Probar en Spotify</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Formulario abierto */}
      {isOpen && (
        <form onSubmit={handleSave} className="mt-4 pt-4 border-t border-ink-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Selector de Fecha */}
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-ink-500" />
                <span>Fecha de emisión</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-ink-300 rounded focus:outline-none focus:border-ink-800"
                required
              />
              <span className="text-[10px] text-ink-500 block mt-0.5 capitalize">
                {formatDatePretty(selectedDate)}
              </span>
            </div>

            {/* Título de la Canción */}
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">
                Título de la canción / obra *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Flow, My Tears"
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-ink-300 rounded focus:outline-none focus:border-ink-800"
                required
              />
            </div>

            {/* Artista */}
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">
                Artista / Compositor *
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Ej: John Dowland"
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-ink-300 rounded focus:outline-none focus:border-ink-800"
                required
              />
            </div>
          </div>

          {/* Enlace a Spotify */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-ink-700">
                Enlace directo a Spotify (Opcional)
              </label>
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#1DB954] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>Abrir enlace</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="url"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/... (o deja en blanco para autogenerar búsqueda)"
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-ink-300 rounded focus:outline-none focus:border-ink-800 font-mono text-[11px]"
            />
            <p className="text-[10px] text-ink-500 mt-1">
              Si dejas este campo vacío, Cripticardo generará automáticamente un enlace directo a la búsqueda de esa canción en Spotify.
            </p>
          </div>

          {/* Mensajes de estado */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded text-xs border ${
                statusMessage.type === 'success'
                  ? 'bg-sage-light/40 border-sage/40 text-sage-dark'
                  : statusMessage.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-parchment-200 border-ink-300 text-ink-800'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {isCustom && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  disabled={isSaving}
                  className="text-xs text-ink-600 hover:text-terracotta inline-flex items-center gap-1 transition-colors cursor-pointer"
                  title="Volver a la rotación de obras del repertorio"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restablecer a automática</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-xs text-ink-700 hover:bg-parchment-200 rounded border border-ink-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 bg-ink-900 hover:bg-ink-800 text-parchment-50 text-xs font-semibold rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-sage-light" />
                    <span>Guardar recomendación</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
