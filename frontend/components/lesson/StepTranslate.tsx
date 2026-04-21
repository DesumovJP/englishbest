'use client';
import { useState, useRef } from 'react';
import type { StepTranslate } from '@/mocks/lessons/types';
import { FeedbackPanel } from './FeedbackPanel';

const CORRECT_MESSAGES = ['Відмінно! 🎉', 'Правильно! 🌟', 'Супер переклад! 🚀', 'Чудово! ⭐'];
const WRONG_MESSAGES   = ['Майже! Спробуй ще 💪', 'Не зовсім… 🤔', 'Ще раз! Ти зможеш 🦉'];
function randomFrom(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)]; }

interface Props {
  step: StepTranslate;
  onCorrect: () => void;
  onWrong: () => void;
}

type State = 'idle' | 'correct' | 'wrong';

export function StepTranslate({ step, onCorrect, onWrong }: Props) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<State>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [feedbackMsg] = useState(() => ({
    correct: randomFrom(CORRECT_MESSAGES),
    wrong:   randomFrom(WRONG_MESSAGES),
  }));

  function handleCheck() {
    const trimmed = value.trim().toLowerCase();
    const isCorrect = step.acceptedAnswers.map(a => a.toLowerCase()).includes(trimmed);
    if (isCorrect) {
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
      textareaRef.current?.focus();
    }
  }

  return (
    <div className={"flex flex-col gap-6 w-full max-w-xl mx-auto"}>
      <div>
        <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-3">{step.prompt}</p>
        <div className="bg-white border-2 border-border rounded-2xl px-5 py-5">
          <p className="text-xl font-black text-ink">{step.sentence}</p>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => { if (state === 'idle') setValue(e.target.value); }}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && value.trim() && state === 'idle') { e.preventDefault(); handleCheck(); } }}
        placeholder="Введіть переклад англійською…"
        autoFocus
        rows={3}
        disabled={state !== 'idle'}
        className={`w-full px-5 py-4 rounded-2xl border-2 text-base text-ink font-medium resize-none focus:outline-none transition-colors ${
          state === 'correct' ? 'border-success/60 bg-success/8' :
          state === 'wrong'   ? 'border-danger/60 bg-danger/8' :
          'border-border focus:border-primary'
        }`}
      />

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
          hint={state === 'wrong' ? `Еталонна відповідь: ${step.answer}` : undefined}
          continueLabel={state === 'correct' ? 'Далі →' : 'Спробую ще раз →'}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
