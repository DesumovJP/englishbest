'use client';

/**
 * Profile avatar with click-to-upload UI.
 *
 * Flow: click avatar → file picker → local preview (data-URL) →
 * `Зберегти` posts the file to `/api/upload` (Strapi → DigitalOcean
 * Spaces in prod via `@strapi/provider-upload-aws-s3`) → parent persists
 * the resulting media id on the profile via `onSaved(media)`.
 *
 * Validation: image MIME, 4 MB cap. The picker is hidden behind a
 * keyboard-focusable button overlay on the avatar.
 */
import { useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { uploadFile, type UploadedMedia } from '@/lib/upload';

interface AvatarUploadProps {
  name: string;
  initialUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Called after a successful upload + parent-side persistence handler. */
  onSaved?: (media: UploadedMedia) => Promise<void> | void;
}

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ACCEPTED = 'image/png,image/jpeg,image/webp,image/gif';

export function AvatarUpload({
  name,
  initialUrl = null,
  size = 'lg',
  className,
  onSaved,
}: AvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(initialUrl ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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
    <div className={className}>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          className="relative group rounded-full overflow-hidden flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
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

        {(pendingFile || error) && (
          <div className="flex flex-col gap-1.5 min-w-0">
            {pendingFile && (
              <>
                <p className="text-[12px] text-ink">
                  {pendingFile.name} · {(pendingFile.size / 1024).toFixed(0)} KB
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSave} disabled={uploading}>
                    {uploading ? 'Завантажую…' : 'Зберегти'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleCancel} disabled={uploading}>
                    Скасувати
                  </Button>
                </div>
              </>
            )}
            {error && <p className="text-[12px] text-danger-dark">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
