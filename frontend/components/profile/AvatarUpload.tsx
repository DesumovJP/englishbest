'use client';

/**
 * Profile avatar with click-to-upload UI.
 *
 * Frontend-only for now: the picked file is read as a data-URL and stays
 * in component state until the page reloads. A "Backend в розробці"
 * notice is shown so users know the upload doesn't persist yet. When the
 * backend `user-profile.avatar` upload endpoint ships, swap the local
 * data-URL flow for a real `multipart/form-data` POST and persist the
 * resulting URL on the profile.
 */
import { useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

interface AvatarUploadProps {
  name: string;
  initialUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Called with the new data-URL after the user accepts a pick. */
  onChange?: (dataUrl: string) => void;
}

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ACCEPTED = 'image/png,image/jpeg,image/webp,image/gif';

export function AvatarUpload({
  name,
  initialUrl = null,
  size = 'lg',
  className,
  onChange,
}: AvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(initialUrl ?? null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = previewUrl ?? savedUrl ?? undefined;

  function handlePick(file: File) {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Файл має бути зображенням');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Зображення завелике (макс. 4 MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.onerror = () => setError('Не вдалося прочитати файл');
    reader.readAsDataURL(file);
  }

  function handleSaveLocal() {
    if (!previewUrl) return;
    setSavedUrl(previewUrl);
    onChange?.(previewUrl);
    setPreviewUrl(null);
  }

  function handleCancel() {
    setPreviewUrl(null);
    setError(null);
  }

  function openPicker() {
    fileRef.current?.click();
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={openPicker}
          className="relative group rounded-full overflow-hidden flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Змінити аватар"
        >
          <Avatar
            name={name}
            src={displayUrl}
            size={size}
            className="bg-primary/15 text-primary-dark"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Змінити
          </span>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handlePick(f);
            e.target.value = '';
          }}
        />

        <div className="flex flex-col gap-1.5 min-w-0">
          {previewUrl ? (
            <>
              <p className="text-[12px] text-ink">
                Нове фото обрано. Збережи локально щоб побачити прев’ю на цій сторінці.
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveLocal}>
                  Зберегти локально
                </Button>
                <Button size="sm" variant="secondary" onClick={handleCancel}>
                  Скасувати
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[12px] text-ink-muted">
                {savedUrl
                  ? 'Аватар оновлено локально (на цій вкладці).'
                  : 'Натисни на аватар, щоб обрати фото.'}
              </p>
              <p className="text-[11px] text-ink-faint">
                Завантаження на сервер — у розробці. Поки фото зберігається тільки в браузері.
              </p>
              <div>
                <Button size="sm" variant="secondary" onClick={openPicker}>
                  {savedUrl ? 'Замінити фото' : 'Обрати фото'}
                </Button>
              </div>
            </>
          )}
          {error && <p className="text-[12px] text-danger-dark">{error}</p>}
        </div>
      </div>
    </div>
  );
}
