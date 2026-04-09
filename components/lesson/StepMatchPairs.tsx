'use client';
import { useState } from 'react';
import type { StepMatchPairs } from '@/mocks/lessons/types';

interface Props {
  step: StepMatchPairs;
  onCorrect: () => void;
}

export function StepMatchPairs({ step, onCorrect }: Props) {
  const [selectedLeft,  setSelectedLeft]  = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrongPair, setWrongPair] = useState<[number, number] | null>(null);

  const [shuffledRight] = useState(() =>
    [...step.pairs.map((_, i) => i)].sort(() => Math.random() - 0.5)
  );

  function handleLeft(i: number) {
    if (matched.includes(i)) return;
    setSelectedLeft(i);
    setWrongPair(null);
  }

  function handleRight(shuffledIdx: number) {
    const pairIdx = shuffledRight[shuffledIdx];
    if (matched.includes(pairIdx)) return;
    if (selectedLeft === null) return;

    if (selectedLeft === pairIdx) {
      setMatched(prev => [...prev, pairIdx]);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (matched.length + 1 === step.pairs.length) {
        setTimeout(onCorrect, 600);
      }
    } else {
      setWrongPair([selectedLeft, shuffledIdx]);
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);
      }, 800);
    }
  }

  const allMatched = matched.length === step.pairs.length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <div>
        <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1">{step.prompt}</p>
        <p className="text-sm text-ink-muted">Клікни ліве слово, потім правий переклад</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Ліва колонка */}
        <ul className="flex flex-col gap-2">
          {step.pairs.map((pair, i) => {
            const isMatched  = matched.includes(i);
            const isSelected = selectedLeft === i;
            const isWrong    = wrongPair?.[0] === i;

            let cls = 'border-border bg-white text-ink hover:border-success/40';
            if (isMatched)  cls = 'border-success/60 bg-success/8 text-success-dark cursor-default';
            if (isSelected) cls = 'border-secondary bg-secondary/10 text-secondary-dark';
            if (isWrong)    cls = 'border-danger/60 bg-danger/8 text-danger';

            return (
              <li key={i}>
                <button
                  onClick={() => handleLeft(i)}
                  disabled={isMatched}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${cls} disabled:cursor-default`}
                >
                  {isMatched
                    ? <span className="flex items-center gap-2"><span className="text-success">✓</span>{pair.left}</span>
                    : pair.left}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Права колонка */}
        <ul className="flex flex-col gap-2">
          {shuffledRight.map((pairIdx, shuffledIdx) => {
            const pair      = step.pairs[pairIdx];
            const isMatched  = matched.includes(pairIdx);
            const isWrong    = wrongPair?.[1] === shuffledIdx;

            let cls = 'border-border bg-white text-ink hover:border-success/40';
            if (isMatched) cls = 'border-success/60 bg-success/8 text-success-dark cursor-default';
            if (isWrong)   cls = 'border-danger/60 bg-danger/8 text-danger';

            return (
              <li key={shuffledIdx}>
                <button
                  onClick={() => handleRight(shuffledIdx)}
                  disabled={isMatched || selectedLeft === null}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${cls} disabled:cursor-default`}
                >
                  {isMatched
                    ? <span className="flex items-center gap-2"><span className="text-success">✓</span>{pair.right}</span>
                    : pair.right}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {allMatched && (
        <div className="bg-success/8 border border-success/30 rounded-2xl px-5 py-4 flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <p className="font-black text-success-dark">Всі пари знайдено!</p>
        </div>
      )}
    </div>
  );
}
