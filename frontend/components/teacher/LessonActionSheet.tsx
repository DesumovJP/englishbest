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

const STATUS_STYLES: Record<SessionStatus, { label: string; cls: string }> = {
  scheduled: { label: 'Заплановано',  cls: 'bg-surface-muted text-ink' },
  live:      { label: 'У процесі',    cls: 'bg-success/15 text-success-dark' },
  completed: { label: 'Проведено',    cls: 'bg-surface-muted text-ink-muted' },
  cancelled: { label: 'Скасовано',    cls: 'bg-danger/10 text-danger-dark' },
  'no-show': { label: 'Неявка',       cls: 'bg-warning/15 text-warning-dark' },
};

const TYPE_LABELS: Record<Session['type'], string> = {
  group:          'Група',
  'one-to-one':   '1-на-1',
  trial:          'Пробне',
  consultation:   'Консультація',
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

  const status = STATUS_STYLES[session.status];
  const split = splitStartAt(session.startAt);
  const audience =
    session.attendees.length === 1
      ? session.attendees[0].displayName
      : `${session.attendees.length} учнів`;

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
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${status.cls}`}>
              {status.label}
            </span>
            <span className="text-xs text-ink-muted">
              {split.date || '—'} · {session.durationMin} хв · {TYPE_LABELS[session.type]}
            </span>
          </div>

          {session.title && (
            <p className="text-sm font-semibold text-ink">{session.title}</p>
          )}

          <div className="grid grid-cols-2 gap-2">
            {session.joinUrl && (
              <a
                href={session.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-left px-3 py-2.5 rounded-xl border border-border text-ink hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">▶</span>
                  <span className="text-sm font-black">Відкрити кімнату</span>
                </div>
                <p className="text-[11px] text-ink-muted mt-0.5">Перейти за посиланням</p>
              </a>
            )}
            <ActionBtn
              icon="▶️"
              label="Запустити"
              hint="Позначити як у процесі"
              disabled={busy || session.status !== 'scheduled'}
              onClick={markLive}
            />
            <ActionBtn
              icon="✓"
              label="Провести"
              hint="Позначити як проведений"
              disabled={busy || session.status === 'completed'}
              onClick={markCompleted}
            />
            <ActionBtn
              icon="📝"
              label="Нотатка"
              disabled={busy}
              onClick={() => setPending({ kind: 'note' })}
            />
            <ActionBtn
              icon="📆"
              label="Перенести"
              disabled={busy || session.status === 'completed'}
              onClick={() => setPending({ kind: 'reschedule' })}
            />
            <ActionBtn
              icon="❌"
              label="Скасувати"
              tone="danger"
              disabled={busy || session.status === 'completed' || session.status === 'cancelled'}
              onClick={() => setPending({ kind: 'cancel' })}
            />
            <ActionBtn
              icon="🗑"
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
  hint,
  onClick,
  disabled,
  tone = 'default',
}: {
  icon: string;
  label: string;
  hint?: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-left px-3 py-2.5 rounded-xl border transition-colors ${
        disabled
          ? 'border-border/50 text-ink-faint cursor-not-allowed'
          : tone === 'danger'
            ? 'border-border text-danger-dark hover:bg-danger/10 hover:border-danger/30'
            : 'border-border text-ink hover:border-primary/40 hover:bg-primary/5'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-black">{label}</span>
      </div>
      {hint && <p className="text-[11px] text-ink-muted mt-0.5">{hint}</p>}
    </button>
  );
}
