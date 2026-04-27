'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createProgress } from '@/lib/api';
import { emitKidsEvent } from '@/lib/kids-store';

type LessonStatus = 'notStarted' | 'inProgress' | 'completed';

interface Exercise {
  documentId: string;
  type: 'mcq';
  question: string;
  options: string[];
  answer: number;
}

interface LessonPlayerProps {
  courseSlug: string;
  lessonSlug: string;
  lessonDocumentId: string;
  courseDocumentId?: string;
  title: string;
  videoUrl?: string;
  transcript?: string;
  exercises?: Exercise[];
  durationMin?: number;
}

export function LessonPlayer({
  courseSlug,
  lessonSlug,
  lessonDocumentId,
  courseDocumentId,
  title,
  transcript,
  exercises = [],
  durationMin,
}: LessonPlayerProps) {
  const storageKey = `progress:${courseSlug}:${lessonSlug}`;
  const [status, setStatus] = useState<LessonStatus>(() => {
    if (typeof window === 'undefined') return 'notStarted';
    return (localStorage.getItem(storageKey) as LessonStatus | null) ?? 'notStarted';
  });
  const [tab, setTab] = useState<'video' | 'exercises' | 'transcript'>('video');
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [submitted, setSubmitted] = useState(false);

  const saveProgress = async (newStatus: LessonStatus) => {
    setStatus(newStatus);
    localStorage.setItem(storageKey, newStatus);
    try {
      await createProgress({
        lessonDocumentId,
        courseDocumentId,
        status: newStatus,
      });
      // Server lifecycle just credited coins / XP / streak / achievements
      // through the rewards service. Tell any kids HUD on the page to drop
      // its cached snapshot and refetch.
      if (newStatus === 'completed') {
        emitKidsEvent('kids:server-state-stale');
      }
    } catch {
      // silently fail — local state is source of truth, progress syncs on reload
    }
  };

  const handleStart = () => saveProgress('inProgress');
  const handleComplete = () => saveProgress('completed');

  const allAnswered = exercises.length > 0 && exercises.every(ex => answers[ex.documentId] !== undefined && answers[ex.documentId] !== null);

  const handleSubmitExercises = () => {
    setSubmitted(true);
    const allCorrect = exercises.every(ex => answers[ex.documentId] === ex.answer);
    if (allCorrect) handleComplete();
  };

  const statusBadge: Record<LessonStatus, { label: string; tone: 'neutral' | 'warning' | 'success' }> = {
    notStarted: { label: 'Not Started', tone: 'neutral' },
    inProgress: { label: 'In Progress', tone: 'warning' },
    completed: { label: 'Completed', tone: 'success' },
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {durationMin && <p className="text-sm text-ink-muted">⏱ {durationMin} min</p>}
        </div>
        <Badge tone={statusBadge[status].tone}>{statusBadge[status].label}</Badge>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border">
        {(['video', 'exercises', 'transcript'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Video tab */}
      {tab === 'video' && (
        <div className="flex flex-col gap-4">
          <div className="aspect-video bg-gradient-to-br from-ink to-ink/70 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-white">
              <span className="text-6xl">🎬</span>
              <p className="text-sm opacity-70">Video player placeholder</p>
            </div>
          </div>
          {status === 'notStarted' && (
            <Button onClick={handleStart} aria-label="Start lesson">▶ Start Lesson</Button>
          )}
          {status === 'inProgress' && (
            <Button onClick={handleComplete} variant="secondary" aria-label="Mark as complete">
              ✓ Mark as Complete
            </Button>
          )}
          {status === 'completed' && (
            <p className="text-center text-primary font-bold">🎉 Lesson completed!</p>
          )}
        </div>
      )}

      {/* Exercises tab */}
      {tab === 'exercises' && (
        <div className="flex flex-col gap-4">
          {exercises.length === 0 ? (
            <p className="text-ink-muted text-center py-8">No exercises for this lesson.</p>
          ) : (
            exercises.map((ex, i) => (
              <div key={ex.documentId} className="p-4 bg-surface-muted rounded-lg flex flex-col gap-3">
                <p className="font-semibold">{i + 1}. {ex.question}</p>
                <div className="flex flex-col gap-2">
                  {ex.options.map((opt, optIdx) => {
                    const isSelected = answers[ex.documentId] === optIdx;
                    const isCorrect = submitted && optIdx === ex.answer;
                    const isWrong = submitted && isSelected && optIdx !== ex.answer;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => !submitted && setAnswers(a => ({ ...a, [ex.documentId]: optIdx }))}
                        className={`text-left px-4 py-2 rounded-md border-2 transition-all ${
                          isCorrect ? 'border-success bg-success/8 text-success-dark' :
                          isWrong ? 'border-danger bg-danger/8 text-danger-dark' :
                          isSelected ? 'border-primary bg-surface-muted' :
                          'border-border hover:border-primary'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          {exercises.length > 0 && !submitted && (
            <Button
              onClick={handleSubmitExercises}
              disabled={!allAnswered}
              aria-label="Submit answers"
            >
              Submit Answers
            </Button>
          )}
          {submitted && (
            <p className="text-center font-bold text-primary">
              ✓ Answers submitted!
            </p>
          )}
        </div>
      )}

      {/* Transcript tab */}
      {tab === 'transcript' && (
        <div className="p-4 bg-surface-muted rounded-lg text-ink-muted leading-relaxed">
          {transcript || 'No transcript available for this lesson.'}
        </div>
      )}
    </div>
  );
}
