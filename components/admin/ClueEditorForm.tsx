'use client';

import React, { useState, useEffect } from 'react';
import { Cryptic, Difficulty } from '@/lib/types';
import ClueCard, { findSubstringIntervals } from '@/components/game/ClueCard';
import LetterGrid from '@/components/game/LetterGrid';
import { getNextAvailableDate, formatDatePretty } from '@/lib/dataService';
import { Save, Eye, ArrowLeft, Calendar, HelpCircle } from 'lucide-react';

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

  const [previewTestLetters, setPreviewTestLetters] = useState<string[]>(
    Array(letterCount || 4).fill('')
  );

  // Ajustar el tamaño del grid de prueba al cambiar la longitud de la respuesta
  useEffect(() => {
    setPreviewTestLetters((prev) => {
      const targetLen = letterCount || 4;
      if (prev.length === targetLen) return prev;
      const next = Array(targetLen).fill('');
      for (let i = 0; i < Math.min(prev.length, targetLen); i++) {
        next[i] = prev[i];
      }
      return next;
    });
  }, [letterCount]);

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
    status: 'published',
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
      status: 'published',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ink-300">
        <button
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
              <span>Vista previa interactiva</span>
            </div>

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
              length={letterCount || 4}
              letters={previewTestLetters}
              revealedIndices={[]}
              isSolved={false}
              isShake={false}
              autoFocus={false}
              wordLengths={wordLengths.length > 1 ? wordLengths : undefined}
              onChangeLetter={(i, val) => {
                const next = [...previewTestLetters];
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
      </div>
    </div>
  );
}
