'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockKidsUser, type Level } from '@/mocks/user';
import { useKidsState } from '@/lib/use-kids-store';
import {
  LIB_ITEMS, LIB_DESCRIPTIONS, LIB_CATEGORIES,
  TYPE_ACCENT, TYPE_LABEL, TYPE_SECTION,
  canAccessLevel,
  type LibTabId, type LibItem,
} from '@/lib/library-data';

/* ══════════════════════════════════════════════════════════════════
   SHARED
══════════════════════════════════════════════════════════════════ */
type PageTab = 'lessons' | 'library';

/* ══════════════════════════════════════════════════════════════════
   LESSONS DATA
══════════════════════════════════════════════════════════════════ */
type LessonStatus = 'done' | 'current' | 'locked';
type LessonType = 'lesson' | 'vocab' | 'reading' | 'listening' | 'speaking' | 'writing' | 'test';

const TYPE_CFG: Record<LessonType, { label: string; color: string; bg: string }> = {
  lesson:    { label: 'Урок',      color: 'text-secondary-dark', bg: 'bg-secondary/10' },
  vocab:     { label: 'Слова',     color: 'text-purple-dark',    bg: 'bg-purple/10'    },
  reading:   { label: 'Читання',   color: 'text-success-dark',   bg: 'bg-success/10'   },
  listening: { label: 'Аудіо',     color: 'text-secondary-dark', bg: 'bg-secondary/15' },
  speaking:  { label: 'Говоріння', color: 'text-accent-dark',    bg: 'bg-accent/10'    },
  writing:   { label: 'Письмо',    color: 'text-ink-muted',      bg: 'bg-surface-muted'},
  test:      { label: 'Тест',      color: 'text-danger-dark',    bg: 'bg-danger/10'    },
};

/* Short description per lesson type */
const TYPE_DESC: Record<string, string> = {
  lesson:    'Основний урок',
  vocab:     'Нові слова',
  reading:   'Практика читання',
  listening: 'Тренуй слух',
  speaking:  'Говори англійською',
  writing:   'Вправи з письма',
  test:      'Перевір знання',
};

/* Gradient per lesson type — used as card background */
const TYPE_GRAD: Record<string, string> = {
  lesson:    'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
  vocab:     'linear-gradient(145deg, #f093fb 0%, #c850c0 100%)',
  reading:   'linear-gradient(145deg, #4facfe 0%, #0262c8 100%)',
  listening: 'linear-gradient(145deg, #43e97b 0%, #0ba360 100%)',
  speaking:  'linear-gradient(145deg, #f7971e 0%, #ffd200 100%)',
  writing:   'linear-gradient(145deg, #a18cd1 0%, #6c63ff 100%)',
  test:      'linear-gradient(145deg, #f54ea2 0%, #ff7676 100%)',
};

interface LLesson { slug: string; title: string; emoji: string; xp: number; type?: LessonType; }
interface LSection {
  slug: string; unit: number; title: string; bossEmoji: string;
  /** Subtitle — what this unit is about in 1–2 lines, for the header panel. */
  description: string;
  /** Key skills / topics covered — shown as chips under the description. */
  skills: string[];
  color: string; ring: string; dot: string; light: string; path: string;
  accent: string;
  lessons: LLesson[];
}

