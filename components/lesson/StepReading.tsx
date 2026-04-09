'use client';
import { useState } from 'react';
import type { StepReading, ReadingQuestion } from '@/mocks/lessons/types';
import { FeedbackPanel } from './FeedbackPanel';

interface Props {
  step: StepReading;
  onCorrect: () => void;
  onWrong: () => void;
}

type Phase = 'read' | 'quiz';
type AnswerState = 'idle' | 'correct' | 'wrong';

const CORRECT_MESSAGES = ['Правильно! 🎉', 'Чудово! ⭐', 'Молодець! 🌟', 'Вірно! 🚀'];
const WRONG_MESSAGES   = ['Не зовсім… 🤔', 'Спробуй ще 💪', 'Ще раз! Ти зможеш 🦉'];
function randomFrom(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ─── Підсвічування слів словника в тексті ──────── */
function HighlightedText({ text, vocabulary }: { text: string; vocabulary: { word: string; translation: string }[] }) {
  const [revealed, setReveal] = useState<Set<string>>(new Set());

  // Розбиваємо текст на токени зі збереженням пунктуації
  const vocabMap = Object.fromEntries(vocabulary.map(v => [v.word.toLowerCase(), v.translation]));
  const allWords = vocabulary.map(v => v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${allWords.join('|')})\\b`, 'gi');

  const parts: { text: string; isVocab: boolean; word?: string; translation?: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isVocab: false });
    }
    const word = match[0];
    parts.push({ text: word, isVocab: true, word: word.toLowerCase(), translation: vocabMap[word.toLowerCase()] });
    lastIndex = match.index + word.length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isVocab: false });
  }

  return (
    <p className="text-base leading-8 text-ink">
      {parts.map((part, i) => {
        if (!part.isVocab) return <span key={i}>{part.text}</span>;
        const isOpen = revealed.has(part.word!);
        return (
          <button
            key={i}
            onClick={() => setReveal(prev => {
              const next = new Set(prev);
              next.has(part.word!) ? next.delete(part.word!) : next.add(part.word!);
              return next;
            })}
            className={`relative inline-flex flex-col items-center mx-0.5 group`}
          >
            <span className={`font-bold underline decoration-dotted decoration-2 transition-colors ${
              isOpen ? 'text-primary-dark decoration-primary' : 'text-secondary decoration-secondary/60 hover:text-secondary-dark'
            }`}>
              {part.text}
            </span>
            {isOpen && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-ink text-white text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                {part.translation}
              </span>
            )}
          </button>
        );
      })}
    </p>
  );
}

/* ─── Один квіз-питання ──────────────────────────── */
function QuizQuestion({
  question,
  questionNum,
  total,
  onNext,
  onWrong,
}: {
  question: ReadingQuestion;
  questionNum: number;
  total: number;
  onNext: () => void;
  onWrong: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [state, setState] = useState<AnswerState>('idle');
  const [msgs] = useState({ correct: randomFrom(CORRECT_MESSAGES), wrong: randomFrom(WRONG_MESSAGES) });

  function handleSelect(i: number) {
    if (state !== 'idle') return;
    setSelected(i);
    if (i === question.correctIndex) {
      setState('correct');
    } else {
      setState('wrong');
      onWrong();
    }
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-ink-muted font-bold">
        <span className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-black text-[11px]">
          {questionNum}
        </span>
        <span>Питання {questionNum} з {total}</span>
      </div>

      <h3 className="text-xl font-black text-ink">{question.question}</h3>

      <ul className="flex flex-col gap-2.5">
        {question.options.map((opt, i) => {
          let cls = 'border-border bg-white text-ink hover:border-primary/40 hover:bg-primary/5';
          if (selected === i) {
            cls = state === 'correct'
              ? 'border-success/60 bg-success/8 text-success-dark'
              : 'border-danger/60 bg-danger/8 text-danger-dark';
          } else if (state !== 'idle' && i === question.correctIndex) {
            cls = 'border-success/60 bg-success/8 text-success-dark';
          }
          const letter = String.fromCharCode(65 + i);
          return (
            <li key={i}>
              <button
                onClick={() => handleSelect(i)}
                disabled={state !== 'idle'}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all disabled:cursor-default ${cls}`}
              >
                <span className="inline-flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-black flex-shrink-0">
                    {state !== 'idle' && selected === i
                      ? (state === 'correct' ? '✓' : '✕')
                      : state !== 'idle' && i === question.correctIndex ? '✓'
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
          message={state === 'correct' ? msgs.correct : msgs.wrong}
          hint={state === 'wrong' ? `Правильна відповідь: ${question.options[question.correctIndex]}` : question.explanation}
          continueLabel={state === 'correct' ? (questionNum < total ? 'Далі →' : 'Завершити читання →') : 'Спробую ще раз →'}
          onContinue={() => {
            if (state === 'correct') onNext();
            else { setSelected(null); setState('idle'); }
          }}
        />
      )}
    </div>
  );
}

/* ─── Головний компонент ─────────────────────────── */
export function StepReading({ step, onCorrect, onWrong }: Props) {
  const [phase, setPhase]       = useState<Phase>('read');
  const [qIndex, setQIndex]     = useState(0);

  const currentQ = step.questions[qIndex];

  function handleNext() {
    if (qIndex + 1 < step.questions.length) {
      setQIndex(i => i + 1);
    } else {
      onCorrect();
    }
  }

  /* ── Фаза читання ────────────────────────────── */
  if (phase === 'read') {
    return (
      <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
        <div>
          <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1">📖 Читання</p>
          <h2 className="text-xl font-black text-ink">{step.title}</h2>
        </div>

        {/* Текст */}
        <div className="bg-white rounded-2xl border-2 border-border px-6 py-5">
          <HighlightedText text={step.text} vocabulary={step.vocabulary} />
        </div>

        {/* Словник */}
        <div className="bg-surface-muted rounded-2xl p-4">
          <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-3">📚 Словник</p>
          <div className="flex flex-wrap gap-2">
            {step.vocabulary.map(v => (
              <div key={v.word} className="flex items-center gap-1.5 bg-white border border-border rounded-xl px-3 py-1.5">
                <span className="text-sm font-bold text-secondary">{v.word}</span>
                <span className="text-ink-muted text-xs">—</span>
                <span className="text-sm text-ink">{v.translation}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-ink-muted text-center">
          💡 Натисни на підкреслене слово, щоб побачити переклад
        </p>

        <button
          onClick={() => setPhase('quiz')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-black text-base hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md"
        >
          Я прочитав — відповісти на питання →
        </button>
      </div>
    );
  }

  /* ── Фаза питань ─────────────────────────────── */
  return (
    <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
      {/* Міні-нагадування тексту */}
      <div
        className="bg-white border border-border rounded-2xl px-4 py-3 cursor-pointer group"
        onClick={() => setPhase('read')}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-black text-ink-muted uppercase tracking-wide">📖 {step.title}</p>
          <span className="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            Перечитати ↑
          </span>
        </div>
        <p className="text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">{step.text}</p>
      </div>

      <QuizQuestion
        question={currentQ}
        questionNum={qIndex + 1}
        total={step.questions.length}
        onNext={handleNext}
        onWrong={onWrong}
      />
    </div>
  );
}
