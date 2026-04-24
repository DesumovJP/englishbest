/**
 * CreateGroupModal — live-wired group creation.
 *
 * Loads teacher's own students (`/api/teacher/me/students`) so the caller
 * can pick initial members. Submits via `createGroup()`.
 */
'use client';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { createGroup, type Group, type GroupLevel } from '@/lib/groups';
import { fetchMyStudents, type TeacherStudent } from '@/lib/teacher-students';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (group: Group) => void;
}

const LEVELS: GroupLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const fieldLabel = 'text-xs font-black text-ink-muted uppercase tracking-wide';
const fieldInput =
  'w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary';

export function CreateGroupModal({ open, onClose, onCreated }: CreateGroupModalProps) {
  const [students,     setStudents]   = useState<TeacherStudent[]>([]);
  const [loadStatus,   setLoadStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const [name,         setName]       = useState('');
  const [level,        setLevel]      = useState<GroupLevel>('A1');
  const [meetUrl,      setMeetUrl]    = useState('');
  const [memberIds,    setMemberIds]  = useState<string[]>([]);
  const [submitting,   setSubmitting] = useState(false);
  const [error,        setError]      = useState<string | null>(null);
  const [toast,        setToast]      = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoadStatus('loading');
    setError(null);
    fetchMyStudents()
      .then((rows) => {
        if (!alive) return;
        setStudents(rows);
        setLoadStatus('ready');
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'failed');
        setLoadStatus('error');
      });
    return () => { alive = false; };
  }, [open]);

  function resetForm() {
    setName('');
    setLevel('A1');
    setMeetUrl('');
    setMemberIds([]);
    setSubmitting(false);
    setError(null);
    setToast(null);
  }

  function handleClose() {
    if (submitting) return;
    resetForm();
    onClose();
  }

  function toggleMember(id: string) {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Вкажи назву групи');
      return;
    }
    setSubmitting(true);
    try {
      const g = await createGroup({
        name: trimmed,
        level,
        meetUrl: meetUrl.trim() || null,
        memberIds: memberIds.length > 0 ? memberIds : undefined,
      });
      onCreated?.(g);
      setToast(`Групу «${g.name}» створено`);
      window.setTimeout(() => {
        resetForm();
        onClose();
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалось створити групу');
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title="Нова група">
      {toast ? (
        <div className="py-10 text-center">
          <p className="text-3xl mb-3">✅</p>
          <p className="font-black text-ink">{toast}</p>
        </div>
      ) : loadStatus === 'loading' ? (
        <div className="py-10 text-center text-ink-muted text-sm">Завантаження учнів…</div>
      ) : loadStatus === 'error' ? (
        <div className="py-10 text-center">
          <p className="text-sm text-danger-dark mb-3">{error ?? 'Помилка завантаження'}</p>
          <Button variant="secondary" size="sm" onClick={handleClose}>Закрити</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className={fieldLabel} htmlFor="grp-name">Назва</label>
            <input
              id="grp-name"
              type="text"
              value={name}
              required
              disabled={submitting}
              onChange={(e) => setName(e.target.value)}
              placeholder="Напр. Ранок A1 · ПН/СР"
              className={fieldInput}
            />
          </div>

          <div>
            <label className={fieldLabel}>Рівень</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  disabled={submitting}
                  onClick={() => setLevel(l)}
                  className={`px-3 py-1.5 rounded-lg border text-[13px] font-bold transition-colors ${
                    level === l
                      ? 'border-primary bg-primary/10 text-primary-dark'
                      : 'border-border text-ink-muted hover:border-primary/40'
                  } disabled:opacity-50`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={fieldLabel} htmlFor="grp-meet">Zoom/Meet URL</label>
            <input
              id="grp-meet"
              type="url"
              value={meetUrl}
              disabled={submitting}
              onChange={(e) => setMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/…"
              className={fieldInput}
            />
          </div>

          <div>
            <label className={fieldLabel}>
              Учасники {memberIds.length > 0 && <span className="text-primary-dark">· вибрано {memberIds.length}</span>}
            </label>
            {students.length === 0 ? (
              <p className="mt-2 text-[13px] text-ink-muted">Немає доступних учнів</p>
            ) : (
              <div className="mt-1.5 max-h-48 overflow-y-auto border border-border rounded-xl">
                {students.map((s) => {
                  const checked = memberIds.includes(s.documentId);
                  return (
                    <label
                      key={s.documentId}
                      className="flex items-center gap-3 px-3 py-2 border-b border-border last:border-b-0 cursor-pointer hover:bg-surface-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={submitting}
                        onChange={() => toggleMember(s.documentId)}
                      />
                      <span className="text-[13px] text-ink flex-1 truncate">{s.displayName}</span>
                      {s.level && (
                        <span className="text-[11px] font-bold text-ink-muted">{s.level}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-danger-dark">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting} fullWidth>
              Скасувати
            </Button>
            <Button type="submit" disabled={submitting} fullWidth>
              {submitting ? 'Створюю…' : 'Створити'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
