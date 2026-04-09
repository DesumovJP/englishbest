import Link from 'next/link';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { ProgressBar } from '@/components/atoms/ProgressBar';

interface DashboardOverviewProps {
  userSlug: string;
  progressSummary: {
    currentCourseTitle: string;
    currentCourseSlug: string;
    completedLessons: number;
    totalLessons: number;
    streak: number;
    todayTasks: { lessonSlug: string; title: string; courseSlug: string }[];
    achievements: string[];
  };
}

export function DashboardOverview({ userSlug, progressSummary }: DashboardOverviewProps) {
  const {
    currentCourseTitle,
    currentCourseSlug,
    completedLessons,
    totalLessons,
    streak,
    todayTasks,
    achievements,
  } = progressSummary;
  const progressPct = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* Current course */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-border col-span-full lg:col-span-2">
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">Current Course</h2>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-xl font-bold text-ink">{currentCourseTitle}</h3>
            <p className="text-sm text-ink-muted">{completedLessons} / {totalLessons} lessons</p>
          </div>
          <Link href={`/courses/${currentCourseSlug}`}>
            <Button size="sm" aria-label="Continue course">Continue →</Button>
          </Link>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-ink-muted mb-1">
            <span>Progress</span><span>{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} size="sm" label="Прогрес курсу" />
        </div>
      </div>

      {/* Streak */}
      <div className="bg-gradient-to-br from-accent to-accent-dark rounded-xl p-5 text-white flex flex-col items-center justify-center gap-2">
        <Icon name="flame" size={32} />
        <p className="text-4xl font-extrabold">{streak}</p>
        <p className="text-sm font-semibold opacity-90">Day Streak 🔥</p>
      </div>

      {/* Today's tasks */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-border col-span-full md:col-span-1">
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">Today&apos;s Tasks</h2>
        {todayTasks.length === 0 ? (
          <p className="text-ink-muted text-sm">All done for today! 🎉</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todayTasks.map(task => (
              <li key={task.lessonSlug}>
                <Link
                  href={`/courses/${task.courseSlug}/lessons/${task.lessonSlug}`}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-surface-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                    <Icon name="play" size={14} className="text-primary-dark" />
                  </div>
                  <span className="text-sm font-medium text-ink">{task.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick join live */}
      <div className="bg-secondary rounded-xl p-5 text-white flex flex-col gap-3">
        <h2 className="text-sm font-semibold opacity-80 uppercase tracking-wide">Live Lesson</h2>
        <p className="font-bold text-lg">Group class starts in 30 min</p>
        <Link href="/calendar">
          <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-secondary" aria-label="Join live lesson">
            Join Now 🎥
          </Button>
        </Link>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">Achievements</h2>
        <div className="flex flex-wrap gap-2">
          {achievements.map(a => (
            <Badge key={a} variant="success">🏆 {a.replace(/-/g, ' ')}</Badge>
          ))}
          {achievements.length === 0 && <p className="text-sm text-ink-muted">Complete lessons to earn badges!</p>}
        </div>
      </div>
    </div>
  );
}
