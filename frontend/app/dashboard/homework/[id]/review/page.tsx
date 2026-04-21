'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
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

const QUALITATIVE_OPTIONS: Array<{ value: Qualitative; label: string; defaultCoins: number }> = [
  { value: 'excellent',         label: 'Excellent',  defaultCoins: 30 },
  { value: 'good',              label: 'Good',       defaultCoins: 20 },
  { value: 'needs-improvement', label: 'Needs work', defaultCoins: 10 },
];

const COIN_RULES: Array<{ label: string; value: string }> = [
  { label: 'Виконано вчасно',            value: '100% + бонус (0–10)' },
  { label: 'Виконано із запізненням',    value: '70% базової суми' },
  { label: 'Повернуто на доопрацювання', value: '0 до повторної здачі' },
  { label: 'Не виконано до дедлайну',    value: '0' },
  { label: 'Серія 5 виконаних ДЗ',       value: '+10 бонус' },
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
        <h1 className="text-[22px] font-semibold text-ink">Завдання не знайдено</h1>
        <Link href="/dashboard/homework" className="text-[13px] font-semibold text-ink-muted hover:text-ink">
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
      <div className="max-w-md mx-auto py-20 text-center">
        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center border ${submittedAction === 'approved' ? 'border-success text-success' : 'border-border text-ink-muted'}`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            {submittedAction === 'approved' ? <path d="M5 13l4 4 10-10" /> : <path d="M9 14l-4-4 4-4M5 10h11a4 4 0 0 1 4 4v4" />}
          </svg>
        </div>
        <h1 className="text-[20px] font-semibold text-ink mt-4">
          {submittedAction === 'approved' ? 'Перевірено' : 'Повернуто на доопрацювання'}
        </h1>
        <p className="text-[13px] text-ink-muted mt-1.5">
          {submittedAction === 'approved'
            ? `Нараховано ${coins + bonus} монет. Повертаємось до списку…`
            : 'Учень отримає сповіщення та зможе перездати ДЗ'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <div className="flex flex-col gap-3">
        <Link href="/dashboard/homework" className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink-muted hover:text-ink w-fit">
          ← Усі домашні завдання
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-border">
          <div className="min-w-0">
            <h1 className="text-[22px] md:text-[26px] font-semibold text-ink tracking-tight">{task.title}</h1>
            <p className="text-[13px] text-ink-muted mt-1 tabular-nums">
              {HOMEWORK_KIND_LABELS[task.kind]} · призначено {task.assignedAt} · дедлайн {task.deadline}
            </p>
          </div>
          <StatusPill label={status.label} cls={status.cls} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <div className="flex flex-col gap-4">
          <SubjectCard name={subjectName} photo={subjectPhoto} level={subjectLevel} kind={task.assignedTo.type} />

          <Card title="Опис завдання">
            <p className="text-[14px] text-ink whitespace-pre-wrap leading-relaxed">{task.description}</p>
          </Card>

          <Card title="Робота учня">
            <SubmissionPreview task={task} />
          </Card>

          <Card title="Оцінка">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                {(['qualitative', 'numeric'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); applyDefaultCoinsFor({ mode: m }); }}
                    className={`ios-btn ios-btn-sm ${mode === m ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
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
                        key={opt.value}
                        type="button"
                        onClick={() => { setQualitative(opt.value); applyDefaultCoinsFor({ qualitative: opt.value }); }}
                        className={`p-3 rounded-lg border text-[13px] font-semibold transition-colors ${
                          active ? 'border-primary bg-primary text-white' : 'border-border bg-white text-ink hover:border-primary/30'
                        }`}
                      >
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
                  <span className="w-14 text-center font-semibold text-[15px] rounded-lg px-2 py-1 border border-border text-ink tabular-nums">
                    {numeric}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card title="Монети">
            <div className="flex flex-col gap-4">
              <SliderRow label="Базово" value={coins} max={50} step={5} onChange={setCoins} display={`${coins}`} />
              <SliderRow label="Бонус"  value={bonus} max={10} step={1} onChange={setBonus} display={`+${bonus}`} />
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-muted border border-border">
                <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Всього</span>
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
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 resize-y transition-[border-color,box-shadow]"
            />
            <p className="mt-2 text-[11px] text-ink-faint">Коментар обов’язковий при поверненні ДЗ на доопрацювання.</p>
          </Card>

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button type="button" onClick={returnWork} className="ios-btn ios-btn-danger">
              Повернути
            </button>
            <button type="button" onClick={approve} className="ios-btn ios-btn-primary">
              Підтвердити перевірку
            </button>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <Card title="Підсумок">
            <dl className="flex flex-col gap-2 text-[12px]">
              <Row label="Дедлайн" value={task.deadline} />
              <Row label="Тип" value={HOMEWORK_KIND_LABELS[task.kind]} />
              <Row label="Базові монети" value={`${task.coins}`} />
              {task.bonusCoins ? <Row label="Бонус" value={`+${task.bonusCoins}`} /> : null}
            </dl>
          </Card>

          <Card title="Правила нарахування">
            <ul className="flex flex-col gap-2">
              {COIN_RULES.map(rule => (
                <li key={rule.label} className="flex items-start justify-between gap-3 text-[12px]">
                  <span className="text-ink-muted">{rule.label}</span>
                  <span className="text-right font-semibold text-ink flex-shrink-0 tabular-nums">{rule.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-ink-faint leading-relaxed">
              Базова сума задається при створенні ДЗ (5–50). Бонус (0–10) — на розсуд викладача.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SliderRow({ label, value, max, step, onChange, display }: { label: string; value: number; max: number; step: number; onChange: (n: number) => void; display: string }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider w-14">{label}</label>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-primary"
      />
      <span className="w-14 text-right font-semibold text-ink tabular-nums">{display}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ios-card p-5">
      <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-3">{title}</p>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-ink font-semibold">{value}</dd>
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
    <div className="ios-card p-4 flex items-center gap-3">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
      ) : (
        <span className="w-11 h-11 rounded-full bg-surface-muted text-ink-muted text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
          Гр.
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-ink truncate">{name}</p>
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
      <div className="py-8 text-center text-[13px] text-ink-muted">
        <p className="font-semibold text-ink">Учень ще не надіслав роботу</p>
      </div>
    );
  }
  switch (task.kind) {
    case 'audio':
      return (
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-muted border border-border">
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-ink">Аудіозапис</p>
            <p className="text-[12px] text-ink-muted">{task.submissionPreview}</p>
          </div>
          <button type="button" className="ios-btn ios-btn-sm ios-btn-secondary">Відтворити</button>
        </div>
      );
    case 'video':
      return (
        <div className="aspect-video rounded-lg bg-surface-muted border border-border flex items-center justify-center">
          <div className="text-center">
            <p className="text-[13px] font-semibold text-ink">Відеозапис</p>
            <p className="text-[11px] text-ink-muted mt-0.5">{task.submissionPreview}</p>
          </div>
        </div>
      );
    case 'file':
      return (
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-muted border border-border">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-ink truncate">{task.submissionPreview}</p>
            <p className="text-[12px] text-ink-muted">Завантажений файл</p>
          </div>
          <button type="button" className="ios-btn ios-btn-sm ios-btn-secondary">Відкрити</button>
        </div>
      );
    case 'library-lesson':
      return (
        <div className="p-3.5 rounded-lg bg-surface-muted border border-border text-[13px]">
          <p className="font-semibold text-ink mb-1">Проходження уроку</p>
          <p className="text-ink-muted text-[12px]">{task.submissionPreview}</p>
        </div>
      );
    default:
      return (
        <div className="p-3.5 rounded-lg bg-surface-muted border border-border">
          <p className="text-[13px] text-ink whitespace-pre-wrap leading-relaxed">{task.submissionPreview}</p>
        </div>
      );
  }
}
