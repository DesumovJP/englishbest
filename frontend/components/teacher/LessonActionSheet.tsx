/**
 * LessonActionSheet — live-wired session actions (complete / cancel / reschedule /
 * note / delete). Operates on a `Session` passed in by the calendar page; each
 * action mutates via updateSession/deleteSession and returns the fresh row to
 * the caller so the grid can re-render without a full refetch.
 */
'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  combineStartAt,
  deleteSession,
  splitStartAt,
  updateSession,
  type Session,
  type SessionStatus,
} from '@/lib/sessions';
import {
  SESSION_STATUS_LABEL,
  sessionTypeLabel,
  formatDuration,
  attendeesCountLabel,
} from '@/lib/session-display';

interface LessonActionSheetProps {
  session: Session | null;
  onClose: () => void;
  onChanged?: (session: Session) => void;
  onDeleted?: (documentId: string) => void;
}

type PendingAction =
  | { kind: 'cancel' }
  | { kind: 'reschedule' }
  | { kind: 'note' }
  | null;

// Labels mirror the canonical strings from `lib/session-display`. Only the
// `cls` (visual chip background) stays local — every audience reads the same
// status / type wording so a teacher and a student talking about the same
// session use the same vocabulary.
const STATUS_CLS: Record<SessionStatus, string> = {
  scheduled: 'bg-surface-muted text-ink',
  live:      'bg-success/15 text-success-dark',
  completed: 'bg-surface-muted text-ink-muted',
  cancelled: 'bg-danger/10 text-danger-dark',
  'no-show': 'bg-warning/15 text-warning-dark',
};

const fieldLabel = 'text-xs font-black text-ink-muted uppercase tracking-wide';
const fieldInput =
  'w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary';

