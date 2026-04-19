'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  HOMEWORK_KIND_ICONS,
  HOMEWORK_KIND_LABELS,
  HOMEWORK_STATUS_STYLES,
  MOCK_GROUPS,
  MOCK_HOMEWORK,
  MOCK_STUDENTS,
  type HomeworkTask,
} from '@/lib/teacher-mocks';
import { CoinTag, LevelBadge, StatusPill } from '@/components/teacher/ui';

type GradeMode = 'numeric' | 'qualitative';
type Qualitative = 'excellent' | 'good' | 'needs-improvement';

const QUALITATIVE_OPTIONS: Array<{ value: Qualitative; label: string; icon: string; defaultCoins: number }> = [
  { value: 'excellent',         label: 'Excellent',     icon: '🌟', defaultCoins: 30 },
  { value: 'good',              label: 'Good',          icon: '👍', defaultCoins: 20 },
  { value: 'needs-improvement', label: 'Needs work',    icon: '📝', defaultCoins: 10 },
];

/* Section 6.5 — правила нарахування монет */
const COIN_RULES: Array<{ label: string; value: string }> = [
  { label: 'Виконано вчасно',         value: '100% + бонус (0–10)' },
  { label: 'Виконано із запізненням', value: '70% базової суми' },
  { label: 'Повернуто на доопрацювання', value: '0 до повторної здачі' },
  { label: 'Не виконано до дедлайну', value: '0' },
  { label: 'Серія 5 виконаних ДЗ',    value: '+10 бонус' },
];

function getSubject(task: HomeworkTask) {
  if (task.assignedTo.type === 'student') {
    return MOCK_STUDENTS.find(s => s.id === task.assignedTo.id);
  }
  return MOCK_GROUPS.find(g => g.id === task.assignedTo.id);
}

function numericDefault(n: number): number {
  if (n >= 10) return 30;
  if (n >= 7)  return 20;
  if (n >= 4)  return 10;
  return 0;
}

