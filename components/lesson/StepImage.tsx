'use client';
import type { StepImage } from '@/mocks/lessons/types';

interface Props {
  step: StepImage;
  onContinue: () => void;
}

export function StepImage({ step, onContinue }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <div>
        <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-3">Подивись на зображення</p>
        <h2 className="text-xl font-black text-ink mb-4">{step.title}</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={step.url}
          alt={step.title}
          className="w-full rounded-2xl border-2 border-border object-cover max-h-72"
        />
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
