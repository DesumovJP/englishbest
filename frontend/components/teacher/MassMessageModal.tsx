/**
 * MassMessageModal — live-wired broadcast.
 *
 * Loads teacher's own students + groups on open to power recipient counts.
 * Submits via `broadcastMessage()` (teacher-only backend action). The backend
 * resolves the actual recipient list from the audience spec — client just
 * surfaces counts.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { fetchMyStudents, type TeacherStudent } from '@/lib/teacher-students';
import { fetchGroups, type Group as TeacherGroup } from '@/lib/groups';
import { broadcastMessage, type BroadcastAudience } from '@/lib/messaging';

type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

interface MassMessageModalProps {
  open: boolean;
  onClose: () => void;
  onSent?: (count: number) => void;
}

const AUDIENCE_OPTIONS: Array<{ value: BroadcastAudience; label: string }> = [
  { value: 'all-students', label: 'Усім учням'   },
  { value: 'all-parents',  label: 'Усім батькам' },
  { value: 'group',        label: 'Групі'        },
  { value: 'level',        label: 'За рівнем'    },
];

const LEVELS: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LABEL_CLS = 'text-[10px] font-semibold text-ink-faint uppercase tracking-wider';

export function MassMessageModal({ open, onClose, onSent }: MassMessageModalProps) {
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [groups, setGroups] = useState<TeacherGroup[]>([]);
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const [audience, setAudience] = useState<BroadcastAudience>('all-students');
  const [groupId, setGroupId] = useState('');
  const [level, setLevel] = useState<Level>('A1');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoadStatus('loading');
    setError(null);
    Promise.all([fetchMyStudents(), fetchGroups()])
      .then(([st, gr]) => {
        if (!alive) return;
        setStudents(st);
        setGroups(gr);
        setLoadStatus('ready');
      })
      .catch(e => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'failed');
        setLoadStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [open]);

  const recipientsCount = useMemo(() => {
    if (audience === 'all-students') return students.length;
    if (audience === 'all-parents') {
      return students.reduce((acc, s) => acc + (s.status === 'active' ? 1 : 0), 0);
    }
    if (audience === 'group') {
      return groups.find(g => g.documentId === groupId)?.members.length ?? 0;
    }
    if (audience === 'level') {
      return students.filter(s => s.level === level).length;
    }
    return 0;
  }, [audience, students, groups, groupId, level]);

  function resetForm() {
    setAudience('all-students');
    setGroupId('');
    setLevel('A1');
    setBody('');
    setSubmitting(false);
    setError(null);
    setToast(null);
  }

  function handleClose() {
    if (submitting) return;
    resetForm();
    onClose();
  }

  const canSend =
    !submitting &&
    body.trim() !== '' &&
    (audience !== 'group' || groupId !== '');

  async function send() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await broadcastMessage({
        audience,
        body: body.trim(),
        groupId: audience === 'group' ? groupId : undefined,
        level: audience === 'level' ? level : undefined,
      });
      onSent?.(res.count);
      setToast(`Надіслано: ${res.count} отримувач(ів)`);
      window.setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (e: any) {
      setError(e?.message ?? 'Не вдалося надіслати');
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title="Написати всім">
      {toast ? (
        <div className="py-6 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-[14px] font-semibold text-ink">{toast}</p>
        </div>
      ) : loadStatus === 'loading' ? (
        <div className="py-10 text-center text-ink-muted text-sm">Завантаження учнів і груп…</div>
      ) : loadStatus === 'error' ? (
        <div className="py-10 text-center">
          <p className="text-sm text-danger-dark mb-3">{error ?? 'Помилка завантаження'}</p>
          <Button variant="secondary" size="sm" onClick={handleClose}>Закрити</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <p className={`${LABEL_CLS} mb-1.5`}>Аудиторія</p>
            <div className="grid grid-cols-2 gap-1.5">
              {AUDIENCE_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  disabled={submitting}
                  onClick={() => setAudience(opt.value)}
                  className={`px-3 h-9 rounded-md border text-[13px] font-medium transition-colors ${
                    audience === opt.value
                      ? 'border-primary bg-surface-muted text-ink'
                      : 'border-border text-ink-muted hover:text-ink hover:border-primary/40'
                  } disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {audience === 'group' && (
            <div>
              <p className={`${LABEL_CLS} mb-1.5`}>Група</p>
              <select
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
                disabled={submitting || groups.length === 0}
                className="w-full h-10 px-3 rounded-md border border-border bg-white text-[13px] text-ink focus:outline-none focus:border-primary"
              >
                <option value="">
                  {groups.length === 0 ? 'Немає груп' : 'Обрати групу…'}
                </option>
                {groups.map(g => (
                  <option key={g.documentId} value={g.documentId}>
                    {g.name} · {g.level} · {g.members.length} учнів
                  </option>
                ))}
              </select>
            </div>
          )}

          {audience === 'level' && (
            <div>
              <p className={`${LABEL_CLS} mb-1.5`}>Рівень</p>
              <div className="grid grid-cols-7 gap-1.5">
                {LEVELS.map(l => (
                  <button
                    type="button"
                    key={l}
                    disabled={submitting}
                    onClick={() => setLevel(l)}
                    className={`h-9 rounded-md border text-[12px] font-semibold tabular-nums transition-colors ${
                      level === l
                        ? 'border-primary bg-surface-muted text-ink'
                        : 'border-border text-ink-muted hover:text-ink hover:border-primary/40'
                    } disabled:opacity-50`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className={`${LABEL_CLS} mb-1.5`}>Повідомлення</p>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              disabled={submitting}
              rows={5}
              placeholder="Ваше повідомлення…"
              className="w-full px-3 py-2.5 rounded-md border border-border bg-white text-[13px] text-ink focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 resize-y"
            />
          </div>

          <div className="flex items-center justify-between gap-2 px-3 h-9 rounded-md bg-surface-muted border border-border text-[12px]">
            <span className="text-ink-muted">Отримувачів (приблизно)</span>
            <span className="font-semibold text-ink tabular-nums">{recipientsCount}</span>
          </div>

          {error && <p className="text-xs text-danger-dark">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={submitting}>
              Скасувати
            </Button>
            <Button size="sm" onClick={send} loading={submitting} disabled={!canSend}>
              Надіслати
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
