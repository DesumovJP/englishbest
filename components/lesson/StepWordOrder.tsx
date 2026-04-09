'use client';
import { useState } from 'react';
import type { StepWordOrder } from '@/mocks/lessons/types';
import { FeedbackPanel } from './FeedbackPanel';

interface Props {
  step: StepWordOrder;
  onCorrect: () => void;
  onWrong: () => void;
}

type State = 'idle' | 'correct' | 'wrong';

/* Кольори чіпів — циклічно по словах */
const CHIP_COLORS = [
  'bg-purple/10 text-purple-dark border-purple/20',
  'bg-secondary/10 text-secondary-dark border-secondary/20',
  'bg-success/10 text-success-dark border-success/20',
  'bg-accent/10 text-accent-dark border-accent/20',
  'bg-danger/10 text-danger-dark border-danger/20',
  'bg-primary/10 text-primary-dark border-primary/20',
];

const CORRECT_MESSAGES = ['Правильно! 🎉', 'Супер! 🌟', 'Чудово! 🚀', 'Молодець! ⭐'];
const WRONG_MESSAGES   = ['Майже! Спробуй ще 💪', 'Не той порядок 🤔', 'Ще раз! 🦉'];

function randomFrom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function StepWordOrder({ step, onCorrect, onWrong }: Props) {
  const [state, setState]         = useState<State>('idle');
  const [placedIdx, setPlacedIdx] = useState<number[]>([]);
  const [feedbackMsg] = useState(() => ({
    correct: randomFrom(CORRECT_MESSAGES),
    wrong:   randomFrom(WRONG_MESSAGES),
  }));

  const usedIndices  = new Set(placedIdx);
  const placedWords  = placedIdx.map(i => step.words[i]);

  function addWord(wordIdx: number) {
    if (state !== 'idle' || usedIndices.has(wordIdx)) return;
    setPlacedIdx(prev => [...prev, wordIdx]);
  }

  function removeWord(posIdx: number) {
    if (state !== 'idle') return;
    setPlacedIdx(prev => prev.filter((_, i) => i !== posIdx));
  }

  function handleCheck() {
    if (placedWords.join(' ') === step.answer.join(' ')) {
      setState('correct');
    } else {
      setState('wrong');
      onWrong();
    }
  }

  function handleContinue() {
    if (state === 'correct') {
      onCorrect();
    } else {
      setPlacedIdx([]);
      setState('idle');
    }
  }

  return (
    <div className={"flex flex-col gap-6 w-full max-w-xl mx-auto"}>
      <div>
        <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1">{step.prompt}</p>
        <p className="text-sm text-ink-muted italic">🇺🇦 {step.translation}</p>
      </div>

      {/* Зона відповіді */}
      <div className={`min-h-[72px] bg-white border-2 rounded-2xl px-4 py-4 flex flex-wrap gap-2 items-center transition-colors ${
        state === 'correct' ? 'border-success/60' : state === 'wrong' ? 'border-danger/60' : 'border-border'
      }`}>
        {placedWords.length === 0 ? (
          <span className="text-ink-muted text-sm">Натисни на слова нижче…</span>
        ) : (
          placedWords.map((w, i) => (
            <button
              key={i}
              onClick={() => removeWord(i)}
              disabled={state !== 'idle'}
              className="px-3 py-2 rounded-xl bg-primary/10 text-primary-dark font-bold text-sm border-2 border-primary/30 hover:bg-primary/20 transition-colors disabled:cursor-default"
            >
              {w}
            </button>
          ))
        )}
      </div>

      {/* Доступні слова — кольорові чіпи */}
      <div className="flex flex-wrap gap-2">
        {step.words.map((w, i) => {
          const colorCls = CHIP_COLORS[i % CHIP_COLORS.length];
          return (
            <button
              key={i}
              onClick={() => addWord(i)}
              disabled={usedIndices.has(i) || state !== 'idle'}
              className={`px-3 py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                usedIndices.has(i)
                  ? 'opacity-0 pointer-events-none'
                  : `${colorCls} hover:opacity-80 hover:scale-105`
              } disabled:cursor-default`}
            >
              {w}
            </button>
          );
        })}
      </div>

      {state === 'idle' ? (
        <button
          onClick={handleCheck}
          disabled={placedWords.length === 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white font-black text-base hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Перевірити
        </button>
      ) : (
        <FeedbackPanel
          state={state}
          message={state === 'correct' ? feedbackMsg.correct : feedbackMsg.wrong}
          hint={state === 'wrong' ? `Правильно: ${step.answer.join(' ')}` : undefined}
          continueLabel={state === 'correct' ? 'Далі →' : 'Спробую ще раз →'}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
