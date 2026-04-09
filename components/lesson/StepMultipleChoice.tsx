'use client';
import { useState } from 'react';
import type { StepMultipleChoice } from '@/mocks/lessons/types';
import { FeedbackPanel } from './FeedbackPanel';

interface Props {
  step: StepMultipleChoice;
  onCorrect: () => void;
  onWrong: () => void;
}

type State = 'idle' | 'correct' | 'wrong';

const CORRECT_MESSAGES = ['Чудово! 🎉', 'Правильно! ⭐', 'Молодець! 🌟', 'Супер! 🚀', 'Так тримати! 💪'];
const WRONG_MESSAGES   = ['Майже! Спробуй ще 💪', 'Не зовсім… 🤔', 'Ще раз! Ти зможеш 🦉', 'Трохи не так 😊'];

function randomFrom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function StepMultipleChoice({ step, onCorrect, onWrong }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [state, setState] = useState<State>('idle');
  const [feedbackMsg] = useState(() => ({
    correct: randomFrom(CORRECT_MESSAGES),
    wrong:   randomFrom(WRONG_MESSAGES),
  }));

  function handleSelect(i: number) {
    if (state !== 'idle') return;
    setSelected(i);
    if (i === step.correctIndex) {
      setState('correct');
    } else {
      setState('wrong');
      onWrong();
    }
  }

  function handleContinue() {
    if (state === 'correct') onCorrect();
    else {
      setSelected(null);
      setState('idle');
    }
  }

  const hint = state === 'wrong'
    ? `Правильна відповідь: ${step.options[step.correctIndex]}`
    : state === 'correct' && step.explanation
    ? step.explanation
    : undefined;

  return (
    <div className={"flex flex-col gap-6 w-full max-w-xl mx-auto"}>
      <h2 className="text-xl font-black text-ink">{step.question}</h2>

      <ul className="flex flex-col gap-3">
        {step.options.map((opt, i) => {
          let cls = 'border-border bg-white text-ink hover:border-primary/40 hover:bg-primary/5';
          if (selected === i) {
            cls = state === 'correct'
              ? 'border-success/60 bg-success/8 text-success-dark'
              : 'border-danger/60 bg-danger/8 text-danger-dark';
          } else if (state !== 'idle' && i === step.correctIndex) {
            cls = 'border-success/60 bg-success/8 text-success-dark';
          }

          const letter = String.fromCharCode(65 + i);

          return (
            <li key={i}>
              <button
                onClick={() => handleSelect(i)}
                disabled={state !== 'idle'}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-base transition-all ${cls} disabled:cursor-default`}
              >
                <span className="inline-flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-black flex-shrink-0">
                    {state !== 'idle' && selected === i
                      ? (state === 'correct' ? '✓' : '✕')
                      : state !== 'idle' && i === step.correctIndex
                      ? '✓'
                      : letter}
                  </span>
                  {opt}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {state !== 'idle' && (
        <FeedbackPanel
          state={state}
          message={state === 'correct' ? feedbackMsg.correct : feedbackMsg.wrong}
          hint={hint}
          continueLabel={state === 'correct' ? 'Далі →' : 'Спробую ще раз →'}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