const SECTIONS: LSection[] = [
  {
    slug: 'basics', unit: 1, title: 'Знайомство', bossEmoji: '👋',
    description: 'Перші кроки англійською: вітайся, називай імʼя, рахуй до десяти та знайомся з новими друзями.',
    skills: ['Greetings', 'Numbers', 'Colors', 'Animals'],
    color: 'text-secondary', ring: 'ring-secondary/60', dot: 'bg-secondary',
    light: 'bg-secondary/8 border-secondary/15', path: 'var(--color-secondary)', accent: '#4F9CF9',
    lessons: [
      { slug: 'hello-goodbye',      title: 'Hello & Goodbye',    emoji: '👋', xp: 10, type: 'lesson'    },
      { slug: 'greetings-vocab',    title: 'Слова привітань',    emoji: '📚', xp: 10, type: 'vocab'     },
      { slug: 'my-name-is',         title: 'My name is...',      emoji: '🙋', xp: 10, type: 'speaking'  },
      { slug: 'numbers-colors',     title: 'Numbers & Colors',   emoji: '🎨', xp: 15, type: 'lesson'    },
      { slug: 'numbers-vocab',      title: 'Числа та кольори',   emoji: '📚', xp: 10, type: 'vocab'     },
      { slug: 'animals',            title: 'Animals',            emoji: '🐶', xp: 15, type: 'lesson'    },
      { slug: 'animals-listening',  title: 'Слухай тварин',      emoji: '👂', xp: 10, type: 'listening' },
      { slug: 'classroom',          title: 'In the Classroom',   emoji: '🏫', xp: 10, type: 'lesson'    },
      { slug: 'my-profile-reading', title: 'Читай: My Profile',  emoji: '📖', xp: 15, type: 'reading'   },
      { slug: 'unit1-test',         title: 'Тест Юніту 1',       emoji: '🎯', xp: 25, type: 'test'      },
    ],
  },
  {
    slug: 'daily-life', unit: 2, title: 'Щоденне життя', bossEmoji: '🏠',
    description: 'Розпорядок дня, їжа, дім та сімʼя — все, щоб упевнено розповісти про себе й свій день.',
    skills: ['Routines', 'Food', 'Family', 'House'],
    color: 'text-success', ring: 'ring-success/60', dot: 'bg-success',
    light: 'bg-success/8 border-success/15', path: 'var(--color-success)', accent: '#22C55E',
    lessons: [
      { slug: 'daily-routines',  title: 'Daily Routines',    emoji: '⏰', xp: 15, type: 'lesson'    },
      { slug: 'routines-vocab',  title: 'Слова: розпорядок', emoji: '📚', xp: 10, type: 'vocab'     },
      { slug: 'food-drinks',     title: 'Food & Drinks',     emoji: '🍎', xp: 15, type: 'lesson'    },
      { slug: 'food-listening',  title: 'Аудіо: на кухні',   emoji: '👂', xp: 10, type: 'listening' },
      { slug: 'my-house',        title: 'My House',          emoji: '🏡', xp: 15, type: 'lesson'    },
      { slug: 'my-room-reading', title: 'Читай: My Room',    emoji: '📖', xp: 15, type: 'reading'   },
      { slug: 'family-friends',  title: 'Family & Friends',  emoji: '👨‍👩‍👧', xp: 15, type: 'lesson'  },
      { slug: 'family-speaking', title: "Розкажи про сімʼю", emoji: '🗣️', xp: 15, type: 'speaking'  },
      { slug: 'weather',         title: 'The Weather',       emoji: '☀️', xp: 10, type: 'lesson'    },
      { slug: 'shopping',        title: "Let's Shop!",       emoji: '🛒', xp: 15, type: 'lesson'    },
      { slug: 'unit2-test',      title: 'Тест Юніту 2',      emoji: '🎯', xp: 30, type: 'test'      },
    ],
  },
  {
    slug: 'grammar', unit: 3, title: 'Present Simple', bossEmoji: '✏️',
    description: 'Головна граматика: будуй речення в теперішньому часі, став запитання та говори про свої звички.',
    skills: ['Statements', 'Questions', 'Negatives', 'Adverbs'],
    color: 'text-purple', ring: 'ring-purple/60', dot: 'bg-purple',
    light: 'bg-purple/8 border-purple/15', path: 'var(--color-purple)', accent: '#A855F7',
    lessons: [
      { slug: 'action-verbs',      title: 'Дієслова дії',        emoji: '📚', xp: 10, type: 'vocab'    },
      { slug: 'present-simple-1',  title: 'Стверджувальні',      emoji: '✅', xp: 20, type: 'lesson'   },
      { slug: 'present-simple-2',  title: 'Питальні речення',    emoji: '❓', xp: 20, type: 'lesson'   },
      { slug: 'ps-listening',      title: 'Аудіо: запитання',    emoji: '👂', xp: 15, type: 'listening'},
      { slug: 'present-simple-3',  title: 'Заперечні речення',   emoji: '🚫', xp: 15, type: 'lesson'   },
      { slug: 'my-day-writing',    title: 'Пиши: Мій день',      emoji: '✍️', xp: 20, type: 'writing'  },
      { slug: 'adverbs-freq',      title: 'Always & Never',      emoji: '🔄', xp: 15, type: 'lesson'   },
      { slug: 'typical-day-read',  title: 'Читай: A Typical Day',emoji: '📖', xp: 15, type: 'reading'  },
      { slug: 'about-me-speaking', title: 'Говори: про себе',    emoji: '🗣️', xp: 20, type: 'speaking' },
      { slug: 'unit3-test',        title: 'Тест Юніту 3',        emoji: '🎯', xp: 35, type: 'test'     },
    ],
  },
  {
    slug: 'adventures', unit: 4, title: 'Пригоди', bossEmoji: '🗺️',
    description: 'Подорожі, зоопарк, погода й перше минуле — готуйся розказати історію про свою найкращу пригоду.',
    skills: ['Travel', 'Seasons', 'Body', 'Past Simple'],
    color: 'text-accent', ring: 'ring-accent/60', dot: 'bg-accent',
    light: 'bg-accent/8 border-accent/15', path: 'var(--color-accent)', accent: '#F59E0B',
    lessons: [
      { slug: 'transport-vocab',    title: 'Транспорт: слова',    emoji: '📚', xp: 10, type: 'vocab'    },
      { slug: 'travel',             title: 'Travelling',          emoji: '✈️', xp: 20, type: 'lesson'   },
      { slug: 'at-the-zoo',         title: 'At the Zoo',          emoji: '🦁', xp: 15, type: 'lesson'   },
      { slug: 'seasons',            title: 'Four Seasons',        emoji: '🍂', xp: 15, type: 'lesson'   },
      { slug: 'weather-listening',  title: 'Аудіо: прогноз',      emoji: '👂', xp: 15, type: 'listening'},
      { slug: 'body-health',        title: 'Body & Health',       emoji: '💪', xp: 20, type: 'lesson'   },
      { slug: 'doctor-reading',     title: 'Читай: At the Doctor',emoji: '📖', xp: 15, type: 'reading'  },
      { slug: 'holiday-writing',    title: 'Пиши: My Holiday',    emoji: '✍️', xp: 20, type: 'writing'  },
      { slug: 'past-simple-1',      title: 'Past Simple',         emoji: '⏳', xp: 25, type: 'lesson'   },
      { slug: 'adventure-speaking', title: 'Говори: пригода',     emoji: '🗣️', xp: 20, type: 'speaking' },
      { slug: 'unit4-test',         title: 'Фінальний тест',      emoji: '🏆', xp: 40, type: 'test'     },
    ],
  },
];

