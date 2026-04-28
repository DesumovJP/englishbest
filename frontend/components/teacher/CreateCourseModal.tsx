'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { createTeacherCourse, type Level } from '@/lib/teacher-courses';

const LEVEL_OPTIONS = (['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((l) => ({
  value: l,
  label: `Рівень ${l}`,
}));

const SECTION_LABEL_CLS =
  'font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted';

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCourseModal({ open, onClose }: CreateCourseModalProps) {
  return (
    <Modal isOpen={open} onClose={onClose} title="Новий курс" size="md">
      <Body onClose={onClose} />
    </Modal>
  );
}

function Body({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [titleUa, setTitleUa] = useState('');
  const [level, setLevel] = useState<Level>('A1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) {
      setError('Вкажіть назву англійською');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createTeacherCourse({
        title: title.trim(),
        titleUa: titleUa.trim() || undefined,
        level,
      });
      onClose();
      router.push(`/dashboard/courses/${created.documentId}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося створити');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className={SECTION_LABEL_CLS}>Назва (EN)</span>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Наприклад: My World"
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className={SECTION_LABEL_CLS}>Назва (UA)</span>
        <Input
          value={titleUa}
          onChange={(e) => setTitleUa(e.target.value)}
          placeholder="Мій світ"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className={SECTION_LABEL_CLS}>Рівень</span>
        <Select
          value={level}
          onChange={(e) => setLevel(e.target.value as Level)}
          options={LEVEL_OPTIONS}
        />
      </label>

      {error && <p className="text-[12.5px] text-danger-dark">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Скасувати
        </Button>
        <Button onClick={handleCreate} disabled={submitting || !title.trim()}>
          {submitting ? 'Створюю…' : 'Створити курс'}
        </Button>
      </div>
    </div>
  );
}
