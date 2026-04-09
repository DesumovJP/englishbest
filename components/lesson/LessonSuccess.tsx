import Link from 'next/link';

interface LessonSuccessProps {
  xp: number;
  lessonTitle: string;
  courseSlug: string;
  nextLessonSlug?: string;
  teacherName: string;
  teacherPhoto: string;
  callUrl: string;
}

export function LessonSuccess({ xp, lessonTitle, courseSlug, nextLessonSlug, teacherName, teacherPhoto, callUrl }: LessonSuccessProps) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-lesson-success">

      {/* Top celebration area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6 text-center">

        {/* Stars decoration */}
        <div className="flex items-end gap-2 mb-6">
          <span className="text-3xl opacity-60 -rotate-[15deg]">⭐</span>
          <span className="text-5xl">⭐</span>
          <span className="text-3xl opacity-60 rotate-[15deg]">⭐</span>
        </div>

        {/* Trophy */}
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-2xl shadow-black/30 mb-5">
          <span className="text-6xl" role="img" aria-label="Трофей">🏆</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-2">Урок завершено!</h1>
        <p className="text-white/60 text-sm mb-8">{lessonTitle}</p>

        {/* XP badge */}
        <div className="inline-flex items-center gap-3 bg-accent/20 border border-accent/40 rounded-2xl px-8 py-4 mb-10">
          <span className="text-3xl">⚡</span>
          <div className="text-left">
            <p className="text-accent/80 text-xs font-bold uppercase tracking-widest">Зароблено</p>
            <p className="text-accent text-4xl font-black leading-none">+{xp} XP</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 w-full max-w-sm">
          <Link
            href="/dashboard/lessons"
            className="flex-1 py-3.5 rounded-2xl border-2 border-white/30 text-white/70 text-sm font-bold text-center hover:bg-white/10 transition-colors"
          >
            До уроків
          </Link>
          {nextLessonSlug ? (
            <Link
              href={`/courses/${courseSlug}/lessons/${nextLessonSlug}`}
              className="flex-1 py-3.5 rounded-2xl bg-accent text-ink text-sm font-black text-center hover:opacity-90 transition-opacity"
            >
              Далі →
            </Link>
          ) : (
            <Link
              href="/dashboard/lessons"
              className="flex-1 py-3.5 rounded-2xl bg-accent text-ink text-sm font-black text-center hover:opacity-90 transition-opacity"
            >
              Завершити
            </Link>
          )}
        </div>
      </div>

      {/* Teacher call card — anchored at bottom */}
      <div className="w-full max-w-sm mx-auto px-4 mb-6">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-5">
        <div className="flex items-center gap-4 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={teacherPhoto}
            alt={teacherName}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-white/30 flex-shrink-0"
          />
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-wide">Закріпи з вчителем</p>
            <p className="text-white font-black text-lg leading-tight">{teacherName}</p>
          </div>
          <div className="ml-auto w-10 h-10 rounded-xl bg-success flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📹</span>
          </div>
        </div>
        <p className="text-white/60 text-sm mb-4">
          Живе заняття з вчителем — найкращий спосіб не забути нові слова та відпрацювати вимову.
        </p>
        <a
          href={callUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3.5 rounded-2xl bg-success text-white font-black text-sm text-center hover:opacity-90 transition-opacity"
        >
          Записатись на відеозаняття →
        </a>
      </div>
      </div>
    </div>
  );
}
