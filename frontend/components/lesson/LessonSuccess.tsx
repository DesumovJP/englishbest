import Link from 'next/link';

interface LessonSuccessProps {
  xp: number;
  coinsEarned: number;
  lessonTitle: string;
  courseSlug: string;
  nextLessonSlug?: string;
  backUrl?: string;
  /** Optional post-lesson CTA. Rendered only when all three fields are present. */
  teacherName?: string;
  teacherPhoto?: string;
  callUrl?: string;
}

function RewardStat({ src, value, label }: { src: string; value: number; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 py-5 px-3 rounded-2xl bg-white border border-border">
      <img src={src} alt="" aria-hidden width={40} height={40} className="object-contain" />
      <p className="text-ink text-2xl font-black leading-none tabular-nums">+{value}</p>
      <p className="type-label text-ink-faint">{label}</p>
    </div>
  );
}

export function LessonSuccess({
  xp, coinsEarned, lessonTitle, courseSlug, nextLessonSlug,
  backUrl = '/kids/school', teacherName, teacherPhoto, callUrl,
}: LessonSuccessProps) {
  return (
    <div className="min-h-dvh bg-lesson-engine flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-5">

        {/* Celebration sheet */}
        <div className="rounded-[28px] bg-white border border-border shadow-card overflow-hidden">

          {/* Hero */}
          <div className="flex flex-col items-center px-6 pt-8 pb-5 text-center">
            <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center shadow-press-accent mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-ink">
                <path d="M5 7h14M7 7v3a5 5 0 0 0 10 0V7M9 21h6M12 17v4M3 7h2v3a2 2 0 0 1-2 2M21 7h-2v3a2 2 0 0 0 2 2" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-ink tracking-tight">Урок завершено!</h1>
            <p className="text-ink-muted text-sm mt-1.5">{lessonTitle}</p>
          </div>

          {/* Rewards */}
          <div className="flex gap-3 px-5">
            <RewardStat src="/xp.png"   value={xp}          label="XP" />
            <RewardStat src="/coin.png" value={coinsEarned} label="Coins" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-5 pt-5 pb-5">
            <Link
              href={backUrl}
              className="flex-1 h-12 rounded-2xl border border-border text-ink-muted text-sm font-bold flex items-center justify-center hover:bg-surface-muted transition-colors"
            >
              До уроків
            </Link>
            {nextLessonSlug ? (
              <Link
                href={`/courses/${courseSlug}/lessons/${nextLessonSlug}`}
                className="flex-1 h-12 rounded-2xl bg-accent text-ink text-sm font-black flex items-center justify-center shadow-press-accent active:translate-y-1 active:shadow-none transition-transform"
              >
                Наступний урок →
              </Link>
            ) : (
              <Link
                href={backUrl}
                className="flex-1 h-12 rounded-2xl bg-accent text-ink text-sm font-black flex items-center justify-center shadow-press-accent active:translate-y-1 active:shadow-none transition-transform"
              >
                Завершити
              </Link>
            )}
          </div>

          {teacherName && teacherPhoto && callUrl && (
            <>
              <div className="h-px bg-border mx-5" />
              <a
                href={callUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-muted transition-colors group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={teacherPhoto}
                  alt={teacherName}
                  className="w-12 h-12 rounded-2xl object-cover border border-border flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="type-label text-ink-faint mb-0.5">Закріпи з вчителем</p>
                  <p className="text-ink font-black text-base leading-tight truncate">{teacherName}</p>
                  <p className="text-ink-muted text-xs mt-0.5 leading-snug">
                    Живе заняття — найкращий спосіб не забути нові слова.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center flex-shrink-0 shadow-press-success group-active:translate-y-0.5 group-active:shadow-none transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M23 7l-7 5 7 5V7Z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </div>
              </a>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
