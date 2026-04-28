/**
 * Strapi upload helper — uploads one file via `POST /api/upload` and returns
 * the resulting media row. Backend in prod stores it on DigitalOcean Spaces
 * (S3-compatible) via the `@strapi/provider-upload-aws-s3` provider; the
 * returned `url` already points at the CDN. In local dev the provider falls
 * back to Strapi's disk store under `/uploads/...` and our normalizer
 * absolutizes that to the backend origin.
 */
import { mediaUrl } from './normalize';

export interface UploadedMedia {
  /** Numeric Strapi media id — the value to PATCH onto a relation field. */
  id: number;
  /** Strapi documentId — exists in v5 responses, not always populated. */
  documentId?: string;
  /** Public URL ready to render (CDN in prod, backend origin in dev). */
  url: string;
  name: string;
  mime: string;
  size: number;
}

interface RawMedia {
  id?: number;
  documentId?: string;
  url?: string;
  name?: string;
  mime?: string;
  size?: number;
}

function normalize(raw: RawMedia): UploadedMedia | null {
  if (typeof raw.id !== 'number' || typeof raw.url !== 'string') return null;
  return {
    id: raw.id,
    documentId: typeof raw.documentId === 'string' ? raw.documentId : undefined,
    url: mediaUrl(raw.url) ?? raw.url,
    name: typeof raw.name === 'string' ? raw.name : '',
    mime: typeof raw.mime === 'string' ? raw.mime : '',
    size: typeof raw.size === 'number' ? raw.size : 0,
  };
}

export async function uploadFile(file: File): Promise<UploadedMedia> {
  const form = new FormData();
  form.append('files', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: form,
    cache: 'no-store',
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const msg =
      (errBody && typeof errBody === 'object' && 'error' in errBody
        ? (errBody as { error?: { message?: string } }).error?.message
        : undefined) ?? `upload ${res.status}`;
    throw new Error(msg);
  }
  const json = (await res.json().catch(() => null)) as RawMedia[] | null;
  const first = Array.isArray(json) ? json[0] : null;
  const m = first ? normalize(first) : null;
  if (!m) throw new Error('upload: malformed response');
  return m;
}
