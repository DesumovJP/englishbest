'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  fetchSubmission,
  gradeSubmission,
  type Submission,
  type SubmissionStatus,
} from '@/lib/homework';
import { LevelBadge, StatusPill } from '@/components/teacher/ui';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { FormField } from '@/components/ui/FormField';
import { Textarea } from '@/components/ui/Textarea';

const STATUS_DISPLAY: Record<SubmissionStatus, { label: string; cls: string }> = {
  notStarted: { label: 'Не розпочато', cls: 'bg-surface-muted text-ink-muted' },
  inProgress: { label: 'В процесі',    cls: 'bg-surface-muted text-ink' },
  submitted:  { label: 'На перевірці', cls: 'bg-primary text-white' },
  reviewed:   { label: 'Перевірено',   cls: 'bg-surface-muted text-ink-muted' },
  returned:   { label: 'Повернуто',    cls: 'bg-surface-muted text-danger-dark' },
  overdue:    { label: 'Прострочено',  cls: 'bg-danger/10 text-danger-dark' },
};

export default function HomeworkReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [score, setScore] = useState<number>(10);
  const [feedback, setFeedback] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [done, setDone] = useState<'approved' | 'returned' | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const s = await fetchSubmission(id);
        if (!alive) return;
        setSubmission(s);
        if (s) {
          if (s.score !== null) setScore(s.score);
          if (s.teacherFeedback) setFeedback(s.teacherFeedback);
        }
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'failed');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function handleGrade(nextStatus: 'reviewed' | 'returned') {
    if (!submission) return;
    if (nextStatus === 'returned' && feedback.trim() === '') {
      window.alert('Коментар обов’язковий при поверненні ДЗ');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await gradeSubmission(submission.documentId, {
        score: nextStatus === 'reviewed' ? score : null,
        teacherFeedback: feedback,
        status: nextStatus,
      });
      setDone(nextStatus === 'reviewed' ? 'approved' : 'returned');
      window.setTimeout(() => router.push('/dashboard/homework'), 1500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'failed');
    } finally {
      setSaving(false);
    }
  }

  const shellStatus: 'loading' | 'error' | 'ready' =
    loading ? 'loading' : error || !submission ? 'error' : 'ready';

  const backLink = (
    <Link
      href="/dashboard/homework"
      className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink-muted hover:text-ink w-fit"
    >
      ← Усі домашні завдання
    </Link>
  );

  if (shellStatus !== 'ready' || !submission) {
    return (
      <div className="flex flex-col gap-3">
        {backLink}
        <DashboardPageShell
          title={submission?.homework?.title ?? 'Перевірка ДЗ'}
          status={shellStatus}
          error={error ?? (submission ? undefined : 'Завдання не знайдено')}
          onRetry={() => location.reload()}
          loadingShape="card"
        />
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div
          className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center border ${
            done === 'approved' ? 'border-success text-success' : 'border-border text-ink-muted'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            {done === 'approved' ? (
              <path d="M5 13l4 4 10-10" />
            ) : (
              <path d="M9 14l-4-4 4-4M5 10h11a4 4 0 0 1 4 4v4" />
            )}
          </svg>
        </div>
        <h1 className="text-[20px] font-semibold text-ink mt-4">
          {done === 'approved' ? 'Перевірено' : 'Повернуто на доопрацювання'}
        </h1>
        <p className="text-[13px] text-ink-muted mt-1.5">Повертаємось до списку…</p>
      </div>
    );
  }

  const status = STATUS_DISPLAY[submission.status];
  const hw = submission.homework;
  const student = submission.student;
  const locked = submission.status === 'reviewed';
  const subtitleText = [
    hw?.dueAt ? `Дедлайн ${hw.dueAt.slice(0, 10)}` : 'Без дедлайну',
    submission.submittedAt ? `здано ${submission.submittedAt.slice(0, 10)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex flex-col gap-3">
      {backLink}
      <DashboardPageShell
        title={hw?.title ?? '—'}
        subtitle={subtitleText}
        actions={<StatusPill label={status.label} cls={status.cls} />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 max-w-5xl">
          <div className="flex flex-col gap-4">
            <Card variant="surface" padding="md" className="flex items-center gap-3">
              <Avatar
                name={student?.displayName ?? '—'}
                src={student?.avatarUrl ?? null}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-ink truncate">
                  {student?.displayName ?? '—'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-ink-muted">Учень</span>
                  {student?.level && (
                    <LevelBadge
                      level={
                        student.level as 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
                      }
                    />
                  )}
                </div>
              </div>
            </Card>

            <Section title="Опис завдання">
              <p className="text-[14px] text-ink whitespace-pre-wrap leading-relaxed">
                {hw?.description || 'Опис не вказано'}
              </p>
            </Section>

            <Section title="Робота учня">
              <SubmissionBody submission={submission} />
            </Section>

            <Section title="Оцінка (1–12)">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  value={score}
                  disabled={locked}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="w-14 text-center font-semibold text-[15px] rounded-lg px-2 py-1 border border-border text-ink tabular-nums">
                  {score}
                </span>
              </div>
            </Section>

            <Section title="Коментар">
              <FormField hint="Коментар обов’язковий при поверненні ДЗ на доопрацювання.">
                <Textarea
                  value={feedback}
                  disabled={locked}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Що сподобалось, що варто поправити…"
                  rows={4}
                />
              </FormField>
            </Section>

            {saveError && (
              <p className="text-[12px] text-danger-dark">{saveError}</p>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <Button
                variant="danger"
                onClick={() => handleGrade('returned')}
                disabled={saving || locked}
              >
                Повернути
              </Button>
              <Button
                onClick={() => handleGrade('reviewed')}
                disabled={saving || locked}
              >
                {saving ? 'Зберігаю…' : 'Підтвердити перевірку'}
              </Button>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <Section title="Підсумок">
              <dl className="flex flex-col gap-2 text-[12px]">
                <Row label="Статус" value={status.label} />
                {hw?.dueAt && <Row label="Дедлайн" value={hw.dueAt.slice(0, 10)} />}
                {submission.submittedAt && (
                  <Row label="Здано" value={submission.submittedAt.slice(0, 10)} />
                )}
                {submission.gradedAt && (
                  <Row label="Перевірено" value={submission.gradedAt.slice(0, 10)} />
                )}
                {submission.score !== null && (
                  <Row label="Оцінка" value={String(submission.score)} />
                )}
              </dl>
            </Section>
          </aside>
        </div>
      </DashboardPageShell>
    </div>
  );
}

function SubmissionBody({ submission }: { submission: Submission }) {
  if (submission.status === 'notStarted' || submission.status === 'inProgress') {
    return (
      <div className="py-8 text-center text-[13px] text-ink-muted">
        <p className="font-semibold text-ink">Учень ще не надіслав роботу</p>
      </div>
    );
  }

  const answersText =
    submission.answers && Object.keys(submission.answers).length > 0
      ? JSON.stringify(submission.answers, null, 2)
      : null;

  return (
    <div className="flex flex-col gap-3">
      {answersText ? (
        <pre className="p-3.5 rounded-lg bg-surface-muted border border-border text-[12px] text-ink whitespace-pre-wrap leading-relaxed max-h-80 overflow-auto">
          {answersText}
        </pre>
      ) : (
        <p className="text-[13px] text-ink-muted">Текст відповіді не надано.</p>
      )}

      {submission.attachments.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {submission.attachments.map((att) => (
            <li key={att.url}>
              <a
                href={att.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted border border-border hover:border-primary/30 text-[13px] text-ink"
              >
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-raised border border-border text-ink-muted uppercase tracking-wider">
                  {(att.mime || 'file').split('/')[0]}
                </span>
                <span className="flex-1 truncate">{att.name || att.url}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card variant="surface" padding="md">
      <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-3">{title}</p>
      {children}
    </Card>
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
