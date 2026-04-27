'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Level } from '@/lib/types/teacher';
import { LevelBadge } from '@/components/teacher/ui';
import { fetchSessionsCached, type Session } from '@/lib/sessions';
import { fetchSubmissionsCached, type Submission } from '@/lib/homework';
import { fetchStudentProgress, type UserProgressRow } from '@/lib/user-progress';
import {
  sessionStatusLabel,
  sessionTypeLabel,
  formatDuration,
  attendeesCountLabel,
} from '@/lib/session-display';

type AdminTab   = 'video';
type TeacherTab = 'video' | 'history' | 'homework' | 'progress';

export interface StudentDetailData {
  /** Profile documentId — used to filter sessions/submissions. */
  slug: string;
  name: string;
  photo: string;
  level: string;
  program: string;
  teacher: string;
  lessonsBalance: number;
  moneyBalance: number;
  lastLesson: string;
  status: string;
  statusDot: string;
  joinedAt: string;
  streak: number;
  totalLessons: number;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}

function Stat({ label, value, muted = false }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex-1 min-w-0 px-4 py-3 text-center">
      <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">{label}</p>
      <p className={`text-[15px] font-semibold tabular-nums mt-1 truncate ${muted ? 'text-ink-muted' : 'text-ink'}`}>{value}</p>
    </div>
  );
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function SessionRow({ s }: { s: Session }) {
  const teacher = s.teacher?.displayName ?? '';
  const peers = attendeesCountLabel(s.attendees);
  const typeLbl = sessionTypeLabel(s.type);
  const statusLbl = sessionStatusLabel(s.status);
  const dot =
    s.status === 'completed' ? 'bg-primary'
    : s.status === 'cancelled' ? 'bg-danger'
    : s.status === 'live' ? 'bg-danger animate-pulse'
    : 'bg-accent';
  return (
    <li className="px-4 py-3 border-b border-border last:border-b-0 flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 ${dot}`} aria-hidden />
        <div className="flex-1 min-w-0">
          {s.course?.title && (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint truncate">
              {s.course.title}
            </p>
          )}
          <p className="text-[13px] font-semibold text-ink truncate">{s.title || 'Урок'}</p>
          <p className="text-[11px] text-ink-muted tabular-nums">
            {formatDateTime(s.startAt)}
            {s.durationMin ? ` · ${formatDuration(s.durationMin)}` : ''}
            {typeLbl ? ` · ${typeLbl}` : ''}
          </p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint whitespace-nowrap">{statusLbl}</span>
      </div>
      {(teacher || peers) && (
        <p className="text-[11px] text-ink-muted pl-5 truncate">
          {teacher && <>З {teacher}</>}
          {teacher && peers ? ' · ' : ''}
          {peers && <>{peers}</>}
        </p>
      )}
      {(s.joinUrl && (s.status === 'scheduled' || s.status === 'live')) || s.recordingUrl ? (
        <div className="pl-5 flex items-center gap-3">
          {s.joinUrl && (s.status === 'scheduled' || s.status === 'live') && (
            <a
              href={s.joinUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-primary-dark hover:underline"
            >
              Приєднатися →
            </a>
          )}
          {s.recordingUrl && (
            <a
              href={s.recordingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-ink-muted hover:text-ink hover:underline"
            >
              Запис →
            </a>
          )}
        </div>
      ) : null}
    </li>
  );
}

function SubmissionRow({ s }: { s: Submission }) {
  const dueAt = s.homework?.dueAt ?? null;
  return (
    <li className="px-4 py-3 border-b border-border last:border-b-0 flex items-center gap-3">
      <span className="text-xl" aria-hidden>📄</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink truncate">{s.homework?.title ?? 'ДЗ'}</p>
        <p className="text-[11px] text-ink-muted tabular-nums">
          {dueAt ? `до ${formatDateTime(dueAt)}` : 'без дедлайну'}
          {s.submittedAt ? ` · здано ${formatDateTime(s.submittedAt)}` : ''}
        </p>
      </div>
      <span className="text-[11px] font-semibold whitespace-nowrap">
        {s.score !== null ? <span className="text-primary-dark">{s.score} б.</span> : <span className="text-ink-faint">{s.status}</span>}
      </span>
      <Link
        href={`/dashboard/homework/${s.documentId}/review`}
        className="text-[11px] font-semibold text-primary hover:underline whitespace-nowrap"
      >
        Переглянути →
      </Link>
    </li>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-10 text-center text-[12px] text-ink-muted">{text}</div>
  );
}

const PROGRESS_STATUS_LABEL: Record<string, string> = {
  notStarted: 'Не почато',
  inProgress: 'У процесі',
  completed:  'Завершено',
  skipped:    'Пропущено',
};

const PROGRESS_STATUS_DOT: Record<string, string> = {
  notStarted: 'bg-ink-faint',
  inProgress: 'bg-accent',
  completed:  'bg-primary',
  skipped:    'bg-danger',
};

type CourseBucket = {
  key: string;
  title: string;
  iconEmoji?: string;
  level?: string;
  rows: UserProgressRow[];
  completed: number;
  total: number;
};

function bucketRowsByCourse(rows: UserProgressRow[]): CourseBucket[] {
  const byKey = new Map<string, CourseBucket>();
  for (const r of rows) {
    const course = r.course ?? (r.lesson?.courseDocumentId
      ? { documentId: r.lesson.courseDocumentId, slug: r.lesson.courseSlug ?? '', title: r.lesson.courseSlug ?? '—', level: undefined, iconEmoji: undefined }
      : null);
    const key = course?.documentId ?? '__unknown__';
    let bucket = byKey.get(key);
    if (!bucket) {
      bucket = {
        key,
        title: course?.title ?? 'Без курсу',
        iconEmoji: course?.iconEmoji,
        level: course?.level,
        rows: [],
        completed: 0,
        total: 0,
      };
      byKey.set(key, bucket);
    }
    bucket.rows.push(r);
    bucket.total += 1;
    if (r.status === 'completed') bucket.completed += 1;
  }
  for (const b of byKey.values()) {
    b.rows.sort((a, b) => (a.lesson?.orderIndex ?? 0) - (b.lesson?.orderIndex ?? 0));
  }
  return Array.from(byKey.values()).sort((a, b) => a.title.localeCompare(b.title, 'uk'));
}

function ProgressByCourse({ rows }: { rows: UserProgressRow[] }) {
  const buckets = useMemo(() => bucketRowsByCourse(rows), [rows]);
  return (
    <div className="flex flex-col">
      {buckets.map((b) => {
        const pct = b.total === 0 ? 0 : Math.round((b.completed / b.total) * 100);
        return (
          <section key={b.key} className="border-b border-border last:border-b-0">
            <header className="px-4 py-3 flex items-center gap-3">
              <span className="text-lg" aria-hidden>{b.iconEmoji ?? '📘'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-ink truncate">{b.title}</p>
                <p className="text-[11px] text-ink-muted tabular-nums">
                  {b.level ? `${b.level} · ` : ''}{b.completed}/{b.total} уроків · {pct}%
                </p>
              </div>
              <div className="w-24 h-1.5 rounded-full bg-surface-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </header>
            <ul>
              {b.rows.map((r) => (
                <li
                  key={r.documentId}
                  className="px-4 py-2.5 flex items-center gap-3 border-t border-border"
                >
                  <span
                    className={`ios-dot ${PROGRESS_STATUS_DOT[r.status] ?? 'bg-ink-faint'}`}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-ink truncate">
                      {r.lesson?.title ?? 'Урок'}
                    </p>
                    <p className="text-[11px] text-ink-muted tabular-nums">
                      {PROGRESS_STATUS_LABEL[r.status] ?? r.status}
                      {r.lastAttemptAt ? ` · ${formatDateTime(r.lastAttemptAt)}` : ''}
                      {r.attempts > 0 ? ` · ${r.attempts} спроб.` : ''}
                    </p>
                  </div>
                  {r.score !== null && (
                    <span className="text-[12px] font-semibold text-primary-dark tabular-nums">
                      {r.score} б.
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="py-10 text-center text-[12px] text-ink-muted">Завантаження…</div>
  );
}

export function StudentDetail({
  student,
  isAdmin = false,
  onClose,
}: {
  student: StudentDetailData;
  isAdmin?: boolean;
  onClose?: () => void;
}) {
  const [adminTab,   setAdminTab]   = useState<AdminTab>('video');
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('video');

  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [subs,     setSubs]     = useState<Submission[] | null>(null);
  const [progress, setProgress] = useState<UserProgressRow[] | null>(null);
  const [loadErr,  setLoadErr]  = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setSessions(null);
    setSubs(null);
    setProgress(null);
    setLoadErr(null);

    Promise.all([
      fetchSessionsCached(),
      isAdmin ? Promise.resolve<Submission[]>([]) : fetchSubmissionsCached(),
      isAdmin ? Promise.resolve<UserProgressRow[]>([]) : fetchStudentProgress(student.slug),
    ])
      .then(([sess, subRows, progRows]) => {
        if (!alive) return;
        setSessions(sess.filter((s) => s.attendees.some((a) => a.documentId === student.slug)));
        setSubs(subRows.filter((s) => s.student?.documentId === student.slug));
        setProgress(progRows);
      })
      .catch((e) => {
        if (alive) setLoadErr((e as Error).message || 'Не вдалося завантажити');
      });

    return () => { alive = false; };
  }, [student.slug, isAdmin]);

  const upcoming = useMemo(
    () => (sessions ?? []).filter((s) => s.status === 'scheduled' || s.status === 'live'),
    [sessions],
  );
  const past = useMemo(
    () => (sessions ?? []).filter((s) => s.status === 'completed' || s.status === 'cancelled' || s.status === 'no-show'),
    [sessions],
  );

  const lowBalance = student.lessonsBalance <= 2;

  const adminTabs: [AdminTab, string][] = [
    ['video', 'Відеоуроки'],
  ];
  const teacherTabs: [TeacherTab, string][] = [
    ['video',    'Уроки'],
    ['history',  'Історія'],
    ['homework', 'ДЗ'],
    ['progress', 'Прогрес'],
  ];

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={student.photo}
            alt={student.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0 bg-surface-muted"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-semibold text-ink leading-snug truncate">{student.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <LevelBadge level={student.level as Level} />
              {student.program && <span className="text-[12px] text-ink-muted truncate">{student.program}</span>}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
                <span className={`ios-dot ${student.statusDot}`} aria-hidden />
                {student.status}
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Закрити"
              className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {isAdmin ? (
          <>
            <div className="ios-card flex items-stretch divide-x divide-border">
              <Stat
                label="Баланс"
                value={
                  <span className={lowBalance ? 'text-danger-dark' : undefined}>
                    {student.lessonsBalance} <span className="text-[12px] text-ink-muted font-medium">уроків</span>
                  </span>
                }
              />
              <Stat label="Сума" value={`₴ ${student.moneyBalance.toLocaleString('uk-UA')}`} />
              <Stat label="Вчитель" value={student.teacher || '—'} muted />
            </div>
            {student.joinedAt && (
              <p className="text-[11px] text-ink-muted tabular-nums mt-2">
                З {student.joinedAt} · Останній урок {student.lastLesson}
              </p>
            )}
            {lowBalance && (
              <p className="mt-2 text-[12px] text-danger-dark font-medium">
                Уроки майже закінчились — потрібне поповнення
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-[12px] text-ink-muted flex-wrap tabular-nums">
            {student.joinedAt && <><span>З {student.joinedAt}</span><span className="text-border">·</span></>}
            <span>Останній урок: <span className="text-ink font-semibold">{student.lastLesson}</span></span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-6 flex-shrink-0 overflow-x-auto">
        {(isAdmin ? adminTabs : teacherTabs).map(([key, label]) => {
          const active = isAdmin ? adminTab === key : teacherTab === key;
          return (
            <button
              key={key}
              onClick={() => isAdmin ? setAdminTab(key as AdminTab) : setTeacherTab(key as TeacherTab)}
              className={`relative px-1 py-3 mr-5 text-[13px] transition-colors whitespace-nowrap ${
                active ? 'text-ink font-semibold' : 'text-ink-muted hover:text-ink font-medium'
              }`}
            >
              {label}
              {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-primary" aria-hidden />}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loadErr && (
          <div className="px-6 py-4 text-[12px] text-danger font-semibold">{loadErr}</div>
        )}

        {/* Video tab — upcoming sessions */}
        {((isAdmin && adminTab === 'video') || (!isAdmin && teacherTab === 'video')) && (
          sessions === null ? <LoadingState /> : upcoming.length === 0 ? (
            <EmptyState text="Немає запланованих уроків" />
          ) : (
            <ul>{upcoming.map((s) => <SessionRow key={s.documentId} s={s} />)}</ul>
          )
        )}

        {/* History tab — past sessions */}
        {!isAdmin && teacherTab === 'history' && (
          sessions === null ? <LoadingState /> : past.length === 0 ? (
            <EmptyState text="Історії уроків ще немає" />
          ) : (
            <ul>{past.map((s) => <SessionRow key={s.documentId} s={s} />)}</ul>
          )
        )}

        {/* Homework tab — submissions */}
        {!isAdmin && teacherTab === 'homework' && (
          subs === null ? <LoadingState /> : subs.length === 0 ? (
            <EmptyState text="Учень ще не отримав жодного ДЗ" />
          ) : (
            <ul>{subs.map((s) => <SubmissionRow key={s.documentId} s={s} />)}</ul>
          )
        )}

        {/* Progress tab — lessons grouped by course */}
        {!isAdmin && teacherTab === 'progress' && (
          progress === null ? <LoadingState /> : progress.length === 0 ? (
            <EmptyState text="Учень ще не розпочав жодного уроку" />
          ) : (
            <ProgressByCourse rows={progress} />
          )
        )}
      </div>

      {/* Parent contact (admin only) */}
      {isAdmin && student.parentName && (
        <div className="px-6 py-4 border-t border-border flex-shrink-0">
          <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-3">Контакт батьків</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-ink-muted">Ім&apos;я</span>
              <span className="text-[13px] font-semibold text-ink">{student.parentName}</span>
            </div>
            {student.parentPhone && (
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-ink-muted">Телефон</span>
                <a href={`tel:${student.parentPhone}`} className="text-[13px] font-semibold text-ink hover:underline underline-offset-2 tabular-nums">{student.parentPhone}</a>
              </div>
            )}
            {student.parentEmail && (
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-ink-muted">Email</span>
                <a href={`mailto:${student.parentEmail}`} className="text-[13px] font-semibold text-ink hover:underline underline-offset-2">{student.parentEmail}</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
