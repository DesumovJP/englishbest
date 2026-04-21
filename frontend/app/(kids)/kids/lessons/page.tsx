'use client';
import { useRef, useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';

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

interface Lesson {
  slug: string; title: string; emoji: string; xp: number; type?: LessonType;
}
interface Section {
  slug: string; unit: number; title: string; bossEmoji: string;
  color: string; ring: string; dot: string; light: string; path: string;
  accent: string;
  lessons: Lesson[];
}

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

/* ── Lesson card ─────────────────────────────────────────────────── */
function LessonCard({ slug, title, xp, type, emoji, accent, status, isCurrent, unitLabel }: {
  slug: string; title: string; xp: number; type?: LessonType; emoji: string;
  accent: string; status: LessonStatus; isCurrent: boolean; unitLabel?: string;
}) {
  // Accent feeds color + shadow + tint via CSS var — all genuinely dynamic.
  const vars = { '--accent': accent } as CSSProperties;
  return (
    <div
      className={[
        "relative w-full h-full rounded-[28px] overflow-hidden select-none bg-[#1a1a2e]",
        isCurrent
          ? "shadow-[0_0_0_4px_var(--accent),0_12px_40px_color-mix(in_oklab,var(--accent),transparent_66%)]"
          : status === 'done'
            ? "shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            : "shadow-[0_10px_28px_rgba(0,0,0,0.22)]",
      ].join(" ")}
      style={vars}>

      {/* Blurred photo background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://picsum.photos/seed/${slug}/400/540`}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover blur-[5px] saturate-150 scale-110"
      />

      {/* Accent tint + dark overlay — dynamic, must stay inline */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(165deg, ${accent}70 0%, rgba(0,0,0,0.58) 100%)` }}
      />

      {status === 'done' && <div className="absolute inset-0 bg-black/25" />}

      {status === 'locked' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-[clamp(44px,8vh,64px)] drop-shadow-[0_3px_8px_rgba(0,0,0,0.6)]">🔒</span>
        </div>
      )}

      {status !== 'locked' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-4 pointer-events-none">
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border-[1.5px] border-white/30 shadow-[0_6px_20px_rgba(0,0,0,0.3)] text-[38px]">
            {emoji}
          </div>
          <p className="font-black text-white leading-tight drop-shadow-xl text-[clamp(24px,3.2vw,34px)] tracking-tight line-clamp-3">
            {title}
          </p>
          <p className="font-bold drop-shadow-sm text-[15px] text-white/75 tracking-[0.01em]">
            {TYPE_DESC[type ?? 'lesson']}
          </p>
          <div className="flex items-center gap-2 mt-1 rounded-full px-3.5 py-1.5 bg-white/20 backdrop-blur-sm border border-white/25">
            <img src="/coin.png" alt="coin" width={18} height={18} className="object-contain" />
            <span className="text-[15px] text-white font-black">+{xp}</span>
            <img src="/xp.png" alt="XP" width={18} height={18} className="object-contain ml-0.5" />
          </div>
        </div>
      )}

      {unitLabel && (
        <div className="absolute top-3 left-3 rounded-full px-2.5 py-1 bg-black/40 backdrop-blur-md border border-white/25">
          <span className="font-black text-white text-[10px] tracking-[0.08em]">{unitLabel}</span>
        </div>
      )}

      {status === 'done' && (
        <div className="absolute top-3 right-3 rounded-full w-7 h-7 flex items-center justify-center bg-green-600 shadow-[0_3px_10px_rgba(22,163,74,0.5)]">
          <span className="font-black text-white text-sm">✓</span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute top-3 right-3 rounded-full px-3 py-1.5 flex items-center gap-1 bg-green-500 shadow-[0_3px_12px_rgba(34,197,94,0.55)]">
          <span className="text-[10px]">▶</span>
          <span className="font-black text-white text-[11px] tracking-[0.08em]">NOW</span>
        </div>
      )}
    </div>
  );
}

/* ── Carousel ─────────────────────────────────────────────────────── */
function LessonsCarousel() {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const cardRefs   = useRef(new Map<string, HTMLDivElement>());
  const rafRef     = useRef<number | null>(null);
  const [scales, setScales] = useState(new Map<string, number>());

  const totalDone = ME.doneSlugs.length;
  const pct = Math.round((totalDone / TOTAL) * 100);
  const currentSection = SECTIONS.find(s => s.lessons.some(l => l.slug === ME.currentSlug)) ?? SECTIONS[0];

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

  const getScale   = (slug: string) => { const t = scales.get(slug) ?? 0; return 0.62 + 0.38 * t; };
  const getOpacity = (slug: string) => { const t = scales.get(slug) ?? 0; return 0.32 + 0.68 * t; };

  const sectionVars = { '--section-accent': currentSection.accent } as CSSProperties;

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-[#FAFAFA]" style={sectionVars}>
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 mx-auto max-w-[640px] pb-2.5 pt-[max(12px,env(safe-area-inset-top))]">
          <Link href="/kids/school"
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-700 text-base font-black active:scale-90 transition-transform">
            ←
          </Link>

          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-[color:var(--section-accent)]/10 border-[1.5px] border-[color:var(--section-accent)]/20">
            {currentSection.bossEmoji}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-black leading-none truncate text-[13px] text-gray-900">
              Unit {currentSection.unit} — {currentSection.title}
            </p>
            <p className="font-medium leading-none mt-1 truncate text-[10.5px] text-gray-400">
              English Kids Starter
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="rounded-full overflow-hidden w-16 h-1.5 bg-gray-100">
              <div className="h-full rounded-full bg-[color:var(--section-accent)] transition-[width] duration-700" style={{ width: `${pct}%` }} />
            </div>
            <span className="font-black text-xs text-[color:var(--section-accent)]">
              {totalDone}<span className="text-gray-300 font-medium">/{TOTAL}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] pl-[calc(50%-clamp(170px,40vw,230px))] pr-[calc(50%-clamp(170px,40vw,230px))]"
      >
        <div className="flex items-center gap-5 py-6">
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
                  className="flex-shrink-0 w-[clamp(340px,80vw,460px)] aspect-[3/4] snap-center will-change-[transform,opacity] transition-[transform,opacity] duration-150 ease-out"
                  style={{
                    transform: `scale(${getScale(lesson.slug)})`,
                    opacity: getOpacity(lesson.slug),
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

          <div className="flex-shrink-0 flex flex-col items-center justify-center gap-4 rounded-[28px] w-[clamp(240px,56vw,320px)] aspect-[3/4] bg-gray-50 border-[2.5px] border-dashed border-gray-200 snap-center opacity-60">
            <span className="text-[56px]">🌟</span>
            <div className="text-center">
              <p className="font-black text-[17px] text-gray-400">Coming soon</p>
              <p className="text-[13px] text-gray-300 font-semibold mt-1">Unit 5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KidsLessonsPage() {
  return <LessonsCarousel />;
}
