'use client';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

/* ── Types ───────────────────────────────────────────────────────── */
type LessonStatus = 'done' | 'current' | 'locked';
type LessonType = 'lesson' | 'vocab' | 'reading' | 'listening' | 'speaking' | 'writing' | 'test';

const TYPE_DESC: Record<string, string> = {
  lesson:    'Основний урок',
  vocab:     'Нові слова',
  reading:   'Практика читання',
  listening: 'Тренуй слух',
  speaking:  'Говори англійською',
  writing:   'Вправи з письма',
  test:      'Перевір знання',
};

const TYPE_GRAD: Record<string, string> = {
  lesson:    'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
  vocab:     'linear-gradient(145deg, #f093fb 0%, #c850c0 100%)',
  reading:   'linear-gradient(145deg, #4facfe 0%, #0262c8 100%)',
  listening: 'linear-gradient(145deg, #43e97b 0%, #0ba360 100%)',
  speaking:  'linear-gradient(145deg, #f7971e 0%, #ffd200 100%)',
  writing:   'linear-gradient(145deg, #a18cd1 0%, #6c63ff 100%)',
  test:      'linear-gradient(145deg, #f54ea2 0%, #ff7676 100%)',
};

interface Lesson {
  slug: string; title: string; emoji: string; xp: number; type?: LessonType;
}
interface Section {
  slug: string; unit: number; title: string; bossEmoji: string;
  color: string; ring: string; dot: string; light: string; path: string;
  accent: string;
  lessons: Lesson[];
}

