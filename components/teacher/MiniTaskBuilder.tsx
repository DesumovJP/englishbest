'use client';
import { useMemo, useState } from 'react';
import { Modal } from '@/components/atoms/Modal';
import {
  MINI_TASK_DESCRIPTIONS,
  MINI_TASK_ICONS,
  MINI_TASK_LABELS,
  MOCK_GROUPS,
  MOCK_LIBRARY,
  MOCK_STUDENTS,
  type Level,
  type MiniTaskKind,
} from '@/lib/teacher-mocks';

interface MiniTaskBuilderProps {
  open: boolean;
  onClose: () => void;
}

type TargetKind = 'student' | 'group' | 'library';

interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

const KINDS: MiniTaskKind[] = ['level-quiz', 'quiz', 'daily-challenge', 'word-of-day', 'listening', 'sentence-builder'];
const LEVELS: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];

const STEP_LABELS = ['Тип', 'Контент', 'Рівень', 'Монети', 'Призначення'];

const inputCls =
  'w-full h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary';
const labelCls = 'text-xs font-black text-ink-muted uppercase tracking-wide';

export function MiniTaskBuilder({ open, onClose }: MiniTaskBuilderProps) {
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<MiniTaskKind>('quiz');

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { id: 'q1', prompt: '', options: ['', '', '', ''], correctIndex: 0 },
  ]);
  const [wordOfDay, setWordOfDay] = useState({ word: '', translation: '', example: '' });
  const [listeningUrl, setListeningUrl] = useState('');
  const [sentenceWords, setSentenceWords] = useState('');

  const [level, setLevel] = useState<Level>('A1');
  const [topic, setTopic] = useState('');
  const [durationMin, setDurationMin] = useState(5);

  const [coins, setCoins] = useState(10);

  const [targetKind, setTargetKind] = useState<TargetKind>('student');
  const [targetId, setTargetId] = useState('');
  const [saveTemplate, setSaveTemplate] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  const isContentValid = useMemo(() => {
    if (kind === 'word-of-day') return wordOfDay.word.trim() !== '' && wordOfDay.translation.trim() !== '';
    if (kind === 'listening')   return listeningUrl.trim() !== '' && questions[0]?.prompt.trim() !== '';
    if (kind === 'sentence-builder') return sentenceWords.trim().split(' ').length >= 3;
    return title.trim() !== '' && questions.every(q => q.prompt.trim() !== '' && q.options.some((o, i) => i === q.correctIndex && o.trim() !== ''));
  }, [kind, title, questions, wordOfDay, listeningUrl, sentenceWords]);

  function reset() {
    setStep(0);
    setKind('quiz');
    setTitle('');
    setQuestions([{ id: 'q1', prompt: '', options: ['', '', '', ''], correctIndex: 0 }]);
    setWordOfDay({ word: '', translation: '', example: '' });
    setListeningUrl('');
    setSentenceWords('');
    setLevel('A1');
    setTopic('');
    setDurationMin(5);
    setCoins(10);
    setTargetKind('student');
    setTargetId('');
    setSaveTemplate(false);
  }

  function closeAll() {
    reset();
    onClose();
  }

  function handleSubmit() {
    const t =
      targetKind === 'student' ? MOCK_STUDENTS.find(s => s.id === targetId)?.name :
      targetKind === 'group'   ? MOCK_GROUPS.find(g => g.id === targetId)?.name :
                                 MOCK_LIBRARY.find(l => l.id === targetId)?.title;
    setToast(`⚡ Міні-завдання створено для: ${t ?? '—'}${saveTemplate ? ' (+ шаблон)' : ''}`);
    window.setTimeout(() => {
      setToast(null);
      closeAll();
    }, 1500);
  }

  function addQuestion() {
    setQuestions(qs => [
      ...qs,
      { id: `q${qs.length + 1}`, prompt: '', options: ['', '', '', ''], correctIndex: 0 },
    ]);
  }

  function updateQuestion(idx: number, patch: Partial<QuizQuestion>) {
    setQuestions(qs => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }

  function removeQuestion(idx: number) {
    setQuestions(qs => (qs.length === 1 ? qs : qs.filter((_, i) => i !== idx)));
  }

  const canAdvance =
    step === 0 ? true :
    step === 1 ? isContentValid :
    step === 2 ? topic.trim() !== '' :
    step === 3 ? coins >= 1 && coins <= 20 :
    step === 4 ? targetId !== '' :
                 false;

  return (
    <Modal isOpen={open} onClose={closeAll} title="Нове міні-завдання">
      {toast ? (
        <div className="py-8 text-center">
          <p className="text-3xl mb-2">⚡</p>
          <p className="font-black text-ink">{toast}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Stepper */}
          <ol className="flex items-center gap-1">
            {STEP_LABELS.map((l, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <li key={l} className="flex-1 flex items-center gap-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => i <= step && setStep(i)}
                    disabled={i > step}
                    className={`flex items-center gap-1.5 min-w-0 text-xs font-bold ${
                      active ? 'text-primary-dark' :
                      done   ? 'text-ink' :
                               'text-ink-faint'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                      active ? 'bg-primary text-white' :
                      done   ? 'bg-primary/15 text-primary-dark' :
                               'bg-surface-muted text-ink-faint'
                    }`}>
                      {done ? '✓' : i + 1}
                    </span>
                    <span className="truncate hidden sm:inline">{l}</span>
                  </button>
                  {i < STEP_LABELS.length - 1 && (
                    <span className={`flex-1 h-0.5 rounded-full ${done ? 'bg-primary/30' : 'bg-border'}`} aria-hidden />
                  )}
                </li>
              );
            })}
          </ol>

          {/* Step body */}
          {step === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {KINDS.map(k => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setKind(k)}
                  className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-colors ${
                    kind === k
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="text-2xl" aria-hidden>{MINI_TASK_ICONS[k]}</span>
                  <p className="text-sm font-black text-ink">{MINI_TASK_LABELS[k]}</p>
                  <p className="text-[11px] text-ink-muted leading-tight">{MINI_TASK_DESCRIPTIONS[k]}</p>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <ContentStep
              kind={kind}
              title={title}
              setTitle={setTitle}
              questions={questions}
              addQuestion={addQuestion}
              updateQuestion={updateQuestion}
              removeQuestion={removeQuestion}
              wordOfDay={wordOfDay}
              setWordOfDay={setWordOfDay}
              listeningUrl={listeningUrl}
              setListeningUrl={setListeningUrl}
              sentenceWords={sentenceWords}
              setSentenceWords={setSentenceWords}
            />
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Рівень</label>
                <div className="grid grid-cols-6 gap-1.5 mt-1.5">
                  {LEVELS.map(l => (
                    <button
                      type="button"
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`h-10 rounded-xl border text-xs font-black transition-colors ${
                        level === l
                          ? 'border-primary bg-primary/10 text-primary-dark'
                          : 'border-border text-ink-muted hover:border-primary/40'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls} htmlFor="mt-topic">Тема</label>
                <input
                  id="mt-topic"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Напр. Present Simple, Food vocabulary…"
                  className={`${inputCls} mt-1.5`}
                />
              </div>
              <div>
                <label className={labelCls}>Тривалість (хв)</label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={1}
                    value={durationMin}
                    onChange={e => setDurationMin(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="w-14 text-right font-black text-ink">{durationMin} хв</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Нагорода в монетах (1–20)</label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={coins}
                    onChange={e => setCoins(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="w-20 text-right font-black text-ink">🪙 {coins}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-coin-bg/40 border border-coin-border text-xs text-ink-muted">
                Монети нараховуються за повне проходження. Часткове — пропорційно до результату.
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                {(['student', 'group', 'library'] as const).map(t => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => { setTargetKind(t); setTargetId(''); }}
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${
                      targetKind === t
                        ? 'border-primary bg-primary/10 text-primary-dark'
                        : 'border-border text-ink-muted hover:border-primary/40'
                    }`}
                  >
                    {t === 'student' ? 'Учень' : t === 'group' ? 'Група' : 'Бібліотека'}
                  </button>
                ))}
              </div>
              <select
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                className={inputCls}
              >
                <option value="">Обрати…</option>
                {(targetKind === 'student' ? MOCK_STUDENTS :
                  targetKind === 'group'   ? MOCK_GROUPS   :
                                             MOCK_LIBRARY
                ).map(item => (
                  <option key={item.id} value={item.id}>
                    {'name' in item ? item.name : item.title}
                    {'level' in item ? ` · ${item.level}` : ''}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-xs text-ink">
                <input
                  type="checkbox"
                  checked={saveTemplate}
                  onChange={e => setSaveTemplate(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                Зберегти як шаблон для майбутніх завдань
              </label>

              <SummaryCard
                kind={kind}
                level={level}
                topic={topic}
                durationMin={durationMin}
                coins={coins}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={step === 0 ? closeAll : () => setStep(s => s - 1)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-ink-muted hover:text-ink"
            >
              {step === 0 ? 'Скасувати' : '← Назад'}
            </button>
            {step < STEP_LABELS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Далі →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canAdvance}
                className="px-4 py-2 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                ⚡ Створити
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function ContentStep({
  kind,
  title,
  setTitle,
  questions,
  addQuestion,
  updateQuestion,
  removeQuestion,
  wordOfDay,
  setWordOfDay,
  listeningUrl,
  setListeningUrl,
  sentenceWords,
  setSentenceWords,
}: {
  kind: MiniTaskKind;
  title: string;
  setTitle: (v: string) => void;
  questions: QuizQuestion[];
  addQuestion: () => void;
  updateQuestion: (i: number, patch: Partial<QuizQuestion>) => void;
  removeQuestion: (i: number) => void;
  wordOfDay: { word: string; translation: string; example: string };
  setWordOfDay: (v: { word: string; translation: string; example: string }) => void;
  listeningUrl: string;
  setListeningUrl: (v: string) => void;
  sentenceWords: string;
  setSentenceWords: (v: string) => void;
}) {
  if (kind === 'word-of-day') {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls}>Слово</label>
          <input value={wordOfDay.word} onChange={e => setWordOfDay({ ...wordOfDay, word: e.target.value })} placeholder="brilliant" className={`${inputCls} mt-1.5`} />
        </div>
        <div>
          <label className={labelCls}>Переклад</label>
          <input value={wordOfDay.translation} onChange={e => setWordOfDay({ ...wordOfDay, translation: e.target.value })} placeholder="блискучий, чудовий" className={`${inputCls} mt-1.5`} />
        </div>
        <div>
          <label className={labelCls}>Приклад у реченні</label>
          <input value={wordOfDay.example} onChange={e => setWordOfDay({ ...wordOfDay, example: e.target.value })} placeholder="Her idea was absolutely brilliant." className={`${inputCls} mt-1.5`} />
        </div>
      </div>
    );
  }

  if (kind === 'listening') {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls}>URL аудіо</label>
          <input value={listeningUrl} onChange={e => setListeningUrl(e.target.value)} placeholder="https://…" className={`${inputCls} mt-1.5`} />
        </div>
        <div>
          <label className={labelCls}>Питання на розуміння</label>
          <input value={questions[0]?.prompt ?? ''} onChange={e => updateQuestion(0, { prompt: e.target.value })} placeholder="What did the speaker order?" className={`${inputCls} mt-1.5`} />
        </div>
      </div>
    );
  }

  if (kind === 'sentence-builder') {
    return (
      <div>
        <label className={labelCls}>Слова у правильному порядку (через пробіл)</label>
        <input
          value={sentenceWords}
          onChange={e => setSentenceWords(e.target.value)}
          placeholder="I have never been to Paris"
          className={`${inputCls} mt-1.5`}
        />
        <p className="mt-1.5 text-[11px] text-ink-muted">
          Учень побачить перемішані слова — має зібрати у правильному порядку.
        </p>
      </div>
    );
  }

  // quiz, level-quiz, daily-challenge
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={labelCls}>Назва</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Past Simple quiz" className={`${inputCls} mt-1.5`} />
      </div>
      <div className="flex flex-col gap-3">
        {questions.map((q, idx) => (
          <div key={q.id} className="p-3 rounded-xl border border-border bg-surface-muted/40 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-ink-muted">Питання {idx + 1}</span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(idx)}
                  className="text-xs text-danger-dark hover:underline"
                >
                  Видалити
                </button>
              )}
            </div>
            <input
              value={q.prompt}
              onChange={e => updateQuestion(idx, { prompt: e.target.value })}
              placeholder="Текст питання…"
              className={inputCls}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                    q.correctIndex === oi ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctIndex === oi}
                    onChange={() => updateQuestion(idx, { correctIndex: oi })}
                    className="accent-primary"
                  />
                  <input
                    value={opt}
                    onChange={e => updateQuestion(idx, { options: q.options.map((x, i) => i === oi ? e.target.value : x) })}
                    placeholder={`Варіант ${oi + 1}`}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
        {questions.length < 10 && (
          <button
            type="button"
            onClick={addQuestion}
            className="px-3 h-10 rounded-xl border border-dashed border-border text-sm font-bold text-ink-muted hover:border-primary/40 hover:text-primary-dark transition-colors"
          >
            + Додати питання
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  kind,
  level,
  topic,
  durationMin,
  coins,
}: {
  kind: MiniTaskKind;
  level: Level;
  topic: string;
  durationMin: number;
  coins: number;
}) {
  return (
    <div className="p-3 rounded-xl bg-surface-muted border border-border flex flex-col gap-1 text-xs text-ink-muted">
      <div className="flex items-center gap-2 text-sm font-black text-ink">
        <span aria-hidden>{MINI_TASK_ICONS[kind]}</span>
        {MINI_TASK_LABELS[kind]}
      </div>
      <p>Рівень {level} · {topic || '—'} · {durationMin} хв · 🪙 {coins}</p>
    </div>
  );
}
