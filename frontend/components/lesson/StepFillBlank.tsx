'use client';
import { useState, useRef } from 'react';
import type { StepFillBlank } from '@/mocks/lessons/types';
import { FeedbackPanel } from './FeedbackPanel';

const CORRECT_MESSAGES = ['Правильно! 🎉', 'Чудово! ⭐', 'Молодець! 🌟', 'Супер! 🚀'];
const WRONG_MESSAGES   = ['Майже! Спробуй ще 💪', 'Не зовсім… 🤔', 'Ще раз! Ти зможеш 🦉'];
function randomFrom(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)]; }

interface Props {
  step: StepFillBlank;
  onCorrect: () => void;
  onWrong: () => void;
}

type State = 'idle' | 'correct' | 'wrong';

export function StepFillBlank({ step, onCorrect, onWrong }: Props) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<State>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const [feedbackMsg] = useState(() => ({
    correct: randomFrom(CORRECT_MESSAGES),
    wrong:   randomFrom(WRONG_MESSAGES),
  }));

  function handleCheck() {
    const trimmed = value.trim().toLowerCase();
    const correct = step.answer.toLowerCase();
    if (trimmed === correct) {
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
      setValue('');
      setState('idle');
      inputRef.current?.focus();
    }
  }

  const borderColor = state === 'correct' ? 'border-success/60' : state === 'wrong' ? 'border-danger/60' : 'border-border focus-within:border-primary';

  return (
    <div className={"flex flex-col gap-6 w-full max-w-xl mx-auto"}>
      <div>
        <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-2">Заповніть пропуск</p>
        <div className={`flex flex-wrap items-center gap-2 bg-white border-2 rounded-2xl px-5 py-5 text-lg font-semibold text-ink transition-colors ${borderColor}`}>
          <span>{step.before}</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => { if (state === 'idle') setValue(e.target.value); }}
            onKeyDown={e => { if (e.key === 'Enter' && value.trim() && state === 'idle') handleCheck(); }}
            placeholder="___"
            autoFocus
            className="inline-block min-w-[80px] border-b-2 border-ink/30 focus:border-primary outline-none bg-transparent text-primary-dark font-black text-center px-1 transition-colors"
            style={{ width: `${Math.max(80, value.length * 12 + 40)}px` }}
            aria-label="Введіть відповідь"
            disabled={state !== 'idle'}
          />
          <span>{step.after}</span>
        </div>
      </div>

      {step.hint && state === 'idle' && (
        <p className="text-xs text-ink-muted">💡 {step.hint}</p>
      )}

      {state === 'idle' ? (
        <button
          onClick={handleCheck}
          disabled={!value.trim()}
          className="w-full py-4 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white font-black text-base hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Перевірити
        </button>
      ) : (
        <FeedbackPanel
          state={state}
          message={state === 'correct' ? feedbackMsg.correct : feedbackMsg.wrong}
          hint={state === 'wrong' ? `Правильна відповідь: ${step.answer}` : undefined}
          continueLabel={state === 'correct' ? 'Далі →' : 'Спробую ще раз →'}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
