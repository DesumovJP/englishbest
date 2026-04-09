'use client';
import { useState } from 'react';
import type { LessonStep, StepMultipleChoice, StepFillBlank, StepWordOrder, StepTheory, StepTranslate, StepMatchPairs, StepImage, StepVideo, StepReading } from '@/mocks/lessons/types';
import { LessonEngine } from '@/components/lesson/LessonEngine';

/* ─── Палітра типів кроків ───────────────────── */
const EXERCISE_TYPES = [
  { type: 'theory',          label: 'Теорія',           emoji: '📖', desc: 'Пояснення + таблиця слів' },
  { type: 'multiple-choice', label: 'Вибір відповіді',  emoji: '☑️', desc: '4 варіанти, 1 правильний' },
  { type: 'fill-blank',      label: 'Заповніть пропуск',emoji: '✏️', desc: 'Речення з пропуском' },
  { type: 'word-order',      label: 'Склади речення',   emoji: '🔤', desc: 'Перетягнути слова' },
  { type: 'match-pairs',     label: "З'єднай пари",     emoji: '🔗', desc: 'Слово ↔ переклад' },
  { type: 'translate',       label: 'Переклад',          emoji: '🌐', desc: 'Написати переклад' },
  { type: 'reading',         label: 'Читання',            emoji: '📚', desc: 'Текст + питання розуміння' },
] as const;

const MEDIA_TYPES = [
  { type: 'image', label: 'Зображення', emoji: '🖼️', desc: 'Вставте URL картинки' },
  { type: 'video', label: 'Відео',      emoji: '🎬', desc: 'YouTube / Vimeo посилання' },
] as const;

const STEP_TYPES = [...EXERCISE_TYPES, ...MEDIA_TYPES] as const;

/* ─── Дефолтні значення для кожного типу ────── */
function createStep(type: LessonStep['type']): LessonStep {
  const id = `step-${Date.now()}`;
  switch (type) {
    case 'theory':
      return { id, type, title: 'Нова тема', body: 'Опис теми...', examples: [{ en: 'word', ua: 'слово' }] };
    case 'multiple-choice':
      return { id, type, question: 'Питання?', options: ['Варіант A', 'Варіант B', 'Варіант C', 'Варіант D'], correctIndex: 0 };
    case 'fill-blank':
      return { id, type, before: 'I drink a glass of', after: 'every morning.', answer: 'milk' };
    case 'word-order':
      return { id, type, prompt: 'Склади речення:', translation: 'Переклад речення', words: ['I', 'like', 'English'], answer: ['I', 'like', 'English'] };
    case 'match-pairs':
      return { id, type, prompt: "З'єднай пари:", pairs: [{ left: 'cat', right: 'кіт' }, { left: 'dog', right: 'пес' }] };
    case 'translate':
      return { id, type, prompt: 'Перекладіть:', sentence: 'Речення для перекладу.', answer: 'Translation here.', acceptedAnswers: ['Translation here.'] };
    case 'image':
      return { id, type, title: 'Назва зображення', url: '', caption: '' };
    case 'video':
      return { id, type, title: 'Назва відео', url: '', caption: '' };
    case 'reading':
      return { id, type, title: 'Назва тексту', text: 'Текст для читання англійською...', vocabulary: [{ word: 'example', translation: 'приклад' }], questions: [{ id: `q-${Date.now()}`, question: 'Питання українською?', options: ['Варіант A', 'Варіант B', 'Варіант C', 'Варіант D'], correctIndex: 0 }] };
  }
}

