'use client';

/**
 * ModerationBanner — status badge + role-aware action buttons for the
 * approval workflow defined in CONTENT_LIFECYCLE_PLAN.md §6.
 *
 * Renders nothing when `reviewStatus` is null (legacy rows pre-Phase
 * L1 backfill, or content where the field was somehow stripped).
 *
 * Action set is derived purely from `(role, isOwner, status)` — same
 * shape across lesson / course / vocab editors so the three callsites
 * stay symmetric.
 */
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type Status = 'draft' | 'submitted' | 'approved' | 'rejected';

interface Props {
  status: Status | null;
  rejectionReason?: string | null;
  isAdmin: boolean;
  isOwner: boolean;
  busy?: boolean;
  onSubmit?: () => void | Promise<void>;
  onApprove?: () => void | Promise<void>;
  onReject?: (reason: string) => void | Promise<void>;
}

const STATUS_META: Record<Status, { label: string; tone: string; description?: string }> = {
  draft: {
    label: 'Чернетка',
    tone: 'bg-surface-muted text-ink-muted',
    description: 'Не видно учням. Натисни «Подати на затвердження», коли готово.',
  },
  submitted: {
    label: 'На розгляді',
    tone: 'bg-warning/15 text-warning-dark',
    description: 'Очікує рішення адміна.',
  },
  approved: {
    label: 'Затверджено',
    tone: 'bg-success/15 text-success-dark',
    description: 'Контент затверджено. Опублікуй, щоб учні побачили.',
  },
  rejected: {
    label: 'Відхилено',
    tone: 'bg-danger/10 text-danger-dark',
    description: 'Внеси зміни і подай ще раз.',
  },
};

export function ModerationBanner({
  status,
  rejectionReason,
  isAdmin,
  isOwner,
  busy = false,
  onSubmit,
  onApprove,
  onReject,
}: Props) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  if (!status) return null;
  const meta = STATUS_META[status];

  const canSubmit  = (isOwner || isAdmin) && (status === 'draft' || status === 'rejected') && !!onSubmit;
  const canApprove = isAdmin && status === 'submitted' && !!onApprove;
  const canReject  = isAdmin && status === 'submitted' && !!onReject;

  async function handleReject() {
    if (!onReject) return;
    if (!reason.trim()) return;
    await onReject(reason.trim());
    setRejecting(false);
    setReason('');
  }

  return (
    <Card variant="surface" padding="md" className="border-l-4 border-l-primary">
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`ios-chip ${meta.tone}`}>{meta.label}</span>
            {meta.description && (
              <span className="text-[12px] text-ink-muted">{meta.description}</span>
            )}
          </div>
          {status === 'rejected' && rejectionReason && (
            <p className="text-[12px] text-danger-dark mt-1">
              <span className="font-semibold">Причина: </span>
              {rejectionReason}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {canSubmit && (
            <Button size="sm" disabled={busy} onClick={() => onSubmit?.()}>
              {status === 'rejected' ? 'Подати ще раз' : 'Подати на затвердження'}
            </Button>
          )}
          {canApprove && (
            <Button size="sm" disabled={busy} onClick={() => onApprove?.()}>
              Затвердити
            </Button>
          )}
          {canReject && !rejecting && (
            <Button
              size="sm"
              variant="danger"
              disabled={busy}
              onClick={() => setRejecting(true)}
            >
              Відхилити
            </Button>
          )}
        </div>
      </div>

      {rejecting && (
        <div className="mt-3 flex flex-col gap-2 pt-3 border-t border-border">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Причина відхилення
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              autoFocus
              placeholder="Що не так — щоб автор зрозумів, як виправити"
              className="ios-input py-2 leading-relaxed"
            />
          </label>
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setRejecting(false);
                setReason('');
              }}
            >
              Скасувати
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={busy || !reason.trim()}
              onClick={handleReject}
            >
              Відхилити з причиною
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
