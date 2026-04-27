/**
 * MiniTaskPlayer — full-screen kids modal that plays a single mini-task.
 *
 * Handles every exercise type the MiniTaskBuilder currently authors:
 *   - mcq             → tap an option
 *   - word-order      → tap words to compose a sentence (sentence-builder)
 *   - theory          → reveal translation / definition (word-of-day)
 *   - reading         → audio + prompt (listening)
 *   - fill-blank      → free-text answer
 *   - translate       → free-text answer
 *
 * On submit it POSTs the answer through `submitAttempt`; the BE auto-grades
 * closed-form types and returns `{ score, correct, awardedCoins }`. We then
 * flip into a result screen (correct + coin animation, or wrong + correct
 * answer reveal). Subsequent attempts reach the BE but never re-award coins
 * (idempotent first-attempt rule lives server-side).
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { KidsButton, KidsCoinBadge, RewardChip } from '@/components/kids/ui';
import type { MiniTask } from '@/lib/mini-tasks';
import { submitAttempt, type SubmitAttemptResult } from '@/lib/mini-task-attempts';
import { emitKidsEvent } from '@/lib/kids-store';
import { pointsForScore } from '@/lib/grade';

interface MiniTaskPlayerProps {
  task: MiniTask;
  onClose: () => void;
  onCompleted?: (result: SubmitAttemptResult) => void;
}

type Phase = 'doing' | 'submitting' | 'done';

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function asOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string');
}

function exerciseAnswerCorrectIndex(answer: unknown, options: string[]): number | null {
  // MiniTaskBuilder stores `answer = { correct: <text>, correctIndex: <int> }`
  // for mcq. Be tolerant of plain string or plain index too.
  if (typeof answer === 'number') return answer;
  if (typeof answer === 'string') return options.indexOf(answer);
  if (answer && typeof answer === 'object') {
    const o = answer as { correct?: unknown; correctIndex?: unknown };
    if (typeof o.correctIndex === 'number') return o.correctIndex;
    if (typeof o.correct === 'string') return options.indexOf(o.correct);
  }
  return null;
}

export function MiniTaskPlayer({ task, onClose, onCompleted }: MiniTaskPlayerProps) {
  const [phase, setPhase] = useState<Phase>('doing');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitAttemptResult | null>(null);

  // Track time-on-task — included in the submission for analytics.
  const startedAt = useMemo(() => Date.now(), []);

  // Per-type interactive state.
  const [mcqIdx, setMcqIdx] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [pickedWords, setPickedWords] = useState<number[]>([]);

  const exercise = task.exercise;
  const xType = exercise?.type ?? 'theory';
  const wordOptions = useMemo(() => {
    if (xType !== 'word-order') return [];
    return shuffle(asOptions(exercise?.options));
  }, [xType, exercise?.options]);
  const mcqOptions = xType === 'mcq' ? asOptions(exercise?.options) : [];

  function reset() {
    setPhase('doing');
    setError(null);
    setResult(null);
    setMcqIdx(null);
    setTextAnswer('');
    setPickedWords([]);
  }

  // Esc closes the modal — but only when not mid-submit so we don't strand
  // an in-flight attempt.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && phase !== 'submitting') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onClose]);

  function buildAnswer(): unknown {
    if (xType === 'mcq') return mcqIdx === null ? null : mcqOptions[mcqIdx];
    if (xType === 'fill-blank' || xType === 'translate') return textAnswer.trim();
    if (xType === 'word-order') {
      // Reconstruct the picked sentence as a single string — matches what
      // MiniTaskBuilder stores in `exercise.answer` (the full target sentence).
      return pickedWords.map(i => wordOptions[i]).join(' ');
    }
    // theory / reading / image / video / frame — info-only; BE marks
    // complete with score=100 on null answer.
    return null;
  }

  function canSubmit(): boolean {
    if (phase !== 'doing') return false;
    if (xType === 'mcq') return mcqIdx !== null;
    if (xType === 'fill-blank' || xType === 'translate') return textAnswer.trim().length > 0;
    if (xType === 'word-order') return pickedWords.length === wordOptions.length;
    return true;
  }

  async function handleSubmit() {
    if (!canSubmit()) return;
    setPhase('submitting');
    setError(null);
    try {
      const res = await submitAttempt({
        taskId: task.documentId,
        answer: buildAnswer(),
        timeSpentSec: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
      });
      setResult(res);
      setPhase('done');
      // Server changed coins / XP / streak — invalidate the kids cache so
      // the HUD reflects the new totals next render.
      emitKidsEvent('kids:server-state-stale');
      onCompleted?.(res);
    } catch (e: any) {
      setError(e?.message ?? 'Не вдалось зберегти');
      setPhase('doing');
    }
  }

  // ─── Render: doing → submitting → done ────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[60] bg-kid-ink/80 backdrop-blur-md flex items-end sm:items-center justify-center pt-3 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+76px)] sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={task.title}
      onClick={() => phase !== 'submitting' && onClose()}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-card-md flex flex-col max-h-[calc(100dvh-env(safe-area-inset-bottom,0px)-92px)] sm:max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-border">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-ink-faint">
              {task.topic || 'Завдання'}
              {task.level ? ` · ${task.level}` : ''}
            </p>
            <h2 className="font-black text-ink text-base leading-snug truncate">{task.title}</h2>
          </div>
          {task.coinReward > 0 && phase !== 'done' && (
            <KidsCoinBadge amount={task.coinReward} size="sm" />
          )}
          <button
            type="button"
            onClick={() => phase !== 'submitting' && onClose()}
            aria-label="Закрити"
            className="w-9 h-9 rounded-full bg-surface-muted hover:bg-border flex items-center justify-center flex-shrink-0"
          >
            <svg className="w-4 h-4 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {phase === 'done' && result ? (
          <ResultScreen result={result} task={task} onClose={onClose} onRetry={reset} />
        ) : (
          <div className="flex flex-col gap-4 p-5">
            {error && (
              <p className="text-[12px] font-semibold text-danger-dark bg-danger/10 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <ExerciseBody
              xType={xType}
              question={exercise?.question ?? null}
              meta={exercise?.meta ?? null}
              answer={exercise?.answer ?? null}
              mcqOptions={mcqOptions}
              wordOptions={wordOptions}
              mcqIdx={mcqIdx}
              setMcqIdx={setMcqIdx}
              textAnswer={textAnswer}
              setTextAnswer={setTextAnswer}
              pickedWords={pickedWords}
              setPickedWords={setPickedWords}
            />

            <KidsButton
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={!canSubmit() || phase === 'submitting'}
              className="w-full"
            >
              {phase === 'submitting' ? 'Зберігаю…' : isPassiveType(xType) ? 'Готово!' : 'Перевірити'}
            </KidsButton>
          </div>
        )}
      </div>
    </div>
  );
}

function isPassiveType(t: string): boolean {
  return t === 'theory' || t === 'reading' || t === 'image' || t === 'video' || t === 'frame';
}

// ─── Exercise body (per-type input) ──────────────────────────────────────
function ExerciseBody({
  xType,
  question,
  meta,
  answer,
  mcqOptions,
  wordOptions,
  mcqIdx,
  setMcqIdx,
  textAnswer,
  setTextAnswer,
  pickedWords,
  setPickedWords,
}: {
  xType: string;
  question: string | null;
  meta: unknown;
  answer: unknown;
  mcqOptions: string[];
  wordOptions: string[];
  mcqIdx: number | null;
  setMcqIdx: (i: number | null) => void;
  textAnswer: string;
  setTextAnswer: (s: string) => void;
  pickedWords: number[];
  setPickedWords: (next: number[]) => void;
}) {
  if (xType === 'mcq') {
    return (
      <div className="flex flex-col gap-3">
        {question && <p className="text-[15px] font-bold text-ink leading-snug">{question}</p>}
        <ul className="flex flex-col gap-2">
          {mcqOptions.map((opt, i) => {
            const picked = mcqIdx === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setMcqIdx(i)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border-2 font-bold text-[14px] transition-colors ${
                    picked
                      ? 'border-primary bg-primary/10 text-primary-dark'
                      : 'border-border bg-white hover:border-primary/40 text-ink'
                  }`}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (xType === 'fill-blank' || xType === 'translate') {
    return (
      <div className="flex flex-col gap-3">
        {question && <p className="text-[15px] font-bold text-ink leading-snug">{question}</p>}
        <input
          type="text"
          value={textAnswer}
          onChange={e => setTextAnswer(e.target.value)}
          placeholder={xType === 'translate' ? 'Переклад…' : 'Твоя відповідь…'}
          autoFocus
          className="w-full h-12 px-4 rounded-2xl border-2 border-border bg-white text-[16px] text-ink focus:outline-none focus:border-primary"
        />
      </div>
    );
  }

  if (xType === 'word-order') {
    return (
      <div className="flex flex-col gap-3">
        {question && <p className="text-[15px] font-bold text-ink leading-snug">{question}</p>}

        {/* Composed answer area */}
        <div className="min-h-[3.5rem] rounded-2xl bg-surface-muted border-2 border-dashed border-border p-3 flex flex-wrap gap-1.5 items-start">
          {pickedWords.length === 0 ? (
            <span className="text-[12px] text-ink-faint italic self-center">Тапай слова знизу</span>
          ) : (
            pickedWords.map((wIdx, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPickedWords(pickedWords.filter((_, j) => j !== i))}
                className="px-3 py-1.5 rounded-xl bg-primary text-white text-[14px] font-bold"
              >
                {wordOptions[wIdx]}
              </button>
            ))
          )}
        </div>

        {/* Word bank */}
        <div className="flex flex-wrap gap-1.5">
          {wordOptions.map((word, i) => {
            const used = pickedWords.includes(i);
            return (
              <button
                key={i}
                type="button"
                disabled={used}
                onClick={() => setPickedWords([...pickedWords, i])}
                className={`px-3 py-1.5 rounded-xl border-2 text-[14px] font-bold transition-colors ${
                  used
                    ? 'border-border bg-surface-muted text-ink-faint cursor-default'
                    : 'border-border bg-white text-ink hover:border-primary/40'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (xType === 'theory') {
    // Word-of-day kind: question = the word; answer = { translation, example }
    const a = (answer ?? {}) as { translation?: string; example?: string | null };
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[28px] font-black text-ink text-center mt-2">{question || '—'}</p>
        {a.translation && (
          <div className="rounded-2xl bg-primary/10 px-4 py-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-primary-dark/70">переклад</p>
            <p className="text-[18px] font-black text-primary-dark mt-0.5">{a.translation}</p>
          </div>
        )}
        {a.example && (
          <div className="rounded-2xl bg-surface-muted px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-ink-faint">приклад</p>
            <p className="text-[14px] font-semibold text-ink mt-0.5 italic">{a.example}</p>
          </div>
        )}
      </div>
    );
  }

  if (xType === 'reading') {
    // Listening kind: question = prompt, meta = { audioUrl }
    const audioUrl = (meta as { audioUrl?: string } | null)?.audioUrl ?? '';
    return (
      <div className="flex flex-col gap-3">
        {audioUrl && (
          <audio controls src={audioUrl} className="w-full">
            <track kind="captions" />
          </audio>
        )}
        {question && <p className="text-[14px] font-semibold text-ink leading-relaxed">{question}</p>}
      </div>
    );
  }

  // Fallback for image / video / frame: render question only.
  return question ? (
    <p className="text-[14px] font-semibold text-ink leading-relaxed">{question}</p>
  ) : null;
}

// ─── Result screen ──────────────────────────────────────────────────────
function ResultScreen({
  result,
  task,
  onClose,
  onRetry,
}: {
  result: SubmitAttemptResult;
  task: MiniTask;
  onClose: () => void;
  onRetry: () => void;
}) {
  const xType = task.exercise?.type ?? 'theory';
  const correctText = useMemo(() => {
    if (!task.exercise) return null;
    const a = task.exercise.answer;
    if (xType === 'mcq') {
      const opts = asOptions(task.exercise.options);
      const idx = exerciseAnswerCorrectIndex(a, opts);
      return idx !== null && idx >= 0 ? opts[idx] : null;
    }
    if (typeof a === 'string') return a;
    if (xType === 'word-order' && Array.isArray(task.exercise.options)) {
      // The builder stores the full target sentence in `answer` for word-order.
      return typeof a === 'string' ? a : null;
    }
    return null;
  }, [task, xType]);

  const passed = result.correct || (result.score !== null && result.score >= 50);
  const pendingReview = result.score === null;

  return (
    <div className="flex flex-col gap-4 p-5 items-center text-center">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
          pendingReview
            ? 'bg-accent/15 text-accent-dark'
            : passed
              ? 'bg-primary/15 text-primary-dark animate-bounce-in'
              : 'bg-danger/10 text-danger-dark animate-shake'
        }`}
      >
        {pendingReview ? '⏳' : passed ? '🎉' : '😅'}
      </div>

      <p className="font-black text-ink text-xl">
        {pendingReview
          ? 'Відправлено на перевірку'
          : passed
            ? 'Молодець!'
            : 'Спробуй ще раз'}
      </p>

      {!pendingReview && result.score !== null && (
        <p className="text-[13px] font-semibold text-ink-muted tabular-nums">
          Оцінка: {pointsForScore(result.score)}/12
        </p>
      )}

      {(result.awardedCoins > 0 || result.xpDelta > 0) && (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {result.awardedCoins > 0 && (
            <RewardChip kind="coin" amount={result.awardedCoins} size="md" />
          )}
          {result.xpDelta > 0 && (
            <RewardChip kind="xp" amount={result.xpDelta} size="md" />
          )}
        </div>
      )}

      {result.levelUp && result.level !== null && (
        <div className="w-full rounded-2xl bg-xp-bg border-2 border-xp-border px-4 py-3 text-center animate-bounce-in">
          <p className="text-[10px] font-black uppercase tracking-wider text-xp/70">level up!</p>
          <p className="text-[18px] font-black text-xp mt-0.5">Рівень {result.level}</p>
        </div>
      )}

      {result.achievementsEarned.length > 0 && (
        <div className="w-full flex flex-col gap-1.5">
          {result.achievementsEarned.map((a) => (
            <div
              key={a.slug}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-accent/10 border-2 border-accent/40 animate-bounce-in"
            >
              <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center text-[20px] leading-none" aria-hidden>🏆</span>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[10px] font-black uppercase tracking-wider text-accent-dark/70 leading-tight">нове досягнення</p>
                <p className="text-[14px] font-black text-accent-dark truncate leading-tight mt-0.5">{a.title}</p>
              </div>
              {(a.coinReward > 0 || a.xpReward > 0) && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {a.coinReward > 0 && <RewardChip kind="coin" amount={a.coinReward} size="xs" />}
                  {a.xpReward > 0 && <RewardChip kind="xp" amount={a.xpReward} size="xs" />}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!passed && correctText && (
        <div className="w-full rounded-2xl bg-primary/10 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-primary-dark/70">правильна відповідь</p>
          <p className="text-[15px] font-black text-primary-dark mt-0.5">{correctText}</p>
        </div>
      )}

      {task.exercise?.explanation && (
        <p className="text-[13px] font-semibold text-ink-muted leading-relaxed">
          {task.exercise.explanation}
        </p>
      )}

      <div className="flex gap-2 w-full pt-2">
        {!passed && !pendingReview && (
          <KidsButton variant="secondary" size="md" onClick={onRetry} className="flex-1">
            Ще раз
          </KidsButton>
        )}
        <KidsButton variant="primary" size="md" onClick={onClose} className="flex-1">
          Готово
        </KidsButton>
      </div>
    </div>
  );
}
