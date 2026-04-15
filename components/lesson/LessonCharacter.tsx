'use client';
import { useEffect, useState } from 'react';
import CharacterAvatar from '@/components/kids/CharacterAvatar';
import { useKidsState } from '@/lib/use-kids-store';
import type { CharacterEmotion } from '@/lib/characters';
import { SpeechBubble } from '@/components/kids/ui';

export type CharEmotion =
  | 'idle'
  | 'thinking'
  | 'correct'
  | 'wrong-soft'   // 1st mistake → thinking
  | 'wrong'        // 2nd mistake → sad
  | 'wrong-hard'   // 3rd+ mistake → angry
  | 'surprised';

const EMOTION_MAP: Record<CharEmotion, CharacterEmotion> = {
  idle:         'idle',
  thinking:     'thinking',
  correct:      'celebrate',
  'wrong-soft': 'thinking',
  wrong:        'sad',
  'wrong-hard': 'angry',
  surprised:    'surprised',
};

const BUBBLES: Partial<Record<CharEmotion, string[]>> = {
  correct:      ['Чудово! 🎉', 'Правильно! ⭐', 'Відмінно! 🌟', 'Браво! 💎'],
  'wrong-soft': ['Хм, подумаймо 🤔', 'Майже!', 'Спробуй ще раз'],
  wrong:        ['Ще раз 💪', 'Не засмучуйся ❤️', 'Ти зможеш!'],
  'wrong-hard': ['Ох! Уважніше 😤', 'Зосередься!', 'Не здавайся!'],
  thinking:     ['Подумай…', 'Що тут правильне?'],
  surprised:    ['Ого! 🌟', 'Вау!'],
};

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function LessonCharacter({ emotion }: { emotion: CharEmotion }) {
  const { state } = useKidsState();
  const characterId = state.activeCharacterId || 'fox';

  const [bubble, setBubble]     = useState('');
  const [visible, setVisible]   = useState(false);
  const [bounceKey, setBounceKey] = useState(0);

  useEffect(() => {
    const lines = BUBBLES[emotion];
    setBounceKey(k => k + 1);
    if (!lines) { setVisible(false); return; }
    const t0 = setTimeout(() => setVisible(false), 0);
    const t1 = setTimeout(() => { setBubble(pick(lines)); setVisible(true); }, 150);
    const t2 = setTimeout(() => setVisible(false), 2800);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [emotion]);

  /* ── Mobile: inline, centered ───────────────────────────────────── */
  return (
    <>
      <div className="lg:hidden flex flex-col items-center gap-0 pt-1 pb-1 select-none">
        {/* Bubble + character wrapped together — both animate on bounce */}
        <div
          key={bounceKey}
          className={`flex flex-col items-center ${emotion === 'correct' ? 'animate-bounce-in' : ''}`}
          style={{ transformOrigin: "bottom center" }}
        >
          {visible && <div className="mb-2"><SpeechBubble text={bubble} maxWidth={160} size="sm" /></div>}
          <CharacterAvatar
            characterId={characterId}
            emotion={EMOTION_MAP[emotion]}
            size={108}
            animate={emotion === 'idle' || emotion === 'thinking'}
          />
        </div>
      </div>

      {/* ── Desktop: fixed bottom-left, large ─────────────────────── */}
      <div className="hidden lg:flex fixed bottom-0 left-8 z-20 flex-col items-center gap-0 pb-5 select-none">
        <div
          key={`d-${bounceKey}`}
          className={`flex flex-col items-center ${emotion === 'correct' ? 'animate-bounce-in' : ''}`}
          style={{ transformOrigin: "bottom center" }}
        >
          {visible && <div className="mb-2"><SpeechBubble text={bubble} maxWidth={160} size="sm" /></div>}
          <CharacterAvatar
            characterId={characterId}
            emotion={EMOTION_MAP[emotion]}
            size={200}
            animate={emotion === 'idle' || emotion === 'thinking'}
          />
        </div>
      </div>
    </>
  );
}
