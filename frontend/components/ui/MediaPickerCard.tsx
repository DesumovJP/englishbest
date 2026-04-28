'use client';

/**
 * Generic image-upload card. Picks a file from the OS picker, uploads
 * via `/api/upload` (Strapi → DigitalOcean Spaces in prod), then
 * bubbles the fresh media row to the parent via `onSaved(media)` for
 * persistence on the related entity (course.coverImage,
 * vocabulary-set.coverImage, lesson.cover, …).
 *
 * Differs from `<AvatarUpload>` in two ways:
 *   - renders a rectangular preview (16:9-ish) instead of a circle
 *   - shows a placeholder icon instead of initials when no image is set
 *
 * Both use the same `lib/upload.uploadFile` helper underneath.
 */
import { useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { uploadFile, type UploadedMedia } from '@/lib/upload';

interface MediaPickerCardProps {
  label: string;
  hint?: string;
  initialUrl?: string | null;
  className?: string;
  /** Called after a successful upload. Parent should persist
   *  `media.id` on the related entity (e.g. course / vocab). */
  onSaved?: (media: UploadedMedia) => Promise<void> | void;
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB — covers usually larger than avatars
const ACCEPTED = 'image/png,image/jpeg,image/webp,image/gif';

export function MediaPickerCard({
  label,
  hint,
  initialUrl = null,
  className,
  onSaved,
}: MediaPickerCardProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(initialUrl ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = previewUrl ?? savedUrl ?? null;

  function handlePick(file: File) {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Файл має бути зображенням');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Зображення завелике (макс. 8 MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
        setPendingFile(file);
      }
    };
    reader.onerror = () => setError('Не вдалося прочитати файл');
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!pendingFile) return;
    setError(null);
    setUploading(true);
    try {
      const media = await uploadFile(pendingFile);
      if (onSaved) await onSaved(media);
      setSavedUrl(media.url);
      setPreviewUrl(null);
      setPendingFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося завантажити');
    } finally {
      setUploading(false);
    }
  }

  function handleCancel() {
    setPreviewUrl(null);
    setPendingFile(null);
    setError(null);
  }

  function openPicker() {
    fileRef.current?.click();
  }

  return (
    <Card variant="surface" padding="md" className={className}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted">
            {label}
          </p>
          {hint && <p className="text-[11px] text-ink-faint">{hint}</p>}
        </div>

        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          className="relative group rounded-xl overflow-hidden border border-border bg-surface-muted/40 aspect-[16/9] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
          aria-label="Змінити обкладинку"
        >
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-ink-muted">
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-[12px] font-semibold">Обрати зображення</span>
            </div>
          )}
          {displayUrl && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white text-[12px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Змінити
            </span>
          )}
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

        {pendingFile ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] text-ink truncate min-w-0 flex-1">
              {pendingFile.name} · {(pendingFile.size / 1024).toFixed(0)} KB
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button size="sm" variant="secondary" onClick={handleCancel} disabled={uploading}>
                Скасувати
              </Button>
              <Button size="sm" onClick={handleSave} disabled={uploading}>
                {uploading ? 'Завантажую…' : 'Зберегти'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-ink-faint">
            PNG / JPEG / WEBP / GIF, до 8 MB. Зберігається на DigitalOcean Spaces (CDN).
          </p>
        )}

        {error && <p className="text-[12px] text-danger-dark">{error}</p>}
      </div>
    </Card>
  );
}
