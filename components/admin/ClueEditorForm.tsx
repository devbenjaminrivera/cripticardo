'use client';

import React, { useState } from 'react';
import { Cryptic, Difficulty } from '@/lib/types';
import ClueCard from '@/components/game/ClueCard';
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

  const cleanAnswer = answer.trim().toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ]/g, '');
  const letterCount = cleanAnswer.length;

  const [previewTestLetters, setPreviewTestLetters] = useState<string[]>(
    Array(letterCount || 4).fill('')
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
    status: 'published',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clue.trim() || !cleanAnswer || letterCount < 2) {
      alert('Por favor completa el enunciado y una palabra solución válida.');
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

        <h2 className="font-serif text-xl font-bold text-ink-900">
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
                Solución {letterCount > 0 && `(${letterCount} letras)`}
              </label>
              <input
                type="text"
                required
                value={answer}
                placeholder="AMOR"
                onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm bg-white border border-ink-300 rounded text-ink-900 font-mono font-bold uppercase tracking-widest focus:outline-none focus:border-ink-900"
              />
              <p className="text-[11px] text-ink-600 italic">
                La palabra respuesta. Las casillas se calculan automáticamente.
              </p>
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

            {/* 4. Juego de palabras / Anagrama */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-ink-700 block">
                Juego de palabras / Anagrama
              </label>
              <input
                type="text"
                value={mechanismPart}
                placeholder="Ej: Desorden en la Roma"
                onChange={(e) => setMechanismPart(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-ink-300 rounded text-ink-900 focus:outline-none focus:border-ink-900 font-sans"
              />
              <p className="text-[11px] text-ink-600 italic">
                El fragmento del enunciado que contiene el truco (las letras revueltas, la palabra oculta o la instrucción).
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
              className="px-6 py-2.5 bg-ink-900 hover:bg-ink-800 text-parchment-50 font-serif text-sm font-semibold rounded shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-parchment-300" />
              <span>Guardar y Publicar</span>
            </button>
          </div>
        </form>

        {/* Vista previa en tiempo real a la derecha */}
        <div className="space-y-3 sticky top-24">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-ink-600 font-semibold">
            <Eye className="w-4 h-4 text-terracotta" />
            <span>Vista del jugador (el mecanismo se mantiene en secreto)</span>
          </div>

          <ClueCard cryptic={previewCryptic} showDefinition={Boolean(defPart)} />

          <div className="bg-parchment-50 border border-ink-300 rounded-lg p-5 shadow-xs space-y-3">
            <div className="text-xs uppercase tracking-wider font-semibold text-ink-600">
              Casillas interactivas ({letterCount || 0} letras)
            </div>
            <LetterGrid
              length={letterCount || 4}
              letters={previewTestLetters}
              revealedIndices={[]}
              isSolved={false}
              isShake={false}
              autoFocus={false}
              onChangeLetter={(i, val) => {
                const next = [...previewTestLetters];
                next[i] = val;
                setPreviewTestLetters(next);
              }}
              onEnterPress={() => {}}
            />
            <p className="text-[11px] text-ink-600 italic">
              Puedes probar a tipear para comprobar el largo y cómo lo experimentará el jugador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
