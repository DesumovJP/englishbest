'use client';
import { useState } from 'react';
import type { StepMultipleChoice } from '@/mocks/lessons/types';
import { FeedbackPanel } from './FeedbackPanel';
import { StepFrame } from './StepFrame';
import { OptionButton, type OptionState } from './OptionButton';

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

function resolveState(i: number, selected: number | null, state: State, correctIndex: number): OptionState {
  if (selected === i) return state === 'correct' ? 'selected-correct' : state === 'wrong' ? 'selected-wrong' : 'idle';
  if (state !== 'idle' && i === correctIndex) return 'reveal-correct';
  if (state !== 'idle') return 'disabled';
  return 'idle';
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
    if (i === step.correctIndex) setState('correct');
    else { setState('wrong'); onWrong(); }
  }

  function handleContinue() {
    if (state === 'correct') onCorrect();
    else { setSelected(null); setState('idle'); }
  }

  const hint = state === 'wrong'
    ? `Правильна відповідь: ${step.options[step.correctIndex]}`
    : state === 'correct' && step.explanation
    ? step.explanation
    : undefined;

  return (
    <StepFrame title={step.question}>
      <ul className="flex flex-col gap-2 sm:gap-3">
        {step.options.map((opt, i) => {
          const optState = resolveState(i, selected, state, step.correctIndex);
          const letter   = String.fromCharCode(65 + i);
          const leading  = state !== 'idle' && selected === i
            ? (state === 'correct' ? '✓' : '✕')
            : state !== 'idle' && i === step.correctIndex
            ? '✓'
            : letter;
          return (
            <li key={i}>
              <OptionButton
                label={opt}
                state={optState}
                onClick={() => handleSelect(i)}
                disabled={state !== 'idle'}
                leading={leading}
              />
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
    </StepFrame>
  );
}