const ALL_SLUGS = SECTIONS.flatMap(s => s.lessons.map(l => l.slug));
const ME = {
  doneSlugs: ['hello-goodbye','greetings-vocab','my-name-is','numbers-colors','numbers-vocab','animals','animals-listening','classroom','my-profile-reading','unit1-test','daily-routines','routines-vocab','food-drinks'],
  currentSlug: 'food-listening',
};

function getLessonStatus(slug: string): LessonStatus {
  if (ME.doneSlugs.includes(slug)) return 'done';
  if (ME.currentSlug === slug) return 'current';
  const ci = ALL_SLUGS.indexOf(ME.currentSlug);
  const ti = ALL_SLUGS.indexOf(slug);
  return ti <= ci ? 'done' : 'locked';
}

/* ── Lesson card — height driven by parent ───────────────────────── */
interface CardLesson extends LLesson { unitNum: number; accent: string; }

function LessonCard({ lesson, status, isCurrent, unitLabel }: {
  lesson: CardLesson; status: LessonStatus; isCurrent: boolean; unitLabel?: string;
}) {
  return (
    <div
      className="relative w-full h-full rounded-[28px] overflow-hidden select-none"
      style={{
        background: '#1a1a2e',
        boxShadow: isCurrent
          ? `0 0 0 4px ${lesson.accent}, 0 12px 40px ${lesson.accent}55`
          : status === 'done' ? '0 4px 16px rgba(0,0,0,0.12)' : '0 10px 28px rgba(0,0,0,0.22)',
      }}
    >
      {/* Blurred photo background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://picsum.photos/seed/${lesson.slug}/400/540`}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(5px) saturate(1.2)', transform: 'scale(1.1)' }}
      />

      {/* Color tint + dark overlay */}
      <div className="absolute inset-0"
        style={{ background: `linear-gradient(165deg, ${lesson.accent}70 0%, rgba(0,0,0,0.58) 100%)` }} />

      {/* Done: extra dark scrim */}
      {status === 'done' && (
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.22)' }} />
      )}

      {/* Locked: full scrim + lock icon */}
      {status === 'locked' && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <span style={{ fontSize: 'clamp(44px, 8vh, 64px)', filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.6))' }}>🔒</span>
        </div>
      )}

      {/* Centered emoji + title + desc + XP */}
      {status !== 'locked' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-4 pointer-events-none">
          <div className="rounded-full flex items-center justify-center"
            style={{
              width: 72, height: 72,
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(14px)',
              border: '1.5px solid rgba(255,255,255,0.28)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              fontSize: 38,
            }}>
            {lesson.emoji}
          </div>
          <p className="font-black text-white leading-tight drop-shadow-xl"
            style={{
              fontSize: 'clamp(24px, 3.2vw, 34px)',
              letterSpacing: '-0.02em',
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            }}>
            {lesson.title}
          </p>
          <p className="font-bold drop-shadow-sm" style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.01em' }}>
            {TYPE_DESC[lesson.type ?? 'lesson']}
          </p>
          <div className="flex items-center gap-2 mt-1 rounded-full px-3.5 py-1.5"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.22)' }}>
            <img src="/coin.png" alt="coin" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            <span style={{ fontSize: 15, color: 'white', fontWeight: 900 }}>+{lesson.xp}</span>
            <img src="/xp.png" alt="XP" style={{ width: 18, height: 18, objectFit: 'contain', marginLeft: 2 }} />
          </div>
        </div>
      )}

      {/* Unit chip — only on first card of each unit */}
      {unitLabel && (
        <div className="absolute top-3 left-3 rounded-full px-2.5 py-1"
          style={{
            background: 'rgba(0,0,0,0.42)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.22)',
          }}>
          <span className="font-black text-white" style={{ fontSize: 10, letterSpacing: '0.08em' }}>
            {unitLabel}
          </span>
        </div>
      )}

      {/* Completed badge */}
      {status === 'done' && !unitLabel && (
        <div className="absolute top-3 right-3 rounded-full w-7 h-7 flex items-center justify-center"
          style={{ background: '#16a34a', boxShadow: '0 3px 10px rgba(22,163,74,0.5)' }}>
          <span className="font-black text-white" style={{ fontSize: 14 }}>✓</span>
        </div>
      )}

      {/* NOW badge */}
      {isCurrent && (
        <div className="absolute top-3 right-3 rounded-full px-3 py-1.5 flex items-center gap-1"
          style={{ background: '#22C55E', boxShadow: '0 3px 12px rgba(34,197,94,0.55)' }}>
          <span style={{ fontSize: 10 }}>▶</span>
          <span className="font-black text-white" style={{ fontSize: 11, letterSpacing: '0.08em' }}>NOW</span>
        </div>
      )}
    </div>
  );
}

