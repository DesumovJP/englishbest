'use client';
import type { StepVideo } from '@/mocks/lessons/types';

interface Props {
  step: StepVideo;
  onContinue: () => void;
}

/* Витягуємо YouTube video ID і повертаємо embed URL */
function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    // youtube.com/watch?v=...
    const v = u.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${v}`;
    // youtu.be/...
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed${u.pathname}`;
    // vimeo.com/123456
    if (u.hostname.includes('vimeo.com')) return `https://player.vimeo.com/video${u.pathname}`;
    // already an embed URL
    return url;
  } catch {
    return url;
  }
}

export function StepVideo({ step, onContinue }: Props) {
  const embedUrl = toEmbedUrl(step.url);

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <div>
        <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-3">Подивись відео</p>
        <h2 className="text-xl font-black text-ink mb-4">{step.title}</h2>
        <div className="relative w-full rounded-2xl overflow-hidden border-2 border-border bg-black aspect-video">
          <iframe
            src={embedUrl}
            title={step.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        {step.caption && (
          <p className="text-sm text-ink-muted mt-2 text-center">{step.caption}</p>
        )}
      </div>
      <button
        onClick={onContinue}
        className="w-full py-4 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white font-black text-base hover:opacity-90 transition-opacity"
      >
        Далі →
      </button>
    </div>
  );
}
