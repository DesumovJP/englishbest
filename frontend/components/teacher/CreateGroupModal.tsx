/**
 * CreateGroupModal — live-wired group create/edit modal.
 *
 * Loads teacher's own students (`/api/teacher/me/students`) for the member
 * picker. When `editing` is provided, the modal operates in edit mode
 * (prefills + calls `updateGroup` + exposes a "Delete" action); otherwise it
 * creates a new group via `createGroup`.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  createGroup,
  deleteGroup,
  updateGroup,
  type Group,
  type GroupLevel,
} from '@/lib/groups';
import { fetchMyStudentsCached, type TeacherStudent } from '@/lib/teacher-students';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (group: Group) => void;
  onUpdated?: (group: Group) => void;
  onDeleted?: (groupId: string) => void;
  editing?: Group | null;
}

const LEVELS: GroupLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const fieldLabel = 'text-xs font-black text-ink-muted uppercase tracking-wide';
const fieldInput =
  'w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-white text-sm text-ink focus:outline-none focus:border-primary';

export function CreateGroupModal({
  open,
  onClose,
  onCreated,
  onUpdated,
  onDeleted,
  editing,
}: CreateGroupModalProps) {
  const isEdit = Boolean(editing);

  const [students,     setStudents]   = useState<TeacherStudent[]>([]);
  const [loadStatus,   setLoadStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const [name,         setName]       = useState('');
  const [level,        setLevel]      = useState<GroupLevel>('A1');
  const [meetUrl,      setMeetUrl]    = useState('');
  const [memberIds,    setMemberIds]  = useState<string[]>([]);
  const [submitting,   setSubmitting] = useState(false);
  const [deleting,     setDeleting]   = useState(false);
  const [error,        setError]      = useState<string | null>(null);
  const [toast,        setToast]      = useState<string | null>(null);
  const [memberQuery,  setMemberQuery]= useState('');

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoadStatus('loading');
    setError(null);
    fetchMyStudentsCached()
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

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setLevel(editing.level);
      setMeetUrl(editing.meetUrl ?? '');
      setMemberIds(editing.members.map((m) => m.documentId));
    } else {
      setName('');
      setLevel('A1');
      setMeetUrl('');
      setMemberIds([]);
    }
    setSubmitting(false);
    setDeleting(false);
    setError(null);
    setToast(null);
  }, [open, editing]);

  function resetForm() {
    setName('');
    setLevel('A1');
    setMeetUrl('');
    setMemberIds([]);
    setSubmitting(false);
    setDeleting(false);
    setError(null);
    setToast(null);
  }

  function handleClose() {
    if (submitting || deleting) return;
    resetForm();
    onClose();
  }

  function addMember(id: string) {
    setMemberIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function removeMember(id: string) {
    setMemberIds((prev) => prev.filter((x) => x !== id));
  }

  const sortedStudents = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    const memberSet = new Set(memberIds);
    const filtered = q
      ? students.filter((s) => s.displayName.toLowerCase().includes(q))
      : students;
    return [...filtered].sort((a, b) => {
      const aIn = memberSet.has(a.documentId) ? 0 : 1;
      const bIn = memberSet.has(b.documentId) ? 0 : 1;
      if (aIn !== bIn) return aIn - bIn;
      return a.displayName.localeCompare(b.displayName, 'uk');
    });
  }, [students, memberIds, memberQuery]);

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
      if (isEdit && editing) {
        const g = await updateGroup(editing.documentId, {
          name: trimmed,
          level,
          meetUrl: meetUrl.trim() || null,
          memberIds,
        });
        onUpdated?.(g);
        setToast(`Групу «${g.name}» оновлено`);
      } else {
        const g = await createGroup({
          name: trimmed,
          level,
          meetUrl: meetUrl.trim() || null,
          memberIds: memberIds.length > 0 ? memberIds : undefined,
        });
        onCreated?.(g);
        setToast(`Групу «${g.name}» створено`);
      }
      window.setTimeout(() => {
        resetForm();
        onClose();
      }, 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалось зберегти групу');
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    if (!window.confirm(`Видалити групу «${editing.name}»? Цю дію не можна скасувати.`)) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteGroup(editing.documentId);
      onDeleted?.(editing.documentId);
      setToast('Групу видалено');
      window.setTimeout(() => {
        resetForm();
        onClose();
      }, 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалось видалити групу');
      setDeleting(false);
    }
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title={isEdit ? 'Редагувати групу' : 'Нова група'}>
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
              disabled={submitting || deleting}
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
                  disabled={submitting || deleting}
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
              disabled={submitting || deleting}
              onChange={(e) => setMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/…"
              className={fieldInput}
            />
          </div>

          <div>
            <label className={fieldLabel}>
              Учасники {memberIds.length > 0 && <span className="text-primary-dark">· у групі {memberIds.length}</span>}
            </label>
            {students.length === 0 ? (
              <p className="mt-2 text-[13px] text-ink-muted">Немає доступних учнів</p>
            ) : (
              <>
                <input
                  type="search"
                  value={memberQuery}
                  onChange={(e) => setMemberQuery(e.target.value)}
                  placeholder="Пошук учня…"
                  disabled={submitting || deleting}
                  className={fieldInput}
                />
                <div className="mt-1.5 max-h-56 overflow-y-auto border border-border rounded-xl divide-y divide-border">
                  {sortedStudents.length === 0 ? (
                    <p className="px-3 py-4 text-[13px] text-ink-muted text-center">Нічого не знайдено</p>
                  ) : (
                    sortedStudents.map((s) => {
                      const isMember = memberIds.includes(s.documentId);
                      return (
                        <div
                          key={s.documentId}
                          className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                            isMember ? 'bg-primary/5' : 'bg-white'
                          }`}
                        >
                          <span className="text-[13px] text-ink flex-1 truncate">
                            {s.displayName}
                          </span>
                          {s.level && (
                            <span className="text-[11px] font-bold text-ink-muted">{s.level}</span>
                          )}
                          {isMember ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMember(s.documentId)}
                              disabled={submitting || deleting}
                              className="text-danger-dark hover:bg-danger/10"
                            >
                              Прибрати
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => addMember(s.documentId)}
                              disabled={submitting || deleting}
                            >
                              Додати
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>

          {error && <p className="text-sm text-danger-dark">{error}</p>}

          <div className="flex gap-2 pt-2">
            {isEdit && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={submitting || deleting}
              >
                {deleting ? 'Видаляю…' : 'Видалити'}
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={submitting || deleting}
              fullWidth
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={submitting || deleting} fullWidth>
              {submitting ? (isEdit ? 'Зберігаю…' : 'Створюю…') : isEdit ? 'Зберегти' : 'Створити'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
