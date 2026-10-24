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
}: LetterGridProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasFocusedRef = useRef(false);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
    // Autofocus ONLY once on mount if autoFocus is explicitly true
    if (autoFocus && !hasFocusedRef.current && !isSolved) {
      hasFocusedRef.current = true;
      const firstEmpty = letters.findIndex((l) => !l);
      const targetIndex = firstEmpty !== -1 ? firstEmpty : 0;
      inputRefs.current[targetIndex]?.focus();
    }
  }, [length, autoFocus, isSolved, letters]);

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSolved) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (letters[index]) {
        // If current has a letter, clear it
        onChangeLetter(index, '');
      } else if (index > 0) {
        // Move back and clear previous
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

    // Solo admitir letras
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
    const pasted = e.clipboardData.getData('text').trim().toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ]/g, '');
    if (!pasted) return;

    const chars = pasted.slice(0, length).split('');
    chars.forEach((char, i) => {
      onChangeLetter(i, char);
    });

    const nextIndex = Math.min(chars.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 sm:gap-2.5 my-4 ${
        isShake ? 'shake-cell' : ''
      }`}
    >
      {Array.from({ length }).map((_, i) => {
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
            maxLength={2}
            value={letter}
            disabled={isSolved}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onChange={(e) => handleInput(i, e)}
            onPaste={handlePaste}
            aria-label={`Letra ${i + 1} de ${length}`}
            className={`letter-input w-11 h-13 sm:w-13 sm:h-16 text-center font-mono text-xl sm:text-2xl font-bold rounded border shadow-xs select-none uppercase ${
              isSolved
                ? 'solved bg-sage-light border-sage text-sage-dark'
                : isRevealed
                ? 'revealed bg-parchment-200 text-terracotta border-terracotta/40'
                : 'bg-white/80 border-ink-300 text-ink-900 focus:bg-white focus:border-ink-900'
            }`}
          />
        );
      })}
    </div>
  );
}