export function LessonActionSheet({
  session,
  onClose,
  onChanged,
  onDeleted,
}: LessonActionSheetProps) {
  const [pending, setPending] = useState<PendingAction>(null);
  const [reason, setReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (!session) return null;

  const statusLabel = SESSION_STATUS_LABEL[session.status];
  const statusCls = STATUS_CLS[session.status];
  const split = splitStartAt(session.startAt);
  const audience =
    session.attendees.length === 1
      ? session.attendees[0].displayName
      : attendeesCountLabel(session.attendees);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => {
      setToast(null);
      setPending(null);
      onClose();
    }, 1100);
  }

  async function runUpdate(
    patch: Partial<Parameters<typeof updateSession>[1]>,
    successMsg: string,
  ) {
    setError(null);
    setBusy(true);
    try {
      const next = await updateSession(session!.documentId, patch);
      onChanged?.(next);
      flash(successMsg);
    } catch (e: any) {
      setError(e?.message ?? 'Не вдалось виконати дію');
      setBusy(false);
    }
  }

  async function markCompleted() {
    await runUpdate({ status: 'completed' }, 'Позначено як проведено');
  }

  async function markLive() {
    await runUpdate({ status: 'live' }, 'Урок запущено');
  }

  async function commitCancel() {
    if (!reason.trim()) return;
    const mergedNotes = [session!.notes, `Скасовано: ${reason.trim()}`]
      .filter(Boolean)
      .join('\n');
    await runUpdate(
      { status: 'cancelled', notes: mergedNotes },
      'Урок скасовано',
    );
  }

  async function commitReschedule() {
    if (!newDate || !newTime) return;
    const startAt = combineStartAt(newDate, newTime);
    if (!startAt) {
      setError('Невірна дата або час');
      return;
    }
    await runUpdate({ startAt, status: 'scheduled' }, 'Перенесено');
  }

  async function commitNote() {
    if (!note.trim()) return;
    const mergedNotes = [session!.notes, note.trim()].filter(Boolean).join('\n');
    await runUpdate({ notes: mergedNotes }, 'Нотатку збережено');
  }

  async function handleDelete() {
    if (!confirm('Видалити урок назавжди?')) return;
    setError(null);
    setBusy(true);
    try {
      await deleteSession(session!.documentId);
      onDeleted?.(session!.documentId);
      flash('Урок видалено');
    } catch (e: any) {
      setError(e?.message ?? 'Не вдалось видалити');
      setBusy(false);
    }
  }

  const title = `${split.time || '—'} · ${audience}`;

  return (
    <Modal isOpen={true} onClose={onClose} title={title}>
      {toast ? (
        <div className="py-6 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-black text-ink">{toast}</p>
        </div>
      ) : pending?.kind === 'cancel' ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink">Вкажи причину скасування:</p>
          <textarea
            autoFocus
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Наприклад: учень захворів"
            className={`${fieldInput} h-auto min-h-24 py-2 resize-y`}
          />
          {error && <p className="text-xs text-danger-dark">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPending(null)} disabled={busy}>
              Назад
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={commitCancel}
              loading={busy}
              disabled={!reason.trim()}
            >
              Скасувати урок
            </Button>
          </div>
        </div>
      ) : pending?.kind === 'reschedule' ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>Нова дата</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className={fieldInput}
              />
            </div>
            <div>
              <label className={fieldLabel}>Новий час</label>
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className={fieldInput}
              />
            </div>
          </div>
          {error && <p className="text-xs text-danger-dark">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPending(null)} disabled={busy}>
              Назад
            </Button>
            <Button
              size="sm"
              onClick={commitReschedule}
              loading={busy}
              disabled={!newDate || !newTime}
            >
              Перенести
            </Button>
          </div>
        </div>
      ) : pending?.kind === 'note' ? (
        <div className="flex flex-col gap-3">
          <textarea
            autoFocus
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Що важливо пам'ятати про цей урок…"
            className={`${fieldInput} h-auto min-h-28 py-2 resize-y`}
          />
          {error && <p className="text-xs text-danger-dark">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPending(null)} disabled={busy}>
              Назад
            </Button>
            <Button
              size="sm"
              onClick={commitNote}
              loading={busy}
              disabled={!note.trim()}
            >
              Зберегти
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${statusCls}`}>
              {statusLabel}
            </span>
            <span className="text-xs text-ink-muted">
              {split.date || '—'}
              {session.durationMin ? ` · ${formatDuration(session.durationMin)}` : ''}
              {session.type ? ` · ${sessionTypeLabel(session.type)}` : ''}
            </span>
          </div>

          {session.course?.title && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              {session.course.title}
            </p>
          )}
          {session.title && (
            <p className="text-sm font-semibold text-ink">{session.title}</p>
          )}

          {session.joinUrl && (
            <a
              href={session.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 h-10 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors w-fit"
            >
              <ActionIcon name="link" />
              Відкрити кімнату
            </a>
          )}

          <div className="grid grid-cols-2 gap-2">
            <ActionBtn
              icon={<ActionIcon name="play" />}
              label="Запустити"
              disabled={busy || session.status !== 'scheduled'}
              onClick={markLive}
            />
            <ActionBtn
              icon={<ActionIcon name="check" />}
              label="Провести"
              disabled={busy || session.status === 'completed'}
              onClick={markCompleted}
            />
            <ActionBtn
              icon={<ActionIcon name="note" />}
              label="Нотатка"
              disabled={busy}
              onClick={() => setPending({ kind: 'note' })}
            />
            <ActionBtn
              icon={<ActionIcon name="calendar" />}
              label="Перенести"
              disabled={busy || session.status === 'completed'}
              onClick={() => setPending({ kind: 'reschedule' })}
            />
            <ActionBtn
              icon={<ActionIcon name="cancel" />}
              label="Скасувати"
              tone="danger"
              disabled={busy || session.status === 'completed' || session.status === 'cancelled'}
              onClick={() => setPending({ kind: 'cancel' })}
            />
            <ActionBtn
              icon={<ActionIcon name="trash" />}
              label="Видалити"
              tone="danger"
              disabled={busy}
              onClick={handleDelete}
            />
          </div>

          {session.notes && (
            <p className="text-xs text-ink bg-surface-muted rounded-lg px-3 py-2 whitespace-pre-line">
              <span className="font-bold">Нотатка:</span> {session.notes}
            </p>
          )}

          {error && <p className="text-xs text-danger-dark">{error}</p>}
        </div>
      )}
    </Modal>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  disabled,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}) {
  const toneCls = disabled
    ? 'border-border/60 text-ink-faint cursor-not-allowed'
    : tone === 'danger'
      ? 'border-border text-danger-dark hover:border-danger/40 hover:bg-danger/5'
      : 'border-border text-ink hover:border-primary/40 hover:bg-primary/5';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2.5 h-10 px-3 rounded-xl border bg-white text-sm font-semibold transition-colors ${toneCls}`}
    >
      <span className="flex-shrink-0 text-ink-faint">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function ActionIcon({ name }: { name: 'play' | 'check' | 'note' | 'calendar' | 'cancel' | 'trash' | 'link' }) {
  const props = {
    className: 'w-[18px] h-[18px]',
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'play':
      return <svg {...props}><path d="M7 5l12 7-12 7V5Z" /></svg>;
    case 'check':
      return <svg {...props}><path d="M5 12l4.5 4.5L19 7" /></svg>;
    case 'note':
      return <svg {...props}><path d="M5 4h11l3 3v13H5V4Z" /><path d="M8 10h8M8 14h8M8 18h5" /></svg>;
    case 'calendar':
      return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
    case 'cancel':
      return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M5.5 5.5l13 13" /></svg>;
    case 'trash':
      return <svg {...props}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>;
    case 'link':
      return <svg {...props}><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1.5-1.5" /></svg>;
  }
}
