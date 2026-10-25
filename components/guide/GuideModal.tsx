'use client';

import React, { useState } from 'react';
import { X, BookOpen, Lightbulb, ChevronRight, HelpCircle } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Lesson {
  number: number;
  title: string;
  shortDesc: string;
  indicators: string[];
  clue: string;
  letterCount: number;
  answer: string;
  explanation: string[];
  note?: string;
}

const LESSONS: Lesson[] = [
  {
    number: 1,
    title: 'La Doble Definición',
    shortDesc: 'En este tipo de pista la respuesta está definida dos o más veces de manera distinta en la misma frase.',
    indicators: ['Sin indicador de letras: ambas partes son definiciones directas'],
    clue: 'Pido a Dios el precioso metal',
    letterCount: 3,
    answer: 'ORO',
    explanation: [
      '«Pedir a Dios» es orar. En primera persona: cuando pido a Dios, yo oro.',
      '«El precioso metal» es el oro.',
      'Ambas definiciones apuntan de forma independiente a la misma palabra: ORO.'
    ],
  },
  {
    number: 2,
    title: 'El Anagrama',
    shortDesc: 'Un anagrama es una sopa de letras con las que se pueden escribir una o más palabras.',
    indicators: ['«roto»', '«loco»', '«confuso»', '«enloquecido»', '«mezcla»', '«desorden»'],
    clue: 'Pido tu nardo enloquecido. ¡Qué coyuntura!',
    letterCount: 11,
    answer: 'OPORTUNIDAD',
    explanation: [
      'Definición: «Coyuntura» = OPORTUNIDAD.',
      'Materia prima: «Pido tu nardo» (11 letras).',
      'Indicador de anagrama: «enloquecido» (indica desordenar las letras de «pido tu nardo»).',
      'P-I-D-O-T-U-N-A-R-D-O reordenado = OPORTUNIDAD.'
    ],
  },
  {
    number: 3,
    title: 'Palabras Dentro de Palabras',
    shortDesc: 'Una palabra o letra se inserta dentro de otra para formar la respuesta definitiva.',
    indicators: ['«abraza»', '«incluye»', '«acoge»', '«con»', '«incrustaciones»', '«guarda»'],
    clue: 'Sable con cincuenta incrustaciones al dorso',
    letterCount: 7,
    answer: 'ESPALDA',
    explanation: [
      'Definición: «al dorso» = ESPALDA.',
      'Pieza 1: «Sable» = ESPADA.',
      'Pieza 2: «Cincuenta» = L (en números romanos).',
      'Indicador: «incrustaciones» (la L se incrusta dentro de ESPADA).',
      'ESPA[L]DA = ESPALDA.'
    ],
  },
  {
    number: 4,
    title: 'Onomatopeya y Sonido (Homófonos)',
    shortDesc: 'La respuesta suena exactamente como otra palabra de la pista al pronunciarse en voz alta.',
    indicators: ['«suena»', '«oye»', '«oigo»', '«escuché»', '«al teléfono»'],
    clue: 'Escuché que abandona el cuartel general',
    letterCount: 4,
    answer: 'SEDE',
    explanation: [
      'Definición: «cuartel general» = SEDE.',
      'Palabra base: «Abandona» = CEDE (del verbo ceder).',
      'Indicador auditivo: «Escuché que...»',
      'Reglas sudamericanas: la C y la S suenan igual (CEDE suena igual a SEDE).'
    ],
    note: 'En español rige el seseo común en Sudamérica, donde palabras con C y S son homófonas.'
  },
  {
    number: 5,
    title: 'Palabras Escondidas (Ocultas)',
    shortDesc: 'La solución se encuentra literalmente oculta y continua entre dos o más palabras consecutivas.',
    indicators: ['«algo de»', '«parte de»', '«en»', '«se ve en»', '«oculto en»'],
    clue: 'Algo de copla Nerudiana en ese proyecto',
    letterCount: 4,
    answer: 'PLAN',
    explanation: [
      'Definición: «proyecto» = PLAN.',
      'Indicador: «Algo de...» (indica extraer un fragmento del texto).',
      'Texto donde se camufla: «co[pla N]erudiana».',
      'Las letras consecutivas P-L-A-N están escondidas a simple vista.'
    ],
  },
  {
    number: 6,
    title: 'Palabras en Reverso',
    shortDesc: 'La respuesta está escondida en un sinónimo o definición leída en sentido inverso (de derecha a izquierda).',
    indicators: ['«atrás»', '«regreso»', '«de vuelta»', '«en reversa»', '«retorna»'],
    clue: 'Acepta un embiste de regreso',
    letterCount: 5,
    answer: 'ACATA',
    explanation: [
      'Definición: «Acepta» = ACATA.',
      'Palabra base: «un embiste» = ATACA.',
      'Indicador de reverso: «de regreso» (leer en sentido inverso).',
      'A-T-A-C-A al revés = A-C-A-T-A.'
    ],
  },
];

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [selectedLesson, setSelectedLesson] = useState<number>(1);

  if (!isOpen) return null;

  const current = LESSONS.find((l) => l.number === selectedLesson) || LESSONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-parchment-50 border border-ink-300 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-ink-300 bg-parchment-100">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-terracotta" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-ink-900">
                Manual: Cómo Resolver un Críptico
              </h2>
              <span className="text-[11px] text-ink-600 block">
                Basado en la guía de crípticos de <strong>Daniel Mermelstein</strong>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-ink-600 hover:text-ink-900 hover:bg-parchment-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Lecciones */}
        <div className="bg-parchment-200/60 border-b border-parchment-300 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {LESSONS.map((l) => (
            <button
              key={l.number}
              onClick={() => setSelectedLesson(l.number)}
              className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                selectedLesson === l.number
                  ? 'bg-ink-900 text-parchment-50 font-semibold shadow-2xs'
                  : 'bg-white/70 hover:bg-white text-ink-700 border border-ink-300/50'
              }`}
            >
              Lección {l.number}: {l.title}
            </button>
          ))}
        </div>

        {/* Contenido de la Lección */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-sm text-ink-800">
          {/* Título y descripción */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-mono font-bold text-terracotta tracking-wider">
                Lección {current.number}
              </span>
              <span className="text-ink-300">•</span>
              <span className="text-xs text-ink-600 font-medium">Mecanismo Críptico</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">
              {current.title}
            </h3>
            <p className="text-ink-700 leading-relaxed text-sm sm:text-base">
              {current.shortDesc}
            </p>
          </div>

          {/* Indicadores clave */}
          <div className="bg-white/80 border border-ink-200 rounded-lg p-4 space-y-2">
            <span className="text-xs uppercase font-mono font-bold text-ink-700 block tracking-wider">
              Palabras indicadoras habituales:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {current.indicators.map((ind, i) => (
                <span
                  key={i}
                  className="bg-parchment-200 text-ink-900 text-xs px-2.5 py-0.5 rounded border border-parchment-300 font-medium"
                >
                  {ind}
                </span>
              ))}
            </div>
          </div>

          {/* Tarjeta del Ejemplo del Manual */}
          <div className="bg-parchment-100 border border-ink-300 rounded-lg p-5 space-y-4 shadow-2xs">
            <span className="text-xs font-mono uppercase text-ink-600 font-bold tracking-wider block">
              Ejemplo de pista:
            </span>
            <div className="font-serif text-xl sm:text-2xl text-ink-900 font-medium leading-relaxed">
              «{current.clue}» ({current.letterCount})
            </div>

            <div className="pt-3 border-t border-parchment-300 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-ink-900 text-sm">Respuesta:</span>
                <span className="font-mono font-bold tracking-widest text-ink-900 bg-white px-2.5 py-0.5 rounded border border-ink-300 text-sm">
                  {current.answer}
                </span>
              </div>

              <div className="space-y-1.5 pt-1 text-xs sm:text-sm text-ink-800">
                {current.explanation.map((step, idx) => (
                  <p key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </p>
                ))}
              </div>

              {current.note && (
                <p className="text-xs text-ink-600 italic bg-white/50 p-2.5 rounded border border-parchment-300 mt-2">
                  💡 {current.note}
                </p>
              )}
            </div>
          </div>

          {/* Navegación entre lecciones */}
          <div className="flex items-center justify-between pt-2 border-t border-parchment-300 text-xs font-medium">
            <button
              disabled={selectedLesson === 1}
              onClick={() => setSelectedLesson((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 border border-ink-300 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-parchment-200 transition-colors cursor-pointer"
            >
              ← Anterior
            </button>
            <span className="font-mono text-ink-600">
              Lección {current.number} de {LESSONS.length}
            </span>
            <button
              disabled={selectedLesson === LESSONS.length}
              onClick={() => setSelectedLesson((prev) => Math.min(LESSONS.length, prev + 1))}
              className="px-3 py-1.5 border border-ink-300 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-parchment-200 transition-colors cursor-pointer"
            >
              Siguiente →
            </button>
          </div>

          {/* Nota de atribución al autor al final del contenido */}
          <div className="bg-white/80 border border-ink-200 rounded-lg p-3 sm:p-3.5 text-xs text-ink-700 flex items-start gap-2.5 shadow-2xs">
            <BookOpen className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] sm:text-xs leading-relaxed">
              <span className="font-semibold text-ink-900 block">Créditos de la guía:</span>
              <p className="text-ink-600">
                Mecanismos, reglas y ejemplos elaborados a partir de las lecciones y explicaciones de <strong>Daniel Mermelstein</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ink-300 bg-parchment-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-ink-600 italic text-center sm:text-left">
            Guía y mecanismos basados en el trabajo de <strong>Daniel Mermelstein</strong>.
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-ink-900 hover:bg-ink-800 text-parchment-50 text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer flex-shrink-0"
          >
            Entendido, ¡volver al juego!
          </button>
        </div>
      </div>
    </div>
  );
}
