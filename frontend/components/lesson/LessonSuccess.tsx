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
    <div className="flex-1 flex flex-col items-center gap-2 py-5 px-3 rounded-2xl bg-white/5 border border-white/10">
      <img src={src} alt="" aria-hidden width={44} height={44} className="object-contain drop-shadow-lg" />
      <p className="text-white text-3xl font-black leading-none tracking-tight">+{value}</p>
      <p className="type-label text-white/50">{label}</p>
    </div>
  );
}

export function LessonSuccess({
  xp, coinsEarned, lessonTitle, courseSlug, nextLessonSlug,
  backUrl = '/kids/school', teacherName, teacherPhoto, callUrl,
}: LessonSuccessProps) {
  return (
    <div className="min-h-dvh bg-lesson-success flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-6">

        {/* Floating stars */}
        <div className="flex items-end justify-center gap-2 -mb-2 select-none pointer-events-none" aria-hidden>
          <span className="text-3xl opacity-50 -rotate-[15deg]">⭐</span>
          <span className="text-5xl drop-shadow-[0_4px_16px_rgba(255,200,0,0.5)]">⭐</span>
          <span className="text-3xl opacity-50 rotate-[15deg]">⭐</span>
        </div>

        {/* Celebration sheet */}
        <div className="rounded-[32px] bg-white/[0.06] border border-white/10 backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">

          {/* Hero */}
          <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-xl shadow-accent/40 mb-4">
              <span className="text-5xl" role="img" aria-label="Трофей">🏆</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Урок завершено!</h1>
            <p className="text-white/55 text-sm mt-1.5">{lessonTitle}</p>
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
              className="flex-1 h-12 rounded-2xl border border-white/20 text-white/80 text-sm font-bold flex items-center justify-center hover:bg-white/5 transition-colors"
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
              <div className="h-px bg-white/10 mx-5" />
              <a
                href={callUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.04] transition-colors group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={teacherPhoto}
                  alt={teacherName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="type-label text-white/40 mb-0.5">Закріпи з вчителем</p>
                  <p className="text-white font-black text-base leading-tight truncate">{teacherName}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-snug">
                    Живе заняття — найкращий спосіб не забути нові слова.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center flex-shrink-0 shadow-press-success group-active:translate-y-0.5 group-active:shadow-none transition-transform">
                  <span className="text-lg">📹</span>
                </div>
              </a>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
