'use client';
import { useEffect, useState } from 'react';
import type { LessonData } from '@/mocks/lessons/types';
import { emitKidsEvent } from '@/lib/kids-store';
import { createProgress } from '@/lib/api';
import { LessonProgress }     from './LessonProgress';
import { LessonSuccess }      from './LessonSuccess';
import { LessonCharacter }    from './LessonCharacter';
import type { CharEmotion }   from './LessonCharacter';
import { StepTheory }         from './StepTheory';
import { StepTheoryMobile }   from './StepTheoryMobile';
import { StepMultipleChoice } from './StepMultipleChoice';
import { StepFillBlank }      from './StepFillBlank';
import { StepWordOrder }      from './StepWordOrder';
import { StepMatchPairs }     from './StepMatchPairs';
import { StepTranslate }      from './StepTranslate';
import { StepImage }          from './StepImage';
import { StepVideo }          from './StepVideo';
import { StepReading }        from './StepReading';
import RotateHint             from '@/components/kids/RotateHint';

interface Props {
  lesson: LessonData;
  /** Strapi documentId for the lesson — required to persist completion
   *  through user-progress so the rewards lifecycle (coins, XP, streak,
   *  achievements) actually fires. Optional only because legacy callers
   *  may not have it yet; without it lesson completion is purely
   *  optimistic and grants no real rewards. */
  lessonDocumentId?: string;
  /** Strapi documentId of the parent course. */
  courseDocumentId?: string;
  nextLessonSlug?: string;
  backUrl?: string;
  /** Optional teacher-upsell CTA on the success screen. */
  teacherName?: string;
  teacherPhoto?: string;
  callUrl?: string;
}

