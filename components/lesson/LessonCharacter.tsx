'use client';
import { useEffect, useState } from 'react';

export type CharEmotion = 'idle' | 'correct' | 'wrong';

const BUBBLES: Record<CharEmotion, string[]> = {
  idle:    ['Давай, ти зможеш!', 'Думай уважно 🦉', 'Сміливіше!', 'Ти молодець!'],
  correct: ['Чудово! 🎉', 'Правильно! ⭐', 'Відмінно! 🌟', 'Супер! 🔥', 'Браво! 💎'],
  wrong:   ['Не здавайся! 💪', 'Майже… ще раз!', 'Ти зможеш! ❤️', 'Спробуй знову 🦉'],
};

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ─── SVG Сова ───────────────────────────────── */
function OwlBody({ emotion }: { emotion: CharEmotion }) {
  const isCorrect = emotion === 'correct';
  const isWrong   = emotion === 'wrong';

  return (
    <svg width="100" height="120" viewBox="0 0 100 120"
      className={`drop-shadow-xl transition-all duration-300 ${isCorrect ? 'scale-110 drop-shadow-[0_0_12px_rgba(74,222,128,0.6)]' : 'scale-100'}`}>

      {/* Тінь */}
      <ellipse cx="50" cy="117" rx="28" ry="5" fill="#000" opacity="0.12"/>

      {/* Тіло */}
      <ellipse cx="50" cy="85" rx="34" ry="36" fill="#16a34a"/>

      {/* Черевце */}
      <ellipse cx="50" cy="92" rx="22" ry="26" fill="#dcfce7"/>
      {/* Смуги на черевці */}
      <ellipse cx="50" cy="86" rx="14" ry="8"  fill="#bbf7d0" opacity="0.5"/>
      <ellipse cx="50" cy="98" rx="16" ry="9"  fill="#bbf7d0" opacity="0.4"/>

      {/* Голова */}
      <circle cx="50" cy="44" r="32" fill="#16a34a"/>

      {/* Вушка */}
      <polygon points="24,20 18,4 32,16"  fill="#15803d"/>
      <polygon points="76,20 82,4 68,16"  fill="#15803d"/>

      {/* Обличчя — тло очей */}
      <circle cx="37" cy="42" r="14" fill="white"/>
      <circle cx="63" cy="42" r="14" fill="white"/>

      {/* Очі — idle */}
      {!isCorrect && !isWrong && (
        <>
          <circle cx="37" cy="42" r="9"  fill="#1e3a5f"/>
          <circle cx="63" cy="42" r="9"  fill="#1e3a5f"/>
          <circle cx="40" cy="39" r="3.5" fill="white"/>
          <circle cx="66" cy="39" r="3.5" fill="white"/>
          <circle cx="41" cy="40" r="1.5" fill="#93c5fd" opacity="0.7"/>
          <circle cx="67" cy="40" r="1.5" fill="#93c5fd" opacity="0.7"/>
        </>
      )}

      {/* Очі — correct: щасливі дужки */}
      {isCorrect && (
        <>
          <path d="M26 42 Q37 32 48 42" stroke="#1e3a5f" strokeWidth="5" fill="none" strokeLinecap="round"/>
          <path d="M52 42 Q63 32 74 42" stroke="#1e3a5f" strokeWidth="5" fill="none" strokeLinecap="round"/>
          {/* Зірочки */}
          <text x="16" y="22" fontSize="16">⭐</text>
          <text x="62" y="20" fontSize="14">✨</text>
          <text x="72" y="72" fontSize="12">🌟</text>
        </>
      )}

      {/* Очі — wrong: сумні з нахиленими бровами */}
      {isWrong && (
        <>
          <circle cx="37" cy="44" r="9"  fill="#1e3a5f"/>
          <circle cx="63" cy="44" r="9"  fill="#1e3a5f"/>
          <circle cx="40" cy="41" r="3.5" fill="white"/>
          <circle cx="66" cy="41" r="3.5" fill="white"/>
          {/* Брови — сумні */}
          <path d="M24 30 Q37 36 48 28" stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M52 28 Q63 36 76 30" stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          {/* Крапля поту */}
          <path d="M80 28 Q82 22 84 28 Q84 33 80 28Z" fill="#93c5fd" opacity="0.8"/>
        </>
      )}

      {/* Дзьоб */}
      <polygon points="50,52 44,60 56,60" fill="#fbbf24"/>
      <line x1="44" y1="60" x2="56" y2="60" stroke="#d97706" strokeWidth="1.5"/>

      {/* Крила */}
      {isCorrect ? (
        /* Підняті крила */
        <>
          <ellipse cx="17" cy="68" rx="13" ry="24" fill="#15803d" transform="rotate(-40 17 68)"/>
          <ellipse cx="83" cy="68" rx="13" ry="24" fill="#15803d" transform="rotate(40 83 68)"/>
          <ellipse cx="12" cy="56" rx="10" ry="18" fill="#22c55e" transform="rotate(-50 12 56)"/>
          <ellipse cx="88" cy="56" rx="10" ry="18" fill="#22c55e" transform="rotate(50 88 56)"/>
        </>
      ) : isWrong ? (
        /* Одне крило підняте до лоба */
        <>
          <ellipse cx="17" cy="86" rx="13" ry="24" fill="#15803d" transform="rotate(10 17 86)"/>
          <ellipse cx="83" cy="68" rx="13" ry="22" fill="#15803d" transform="rotate(-25 83 68)"/>
        </>
      ) : (
        /* Звичайні крила */
        <>
          <ellipse cx="17" cy="84" rx="13" ry="24" fill="#15803d" transform="rotate(12 17 84)"/>
          <ellipse cx="83" cy="84" rx="13" ry="24" fill="#15803d" transform="rotate(-12 83 84)"/>
        </>
      )}

      {/* Лапки */}
      <ellipse cx="40" cy="118" rx="11" ry="5" fill="#fbbf24"/>
      <ellipse cx="60" cy="118" rx="11" ry="5" fill="#fbbf24"/>
      <line x1="34" y1="114" x2="34" y2="118" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="40" y1="113" x2="40" y2="118" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="46" y1="114" x2="46" y2="118" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="54" y1="114" x2="54" y2="118" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="60" y1="113" x2="60" y2="118" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="66" y1="114" x2="66" y2="118" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Бульбашка ──────────────────────────────── */
function SpeechBubble({ text, emotion }: { text: string; emotion: CharEmotion }) {
  const bg  = emotion === 'correct' ? 'bg-success/15 border-success/40' :
              emotion === 'wrong'   ? 'bg-danger/15 border-danger/40' :
                                     'bg-white border-border';
  const txt = emotion === 'correct' ? 'text-success-dark' :
              emotion === 'wrong'   ? 'text-danger-dark' :
                                     'text-ink';
  const tri = emotion === 'correct' ? 'var(--color-success)' :
              emotion === 'wrong'   ? 'var(--color-danger)' : 'white';

  return (
    <div className="relative">
      <div className={`px-4 py-2.5 rounded-2xl border-2 text-xs font-black text-center max-w-[140px] leading-snug ${bg} ${txt} animate-slide-up shadow-sm`}>
        {text}
      </div>
      {/* Трикутник вниз */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2.5 w-0 h-0"
        style={{
          borderLeft:  '9px solid transparent',
          borderRight: '9px solid transparent',
          borderTop:   `10px solid ${tri}`,
        }} />
    </div>
  );
}

/* ─── Головний компонент ─────────────────────── */
export function LessonCharacter({ emotion }: { emotion: CharEmotion }) {
  const [bubble, setBubble] = useState(() => pick(BUBBLES.idle));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t0 = setTimeout(() => setVisible(false), 0);
    const t1 = setTimeout(() => {
      setBubble(pick(BUBBLES[emotion]));
      setVisible(true);
    }, 150);
    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, [emotion]);

  return (
    <div className="hidden lg:flex fixed bottom-0 left-6 z-20 flex-col items-center gap-2 pb-2 select-none">
      {visible && <SpeechBubble text={bubble} emotion={emotion} />}
      <div className={`transition-all duration-300 ${emotion === 'correct' ? 'animate-bounce' : ''}`}>
        <OwlBody emotion={emotion} />
      </div>
    </div>
  );
}
