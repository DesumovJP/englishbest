'use client';
import { Modal } from '@/components/ui/Modal';
import { BLOCK_KIND_LABELS, BLOCK_KIND_ICONS } from '@/lib/ui/teacher-labels';
import type { BlockKind } from '@/lib/types/teacher';

interface BlockPickerProps {
  open: boolean;
  onClose: () => void;
  onPick: (kind: BlockKind) => void;
}

const KINDS: BlockKind[] = [
  'text',
  'image',
  'audio',
  'video',
  'exercise-multiple-choice',
  'exercise-text-input',
  'exercise-matching',
  'exercise-word-order',
  'exercise-fill-gap',
  'flashcards',
  'link',
  'teacher-note',
];

export function BlockPicker({ open, onClose, onPick }: BlockPickerProps) {
  return (
    <Modal isOpen={open} onClose={onClose} title="Додати блок">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {KINDS.map(kind => (
          <button
            key={kind}
            type="button"
            onClick={() => {
              onPick(kind);
              onClose();
            }}
            className="flex flex-col items-start gap-1.5 p-3 rounded-xl border border-border bg-white hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
          >
            <span className="text-xl">{BLOCK_KIND_ICONS[kind]}</span>
            <span className="text-xs font-black text-ink leading-tight">
              {BLOCK_KIND_LABELS[kind]}
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