export default function HomeworkReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const task = useMemo(() => MOCK_HOMEWORK.find(h => h.id === id) ?? null, [id]);

  const [mode, setMode] = useState<GradeMode>('qualitative');
  const [numeric, setNumeric] = useState<number>(10);
  const [qualitative, setQualitative] = useState<Qualitative>('good');
  const [coins, setCoins] = useState<number>(task?.coins ?? 20);
  const [bonus, setBonus] = useState<number>(task?.bonusCoins ?? 0);
  const [comment, setComment] = useState<string>('');
  const [submittedAction, setSubmittedAction] = useState<'approved' | 'returned' | null>(null);

  if (!task) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="type-h1 text-ink">Завдання не знайдено</h1>
        <Link href="/dashboard/homework" className="text-sm font-bold text-primary-dark hover:underline">
          ← До списку ДЗ
        </Link>
      </div>
    );
  }

  const subject = getSubject(task);
  const subjectPhoto = task.assignedTo.type === 'student' ? (subject as { photo?: string })?.photo : undefined;
  const subjectName = subject?.name ?? '—';
  const subjectLevel = subject?.level;
  const status = HOMEWORK_STATUS_STYLES[task.status];

  function applyDefaultCoinsFor(next: { mode?: GradeMode; numeric?: number; qualitative?: Qualitative }) {
    const m = next.mode ?? mode;
    if (m === 'numeric') {
      const n = next.numeric ?? numeric;
      setCoins(numericDefault(n));
    } else {
      const q = next.qualitative ?? qualitative;
      const found = QUALITATIVE_OPTIONS.find(o => o.value === q);
      setCoins(found?.defaultCoins ?? 20);
    }
  }

  function approve() {
    setSubmittedAction('approved');
    window.setTimeout(() => router.push('/dashboard/homework'), 1500);
  }

  function returnWork() {
    if (comment.trim() === '') {
      window.alert('Коментар обов’язковий при поверненні ДЗ');
      return;
    }
    setSubmittedAction('returned');
    window.setTimeout(() => router.push('/dashboard/homework'), 1500);
  }

  if (submittedAction) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <p className="text-5xl mb-4">{submittedAction === 'approved' ? '✅' : '↩️'}</p>
        <h1 className="type-h2 text-ink mb-2">
          {submittedAction === 'approved' ? 'Перевірено' : 'Повернуто на доопрацювання'}
        </h1>
        <p className="text-sm text-ink-muted">
          {submittedAction === 'approved'
            ? `Нараховано 🪙 ${coins + bonus} монет. Повертаємось до списку…`
            : 'Учень отримає сповіщення та зможе перездати ДЗ.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard/homework"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink w-fit"
        >
          ← Усі домашні завдання
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="type-h1 text-ink flex items-center gap-2">
              <span aria-hidden>{HOMEWORK_KIND_ICONS[task.kind]}</span>
              {task.title}
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              {HOMEWORK_KIND_LABELS[task.kind]} · призначено {task.assignedAt} · дедлайн {task.deadline}
            </p>
          </div>
          <StatusPill label={status.label} cls={status.cls} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="flex flex-col gap-5">
          <SubjectCard name={subjectName} photo={subjectPhoto} level={subjectLevel} kind={task.assignedTo.type} />

          <Card title="Опис завдання">
            <p className="text-sm text-ink whitespace-pre-wrap">{task.description}</p>
          </Card>

          <Card title="Робота учня">
            <SubmissionPreview task={task} />
          </Card>

          <Card title="Оцінка">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                {(['qualitative', 'numeric'] as const).map(m => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => { setMode(m); applyDefaultCoinsFor({ mode: m }); }}
                    className={`px-3 h-9 rounded-xl border text-xs font-bold transition-colors ${
                      mode === m
                        ? 'border-primary bg-primary/10 text-primary-dark'
                        : 'border-border text-ink-muted hover:border-primary/40'
                    }`}
                  >
                    {m === 'qualitative' ? 'Excellent / Good / NI' : '1–12'}
                  </button>
                ))}
              </div>

              {mode === 'qualitative' ? (
                <div className="grid grid-cols-3 gap-2">
                  {QUALITATIVE_OPTIONS.map(opt => {
                    const active = qualitative === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => { setQualitative(opt.value); applyDefaultCoinsFor({ qualitative: opt.value }); }}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-bold transition-colors ${
                          active
                            ? 'border-primary bg-primary/10 text-primary-dark'
                            : 'border-border text-ink-muted hover:border-primary/40'
                        }`}
                      >
                        <span className="text-xl" aria-hidden>{opt.icon}</span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={12}
                    step={1}
                    value={numeric}
                    onChange={e => { const n = Number(e.target.value); setNumeric(n); applyDefaultCoinsFor({ numeric: n }); }}
                    className="flex-1 accent-primary"
                  />
                  <span className={`w-14 text-center font-black text-base rounded-lg px-2 py-1 ${
                    numeric >= 10 ? 'bg-primary/10 text-primary-dark' :
                    numeric >= 7  ? 'bg-accent/15 text-accent-dark'  :
                    numeric >= 4  ? 'bg-secondary/15 text-secondary-dark' :
                                    'bg-danger/10 text-danger-dark'
                  }`}>
                    {numeric}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card title="Монети">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-black text-ink-muted uppercase tracking-wide w-20">Базово</label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={coins}
                  onChange={e => setCoins(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="w-20 text-right font-black text-ink">🪙 {coins}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-black text-ink-muted uppercase tracking-wide w-20">Бонус</label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={bonus}
                  onChange={e => setBonus(Number(e.target.value))}
                  className="flex-1 accent-accent"
                />
                <span className="w-20 text-right font-black text-accent-dark">+{bonus}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-coin-bg/40 border border-coin-border">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wide">Всього до нарахування</span>
                <CoinTag amount={coins} bonus={bonus || undefined} />
              </div>
            </div>
          </Card>

          <Card title="Коментар">
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Що сподобалось, що варто поправити…"
              rows={4}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary resize-y"
            />
            <p className="mt-1.5 text-[11px] text-ink-muted">
              Коментар обов’язковий при поверненні ДЗ на доопрацювання.
            </p>
          </Card>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={returnWork}
              className="px-4 py-2.5 rounded-xl border border-danger/30 text-danger-dark text-sm font-black hover:bg-danger/5 transition-colors"
            >
              ↩️ Повернути на доопрацювання
            </button>
            <button
              type="button"
              onClick={approve}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity"
            >
              ✅ Підтвердити перевірку
            </button>
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          <Card title="Правила нарахування">
            <ul className="flex flex-col gap-2">
              {COIN_RULES.map(rule => (
                <li key={rule.label} className="flex items-start justify-between gap-3 text-xs">
                  <span className="text-ink-muted">{rule.label}</span>
                  <span className="text-right font-bold text-ink flex-shrink-0">{rule.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-ink-faint leading-relaxed">
              Базова сума задається при створенні ДЗ (5–50). Бонус (0–10) — на розсуд викладача.
            </p>
          </Card>

          <Card title="Підсумок">
            <dl className="flex flex-col gap-2 text-xs">
              <Row label="Дедлайн" value={task.deadline} />
              <Row label="Тип" value={HOMEWORK_KIND_LABELS[task.kind]} />
              <Row label="Базові монети" value={`🪙 ${task.coins}`} />
              {task.bonusCoins ? <Row label="Бонус" value={`+${task.bonusCoins}`} /> : null}
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-border p-5">
      <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest mb-3">{title}</p>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-ink font-bold">{value}</dd>
    </div>
  );
}

function SubjectCard({
  name,
  photo,
  level,
  kind,
}: {
  name: string;
  photo?: string;
  level?: string;
  kind: 'student' | 'group';
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
      ) : (
        <span className="w-12 h-12 rounded-full bg-secondary/15 text-secondary-dark text-xl font-black flex items-center justify-center flex-shrink-0" aria-hidden>
          🧩
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-ink truncate">{name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-ink-muted">{kind === 'student' ? 'Учень' : 'Група'}</span>
          {level ? <LevelBadge level={level as 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'} /> : null}
        </div>
      </div>
    </div>
  );
}

function SubmissionPreview({ task }: { task: HomeworkTask }) {
  if (!task.submissionPreview) {
    return (
      <div className="py-8 text-center text-sm text-ink-muted">
        <p className="text-3xl mb-2">🕒</p>
        <p>Учень ще не надіслав роботу</p>
      </div>
    );
  }
  switch (task.kind) {
    case 'audio':
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-muted border border-border">
          <span className="text-2xl" aria-hidden>🎤</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-ink">Аудіо запис</p>
            <p className="text-xs text-ink-muted">{task.submissionPreview}</p>
          </div>
          <button type="button" className="px-3 h-9 rounded-lg border border-border text-xs font-bold text-ink-muted hover:border-primary/40">
            ▶ Відтворити
          </button>
        </div>
      );
    case 'video':
      return (
        <div className="aspect-video rounded-xl bg-ink/90 flex items-center justify-center text-white">
          <div className="text-center">
            <p className="text-3xl mb-1">🎬</p>
            <p className="text-xs">{task.submissionPreview}</p>
          </div>
        </div>
      );
    case 'file':
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-muted border border-border">
          <span className="text-2xl" aria-hidden>📎</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink truncate">{task.submissionPreview}</p>
            <p className="text-xs text-ink-muted">Завантажений файл</p>
          </div>
          <button type="button" className="px-3 h-9 rounded-lg border border-border text-xs font-bold text-ink-muted hover:border-primary/40">
            Відкрити
          </button>
        </div>
      );
    case 'library-lesson':
      return (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm">
          <p className="font-bold text-ink mb-1">📘 Проходження уроку</p>
          <p className="text-ink-muted text-xs">{task.submissionPreview}</p>
        </div>
      );
    default:
      return (
        <div className="p-4 rounded-xl bg-surface-muted border border-border">
          <p className="text-sm text-ink whitespace-pre-wrap">{task.submissionPreview}</p>
        </div>
      );
  }
}
