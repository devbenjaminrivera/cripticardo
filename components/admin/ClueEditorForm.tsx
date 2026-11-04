'use client';

import React, { useState, useRef } from 'react';
import { Cryptic, Difficulty } from '@/lib/types';
import ClueCard, { findSubstringIntervals } from '@/components/game/ClueCard';
import LetterGrid from '@/components/game/LetterGrid';
import AnatomyBreakdown from '@/components/game/AnatomyBreakdown';
import { getNextAvailableDate, formatDatePretty } from '@/lib/dataService';
import {
  Save,
  Eye,
  ArrowLeft,
  Calendar,
  ImageIcon,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface ClueEditorFormProps {
  initialData?: Cryptic | null;
  onSave: (data: Omit<Cryptic, 'id' | 'clueNumber'> & { id?: string }) => void;
  onCancel: () => void;
}

const DIFFICULTIES: Difficulty[] = ['Fácil', 'Medio', 'Difícil'];

export default function ClueEditorForm({
  initialData,
  onSave,
  onCancel,
}: ClueEditorFormProps) {
  // Fecha asignada automáticamente al siguiente día libre en Chile si es nuevo
  const [scheduledDate] = useState<string>(
    initialData?.scheduledDate || getNextAvailableDate()
  );

  const [clue, setClue] = useState(initialData?.clue || '');
  const [answer, setAnswer] = useState(initialData?.answer || '');
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initialData?.difficulty || 'Medio'
  );
  const [defPart, setDefPart] = useState(initialData?.defPart || '');
  const [mechanismPart, setMechanismPart] = useState(
    initialData?.mechanismPart || ''
  );
  const [mechanismText, setMechanismText] = useState(
    initialData?.mechanismText || ''
  );
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || '');
  const [imageCaption, setImageCaption] = useState<string>(initialData?.imageCaption || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [previewTab, setPreviewTab] = useState<'game' | 'resolution'>('game');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpiar respuesta: conserva letras y espacios individuales
  const cleanAnswer = answer
    .trim()
    .toUpperCase()
    .replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '')
    .replace(/\s+/g, ' ');

  // Palabras individuales y desglose de longitudes
  const answerWords = cleanAnswer ? cleanAnswer.split(/\s+/).filter(Boolean) : [];
  const wordLengths = answerWords.map((w) => w.length);
  const letterCount = cleanAnswer.replace(/\s/g, '').length;

  // Indicadores separados por coma
  const detectedIndicators = mechanismPart
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  // Comprobar si los indicadores coinciden con el enunciado de forma tolerante
  const missingIndicators = detectedIndicators.filter(
    (ind) => findSubstringIntervals(clue, ind).length === 0
  );

  const [previewTestLetters, setPreviewTestLetters] = useState<string[]>([]);
  const targetLettersLen = letterCount || 4;
  const currentTestLetters = Array.from(
    { length: targetLettersLen },
    (_, i) => previewTestLetters[i] || ''
  );

  // Previsualización en tiempo real
  const previewCryptic: Cryptic = {
    id: initialData?.id || 'preview',
    clueNumber: initialData?.clueNumber || 1,
    scheduledDate: scheduledDate,
    clue: clue || 'Escribe el enunciado de la pista...',
    answer: cleanAnswer || 'SOLUCION',
    letterCount: letterCount || 8,
    difficulty,
    defPart: defPart || '',
    mechanismPart: mechanismPart || '',
    mechanismText: mechanismText || 'Explicación del juego de palabras...',
    imageUrl: imageUrl.trim() || undefined,
    imageCaption: imageCaption.trim() || undefined,
    status: 'published',
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona un archivo de imagen (JPG, PNG, WebP o GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen debe pesar menos de 5 MB.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al subir la imagen');
      }

      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        // Cambiar automáticamente la vista previa a la tarjeta de resolución para verla de inmediato
        setPreviewTab('resolution');
      }
    } catch (err: unknown) {
      console.warn('Fallo al subir por API, usando fallback de lectura local:', err);
      // Fallback a Base64 si el backend o bucket no está listo
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
          setPreviewTab('resolution');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clue.trim() || !cleanAnswer || letterCount < 2) {
      alert('Por favor completa el enunciado y una palabra o frase solución válida.');
      return;
    }

    onSave({
      id: initialData?.id,
      scheduledDate,
      clue: clue.trim(),
      answer: cleanAnswer,
      letterCount,
      difficulty,
      defPart: defPart.trim(),
      mechanismPart: mechanismPart.trim(),
      mechanismText: mechanismText.trim(),
      imageUrl: imageUrl.trim() || undefined,
      imageCaption: imageCaption.trim() || undefined,
      status: 'published',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ink-300">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-semibold flex items-center gap-1.5 text-ink-700 hover:text-ink-900 bg-parchment-200 px-3 py-1.5 rounded border border-ink-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Panel</span>
        </button>

        <h2 className="text-xl font-bold text-ink-900">
          {initialData ? `Editar Juego #${initialData.clueNumber}` : 'Nuevo Críptico'}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Formulario a la izquierda */}
        <form
          onSubmit={handleSubmit}
          className="bg-parchment-50 border border-ink-300 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-xs"
        >
          {/* Aviso de Fecha Automática */}
          <div className="bg-parchment-200/70 border border-parchment-300 rounded p-3 text-xs text-ink-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-terracotta flex-shrink-0" />
            <div>
              <span className="font-semibold block">
                Fecha programada: {formatDatePretty(scheduledDate)}
              </span>
              <span className="text-ink-600 text-[11px]">
                Asignada automáticamente para el próximo día libre (hora de Chile).
              </span>
            </div>
          </div>

          {/* 1. Enunciado */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-ink-700 block">
              Enunciado de la pista
            </label>
            <textarea
              required
              rows={3}
              value={clue}
              placeholder="Ej: Desorden en la Roma da apego apasionado"
              onChange={(e) => setClue(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-ink-300 rounded text-ink-900 focus:outline-none focus:border-ink-900 font-serif"
            />
            <p className="text-[11px] text-ink-600 italic">
              La frase completa tal como la leerá el jugador. Debe contener tanto la definición como el juego de palabras.
            </p>
          </div>

          {/* 2. Solución y Dificultad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-ink-700 block">
                Solución{' '}
                {letterCount > 0 && (
                  <span className="font-mono font-bold text-ink-900 lowercase">
                    ({letterCount} {letterCount === 1 ? 'letra' : 'letras'}
                    {wordLengths.length > 1 ? `: ${wordLengths.join(', ')}` : ''})
                  </span>
                )}
              </label>
              <input
                type="text"
                required
                value={answer}
                placeholder="Ej: AMOR o SANTA MARIA"
                onChange={(e) => {
                  const val = e.target.value
                    .toUpperCase()
                    .replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '')
                    .replace(/\s{2,}/g, ' ');
                  setAnswer(val);
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-ink-300 rounded text-ink-900 font-mono font-bold uppercase tracking-widest focus:outline-none focus:border-ink-900"
              />
              {answerWords.length > 1 ? (
                <p className="text-[11px] text-sage-dark font-medium flex items-center gap-1">
                  <span>✨ Frase de {answerWords.length} palabras detectada ({wordLengths.join(' y ')} letras). Se agruparán en bloques separados.</span>
                </p>
              ) : (
                <p className="text-[11px] text-ink-600 italic">
                  La palabra o frase respuesta (usa la barra espaciadora para separar palabras).
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-ink-700 block">
                Dificultad
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 text-sm bg-white border border-ink-300 rounded text-ink-900 focus:outline-none focus:border-ink-900 font-sans"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-ink-600 italic">
                Nivel estimado del enigma.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-parchment-300 space-y-4">
            {/* 3. Definición */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-ink-700 block">
                Definición
              </label>
              <input
                type="text"
                value={defPart}
                placeholder="Ej: apego apasionado"
                onChange={(e) => setDefPart(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-ink-300 rounded text-ink-900 focus:outline-none focus:border-ink-900 font-sans"
              />
              <p className="text-[11px] text-ink-600 italic">
                El fragmento textual exacto del enunciado que significa la palabra (se resaltará cuando el usuario use la Pista 1).
              </p>
            </div>

            {/* 4. Indicador */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider font-semibold text-ink-700 block">
                  Indicador {detectedIndicators.length > 1 && `(${detectedIndicators.length} detectados)`}
                </label>
                {detectedIndicators.length > 1 && (
                  <span className="text-[10px] text-orange-950 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded font-medium">
                    Múltiples indicadores por coma
                  </span>
                )}
              </div>
              <input
                type="text"
                value={mechanismPart}
                placeholder="Ej: al revés, roto (separa con comas si hay más de uno)"
                onChange={(e) => setMechanismPart(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-ink-300 rounded text-ink-900 focus:outline-none focus:border-ink-900 font-sans"
              />

              {/* Badges de indicadores detectados */}
              {detectedIndicators.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-ink-600 font-medium">
                    {detectedIndicators.length > 1 ? 'Indicadores detectados:' : 'Indicador detectado:'}
                  </span>
                  {detectedIndicators.map((ind, i) => {
                    const inClue = findSubstringIntervals(clue, ind).length > 0;
                    return (
                      <span
                        key={i}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          inClue
                            ? 'bg-orange-100 text-orange-950 border-orange-300'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                        title={
                          inClue
                            ? 'Encontrado en el enunciado (se resaltará en naranja)'
                            : 'Atención: no coincide textualmente con el enunciado'
                        }
                      >
                        «{ind}» {inClue ? '✓' : '⚠️'}
                      </span>
                    );
                  })}
                </div>
              )}

              {missingIndicators.length > 0 && clue.trim().length > 0 && (
                <p className="text-[11px] text-amber-800 font-medium bg-amber-50/80 border border-amber-200 p-2 rounded">
                  ⚠️ Atención: {missingIndicators.map((m) => `«${m}»`).join(', ')}{' '}
                  {missingIndicators.length === 1
                    ? 'no aparece textualmente en el enunciado'
                    : 'no aparecen textualmente en el enunciado'}. Comprueba que las palabras coincidan.
                </p>
              )}

              <p className="text-[11px] text-ink-600 italic">
                Separa con coma (,) si hay más de un indicador. Cada uno se resaltará individualmente en naranja al pedir la Pista 2.
              </p>
            </div>

            {/* 5. Explicación de la resolución */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-ink-700 block">
                Explicación de la resolución
              </label>
              <textarea
                rows={3}
                value={mechanismText}
                placeholder="Ej: 'Desorden en' es el indicador de mover las letras de ROMA, formando AMOR."
                onChange={(e) => setMechanismText(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-ink-300 rounded text-ink-900 focus:outline-none focus:border-ink-900 font-sans text-xs sm:text-sm"
              />
              <p className="text-[11px] text-ink-600 italic">
                Desglose paso a paso que se le revelará al jugador cuando resuelva el enigma o se rinda.
              </p>
            </div>

            {/* 6. Imagen ilustrativa del críptico (NUEVO) */}
            <div className="space-y-2 pt-2 border-t border-parchment-300">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider font-semibold text-ink-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-terracotta" />
                  <span>Imagen ilustrativa</span>
                  <span className="text-[11px] font-normal text-ink-500 lowercase">(opcional)</span>
                </label>
                {!imageUrl && (
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-terracotta hover:underline font-medium cursor-pointer"
                  >
                    {showUrlInput ? 'Subir archivo de imagen' : 'O pegar enlace URL'}
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />

              {imageUrl ? (
                <div className="space-y-3">
                  <div className="bg-white border border-ink-300 rounded-lg p-3 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-16 h-16 rounded border border-ink-200 overflow-hidden bg-parchment-100 flex-shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt="Vista previa de imagen"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-xs font-semibold text-ink-900 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                          <span>Imagen asignada al críptico</span>
                        </span>
                        <span className="text-[11px] text-ink-600 block truncate">
                          Se adapta al formato de la ilustración en la tarjeta de resolución.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-medium px-2.5 py-1.5 border border-ink-300 hover:border-ink-800 rounded bg-parchment-50 hover:bg-parchment-100 text-ink-800 transition-colors cursor-pointer"
                      >
                        Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setCustomUrl('');
                          setImageCaption('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1.5 border border-ink-300 hover:border-terracotta rounded text-terracotta hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Campo para editar el nombre de la obra y autor en pantalla completa */}
                  <div className="bg-parchment-50 border border-ink-300 rounded-lg p-3 space-y-1.5 shadow-2xs">
                    <label className="text-xs font-semibold text-ink-800 block">
                      Nombre de la obra y autor (para pantalla completa)
                    </label>
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="Ej: Joven tocando el cornetto — Bernardo Strozzi (c. 1635)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-ink-300 rounded text-ink-900 focus:outline-none focus:border-ink-900 font-serif"
                    />
                    <p className="text-[11px] text-ink-600">
                      Reemplaza el texto automático <em>«Ilustración: {cleanAnswer || 'RESPUESTA'}»</em> en la barra del visor en pantalla completa.
                    </p>
                  </div>
                </div>
              ) : showUrlInput ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customUrl}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-ink-300 rounded text-ink-900 focus:outline-none focus:border-ink-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customUrl.trim()) {
                          setImageUrl(customUrl.trim());
                          setPreviewTab('resolution');
                        }
                      }}
                      className="px-3 py-2 bg-ink-900 text-parchment-50 text-xs font-semibold rounded hover:bg-ink-800 transition-colors cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                  <p className="text-[11px] text-ink-600 italic">
                    Pega una URL directa a una imagen alojada en la web.
                  </p>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                    isUploading
                      ? 'border-terracotta bg-parchment-100/50'
                      : 'border-ink-300 hover:border-ink-700 bg-white/60 hover:bg-white'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Loader2 className="w-6 h-6 text-terracotta animate-spin" />
                      <span className="text-xs font-semibold text-ink-800">
                        Subiendo y optimizando imagen...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-5 h-5 text-ink-600" />
                      <span className="text-xs font-semibold text-ink-900">
                        Haz clic aquí o arrastra una imagen para subir
                      </span>
                      <span className="text-[11px] text-ink-500">
                        PNG, JPG, WebP o GIF (máximo 5 MB)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <p className="text-[11px] text-terracotta-dark font-medium bg-red-50 p-2 rounded border border-red-200">
                  {uploadError}
                </p>
              )}

              <p className="text-[11px] text-ink-600 italic">
                Aparecerá en la parte derecha de la tarjeta de resolución (abajo de pistas y junto a la solución y pistas anatómicas).
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-ink-300 hover:border-ink-800 rounded text-xs font-semibold text-ink-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-ink-900 hover:bg-ink-800 text-parchment-50 text-sm font-semibold rounded shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-parchment-300" />
              <span>Guardar y Publicar</span>
            </button>
          </div>
        </form>

        {/* Vista previa en tiempo real a la derecha */}
        <div className="space-y-3 sticky top-24">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-ink-600 font-semibold">
              <Eye className="w-4 h-4 text-terracotta" />
              <span>Vista previa en vivo</span>
            </div>

            {/* Selector de pestañas de previsualización */}
            <div className="flex items-center gap-1 bg-parchment-200 p-0.5 rounded border border-ink-300 text-xs">
              <button
                type="button"
                onClick={() => setPreviewTab('game')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer font-medium ${
                  previewTab === 'game'
                    ? 'bg-ink-900 text-parchment-50 shadow-2xs font-semibold'
                    : 'text-ink-700 hover:text-ink-900'
                }`}
              >
                1. Juego
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('resolution')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer font-medium flex items-center gap-1 ${
                  previewTab === 'resolution'
                    ? 'bg-ink-900 text-parchment-50 shadow-2xs font-semibold'
                    : 'text-ink-700 hover:text-ink-900'
                }`}
              >
                <span>2. Resolución</span>
                {imageUrl && <span className="text-[10px]">📷</span>}
              </button>
            </div>
          </div>

          {previewTab === 'game' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[11px]">
                {Boolean(defPart) && (
                  <span className="bg-sage-light text-sage-dark px-2 py-0.5 rounded border border-sage/40 font-medium">
                    Definición (verde)
                  </span>
                )}
                {Boolean(mechanismPart) && (
                  <span className="bg-orange-100 text-orange-950 px-2 py-0.5 rounded border border-orange-300 font-medium">
                    Indicador{detectedIndicators.length > 1 ? 'es' : ''} (naranja)
                  </span>
                )}
              </div>

              <ClueCard
                cryptic={previewCryptic}
                showDefinition={Boolean(defPart)}
                showMechanism={Boolean(mechanismPart)}
              />

              <div className="bg-parchment-50 border border-ink-300 rounded-lg p-5 shadow-xs space-y-3">
                <div className="text-xs uppercase tracking-wider font-semibold text-ink-600">
                  Casillas interactivas ({letterCount || 0} letras
                  {wordLengths.length > 1 ? `: ${wordLengths.join(', ')}` : ''})
                </div>
                <LetterGrid
                  length={targetLettersLen}
                  letters={currentTestLetters}
                  revealedIndices={[]}
                  isSolved={false}
                  isShake={false}
                  autoFocus={false}
                  wordLengths={wordLengths.length > 1 ? wordLengths : undefined}
                  onChangeLetter={(i, val) => {
                    const next = [...currentTestLetters];
                    next[i] = val;
                    setPreviewTestLetters(next);
                  }}
                  onEnterPress={() => {}}
                />
                <p className="text-[11px] text-ink-600 italic">
                  {wordLengths.length > 1
                    ? 'Las palabras se agrupan automáticamente con espacio visual.'
                    : 'Puedes probar a tipear para comprobar el largo y cómo lo experimentará el jugador.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-ink-600 italic">
                Así verá el jugador la tarjeta tras resolver correctamente el críptico:
              </p>
              <AnatomyBreakdown
                cryptic={previewCryptic}
                hintsUsedCount={0}
                timeSpentSeconds={142}
                surrendered={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
