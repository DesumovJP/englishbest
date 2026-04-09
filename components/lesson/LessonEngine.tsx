'use client';
import { useState } from 'react';
import type { LessonData } from '@/mocks/lessons/types';
import { LessonProgress }     from './LessonProgress';
import { LessonSuccess }      from './LessonSuccess';
import { LessonCharacter }    from './LessonCharacter';
import type { CharEmotion }   from './LessonCharacter';
import { StepTheory }         from './StepTheory';
import { StepMultipleChoice } from './StepMultipleChoice';
import { StepFillBlank }      from './StepFillBlank';
import { StepWordOrder }      from './StepWordOrder';
import { StepMatchPairs }     from './StepMatchPairs';
import { StepTranslate }      from './StepTranslate';
import { StepImage }          from './StepImage';
import { StepVideo }          from './StepVideo';
import { StepReading }        from './StepReading';

interface Props {
  lesson: LessonData;
  nextLessonSlug?: string;
  teacherName: string;
  teacherPhoto: string;
  callUrl: string;
}

export function LessonEngine({ lesson, nextLessonSlug, teacherName, teacherPhoto, callUrl }: Props) {
  const [stepIdx,   setStepIdx]   = useState(0);
  const [mistakes,  setMistakes]  = useState(0);
  const [done,      setDone]      = useState(false);
  const [charEmotion, setCharEmotion] = useState<CharEmotion>('idle');

  const step = lesson.steps[stepIdx];
  // Лише вправи (не теорія/медіа) рахуються для прогрес-бару
  const NON_EXERCISE = new Set(['theory', 'image', 'video']);
  const exerciseSteps = lesson.steps.filter(s => !NON_EXERCISE.has(s.type));
  const exerciseDone  = lesson.steps.slice(0, stepIdx).filter(s => !NON_EXERCISE.has(s.type)).length;

  function next() {
    setCharEmotion('correct');
    setTimeout(() => setCharEmotion('idle'), 1800);
    if (stepIdx + 1 >= lesson.steps.length) {
      setDone(true);
    } else {
      setStepIdx(i => i + 1);
    }
  }

  function onWrong() {
    setMistakes(m => m + 1);
    setCharEmotion('wrong');
  }

  if (done) {
    return (
      <LessonSuccess
        xp={Math.max(5, lesson.xp - mistakes * 2)}
        lessonTitle={lesson.title}
        courseSlug={lesson.courseSlug}
        nextLessonSlug={nextLessonSlug}
        teacherName={teacherName}
        teacherPhoto={teacherPhoto}
        callUrl={callUrl}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-lesson-engine">

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

      {/* Контент кроку */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative">
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
