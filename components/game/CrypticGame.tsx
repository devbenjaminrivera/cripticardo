'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [mechanismRevealed, setMechanismRevealed] = useState<boolean>(false);
  const [hint1Used, setHint1Used] = useState<boolean>(false);
  const [hint2Used, setHint2Used] = useState<boolean>(false);
  const [hint3Used, setHint3Used] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [surrendered, setSurrendered] = useState<boolean>(false);
  const [isShake, setIsShake] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    text?: string;
    type?: 'error' | 'success' | 'info';
  }>({});
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [hasPreviouslySolved, setHasPreviouslySolved] = useState<boolean>(false);
  const [showPreviousSolution, setShowPreviousSolution] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Inicialización y carga de progreso
  useEffect(() => {
    const saved = getPlayerProgress(cryptic.id);
    const wasCompleted = Boolean(saved?.completedBefore || saved?.solved);

    if (wasCompleted) {
      setHasPreviouslySolved(true);
    }

    // El tablero inicia limpio para jugar
    setLetters(Array(cryptic.letterCount).fill(''));
    setRevealedIndices([]);
    setDefinitionRevealed(false);
    setMechanismRevealed(false);
    setHint1Used(false);
    setHint2Used(false);
    setHint3Used(false);
    setIsSolved(false);
    setSurrendered(false);
    setTimeSpent(0);
    setHintsUsedCount(0);
    setFeedback({});
    setShowPreviousSolution(false);
    setIsInitialized(true);
  }, [cryptic.id, cryptic.letterCount]);

  // Cronómetro mientras no esté resuelto
  useEffect(() => {
    if (isSolved) return;
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSolved]);

  // Guardar progreso al cambiar letras o pistas
  useEffect(() => {
    if (!isInitialized) return;
    savePlayerProgress(cryptic.id, {
      crypticId: cryptic.id,
      solved: isSolved,
      userLetters: letters,
      revealedIndices,
      definitionRevealed,
      mechanismRevealed,
      hint1Used,
      hint2Used,
      hint3Used,
      timeSpentSeconds: timeSpent,
      surrendered,
    });
  }, [
    isInitialized,
    cryptic.id,
    letters,
    revealedIndices,
    definitionRevealed,
    mechanismRevealed,
    hint1Used,
    hint2Used,
    hint3Used,
    isSolved,
    surrendered,
    timeSpent,
  ]);

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
  };

  // Pista 1: Revelar Definición Directa (desbloquea Pista 2)
  const handleToggleDefinition = () => {
    if (!hint1Used) {
      setHint1Used(true);
      setHintsUsedCount((prev) => prev + 1);
      setFeedback({
        text: 'Pista 1 activa (verde). Se ha desbloqueado la Pista 2.',
        type: 'info',
      });
    }
    setDefinitionRevealed((prev) => !prev);
  };

  // Pista 2: Revelar Indicador (desbloquea Pista 3)
  const handleToggleMechanism = () => {
    if (!hint2Used) {
      setHint2Used(true);
      setHintsUsedCount((prev) => prev + 1);
      setFeedback({
        text: 'Pista 2 activa (naranja). Se ha resaltado el indicador en el enunciado.',
        type: 'info',
      });
    }
    setMechanismRevealed((prev) => !prev);
  };

  // Pista 3: Revelar Letra (solo se permite 1 letra por enigma; desbloquea el botón de Rendirse)
  const handleRevealLetter = () => {
    if (hint3Used) {
      setFeedback({
        text: 'Ya has utilizado la pista de letra (solo se puede revelar 1 letra por enigma).',
        type: 'info',
      });
      return;
    }

    const lettersOnlyAnswer = cryptic.answer.toUpperCase().replace(/\s+/g, '');
    const unrevealedIndices: number[] = [];

    for (let i = 0; i < cryptic.letterCount; i++) {
      if (
        !revealedIndices.includes(i) &&
        normalizeText(letters[i] || '') !== normalizeText(lettersOnlyAnswer[i] || '')
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

    // Elegir índice aleatorio no revelado
    const randomIndex =
      unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    const correctLetter = lettersOnlyAnswer[randomIndex];

    const nextRevealed = [...revealedIndices, randomIndex];
    setRevealedIndices(nextRevealed);

    const nextLetters = [...letters];
    nextLetters[randomIndex] = correctLetter;
    setLetters(nextLetters);

    // Marcar Pista 3 como usada
    if (!hint3Used) {
      setHint3Used(true);
    }
    setHintsUsedCount((prev) => prev + 1);
    setFeedback({
      text: `Letra revelada en casilla ${randomIndex + 1}.`,
      type: 'info',
    });
  };

  const handleSurrender = () => {
    if (window.confirm('¿Deseas ver la solución completa de este críptico?')) {
      const lettersOnlyAnswer = cryptic.answer.toUpperCase().replace(/\s+/g, '');
      setLetters(lettersOnlyAnswer.split(''));
      setSurrendered(true);
      setIsSolved(true);
      setDefinitionRevealed(true);
      setMechanismRevealed(true);
      setFeedback({
        text: 'Solución mostrada. Revisa la anatomía para comprender el mecanismo.',
        type: 'info',
      });
    }
  };

  const handleResetGame = () => {
    setLetters(Array(cryptic.letterCount).fill(''));
    setRevealedIndices([]);
    setDefinitionRevealed(false);
    setMechanismRevealed(false);
    setHint1Used(false);
    setHint2Used(false);
    setHint3Used(false);
    setIsSolved(false);
    setSurrendered(false);
    setTimeSpent(0);
    setHintsUsedCount(0);
    setShowPreviousSolution(false);
    setFeedback({
      text: 'Tablero reiniciado. ¡A resolverlo de nuevo!',
      type: 'info',
    });
  };

  const triggerVictory = () => {
    setIsSolved(true);
    setDefinitionRevealed(true);
    setMechanismRevealed(true);
    setHasPreviouslySolved(true);
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
    const lettersOnlyAnswer = cryptic.answer.replace(/\s+/g, '');

    if (!isComplete || letters.length < cryptic.letterCount) {
      setFeedback({
        text: `Completa todas las ${cryptic.letterCount} letras antes de verificar.`,
        type: 'error',
      });
      triggerShake();
      return;
    }

    if (normalizeText(userWord) === normalizeText(lettersOnlyAnswer)) {
      triggerVictory();
    } else {
      setFeedback({
        text: 'La respuesta no es correcta. ¡Revisa el mecanismo y la definición!',
        type: 'error',
      });
      triggerShake();
    }
  };

  const triggerShake = () => {
    setIsShake(true);
    setTimeout(() => setIsShake(false), 400);
  };

  // Desglose de palabras para respuestas de más de una palabra
  const answerWords = cryptic.answer ? cryptic.answer.trim().split(/\s+/).filter(Boolean) : [];
  const wordLengths = answerWords.length > 1 ? answerWords.map((w) => w.length) : undefined;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Aviso amigable si ya lo completó previamente hoy pero desea resolverlo de nuevo */}
      {hasPreviouslySolved && !isSolved && (
        <div className="bg-sage-light/35 border border-sage/30 rounded-lg p-2.5 sm:p-3.5 flex items-center justify-between flex-wrap gap-2 text-xs text-sage-dark shadow-2xs">
          <span className="font-medium flex items-center gap-1.5">
            <span>✨ Ya resolviste este enigma hoy. ¡Puedes resolverlo de nuevo!</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreviousSolution((prev) => !prev)}
              className="underline hover:text-sage-dark font-semibold cursor-pointer text-xs"
            >
              {showPreviousSolution ? 'Ocultar anatomía' : 'Ver anatomía previa'}
            </button>
            <Link
              href="/archivo"
              className="text-terracotta hover:text-terracotta-dark font-semibold underline text-xs"
            >
              Mi Archivo →
            </Link>
          </div>
        </div>
      )}

      {/* Tarjeta de la pista con resaltados progresivos en verde (definición) y naranja (juego) */}
      <ClueCard
        cryptic={cryptic}
        showDefinition={definitionRevealed}
        showMechanism={mechanismRevealed}
      />

      {/* Casillas de entrada de letras */}
      <div className="bg-parchment-50 border border-ink-300 rounded-lg p-3.5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between pb-2">
          <label className="text-xs uppercase tracking-wider font-semibold text-ink-700">
            Tu Solución ({cryptic.letterCount} casillas{wordLengths ? ` · ${wordLengths.join(', ')}` : ''})
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
          wordLengths={wordLengths}
        />

        {/* Acciones con pistas progresivas y botón de rendirse condicional */}
        <ClueActions
          isSolved={isSolved}
          definitionRevealed={definitionRevealed}
          mechanismRevealed={mechanismRevealed}
          hint1Used={hint1Used}
          hint2Used={hint2Used}
          hint3Used={hint3Used}
          onToggleDefinition={handleToggleDefinition}
          onToggleMechanism={handleToggleMechanism}
          onRevealLetter={handleRevealLetter}
          onSurrender={handleSurrender}
          onCheckAnswer={handleCheckAnswer}
          feedbackMessage={feedback.text}
          feedbackType={feedback.type}
        />
      </div>

      {/* Anatomía explicada al resolver, rendirse o consultar la solución previa */}
      {(isSolved || showPreviousSolution) && (
        <AnatomyBreakdown
          cryptic={cryptic}
          hintsUsedCount={hintsUsedCount}
          timeSpentSeconds={timeSpent}
          surrendered={surrendered}
          onPlayAgain={isSolved ? handleResetGame : undefined}
        />
      )}
    </div>
  );
}
