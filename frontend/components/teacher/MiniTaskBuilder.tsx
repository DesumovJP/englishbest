/**
 * MiniTaskBuilder — wizard modal that creates or edits a template.
 *
 * Steps:
 *   0. Kind (quiz / level-quiz / daily-challenge / word-of-day / listening / sentence-builder)
 *   1. Content (kind-specific exercise body → mapped to `lesson.exercise` component)
 *   2. Metadata (title + topic + level + duration + coins + isPublic)
 *
 * When `initialTask` is provided the wizard opens in edit mode: state is
 * prefilled from the task and submit calls `updateMiniTask` instead of
 * `createMiniTask`. On success the saved record is returned via `onSaved`.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { Switch } from '@/components/ui/Switch';
import {
  createMiniTask,
  KIND_LABEL,
  updateMiniTask,
  type MiniTask,
  type MiniTaskExerciseInput,
  type MiniTaskInput,
  type MiniTaskKind,
  type MiniTaskLevel,
} from '@/lib/mini-tasks';

const KINDS: MiniTaskKind[] = [
  'quiz', 'level-quiz', 'daily-challenge',
  'word-of-day', 'listening', 'sentence-builder',
];
const LEVELS: MiniTaskLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const KIND_DESCRIPTIONS: Record<MiniTaskKind, string> = {
  quiz: 'Декілька MCQ-питань на тему',
  'level-quiz': 'Швидка перевірка рівня учня',
  'daily-challenge': 'Щоденне коротке завдання',
  'word-of-day': 'Нове слово + переклад + приклад',
  listening: 'Аудіо + питання на розуміння',
  'sentence-builder': 'Скласти речення зі слів',
};

const STEP_LABELS = ['Тип', 'Контент', 'Параметри'];

interface MiniTaskBuilderProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (task: MiniTask) => void;
  initialTask?: MiniTask | null;
}

export function MiniTaskBuilder({ open, onClose, onSaved, initialTask }: MiniTaskBuilderProps) {
  const isEdit = Boolean(initialTask);
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<MiniTaskKind>('quiz');

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<MiniTaskLevel>('A1');
  const [durationMin, setDurationMin] = useState(5);
  const [coinReward, setCoinReward] = useState(10);
  const [isPublic, setIsPublic] = useState(false);

  const [mcqPrompt, setMcqPrompt] = useState('');
  const [mcqOptions, setMcqOptions] = useState<string[]>(['', '', '', '']);
  const [mcqCorrect, setMcqCorrect] = useState(0);
  const [mcqExplanation, setMcqExplanation] = useState('');

  const [wordOfDay, setWordOfDay] = useState({ word: '', translation: '', example: '' });

  const [audioUrl, setAudioUrl] = useState('');
  const [listeningPrompt, setListeningPrompt] = useState('');

  const [targetSentence, setTargetSentence] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStep(0);
    setKind('quiz');
    setTitle('');
    setTopic('');
    setLevel('A1');
    setDurationMin(5);
    setCoinReward(10);
    setIsPublic(false);
    setMcqPrompt('');
    setMcqOptions(['', '', '', '']);
    setMcqCorrect(0);
    setMcqExplanation('');
    setWordOfDay({ word: '', translation: '', example: '' });
    setAudioUrl('');
    setListeningPrompt('');
    setTargetSentence('');
    setError(null);
    setSaving(false);
  }

  function closeAll() {
    reset();
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    if (!initialTask) {
      reset();
      return;
    }
    setStep(0);
    setError(null);
    setSaving(false);
    setKind(initialTask.kind);
    setTitle(initialTask.title);
    setTopic(initialTask.topic);
    setLevel(initialTask.level ?? 'A1');
    setDurationMin(initialTask.durationMin);
    setCoinReward(initialTask.coinReward);
    setIsPublic(initialTask.isPublic);

    setMcqPrompt('');
    setMcqOptions(['', '', '', '']);
    setMcqCorrect(0);
    setMcqExplanation('');
    setWordOfDay({ word: '', translation: '', example: '' });
    setAudioUrl('');
    setListeningPrompt('');
    setTargetSentence('');

    const ex = initialTask.exercise;
    if (!ex) return;

    if (initialTask.kind === 'word-of-day') {
      const a = (ex.answer && typeof ex.answer === 'object' ? ex.answer : {}) as {
        translation?: unknown; example?: unknown;
      };
      setWordOfDay({
        word: ex.question ?? '',
        translation: typeof a.translation === 'string' ? a.translation : '',
        example:
          typeof a.example === 'string'
            ? a.example
            : ex.explanation ?? '',
      });
    } else if (initialTask.kind === 'listening') {
      setListeningPrompt(ex.question ?? '');
      const m = (ex.meta && typeof ex.meta === 'object' ? ex.meta : {}) as { audioUrl?: unknown };
      setAudioUrl(typeof m.audioUrl === 'string' ? m.audioUrl : '');
    } else if (initialTask.kind === 'sentence-builder') {
      setTargetSentence(typeof ex.answer === 'string' ? ex.answer : '');
    } else {
      setMcqPrompt(ex.question ?? '');
      const rawOpts = Array.isArray(ex.options) ? (ex.options as unknown[]).map(String) : [];
      const padded = [...rawOpts, '', '', '', ''].slice(0, 4);
      setMcqOptions(padded);
      const a = (ex.answer && typeof ex.answer === 'object' ? ex.answer : {}) as {
        correct?: unknown; correctIndex?: unknown;
      };
      let idx = 0;
      if (typeof a.correctIndex === 'number') {
        idx = Math.max(0, Math.min(3, a.correctIndex));
      } else if (typeof a.correct === 'string') {
        const found = padded.findIndex((o) => o === a.correct);
        if (found >= 0) idx = found;
      }
      setMcqCorrect(idx);
      setMcqExplanation(ex.explanation ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialTask?.documentId]);

  const isContentValid = useMemo(() => {
    if (kind === 'word-of-day') {
      return wordOfDay.word.trim() !== '' && wordOfDay.translation.trim() !== '';
    }
    if (kind === 'listening') {
      return audioUrl.trim() !== '' && listeningPrompt.trim() !== '';
    }
    if (kind === 'sentence-builder') {
      return targetSentence.trim().split(/\s+/).filter(Boolean).length >= 3;
    }
    if (!mcqPrompt.trim()) return false;
    const nonEmpty = mcqOptions.filter(o => o.trim() !== '').length;
    if (nonEmpty < 2) return false;
    return (mcqOptions[mcqCorrect]?.trim() ?? '') !== '';
  }, [kind, mcqPrompt, mcqOptions, mcqCorrect, wordOfDay, audioUrl, listeningPrompt, targetSentence]);

  const canAdvance =
    step === 0 ? true :
    step === 1 ? isContentValid :
    step === 2 ? title.trim() !== '' && topic.trim() !== '' && coinReward >= 1 && coinReward <= 50 :
                 false;

  function buildExerciseInput(): MiniTaskExerciseInput {
    if (kind === 'word-of-day') {
      return {
        type: 'theory',
        question: wordOfDay.word.trim(),
        answer: {
          translation: wordOfDay.translation.trim(),
          example: wordOfDay.example.trim() || null,
        },
        explanation: wordOfDay.example.trim() || null,
        points: 10,
      };
    }
    if (kind === 'listening') {
      return {
        type: 'reading',
        question: listeningPrompt.trim(),
        meta: { audioUrl: audioUrl.trim() },
        points: 15,
      };
    }
    if (kind === 'sentence-builder') {
      const target = targetSentence.trim();
      const words = target.split(/\s+/).filter(Boolean);
      return {
        type: 'word-order',
        question: 'Збери речення у правильному порядку',
        options: words,
        answer: target,
        points: 10,
      };
    }
    const cleanOptions = mcqOptions.map(o => o.trim()).filter(o => o !== '');
    const correctText = mcqOptions[mcqCorrect]?.trim() ?? '';
    return {
      type: 'mcq',
      question: mcqPrompt.trim(),
      options: cleanOptions,
      answer: { correct: correctText, correctIndex: cleanOptions.indexOf(correctText) },
      explanation: mcqExplanation.trim() || null,
      points: 10,
    };
  }

  async function handleSubmit() {
    if (!canAdvance || saving) return;
    setSaving(true);
    setError(null);
    try {
      const payload: MiniTaskInput = {
        title: title.trim(),
        topic: topic.trim(),
        kind,
        level,
        durationMin,
        coinReward,
        isPublic,
        exercise: buildExerciseInput(),
      };
      const saved = isEdit && initialTask
        ? await updateMiniTask(initialTask.documentId, payload)
        : await createMiniTask(payload);
      onSaved?.(saved);
      closeAll();
    } catch (e: any) {
      setError(e?.message ?? 'Не вдалось зберегти');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={open} onClose={closeAll} title={isEdit ? 'Редагувати міні-завдання' : 'Нове міні-завдання'}>
      <div className="flex flex-col gap-5">
        <ol className="flex items-center gap-1.5">
          {STEP_LABELS.map((l, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <li key={l} className="flex-1 flex items-center gap-1.5 min-w-0">
                <button
                  type="button"
                  onClick={() => i <= step && setStep(i)}
                  disabled={i > step}
                  className="flex items-center gap-1.5 min-w-0 text-left disabled:cursor-not-allowed"
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold tabular-nums flex-shrink-0 ${
                    active ? 'bg-primary text-white' :
                    done   ? 'bg-primary/15 text-ink' :
                             'bg-surface-muted text-ink-faint'
                  }`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <span className={`truncate hidden sm:inline text-[11px] font-medium ${
                    active ? 'text-ink' : done ? 'text-ink-muted' : 'text-ink-faint'
                  }`}>{l}</span>
                </button>
                {i < STEP_LABELS.length - 1 && (
                  <span className={`flex-1 h-px ${done ? 'bg-primary/25' : 'bg-border'}`} aria-hidden />
                )}
              </li>
            );
          })}
        </ol>

        {step === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {KINDS.map(k => (
              <button
                type="button"
                key={k}
                onClick={() => setKind(k)}
                className={`flex flex-col items-start gap-1 p-3 rounded-md border text-left transition-colors ${
                  kind === k
                    ? 'border-primary bg-surface-muted'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <p className="text-[13px] font-semibold text-ink">{KIND_LABEL[k]}</p>
                <p className="text-[11px] text-ink-muted leading-snug">{KIND_DESCRIPTIONS[k]}</p>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <ContentStep
            kind={kind}
            mcqPrompt={mcqPrompt} setMcqPrompt={setMcqPrompt}
            mcqOptions={mcqOptions} setMcqOptions={setMcqOptions}
            mcqCorrect={mcqCorrect} setMcqCorrect={setMcqCorrect}
            mcqExplanation={mcqExplanation} setMcqExplanation={setMcqExplanation}
            wordOfDay={wordOfDay} setWordOfDay={setWordOfDay}
            audioUrl={audioUrl} setAudioUrl={setAudioUrl}
            listeningPrompt={listeningPrompt} setListeningPrompt={setListeningPrompt}
            targetSentence={targetSentence} setTargetSentence={setTargetSentence}
          />
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <FormField label="Назва">
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Past Simple quiz" />
            </FormField>
            <FormField label="Тема">
              <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Present Simple, Food vocab…" />
            </FormField>
            <div>
              <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-1.5">Рівень</p>
              <div className="grid grid-cols-7 gap-1.5">
                {LEVELS.map(l => (
                  <button
                    type="button"
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`h-9 rounded-md border text-[12px] font-semibold tabular-nums transition-colors ${
                      level === l
                        ? 'border-primary bg-surface-muted text-ink'
                        : 'border-border text-ink-muted hover:text-ink hover:border-primary/40'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-1.5">
                  Тривалість: {durationMin} хв
                </p>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={durationMin}
                  onChange={e => setDurationMin(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-1.5">
                  Монети: {coinReward}
                </p>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={coinReward}
                  onChange={e => setCoinReward(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 py-2 border-t border-border">
              <div>
                <p className="text-[13px] font-semibold text-ink">Публічне</p>
                <p className="text-[11px] text-ink-muted">Доступне всім вчителям та учням</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} label="Публічне" />
            </div>
          </div>
        )}

        {error && (
          <div className="text-[12px] text-danger-dark border border-danger/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
          <Button
            variant="secondary"
            onClick={step === 0 ? closeAll : () => setStep(s => s - 1)}
          >
            {step === 0 ? 'Скасувати' : 'Назад'}
          </Button>
          {step < STEP_LABELS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance}>
              Далі
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canAdvance} loading={saving}>
              {saving ? 'Збереження…' : isEdit ? 'Зберегти' : 'Створити'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ContentStep({
  kind,
  mcqPrompt, setMcqPrompt,
  mcqOptions, setMcqOptions,
  mcqCorrect, setMcqCorrect,
  mcqExplanation, setMcqExplanation,
  wordOfDay, setWordOfDay,
  audioUrl, setAudioUrl,
  listeningPrompt, setListeningPrompt,
  targetSentence, setTargetSentence,
}: {
  kind: MiniTaskKind;
  mcqPrompt: string; setMcqPrompt: (v: string) => void;
  mcqOptions: string[]; setMcqOptions: (v: string[]) => void;
  mcqCorrect: number; setMcqCorrect: (v: number) => void;
  mcqExplanation: string; setMcqExplanation: (v: string) => void;
  wordOfDay: { word: string; translation: string; example: string };
  setWordOfDay: (v: { word: string; translation: string; example: string }) => void;
  audioUrl: string; setAudioUrl: (v: string) => void;
  listeningPrompt: string; setListeningPrompt: (v: string) => void;
  targetSentence: string; setTargetSentence: (v: string) => void;
}) {
  if (kind === 'word-of-day') {
    return (
      <div className="flex flex-col gap-3">
        <FormField label="Слово">
          <Input value={wordOfDay.word} onChange={e => setWordOfDay({ ...wordOfDay, word: e.target.value })} placeholder="brilliant" />
        </FormField>
        <FormField label="Переклад">
          <Input value={wordOfDay.translation} onChange={e => setWordOfDay({ ...wordOfDay, translation: e.target.value })} placeholder="блискучий, чудовий" />
        </FormField>
        <FormField label="Приклад у реченні">
          <Input value={wordOfDay.example} onChange={e => setWordOfDay({ ...wordOfDay, example: e.target.value })} placeholder="Her idea was absolutely brilliant." />
        </FormField>
      </div>
    );
  }

  if (kind === 'listening') {
    return (
      <div className="flex flex-col gap-3">
        <FormField label="URL аудіо">
          <Input type="url" value={audioUrl} onChange={e => setAudioUrl(e.target.value)} placeholder="https://…" />
        </FormField>
        <FormField label="Питання на розуміння">
          <Textarea value={listeningPrompt} onChange={e => setListeningPrompt(e.target.value)} placeholder="What did the speaker order?" />
        </FormField>
      </div>
    );
  }

  if (kind === 'sentence-builder') {
    return (
      <FormField
        label="Правильне речення"
        hint="Учень побачить слова у випадковому порядку — треба зібрати у правильному."
      >
        <Input value={targetSentence} onChange={e => setTargetSentence(e.target.value)} placeholder="I have never been to Paris" />
      </FormField>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <FormField label="Питання">
        <Textarea value={mcqPrompt} onChange={e => setMcqPrompt(e.target.value)} placeholder="Which verb form is correct?" />
      </FormField>
      <div>
        <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-1.5">Варіанти</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {mcqOptions.map((opt, oi) => (
            <label
              key={oi}
              className={`flex items-center gap-2 px-2.5 h-9 rounded-md border text-[13px] cursor-pointer transition-colors ${
                mcqCorrect === oi ? 'border-primary bg-white' : 'border-border bg-white'
              }`}
            >
              <input
                type="radio"
                name="mcq-correct"
                checked={mcqCorrect === oi}
                onChange={() => setMcqCorrect(oi)}
                className="accent-primary"
              />
              <input
                value={opt}
                onChange={e => {
                  const next = mcqOptions.slice();
                  next[oi] = e.target.value;
                  setMcqOptions(next);
                }}
                placeholder={`Варіант ${oi + 1}`}
                className="flex-1 bg-transparent text-[13px] focus:outline-none"
              />
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-ink-muted">Виберіть правильну відповідь радіокнопкою.</p>
      </div>
      <FormField label="Пояснення (необов'язково)">
        <Textarea value={mcqExplanation} onChange={e => setMcqExplanation(e.target.value)} placeholder="Чому саме цей варіант правильний" />
      </FormField>
    </div>
  );
}