/* ─── Форма редагування кроку ────────────────── */
function StepEditor({ step, onChange }: { step: LessonStep; onChange: (s: LessonStep) => void }) {
  const inputCls = 'w-full h-10 px-3 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors';
  const labelCls = 'text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block';

  if (step.type === 'theory') {
    const s = step as StepTheory;
    return (
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Заголовок</label>
          <input className={inputCls} value={s.title} onChange={e => onChange({ ...s, title: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Текст пояснення</label>
          <textarea className="w-full px-3 py-2 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors resize-none" rows={3} value={s.body} onChange={e => onChange({ ...s, body: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Слова (EN → UA)</label>
          <div className="flex flex-col gap-2">
            {s.examples.map((ex, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input className={inputCls} placeholder="english" value={ex.en} onChange={e => { const ex2 = [...s.examples]; ex2[i] = { ...ex2[i], en: e.target.value }; onChange({ ...s, examples: ex2 }); }} />
                <span className="text-ink-muted flex-shrink-0">→</span>
                <input className={inputCls} placeholder="переклад" value={ex.ua} onChange={e => { const ex2 = [...s.examples]; ex2[i] = { ...ex2[i], ua: e.target.value }; onChange({ ...s, examples: ex2 }); }} />
                <button onClick={() => onChange({ ...s, examples: s.examples.filter((_, j) => j !== i) })} className="text-danger text-xs font-bold hover:underline flex-shrink-0">✕</button>
              </div>
            ))}
            <button onClick={() => onChange({ ...s, examples: [...s.examples, { en: '', ua: '' }] })} className="text-xs font-bold text-primary-dark hover:underline text-left">+ Додати слово</button>
          </div>
        </div>
        <div>
          <label className={labelCls}>Підказка (необов&apos;язково)</label>
          <input className={inputCls} value={s.tip ?? ''} placeholder="💡 Підказка…" onChange={e => onChange({ ...s, tip: e.target.value })} />
        </div>
      </div>
    );
  }

  if (step.type === 'multiple-choice') {
    const s = step as StepMultipleChoice;
    return (
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Питання</label>
          <input className={inputCls} value={s.question} onChange={e => onChange({ ...s, question: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Варіанти (відмітити правильний)</label>
          <div className="flex flex-col gap-2">
            {s.options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <button
                  onClick={() => onChange({ ...s, correctIndex: i })}
                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors ${s.correctIndex === i ? 'border-primary bg-primary' : 'border-border'}`}
                  aria-label={`Варіант ${i + 1} ${s.correctIndex === i ? '(правильний)' : ''}`}
                />
                <input className={inputCls} value={opt} onChange={e => { const opts = [...s.options]; opts[i] = e.target.value; onChange({ ...s, options: opts }); }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Пояснення (необов&apos;язково)</label>
          <input className={inputCls} value={s.explanation ?? ''} onChange={e => onChange({ ...s, explanation: e.target.value })} />
        </div>
      </div>
    );
  }

  if (step.type === 'fill-blank') {
    const s = step as StepFillBlank;
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-surface-muted rounded-xl p-3 text-sm text-ink-muted">
          Речення буде виглядати: <strong>{s.before}</strong> [пропуск] <strong>{s.after}</strong>
        </div>
        <div>
          <label className={labelCls}>Текст ДО пропуску</label>
          <input className={inputCls} value={s.before} onChange={e => onChange({ ...s, before: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Текст ПІСЛЯ пропуску</label>
          <input className={inputCls} value={s.after} onChange={e => onChange({ ...s, after: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Правильна відповідь</label>
          <input className={inputCls} value={s.answer} onChange={e => onChange({ ...s, answer: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Підказка</label>
          <input className={inputCls} value={s.hint ?? ''} onChange={e => onChange({ ...s, hint: e.target.value })} />
        </div>
      </div>
    );
  }

  if (step.type === 'word-order') {
    const s = step as StepWordOrder;
    const wordsStr = s.words.join(' ');
    return (
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Підказка (укр. переклад)</label>
          <input className={inputCls} value={s.translation} onChange={e => onChange({ ...s, translation: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Слова (через пробіл, у правильному порядку)</label>
          <input
            className={inputCls}
            value={wordsStr}
            onChange={e => {
              const words = e.target.value.split(' ').filter(Boolean);
              onChange({ ...s, words, answer: words });
            }}
          />
          <p className="text-xs text-ink-muted mt-1">Слова будуть перемішані автоматично для учня</p>
        </div>
      </div>
    );
  }

  if (step.type === 'translate') {
    const s = step as StepTranslate;
    return (
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Речення для перекладу</label>
          <input className={inputCls} value={s.sentence} onChange={e => onChange({ ...s, sentence: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Еталонна відповідь</label>
          <input className={inputCls} value={s.answer} onChange={e => onChange({ ...s, answer: e.target.value, acceptedAnswers: [e.target.value] })} />
        </div>
        <div>
          <label className={labelCls}>Додаткові прийнятні варіанти (через Enter)</label>
          <textarea
            className="w-full px-3 py-2 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors resize-none"
            rows={3}
            value={s.acceptedAnswers.join('\n')}
            onChange={e => onChange({ ...s, acceptedAnswers: e.target.value.split('\n').filter(Boolean) })}
          />
        </div>
      </div>
    );
  }

  if (step.type === 'match-pairs') {
    const s = step as StepMatchPairs;
    return (
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Заголовок</label>
          <input className={inputCls} value={s.prompt} onChange={e => onChange({ ...s, prompt: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Пари (ліво → право)</label>
          <div className="flex flex-col gap-2">
            {s.pairs.map((pair, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input className={inputCls} placeholder="English" value={pair.left} onChange={e => { const p = [...s.pairs]; p[i] = { ...p[i], left: e.target.value }; onChange({ ...s, pairs: p }); }} />
                <span className="text-ink-muted flex-shrink-0 text-sm">↔</span>
                <input className={inputCls} placeholder="Переклад" value={pair.right} onChange={e => { const p = [...s.pairs]; p[i] = { ...p[i], right: e.target.value }; onChange({ ...s, pairs: p }); }} />
                <button onClick={() => onChange({ ...s, pairs: s.pairs.filter((_, j) => j !== i) })} className="text-danger text-xs font-bold hover:underline flex-shrink-0">✕</button>
              </div>
            ))}
            <button onClick={() => onChange({ ...s, pairs: [...s.pairs, { left: '', right: '' }] })} className="text-xs font-bold text-primary-dark hover:underline text-left">+ Додати пару</button>
          </div>
        </div>
      </div>
    );
  }

  if (step.type === 'image') {
    const s = step as StepImage;
    return (
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Назва</label>
          <input className={inputCls} value={s.title} onChange={e => onChange({ ...s, title: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>URL зображення</label>
          <input className={inputCls} placeholder="https://..." value={s.url} onChange={e => onChange({ ...s, url: e.target.value })} />
        </div>
        {s.url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={s.url} alt={s.title} className="w-full rounded-xl border border-border object-cover max-h-48" />
        )}
        <div>
          <label className={labelCls}>Підпис (необов&apos;язково)</label>
          <input className={inputCls} value={s.caption ?? ''} placeholder="Опис зображення…" onChange={e => onChange({ ...s, caption: e.target.value })} />
        </div>
      </div>
    );
  }

  if (step.type === 'video') {
    const s = step as StepVideo;
    return (
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Назва відео</label>
          <input className={inputCls} value={s.title} onChange={e => onChange({ ...s, title: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Посилання (YouTube / Vimeo)</label>
          <input className={inputCls} placeholder="https://youtube.com/watch?v=..." value={s.url} onChange={e => onChange({ ...s, url: e.target.value })} />
          <p className="text-xs text-ink-muted mt-1">Підтримуються youtube.com, youtu.be, vimeo.com</p>
        </div>
        <div>
          <label className={labelCls}>Підпис (необов&apos;язково)</label>
          <input className={inputCls} value={s.caption ?? ''} placeholder="Коментар до відео…" onChange={e => onChange({ ...s, caption: e.target.value })} />
        </div>
      </div>
    );
  }

  if (step.type === 'reading') {
    const s = step as StepReading;
    return (
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Заголовок тексту</label>
          <input className={inputCls} value={s.title} onChange={e => onChange({ ...s, title: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Текст для читання (англійською)</label>
          <textarea className="w-full px-3 py-2 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors resize-none" rows={5} value={s.text} onChange={e => onChange({ ...s, text: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Словник (підсвічені слова)</label>
          <div className="flex flex-col gap-2">
            {s.vocabulary.map((v, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input className={inputCls} placeholder="word" value={v.word} onChange={e => { const voc = [...s.vocabulary]; voc[i] = { ...voc[i], word: e.target.value }; onChange({ ...s, vocabulary: voc }); }} />
                <span className="text-ink-muted flex-shrink-0">→</span>
                <input className={inputCls} placeholder="переклад" value={v.translation} onChange={e => { const voc = [...s.vocabulary]; voc[i] = { ...voc[i], translation: e.target.value }; onChange({ ...s, vocabulary: voc }); }} />
                <button onClick={() => onChange({ ...s, vocabulary: s.vocabulary.filter((_, j) => j !== i) })} className="text-danger text-xs font-bold hover:underline flex-shrink-0">✕</button>
              </div>
            ))}
            <button onClick={() => onChange({ ...s, vocabulary: [...s.vocabulary, { word: '', translation: '' }] })} className="text-xs font-bold text-primary-dark hover:underline text-left">+ Додати слово</button>
          </div>
        </div>
        <div>
          <label className={labelCls}>Питання розуміння</label>
          <div className="flex flex-col gap-3">
            {s.questions.map((q, qi) => (
              <div key={q.id} className="border border-border rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-ink-muted">Питання {qi + 1}</span>
                  <button onClick={() => onChange({ ...s, questions: s.questions.filter((_, j) => j !== qi) })} className="text-danger text-xs font-bold hover:underline">✕</button>
                </div>
                <input className={inputCls} placeholder="Питання українською?" value={q.question} onChange={e => { const qs = [...s.questions]; qs[qi] = { ...qs[qi], question: e.target.value }; onChange({ ...s, questions: qs }); }} />
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex gap-2 items-center">
                    <button onClick={() => { const qs = [...s.questions]; qs[qi] = { ...qs[qi], correctIndex: oi }; onChange({ ...s, questions: qs }); }} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${q.correctIndex === oi ? 'border-primary bg-primary' : 'border-border'}`} />
                    <input className={inputCls} placeholder={`Варіант ${oi + 1}`} value={opt} onChange={e => { const qs = [...s.questions]; const opts = [...qs[qi].options]; opts[oi] = e.target.value; qs[qi] = { ...qs[qi], options: opts }; onChange({ ...s, questions: qs }); }} />
                  </div>
                ))}
              </div>
            ))}
            <button onClick={() => onChange({ ...s, questions: [...s.questions, { id: `q-${Date.now()}`, question: '', options: ['', '', '', ''], correctIndex: 0 }] })} className="text-xs font-bold text-primary-dark hover:underline text-left">+ Додати питання</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ─── Головний компонент ─────────────────────── */
export default function CourseBuilderPage() {
  const [lessonTitle, setLessonTitle] = useState('Food & Drinks');
  const [lessonSlug,  setLessonSlug]  = useState('food-drinks');
  const [lessonXp,    setLessonXp]    = useState('20');
  const [steps, setSteps] = useState<LessonStep[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  function addStep(type: LessonStep['type']) {
    const newStep = createStep(type);
    setSteps(prev => [...prev, newStep]);
    setSelectedIdx(steps.length);
  }

  function removeStep(idx: number) {
    setSteps(prev => prev.filter((_, i) => i !== idx));
    setSelectedIdx(null);
  }

  function moveStep(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= steps.length) return;
    setSteps(prev => {
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
    setSelectedIdx(next);
  }

  function updateStep(idx: number, updated: LessonStep) {
    setSteps(prev => prev.map((s, i) => i === idx ? updated : s));
  }

  function exportJson() {
    const data = { slug: lessonSlug, courseSlug: 'elementary-kids', title: lessonTitle, xp: Number(lessonXp), steps };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const selectedStep = selectedIdx !== null ? steps[selectedIdx] : null;
  const previewLesson = {
    slug: lessonSlug,
    courseSlug: 'elementary-kids',
    title: lessonTitle,
    xp: Number(lessonXp),
    steps,
  };

  /* ── Режим превью ─────────────────────────── */
  if (previewing) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="flex items-center gap-3 px-4 py-2 bg-accent/8 border-b border-accent/20 flex-shrink-0">
          <span className="text-sm font-bold text-accent-dark">👁 Режим перегляду</span>
          <button onClick={() => setPreviewing(false)} className="ml-auto px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-black hover:opacity-90 transition-opacity">
            ← Повернутись до редактора
          </button>
        </div>
        <LessonEngine
          lesson={previewLesson}
          teacherName="Maria S."
          teacherPhoto="https://randomuser.me/api/portraits/women/65.jpg"
          callUrl="#"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Заголовок */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-ink">Конструктор уроку</h1>
          <p className="text-ink-muted mt-0.5 text-sm">Створюйте уроки з готових блоків</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setPreviewing(true)}
            disabled={steps.length === 0}
            className="px-4 py-2.5 rounded-xl text-sm font-black border-2 border-border text-ink hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            👁 Переглянути урок
          </button>
          <button
            onClick={exportJson}
            className={`px-4 py-2.5 rounded-xl text-sm font-black transition-all ${copied ? 'bg-primary/10 text-primary-dark' : 'bg-gradient-to-br from-primary to-primary-dark text-white hover:opacity-90'}`}
          >
            {copied ? '✓ Скопійовано!' : '{ } Експорт JSON'}
          </button>
        </div>
      </div>

      {/* Мета уроку */}
      <div className="bg-white rounded-2xl border border-border p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">Назва уроку</label>
          <input value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div>
          <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">Slug (URL)</label>
          <input value={lessonSlug} onChange={e => setLessonSlug(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border text-sm text-ink font-mono focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div>
          <label className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1 block">XP нагорода</label>
          <input type="number" value={lessonXp} onChange={e => setLessonXp(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border text-sm text-ink focus:outline-none focus:border-primary transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_340px] gap-6 items-start">

        {/* Ліво: список кроків */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-black text-ink-muted uppercase tracking-wide">Кроки уроку ({steps.length})</p>
          <div className="flex flex-col gap-2">
            {steps.length === 0 && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-border p-6 text-center text-ink-muted text-sm">
                Додайте перший крок →
              </div>
            )}
            {steps.map((s, i) => {
              const meta = STEP_TYPES.find(t => t.type === s.type);
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedIdx(i)}
                  className={`bg-white rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${selectedIdx === i ? 'border-primary' : 'border-border hover:border-primary/40'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base flex-shrink-0">{meta?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-ink truncate">{meta?.label}</p>
                      <p className="text-[10px] text-ink-muted truncate">
                        {s.type === 'theory' ? (s as StepTheory).title :
                         s.type === 'multiple-choice' ? (s as StepMultipleChoice).question :
                         s.type === 'fill-blank' ? `${(s as StepFillBlank).before} [___]` :
                         s.type === 'translate' ? (s as StepTranslate).sentence :
                         meta?.desc}
                      </p>
                    </div>
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); moveStep(i, -1); }} disabled={i === 0} className="text-ink-muted hover:text-ink disabled:opacity-30 text-xs" aria-label="Вгору">↑</button>
                      <button onClick={e => { e.stopPropagation(); moveStep(i, 1); }} disabled={i === steps.length - 1} className="text-ink-muted hover:text-ink disabled:opacity-30 text-xs" aria-label="Вниз">↓</button>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); removeStep(i); }}
                      className="text-ink-muted hover:text-danger transition-colors flex-shrink-0 text-xs font-bold"
                      aria-label="Видалити крок"
                    >✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Центр: редактор вибраного кроку */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {selectedStep ? (
            <>
              <div className="px-5 py-4 border-b border-border bg-surface-muted flex items-center gap-2">
                <span className="text-lg">{STEP_TYPES.find(t => t.type === selectedStep.type)?.emoji}</span>
                <h2 className="font-black text-ink">{STEP_TYPES.find(t => t.type === selectedStep.type)?.label}</h2>
              </div>
              <div className="p-5">
                <StepEditor
                  step={selectedStep}
                  onChange={updated => updateStep(selectedIdx!, updated)}
                />
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-ink-muted">
              <p className="text-4xl mb-3">👈</p>
              <p className="font-semibold">Виберіть крок зі списку або додайте новий</p>
            </div>
          )}
        </div>

        {/* Право: палітра типів */}
        <div className="flex flex-col gap-4">
          {/* Вправи */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-black text-ink-muted uppercase tracking-wide">Вправи</p>
            {EXERCISE_TYPES.map(t => (
              <button
                key={t.type}
                onClick={() => addStep(t.type)}
                className="flex items-start gap-3 bg-white border-2 border-border rounded-xl px-4 py-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <span className="text-2xl flex-shrink-0">{t.emoji}</span>
                <div>
                  <p className="text-sm font-black text-ink group-hover:text-primary-dark transition-colors">{t.label}</p>
                  <p className="text-xs text-ink-muted">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Медіа */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-black text-ink-muted uppercase tracking-wide">Медіа</p>
            {MEDIA_TYPES.map(t => (
              <button
                key={t.type}
                onClick={() => addStep(t.type)}
                className="flex items-start gap-3 bg-white border-2 border-border rounded-xl px-4 py-3 text-left hover:border-purple/30 hover:bg-purple/5 transition-all group"
              >
                <span className="text-2xl flex-shrink-0">{t.emoji}</span>
                <div>
                  <p className="text-sm font-black text-ink group-hover:text-purple-dark transition-colors">{t.label}</p>
                  <p className="text-xs text-ink-muted">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Поточний JSON */}
          {steps.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-2">JSON-превью</p>
              <pre className="bg-surface-muted rounded-xl p-3 text-[10px] text-ink-muted overflow-x-auto max-h-48 overflow-y-auto">
                {JSON.stringify({ slug: lessonSlug, title: lessonTitle, xp: lessonXp, stepsCount: steps.length }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
