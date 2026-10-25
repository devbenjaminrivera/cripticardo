'use client';

import React, { useRef, useEffect } from 'react';

interface LetterGridProps {
  length: number;
  letters: string[];
  revealedIndices: number[];
  isSolved: boolean;
  isShake: boolean;
  onChangeLetter: (index: number, val: string) => void;
  onEnterPress: () => void;
  onFocusNext?: (index: number) => void;
  autoFocus?: boolean;
  wordLengths?: number[];
}

export default function LetterGrid({
  length,
  letters,
  revealedIndices,
  isSolved,
  isShake,
  onChangeLetter,
  onEnterPress,
  autoFocus = false,
  wordLengths,
}: LetterGridProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasFocusedRef = useRef(false);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
    // Autofocus al cargar o al reiniciar el intento si autoFocus es true y no está resuelto
    if (!isSolved) {
      if (autoFocus && !hasFocusedRef.current) {
        hasFocusedRef.current = true;
        const firstEmpty = letters.findIndex((l) => !l);
        const targetIndex = firstEmpty !== -1 ? firstEmpty : 0;
        inputRefs.current[targetIndex]?.focus();
      }
    } else {
      hasFocusedRef.current = false;
    }
  }, [length, autoFocus, isSolved, letters]);

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSolved) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (letters[index]) {
        // Si la celda actual tiene letra, borrarla
        onChangeLetter(index, '');
      } else if (index > 0) {
        // Retroceder a la anterior y borrarla
        onChangeLetter(index - 1, '');
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < length - 1) inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onEnterPress();
    }
  };

  const handleInput = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSolved) return;
    const value = e.target.value.toUpperCase();
    const lastChar = value.slice(-1);

    // Solo admitir letras válidas
    if (/^[A-ZÁÉÍÓÚÑ]$/.test(lastChar)) {
      onChangeLetter(index, lastChar);
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (value === '') {
      onChangeLetter(index, '');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isSolved) return;
    const pasted = e.clipboardData
      .getData('text')
      .trim()
      .toUpperCase()
      .replace(/[^A-ZÁÉÍÓÚÑ]/g, '');
    if (!pasted) return;

    const chars = pasted.slice(0, length).split('');
    chars.forEach((char, i) => {
      onChangeLetter(i, char);
    });

    const nextIndex = Math.min(chars.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  // Tamaño dinámico adaptable a pantallas móviles
  const getCellSizeClass = (count: number) => {
    if (count <= 4) {
      return 'w-14 h-16 sm:w-16 sm:h-20 text-2xl sm:text-3xl';
    }
    if (count <= 7) {
      return 'w-10 h-13 sm:w-13 sm:h-16 text-xl sm:text-2xl';
    }
    if (count <= 9) {
      return 'w-8 h-11 sm:w-12 sm:h-15 text-lg sm:text-xl';
    }
    return 'w-7 h-10 sm:w-10 sm:h-13 text-base sm:text-lg';
  };

  const getGapClass = (count: number) => {
    if (count <= 5) return 'gap-2.5 sm:gap-3';
    if (count <= 8) return 'gap-1.5 sm:gap-2.5';
    return 'gap-1 sm:gap-2';
  };

  const isMultiWord = Boolean(
    wordLengths &&
      wordLengths.length > 1 &&
      wordLengths.reduce((a, b) => a + b, 0) === length
  );

  // Generar grupos de índices lineales correspondientes a cada palabra
  const wordGroups: number[][] = [];
  if (isMultiWord && wordLengths) {
    let offset = 0;
    for (const wLen of wordLengths) {
      const group: number[] = [];
      for (let i = 0; i < wLen; i++) {
        group.push(offset + i);
      }
      wordGroups.push(group);
      offset += wLen;
    }
  }

  const renderCell = (i: number) => {
    const isRevealed = revealedIndices.includes(i);
    const letter = letters[i] || '';

    return (
      <input
        key={i}
        ref={(el) => {
          inputRefs.current[i] = el;
        }}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={2}
        value={letter}
        disabled={isSolved}
        onKeyDown={(e) => handleKeyDown(i, e)}
        onChange={(e) => handleInput(i, e)}
        onPaste={handlePaste}
        aria-label={`Letra ${i + 1} de ${length}`}
        className={`letter-input ${getCellSizeClass(
          length
        )} text-center font-mono font-bold rounded-md border shadow-2xs select-none uppercase transition-transform active:scale-95 ${
          isSolved
            ? 'solved bg-sage-light border-sage text-sage-dark'
            : isRevealed
            ? 'revealed bg-parchment-200 text-terracotta border-terracotta/40'
            : 'bg-white border-ink-300 text-ink-900 focus:border-ink-900 focus:ring-1 focus:ring-ink-900'
        }`}
      />
    );
  };

  if (isMultiWord) {
    return (
      <div
        className={`flex flex-wrap justify-center items-center gap-x-4 sm:gap-x-7 gap-y-3 my-3 sm:my-5 ${
          isShake ? 'shake-cell' : ''
        }`}
      >
        {wordGroups.map((group, groupIdx) => (
          <div
            key={groupIdx}
            className={`flex items-center ${getGapClass(length)}`}
            aria-label={`Palabra ${groupIdx + 1}`}
          >
            {group.map((cellIdx) => renderCell(cellIdx))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap justify-center items-center ${getGapClass(
        length
      )} my-3 sm:my-5 ${isShake ? 'shake-cell' : ''}`}
    >
      {Array.from({ length }).map((_, i) => renderCell(i))}
    </div>
  );
}
