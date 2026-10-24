'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cryptic } from '@/lib/types';
import LetterGrid from './LetterGrid';
import ClueCard from './ClueCard';
import ClueActions from './ClueActions';
import AnatomyBreakdown from './AnatomyBreakdown';
import { getPlayerProgress, savePlayerProgress } from '@/lib/playerStorage';
import confetti from 'canvas-confetti';

interface CrypticGameProps {
  cryptic: Cryptic;
}

export default function CrypticGame({ cryptic }: CrypticGameProps) {
  const [letters, setLetters] = useState<string[]>(() =>
    Array(cryptic.letterCount).fill('')
  );
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [definitionRevealed, setDefinitionRevealed] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [surrendered, setSurrendered] = useState<boolean>(false);
  const [isShake, setIsShake] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    text?: string;
    type?: 'error' | 'success' | 'info';
  }>({});
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);

  // Restore saved progress if available
  useEffect(() => {
    const saved = getPlayerProgress(cryptic.id);
    if (saved) {
      if (saved.userLetters && saved.userLetters.length === cryptic.letterCount) {
        setLetters(saved.userLetters);
      }
      if (saved.revealedIndices) {
        setRevealedIndices(saved.revealedIndices);
      }
      if (saved.definitionRevealed) {
        setDefinitionRevealed(true);
      }
      if (saved.solved) {
        setIsSolved(true);
      }
      if (saved.surrendered) {
        setSurrendered(true);
      }
      if (typeof saved.timeSpentSeconds === 'number') {
        setTimeSpent(saved.timeSpentSeconds);
      }
    } else {
      // Reset state for new cryptic
      setLetters(Array(cryptic.letterCount).fill(''));
      setRevealedIndices([]);
      setDefinitionRevealed(false);
      setIsSolved(false);
      setSurrendered(false);
      setTimeSpent(0);
      setHintsUsedCount(0);
    }
  }, [cryptic.id, cryptic.letterCount]);

  // Timer while not solved
  useEffect(() => {
    if (isSolved) return;
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSolved]);

  // Save progress when letters or state changes
  useEffect(() => {
    savePlayerProgress(cryptic.id, {
      crypticId: cryptic.id,
      solved: isSolved,
      userLetters: letters,
      revealedIndices,
      definitionRevealed,
      timeSpentSeconds: timeSpent,
      surrendered,
    });
  }, [cryptic.id, letters, revealedIndices, definitionRevealed, isSolved, surrendered, timeSpent]);

  // Normalizador para comparar ignorando tildes y mayúsculas
  const normalizeText = (str: string) =>
    str
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // Handlers
  const handleChangeLetter = (index: number, val: string) => {
    const newLetters = [...letters];
    newLetters[index] = val;
    setLetters(newLetters);
    if (feedback.text) setFeedback({});

    // Auto-comprobar si todas las casillas están llenas y coinciden con la solución
    if (
      val &&
      newLetters.every((l) => l && l.trim().length > 0) &&
      newLetters.length === cryptic.letterCount
    ) {
      const userWord = newLetters.join('');
      if (normalizeText(userWord) === normalizeText(cryptic.answer)) {
        triggerVictory();
      }
    }
  };

  const handleToggleDefinition = () => {
    if (!definitionRevealed) {
      setHintsUsedCount((prev) => prev + 1);
    }
    setDefinitionRevealed((prev) => !prev);
  };

  const handleRevealLetter = () => {
    const cleanAnswer = cryptic.answer.toUpperCase();
    const unrevealedIndices: number[] = [];

    for (let i = 0; i < cryptic.letterCount; i++) {
      if (
        !revealedIndices.includes(i) &&
        normalizeText(letters[i] || '') !== normalizeText(cleanAnswer[i] || '')
      ) {
        unrevealedIndices.push(i);
      }
    }

    if (unrevealedIndices.length === 0) {
      setFeedback({
        text: '¡Todas las letras han sido reveladas o ya son correctas!',
        type: 'info',
      });
      return;
    }

    // Pick a random unrevealed index
    const randomIndex =
      unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    const correctLetter = cleanAnswer[randomIndex];

    const nextRevealed = [...revealedIndices, randomIndex];
    setRevealedIndices(nextRevealed);

    const nextLetters = [...letters];
    nextLetters[randomIndex] = correctLetter;
    setLetters(nextLetters);

    setHintsUsedCount((prev) => prev + 1);
    setFeedback({
      text: `Letra revelada en la posición ${randomIndex + 1}.`,
      type: 'info',
    });

    // Check if word is now complete and correct
    if (normalizeText(nextLetters.join('')) === normalizeText(cleanAnswer)) {
      triggerVictory();
    }
  };

  const handleSurrender = () => {
    if (window.confirm('¿Deseas ver la solución completa de este críptico?')) {
      const cleanAnswer = cryptic.answer.toUpperCase();
      setLetters(cleanAnswer.split(''));
      setSurrendered(true);
      setIsSolved(true);
      setDefinitionRevealed(true);
      setFeedback({
        text: 'Solución mostrada. Revisa la anatomía para comprender el mecanismo.',
        type: 'info',
      });
    }
  };

  const triggerVictory = () => {
    setIsSolved(true);
    setDefinitionRevealed(true);
    setFeedback({
      text: '¡Respuesta correcta! Has descifrado el críptico.',
      type: 'success',
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#436A55', '#C2593F', '#1C1917', '#E5DAC0'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  };

  const handleCheckAnswer = () => {
    const isComplete = letters.every((l) => l && l.trim().length > 0);
    const userWord = letters.join('');
    const cleanAnswer = cryptic.answer;

    if (!isComplete || letters.length < cryptic.letterCount) {
      setFeedback({
        text: `Completa todas las ${cryptic.letterCount} letras antes de verificar.`,
        type: 'error',
      });
      triggerShake();
      return;
    }

    if (normalizeText(userWord) === normalizeText(cleanAnswer)) {
      triggerVictory();
    } else {
      setFeedback({
        text: 'La palabra no es correcta. ¡Revisa el mecanismo y la definición!',
        type: 'error',
      });
      triggerShake();
    }
  };

  const triggerShake = () => {
    setIsShake(true);
    setTimeout(() => setIsShake(false), 400);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tarjeta de la pista */}
      <ClueCard cryptic={cryptic} showDefinition={definitionRevealed} />

      {/* Casillas de entrada de letras */}
      <div className="bg-parchment-50 border border-ink-300 rounded-lg p-3.5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between pb-2">
          <label className="text-xs uppercase tracking-wider font-semibold text-ink-700">
            Tu Solución ({cryptic.letterCount} casillas)
          </label>
          <div className="font-mono text-xs text-ink-600">
            {letters.filter(Boolean).length} / {cryptic.letterCount} letras
          </div>
        </div>

        <LetterGrid
          length={cryptic.letterCount}
          letters={letters}
          revealedIndices={revealedIndices}
          isSolved={isSolved}
          isShake={isShake}
          onChangeLetter={handleChangeLetter}
          onEnterPress={handleCheckAnswer}
          autoFocus={true}
        />

        {/* Acciones y pistas */}
        <ClueActions
          isSolved={isSolved}
          definitionRevealed={definitionRevealed}
          onToggleDefinition={handleToggleDefinition}
          onRevealLetter={handleRevealLetter}
          onSurrender={handleSurrender}
          onCheckAnswer={handleCheckAnswer}
          feedbackMessage={feedback.text}
          feedbackType={feedback.type}
        />
      </div>

      {/* Anatomía explicada al resolver o rendirse */}
      {isSolved && (
        <AnatomyBreakdown
          cryptic={cryptic}
          hintsUsedCount={hintsUsedCount}
          timeSpentSeconds={timeSpent}
          surrendered={surrendered}
        />
      )}
    </div>
  );
}