/* ── Data ────────────────────────────────────────────────────────── */
const SECTIONS: Section[] = [
  {
    slug: 'basics', unit: 1, title: 'Знайомство', bossEmoji: '👋',
    color: 'text-secondary', ring: 'ring-secondary/60', dot: 'bg-secondary',
    light: 'bg-secondary/8 border-secondary/15', path: 'var(--color-secondary)',
    accent: '#4F9CF9',
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
    color: 'text-success', ring: 'ring-success/60', dot: 'bg-success',
    light: 'bg-success/8 border-success/15', path: 'var(--color-success)',
    accent: '#22C55E',
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
    color: 'text-purple', ring: 'ring-purple/60', dot: 'bg-purple',
    light: 'bg-purple/8 border-purple/15', path: 'var(--color-purple)',
    accent: '#A855F7',
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
    color: 'text-accent', ring: 'ring-accent/60', dot: 'bg-accent',
    light: 'bg-accent/8 border-accent/15', path: 'var(--color-accent)',
    accent: '#F59E0B',
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
const TOTAL = ALL_SLUGS.length;
const ME = {
  name: 'Аліса К.', photo: 'https://randomuser.me/api/portraits/girls/44.jpg',
  level: 'A1', totalXp: 1847, streak: 14,
  doneSlugs: ['hello-goodbye','greetings-vocab','my-name-is','numbers-colors','numbers-vocab','animals','animals-listening','classroom','my-profile-reading','unit1-test','daily-routines','routines-vocab','food-drinks'],
  currentSlug: 'food-listening',
};

function getStatus(slug: string): LessonStatus {
  if (ME.doneSlugs.includes(slug)) return 'done';
  if (ME.currentSlug === slug) return 'current';
  const ci = ALL_SLUGS.indexOf(ME.currentSlug);
  const ti = ALL_SLUGS.indexOf(slug);
  return ti <= ci ? 'done' : 'locked';
}

/* ── Lesson card — height driven by parent ───────────────────────── */
function LessonCard({ slug, title, xp, type, emoji, accent, status, isCurrent, unitLabel }: {
  slug: string; title: string; xp: number; type?: LessonType; emoji: string;
  accent: string; status: LessonStatus; isCurrent: boolean; unitLabel?: string;
}) {
  return (
    <div className="relative w-full h-full rounded-[28px] overflow-hidden select-none"
      style={{
        background: '#1a1a2e',
        boxShadow: isCurrent
          ? `0 0 0 4px ${accent}, 0 12px 40px ${accent}55`
          : status === 'done' ? '0 4px 16px rgba(0,0,0,0.12)' : '0 10px 28px rgba(0,0,0,0.22)',
      }}>

      {/* Blurred photo background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://picsum.photos/seed/${slug}/400/540`}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(5px) saturate(1.2)', transform: 'scale(1.1)' }}
      />

      {/* Color tint + dark overlay */}
      <div className="absolute inset-0"
        style={{ background: `linear-gradient(165deg, ${accent}70 0%, rgba(0,0,0,0.58) 100%)` }} />

      {/* Done: extra scrim */}
      {status === 'done' && (
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.22)' }} />
      )}

      {/* Locked: full scrim + lock */}
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
            {emoji}
          </div>
          <p className="font-black text-white leading-tight drop-shadow-xl"
            style={{
              fontSize: 'clamp(24px, 3.2vw, 34px)',
              letterSpacing: '-0.02em',
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            }}>
            {title}
          </p>
          <p className="font-bold drop-shadow-sm" style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.01em' }}>
            {TYPE_DESC[type ?? 'lesson']}
          </p>
          <div className="flex items-center gap-2 mt-1 rounded-full px-3.5 py-1.5"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.22)' }}>
            <img src="/coin.png" alt="coin" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            <span style={{ fontSize: 15, color: 'white', fontWeight: 900 }}>+{xp}</span>
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
      {status === 'done' && (
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

/* ── Carousel (all screens) ──────────────────────────────────────── */
function LessonsCarousel() {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const cardRefs   = useRef(new Map<string, HTMLDivElement>());
  const rafRef     = useRef<number | null>(null);
  const [scales, setScales] = useState(new Map<string, number>());

  const totalDone = ME.doneSlugs.length;
  const pct = Math.round((totalDone / TOTAL) * 100);
  const currentSection = SECTIONS.find(s => s.lessons.some(l => l.slug === ME.currentSlug)) ?? SECTIONS[0];

  /* Recalculate per-card proximity to viewport center */
  function calcScales() {
    const ctr = scrollRef.current;
    if (!ctr) return;
    const { left: cl, width: cw } = ctr.getBoundingClientRect();
    const cx        = cl + cw / 2;
    const threshold = cw * 0.5;
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
    requestAnimationFrame(calcScales);
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('scrollend', calcScales);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Auto-scroll to current lesson using getBoundingClientRect */
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

  /* Scale: 0.62 (off-center) → 1.0 (centered) | opacity: 0.32 → 1.0 */
  function getScale(slug: string)   { const t = scales.get(slug) ?? 0; return 0.62 + 0.38 * t; }
  function getOpacity(slug: string) { const t = scales.get(slug) ?? 0; return 0.32 + 0.68 * t; }

  /* Half card width for padding trick — must match card width / 2 */
  const halfCard = 'clamp(170px, 40vw, 230px)';

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-[#FAFAFA]">

      {/* Compact centered top bar */}
      <div className="flex-shrink-0 bg-white" style={{ borderBottom: '1px solid #F3F4F6' }}>
        <div className="flex items-center gap-3 px-4 mx-auto"
          style={{
            paddingTop: 'env(safe-area-inset-top, 12px)',
            paddingBottom: 10,
            maxWidth: 640,
          }}>
          <Link href="/kids/school"
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
            style={{ background: '#F3F4F6', color: '#374151', fontSize: 16, fontWeight: 900 }}>←</Link>

          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: `${currentSection.accent}18`, border: `1.5px solid ${currentSection.accent}30` }}>
            {currentSection.bossEmoji}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-black leading-none truncate" style={{ fontSize: 13, color: '#1A1A2E' }}>
              Unit {currentSection.unit} — {currentSection.title}
            </p>
            <p className="font-medium leading-none mt-1 truncate" style={{ fontSize: 10.5, color: '#9CA3AF' }}>
              English Kids Starter
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="rounded-full overflow-hidden" style={{ width: 64, height: 6, background: '#F3F4F6' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: currentSection.accent, transition: 'width 0.7s ease' }} />
            </div>
            <span className="font-black" style={{ fontSize: 12, color: currentSection.accent }}>
              {totalDone}<span style={{ color: '#D1D5DB', fontWeight: 500 }}>/{TOTAL}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card carousel — center-focus scroll snap */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center overflow-x-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingLeft:  `calc(50% - ${halfCard})`,
          paddingRight: `calc(50% - ${halfCard})`,
        }}
      >
        <div className="flex items-center gap-5" style={{ paddingTop: 24, paddingBottom: 24 }}>

          {SECTIONS.flatMap(sec =>
            sec.lessons.map((lesson, i) => {
              const status    = getStatus(lesson.slug);
              const isCurr    = lesson.slug === ME.currentSlug;
              const unitLabel = i === 0 ? `UNIT ${sec.unit} · ${sec.title.toUpperCase()}` : undefined;
              const card = (
                <LessonCard
                  slug={lesson.slug} title={lesson.title} xp={lesson.xp} type={lesson.type}
                  emoji={lesson.emoji} accent={sec.accent}
                  status={status} isCurrent={isCurr} unitLabel={unitLabel}
                />
              );
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
                    width:           'clamp(340px, 80vw, 460px)',
                    aspectRatio:     '3/4',
                    scrollSnapAlign: 'center',
                    transform:       `scale(${getScale(lesson.slug)})`,
                    opacity:          getOpacity(lesson.slug),
                    transition:      'transform 0.14s ease-out, opacity 0.14s ease-out',
                    willChange:      'transform, opacity',
                  }}
                >
                  {status !== 'locked'
                    ? <Link href={`/courses/english-kids-starter/lessons/${lesson.slug}`}
                        className="block w-full h-full active:scale-[0.97] transition-transform">{card}</Link>
                    : card
                  }
                </div>
              );
            })
          )}

          <div className="flex-shrink-0 flex flex-col items-center justify-center gap-4 rounded-[28px]"
            style={{
              width: 'clamp(240px, 56vw, 320px)', aspectRatio: '3/4',
              background: '#F9FAFB', border: '2.5px dashed #E5E7EB',
              scrollSnapAlign: 'center', opacity: 0.6,
            }}>
            <span style={{ fontSize: 56 }}>🌟</span>
            <div className="text-center">
              <p className="font-black" style={{ fontSize: 17, color: '#9CA3AF' }}>Coming soon</p>
              <p style={{ fontSize: 13, color: '#C4C4C4', fontWeight: 600, marginTop: 4 }}>Unit 5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function KidsLessonsPage() {
  return <LessonsCarousel />;
}