export function LessonEngine({
  lesson,
  lessonDocumentId,
  courseDocumentId,
  nextLessonSlug,
  backUrl = '/kids/school',
  teacherName,
  teacherPhoto,
  callUrl,
}: Props) {
  const [stepIdx,   setStepIdx]   = useState(0);
  const [mistakes,  setMistakes]  = useState(0);
  const [earned,    setEarned]    = useState<{ xp: number; coins: number } | null>(null);
  const [done,      setDone]      = useState(false);
  const [charEmotion, setCharEmotion] = useState<CharEmotion>('idle');
  const [stepMistakes, setStepMistakes] = useState(0);

  const step = lesson.steps[stepIdx];
  // Лише вправи (не теорія/медіа) рахуються для прогрес-бару
  const NON_EXERCISE = new Set<string>(['theory', 'image', 'video']);

  // On exercise steps, settle character into a "thinking" pose after a short beat
  useEffect(() => {
    if (NON_EXERCISE.has(step.type)) return;
    const t = setTimeout(() => {
      setCharEmotion(prev => (prev === 'idle' ? 'thinking' : prev));
    }, 400);
    return () => clearTimeout(t);
  }, [stepIdx, step.type]);
  const exerciseSteps = lesson.steps.filter(s => !NON_EXERCISE.has(s.type));
  const exerciseDone  = lesson.steps.slice(0, stepIdx).filter(s => !NON_EXERCISE.has(s.type)).length;

  async function next() {
    setCharEmotion('correct');
    setStepMistakes(0);
    // After celebration, return to thinking on the next exercise step, idle on theory/media
    setTimeout(() => {
      const nextStep = lesson.steps[stepIdx + 1];
      if (!nextStep) return;
      setCharEmotion(NON_EXERCISE.has(nextStep.type) ? 'idle' : 'thinking');
    }, 1800);
    if (stepIdx + 1 >= lesson.steps.length) {
      // Display values for the success screen — these mirror the matrix
      // in `lib/rewards.ts` (LESSON_XP=15, LESSON_COINS=10) so what the
      // kid sees on the success screen matches what actually got
      // credited server-side. We don't try to scale by mistakes anymore;
      // that's a future "score-aware" branch.
      const earnedXp = 15;
      const earnedCoins = 10;
      setEarned({ xp: earnedXp, coins: earnedCoins });
      setDone(true);

      // Persist completion: writes user-progress, which tripges the
      // server lifecycle → awardOnAction → coins / XP / streak /
      // achievement evaluation. Then refresh the kids HUD so the new
      // totals show up. Wrapped to never throw past the success screen.
      if (lessonDocumentId) {
        createProgress({
          lessonDocumentId,
          courseDocumentId,
          status: 'completed',
        })
          .then(() => emitKidsEvent('kids:server-state-stale'))
          .catch((err) => {
            // If the server write fails, the kid still sees the success
            // screen — they did the work. Next mount will reconcile.
            console.error('[LessonEngine] createProgress failed', err);
          });
      } else {
        // No documentId means the caller didn't migrate yet (legacy
        // mock route). Without it we can't fire the reward pipeline,
        // so coins/XP shown on the success screen are display-only.
        console.warn('[LessonEngine] lessonDocumentId missing — rewards will not be awarded');
      }
    } else {
      setStepIdx(i => i + 1);
    }
  }

  function onWrong() {
    setMistakes(m => m + 1);
    setStepMistakes(n => {
      const next = n + 1;
      setCharEmotion(next === 1 ? 'wrong-soft' : next === 2 ? 'wrong' : 'wrong-hard');
      return next;
    });
    // settle back into thinking pose after the wrong-reaction
    setTimeout(() => setCharEmotion('thinking'), 2200);
  }

  if (done && earned) {
    return (
      <LessonSuccess
        xp={earned.xp}
        coinsEarned={earned.coins}
        lessonTitle={lesson.title}
        courseSlug={lesson.courseSlug}
        nextLessonSlug={nextLessonSlug}
        backUrl={backUrl}
        teacherName={teacherName}
        teacherPhoto={teacherPhoto}
        callUrl={callUrl}
      />
    );
  }

  return (
    <div className="flex flex-col h-dvh relative overflow-hidden bg-lesson-engine">
      <RotateHint />

      {/* Ігрові декорації фону */}
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-10 left-8 text-4xl opacity-20 animate-[float_9s_ease-in-out_infinite]">☁️</div>
        <div className="absolute top-16 right-12 text-5xl opacity-15 animate-[float_12s_ease-in-out_infinite_2s]">☁️</div>
        <div className="absolute top-1/3 left-4 text-xl opacity-25 animate-pulse [animation-delay:0.8s]">✨</div>
        <div className="absolute top-1/3 right-6 text-xl opacity-25 animate-pulse [animation-delay:1.6s]">⭐</div>
        <div className="absolute top-2/3 left-10 text-2xl opacity-20 animate-pulse anim-delay-400">✨</div>
        <div className="absolute top-2/3 right-10 text-xl opacity-20 animate-pulse [animation-delay:2s]">⭐</div>
        {/* Пагорби знизу */}
        <svg className="absolute bottom-0 left-0 w-full" height="100" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <ellipse cx="150"  cy="100" rx="220" ry="70" fill="#86efac" opacity="0.35"/>
          <ellipse cx="600"  cy="100" rx="380" ry="80" fill="#6ee7b7" opacity="0.25"/>
          <ellipse cx="1050" cy="100" rx="250" ry="65" fill="#86efac" opacity="0.30"/>
        </svg>
      </div>

      <LessonProgress
        current={exerciseDone}
        total={exerciseSteps.length}
        xp={lesson.xp}
        courseSlug={lesson.courseSlug}
      />
      <LessonCharacter emotion={charEmotion} />

      {/* Mobile: compact theory (separate layout) */}
      {step.type === 'theory' && (
        <div className="sm:hidden flex-1 min-h-0 flex">
          <StepTheoryMobile step={step} onContinue={next} />
        </div>
      )}

      {/* Desktop / tablet content */}
      <div className={`${step.type === 'theory' ? 'hidden sm:flex' : 'flex'} flex-1 min-h-0 overflow-y-auto overscroll-contain flex-col items-stretch sm:items-center px-3 sm:px-4 pt-1 pb-3 sm:py-8 justify-start sm:justify-center relative`}>
        {step.type === 'theory' && (
          <StepTheory step={step} onContinue={next} />
        )}
        {step.type === 'multiple-choice' && (
          <StepMultipleChoice key={step.id} step={step} onCorrect={next} onWrong={onWrong} />
        )}
        {step.type === 'fill-blank' && (
          <StepFillBlank key={step.id} step={step} onCorrect={next} onWrong={onWrong} />
        )}
        {step.type === 'word-order' && (
          <StepWordOrder key={step.id} step={step} onCorrect={next} onWrong={onWrong} />
        )}
        {step.type === 'match-pairs' && (
          <StepMatchPairs key={step.id} step={step} onCorrect={next} />
        )}
        {step.type === 'translate' && (
          <StepTranslate key={step.id} step={step} onCorrect={next} onWrong={onWrong} />
        )}
        {step.type === 'image' && (
          <StepImage key={step.id} step={step} onContinue={next} />
        )}
        {step.type === 'video' && (
          <StepVideo key={step.id} step={step} onContinue={next} />
        )}
        {step.type === 'reading' && (
          <StepReading key={step.id} step={step} onCorrect={next} onWrong={onWrong} />
        )}
      </div>

    </div>
  );
}