/* ── Lessons carousel — center-focus scale effect ─────────────────── */
function LessonsCarousel() {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const cardRefs   = useRef(new Map<string, HTMLDivElement>());
  const rafRef     = useRef<number | null>(null);
  const [scales, setScales] = useState(new Map<string, number>());

  const totalDone  = SECTIONS.flatMap(s => s.lessons).filter(l => getLessonStatus(l.slug) === 'done').length;
  const totalCount = SECTIONS.flatMap(s => s.lessons).length;
  const pct        = Math.round((totalDone / totalCount) * 100);
  const currentSection = SECTIONS.find(s => s.lessons.some(l => l.slug === ME.currentSlug)) ?? SECTIONS[0];
  const sectionDone  = currentSection.lessons.filter(l => getLessonStatus(l.slug) === 'done').length;
  const sectionTotal = currentSection.lessons.length;
  const sectionPct   = Math.round((sectionDone / sectionTotal) * 100);
  const xpInUnit     = currentSection.lessons.reduce((sum, l) => sum + l.xp, 0);
  const currentLesson = currentSection.lessons.find(l => l.slug === ME.currentSlug) ?? currentSection.lessons[0];

  /* Recalculate per-card proximity to viewport center */
  function calcScales() {
    const ctr = scrollRef.current;
    if (!ctr) return;
    const { left: cl, width: cw } = ctr.getBoundingClientRect();
    const cx        = cl + cw / 2;
    const threshold = cw * 0.5; // 1 "half-viewport" = smooth falloff
    const next = new Map<string, number>();
    cardRefs.current.forEach((el, slug) => {
      const { left, width } = el.getBoundingClientRect();
      const dist = Math.abs(left + width / 2 - cx);
      next.set(slug, Math.max(0, Math.min(1, 1 - dist / threshold)));
    });
    setScales(new Map(next));
  }

  /* Attach scroll listener */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(calcScales);
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('scrollend', calcScales, { passive: true });
    requestAnimationFrame(calcScales); // initial
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('scrollend', calcScales);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Auto-scroll to current lesson (viewport-rect based, works with snap padding) */
  useEffect(() => {
    const t = setTimeout(() => {
      const cur = currentRef.current;
      const ctr = scrollRef.current;
      if (!cur || !ctr) return;
      const curRect = cur.getBoundingClientRect();
      const ctrRect = ctr.getBoundingClientRect();
      const target  = ctr.scrollLeft + (curRect.left + curRect.width / 2) - (ctrRect.left + ctrRect.width / 2);
      ctr.scrollTo({ left: target, behavior: 'smooth' });
      setTimeout(calcScales, 700);
    }, 350);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Scale: 0.80 (off-center) → 1.05 (centered)  |  opacity: 0.52 → 1.0 */
  function getScale(slug: string)   { const t = scales.get(slug) ?? 0; return 0.80 + 0.25 * t; }
  function getOpacity(slug: string) { const t = scales.get(slug) ?? 0; return 0.52 + 0.48 * t; }

  return (
    <div
      className="relative flex flex-col flex-1 overflow-hidden"
      style={{
        background: "url('/kids-school-bg.jpg') center / cover no-repeat",
      }}
    >
      {/* Soft wash so the glass panel stays readable on any crop of the bg */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/55 to-white/85" />

      {/* ── Unit description panel ────────────────────────────────── */}
      <div className="relative z-10 flex-shrink-0 px-4 pt-4 pb-3">
        <div
          className="mx-auto w-full rounded-3xl bg-white/85 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_rgba(15,23,42,0.10)] overflow-hidden"
          style={{ maxWidth: 880 }}
        >
          <div className="flex items-stretch gap-4 p-4 md:p-5">
            {/* Unit crest */}
            <div
              className="flex-shrink-0 rounded-2xl flex flex-col items-center justify-center px-3 py-2.5"
              style={{
                minWidth: 76,
                background: `linear-gradient(160deg, ${currentSection.accent}1c 0%, ${currentSection.accent}0c 100%)`,
                border: `1.5px solid ${currentSection.accent}40`,
              }}
            >
              <span style={{ fontSize: 34, lineHeight: 1 }} aria-hidden>{currentSection.bossEmoji}</span>
              <span className="font-black tracking-widest mt-1.5" style={{ fontSize: 9, color: currentSection.accent, letterSpacing: '0.14em' }}>
                UNIT {currentSection.unit}
              </span>
            </div>

            {/* Meta + copy */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-black text-ink leading-tight" style={{ fontSize: 'clamp(17px, 2.2vw, 22px)', letterSpacing: '-0.02em' }}>
                  {currentSection.title}
                </p>
                <span
                  className="rounded-full px-2 py-0.5 font-black tracking-wide"
                  style={{
                    fontSize: 9.5,
                    background: `${currentSection.accent}15`,
                    color: currentSection.accent,
                    border: `1px solid ${currentSection.accent}30`,
                    letterSpacing: '0.08em',
                  }}
                >
                  KIDS STARTER · A1
                </span>
              </div>

              <p className="text-ink-muted font-medium leading-snug mt-1.5" style={{ fontSize: 13.5 }}>
                {currentSection.description}
              </p>

              <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                {currentSection.skills.map(skill => (
                  <span
                    key={skill}
                    className="rounded-full px-2.5 py-1 font-bold bg-surface-muted text-ink"
                    style={{ fontSize: 10.5, letterSpacing: '0.02em' }}
                  >
                    {skill}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-black bg-accent/12 text-accent-dark" style={{ fontSize: 10.5 }}>
                  <img src="/xp.png" alt="" aria-hidden style={{ width: 11, height: 11, objectFit: 'contain' }} />
                  +{xpInUnit} XP
                </span>
              </div>
            </div>

            {/* Continue CTA — mobile hides, folds below */}
            <div className="hidden md:flex flex-col items-stretch justify-center gap-2 flex-shrink-0" style={{ minWidth: 180 }}>
              <Link
                href={`/courses/english-kids-starter/lessons/${currentLesson.slug}`}
                className="flex items-center justify-center gap-1.5 rounded-2xl h-11 font-black text-white text-sm shadow-press-primary active:translate-y-1 active:shadow-none transition-transform"
                style={{ background: currentSection.accent, boxShadow: `0 4px 0 ${currentSection.accent}b0` }}
              >
                Продовжити →
              </Link>
              <p className="text-[11px] font-bold text-ink-muted text-center leading-tight truncate">
                {currentLesson.emoji} {currentLesson.title}
              </p>
            </div>
          </div>

          {/* Progress strip */}
          <div className="flex items-center gap-3 px-4 md:px-5 py-3 border-t border-black/5 bg-white/40">
            <div className="flex-1 rounded-full overflow-hidden" style={{ height: 7, background: `${currentSection.accent}22` }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${sectionPct}%`, background: `linear-gradient(90deg, ${currentSection.accent} 0%, ${currentSection.accent}cc 100%)` }}
              />
            </div>
            <span className="font-black flex-shrink-0" style={{ fontSize: 12, color: currentSection.accent }}>
              {sectionDone}<span className="text-ink-faint font-medium">/{sectionTotal}</span>
              <span className="text-ink-muted font-semibold ml-1.5" style={{ fontSize: 10 }}>
                уроків
              </span>
            </span>
            <span className="text-ink-faint" aria-hidden>·</span>
            <span className="font-bold text-ink-muted" style={{ fontSize: 11 }}>
              Курс · {totalDone}/{totalCount}
            </span>
          </div>

          {/* Mobile CTA */}
          <Link
            href={`/courses/english-kids-starter/lessons/${currentLesson.slug}`}
            className="md:hidden flex items-center justify-center gap-1.5 rounded-b-3xl h-11 font-black text-white text-sm text-center transition-transform active:scale-[0.98]"
            style={{ background: currentSection.accent }}
          >
            Продовжити: {currentLesson.title} →
          </Link>
        </div>
      </div>

      {/* ── Card carousel — center-focus scroll snap ──────────────── */}
      {/*
        Padding trick: paddingInline = 50% - halfCardWidth
        → first card's center aligns with viewport center at scrollLeft=0
        → last card's center aligns with viewport center at scrollLeft=max
        CSS scroll-snap then locks each card to center on release.
      */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center overflow-x-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingLeft:  'calc(50% - clamp(140px, 31vw, 190px))',
          paddingRight: 'calc(50% - clamp(140px, 31vw, 190px))',
        }}
      >
        <div className="flex items-center gap-4" style={{ paddingTop: 16, paddingBottom: 16 }}>

          {SECTIONS.flatMap(sec =>
            sec.lessons.map((lesson, i) => {
              const status = getLessonStatus(lesson.slug);
              const isCurr = lesson.slug === ME.currentSlug;
              const unitLabel = i === 0 ? `UNIT ${sec.unit} · ${sec.title.toUpperCase()}` : undefined;
              const card = <LessonCard lesson={{ ...lesson, unitNum: sec.unit, accent: sec.accent }} status={status} isCurrent={isCurr} unitLabel={unitLabel} />;

              return (
                <div
                  key={lesson.slug}
                  ref={el => {
                    if (el) {
                      cardRefs.current.set(lesson.slug, el);
                      if (isCurr) currentRef.current = el;
                    }
                  }}
                  className="flex-shrink-0"
                  style={{
                    width:          'clamp(280px, 62vw, 380px)',
                    aspectRatio:    '3/4',
                    scrollSnapAlign:'center',
                    transform:      `scale(${getScale(lesson.slug)})`,
                    opacity:         getOpacity(lesson.slug),
                    transition:     'transform 0.12s ease-out, opacity 0.12s ease-out',
                    willChange:     'transform, opacity',
                  }}
                >
                  {status !== 'locked'
                    ? <Link href={`/courses/english-kids-starter/lessons/${lesson.slug}`} className="block w-full h-full active:scale-[0.97] transition-transform">{card}</Link>
                    : card
                  }
                </div>
              );
            })
          )}

          {/* Coming soon */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center gap-3 rounded-[28px]"
            style={{ width: 'clamp(280px, 62vw, 380px)', aspectRatio: '3/4', background: '#F9FAFB', border: '2.5px dashed #E5E7EB',
                     scrollSnapAlign: 'center', opacity: 0.6 }}>
            <span style={{ fontSize: 64 }}>🌟</span>
            <div className="text-center">
              <p className="font-black" style={{ fontSize: 20, color: '#9CA3AF' }}>Coming soon</p>
              <p style={{ fontSize: 14, color: '#C4C4C4', fontWeight: 600 }}>Unit 5</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LIBRARY
══════════════════════════════════════════════════════════════════ */

/* ── Cover background per type — dark, book-like ────────────────── */
const COVER_BG: Record<Exclude<LibTabId, 'all'>, string> = {
  books:   'linear-gradient(160deg, #1e3a5f 0%, #1D4ED8 100%)',
  courses: 'linear-gradient(160deg, #064e3b 0%, #059669 100%)',
  videos:  'linear-gradient(160deg, #3b0764 0%, #7C3AED 100%)',
  games:   'linear-gradient(160deg, #78350f 0%, #D97706 100%)',
};

/* ── Classic library list row (like in the screenshot) ───────────── */
function LibListItem({ item, isLocked, onNavigate }: {
  item: LibItem; isLocked: boolean; onNavigate: () => void;
}) {
  const accent = TYPE_ACCENT[item.type];
  const desc   = LIB_DESCRIPTIONS[item.id] ?? '';

  return (
    <div
      className="flex gap-5 px-6 py-5 cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid #F3F4F6', opacity: isLocked ? 0.65 : 1 }}
      onClick={onNavigate}
    >
      {/* Book cover — portrait ratio */}
      <div
        className="flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          width: 96, height: 130,
          background: COVER_BG[item.type],
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          fontSize: 52,
          filter: isLocked ? 'grayscale(0.5)' : 'none',
        }}
      >
        {item.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Title */}
        <p className="font-black leading-snug" style={{ fontSize: 18, color: '#1A1A2E', letterSpacing: '-0.02em' }}>
          {item.titleEn}
          <span className="font-medium" style={{ fontSize: 15, color: '#6B7280' }}> — {item.subtitle}</span>
        </p>
        <p className="font-medium mt-0.5" style={{ fontSize: 13, color: '#9CA3AF' }}>{item.titleUa}</p>

        {/* Description */}
        {desc && (
          <p className="font-medium leading-relaxed mt-2"
            style={{
              fontSize: 13.5, color: '#374151',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
            {desc}
          </p>
        )}

        {/* Footer tags */}
        <div className="flex items-center gap-2 mt-auto pt-3 flex-wrap">
          <span className="rounded-md px-2.5 py-0.5 font-bold"
            style={{ fontSize: 11.5, background: `${accent}15`, color: accent, border: `1px solid ${accent}28` }}>
            {TYPE_LABEL[item.type]}
          </span>
          <span className="rounded-md px-2.5 py-0.5 font-bold"
            style={{ fontSize: 11.5, background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
            {item.level}
          </span>
          {isLocked && (
            <span style={{ fontSize: 14 }}>🔒</span>
          )}
        </div>
      </div>
    </div>
  );
}

function LibraryCatalog({ balance }: { balance: number }) {
  const router  = useRouter();
  const user    = mockKidsUser;
  const [libTab, setLibTab] = useState<LibTabId>('all');

  const visible = LIB_ITEMS.filter(i => libTab === 'all' || i.type === libTab);
  const counts: Record<LibTabId, number> = {
    all:     LIB_ITEMS.length,
    books:   LIB_ITEMS.filter(i => i.type === 'books').length,
    courses: LIB_ITEMS.filter(i => i.type === 'courses').length,
    videos:  LIB_ITEMS.filter(i => i.type === 'videos').length,
    games:   LIB_ITEMS.filter(i => i.type === 'games').length,
  };

  const grouped: { header: string; items: LibItem[] }[] =
    libTab === 'all'
      ? (['books', 'courses', 'videos', 'games'] as Exclude<LibTabId, 'all'>[])
          .map(t => ({ header: TYPE_SECTION[t], items: visible.filter(i => i.type === t) }))
          .filter(g => g.items.length > 0)
      : [{ header: '', items: visible }];

  return (
    <div className="flex flex-1 overflow-hidden">

      {/* ── Sidebar — always visible ─────────────────────────────── */}
      <div className="flex flex-col flex-shrink-0 overflow-y-auto bg-white"
        style={{ width: 196, borderRight: '1px solid #F3F4F6', paddingTop: 20, paddingBottom: 20 }}>
        <p className="px-5 mb-2 font-black uppercase tracking-widest" style={{ fontSize: 10, color: '#9CA3AF' }}>
          Категорія
        </p>
        {LIB_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setLibTab(cat.id)}
            className="flex items-center justify-between px-5 py-2.5 text-left transition-colors"
            style={{
              background: libTab === cat.id ? '#F3F4F6' : 'transparent',
              borderLeft: libTab === cat.id ? '3px solid #1A1A2E' : '3px solid transparent',
            }}>
            <span className="font-bold"
              style={{ fontSize: 13, color: libTab === cat.id ? '#1A1A2E' : '#6B7280', fontWeight: libTab === cat.id ? 800 : 500 }}>
              {cat.label}
            </span>
            <span className="font-medium" style={{ fontSize: 11, color: '#9CA3AF' }}>{counts[cat.id]}</span>
          </button>
        ))}
      </div>

      {/* ── List ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-28 bg-white">
        {grouped.map((group, gi) => (
          <div key={gi}>
            {libTab === 'all' && (
              <div className="px-6 pt-6 pb-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <p className="font-black" style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {group.header}
                </p>
              </div>
            )}
            {group.items.map(item => (
              <LibListItem
                key={item.id}
                item={item}
                isLocked={!canAccessLevel(user.level, item.level)}
                onNavigate={() => router.push(`/kids/library/${item.id}`)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════ */
export default function SchoolPage() {
  const { state } = useKidsState();
  const [tab, setTab]   = useState<PageTab>('lessons');
  const balance         = state.coins ?? mockKidsUser.coins;

  return (
    <div className="flex flex-col h-[100dvh] bg-white">

      {/* Tab switcher */}
      <div className="flex flex-shrink-0 px-4" style={{ paddingTop: 'env(safe-area-inset-top, 8px)', borderBottom: '1px solid #F3F4F6' }}>
        {([
          { id: 'lessons', label: 'Уроки',       emoji: '📚' },
          { id: 'library', label: 'Бібліотека',  emoji: '🎓' },
        ] as { id: PageTab; label: string; emoji: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 py-3 px-1 mr-6 font-black transition-colors"
            style={{
              fontSize: 14,
              color: tab === t.id ? '#1A1A2E' : '#9CA3AF',
              borderBottom: tab === t.id ? '2.5px solid #1A1A2E' : '2.5px solid transparent',
              marginBottom: -1,
            }}>
            <span style={{ fontSize: 16 }}>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'lessons'
          ? <LessonsCarousel />
          : <LibraryCatalog balance={balance} />
        }
      </div>
    </div>
  );
}
