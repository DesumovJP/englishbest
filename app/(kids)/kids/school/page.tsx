'use client';
import { useState, useRef, useEffect, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockKidsUser } from '@/mocks/user';
import { useKidsState } from '@/lib/use-kids-store';
import {
  LIB_ITEMS, LIB_DESCRIPTIONS, LIB_CATEGORIES,
  TYPE_ACCENT, TYPE_LABEL, TYPE_SECTION,
  canAccessLevel,
  type LibTabId, type LibItem,
} from '@/lib/library-data';

type PageTab = 'lessons' | 'library';

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

interface LLesson { slug: string; title: string; emoji: string; xp: number; type?: LessonType; }
interface LSection {
  slug: string; unit: number; title: string; bossEmoji: string;
  description: string;
  skills: string[];
  accent: string;
  lessons: LLesson[];
}

const SECTIONS: LSection[] = [
  {
    slug: 'basics', unit: 1, title: 'Знайомство', bossEmoji: '👋',
    description: 'Перші кроки англійською: вітайся, називай імʼя, рахуй до десяти та знайомся з новими друзями.',
    skills: ['Greetings', 'Numbers', 'Colors', 'Animals'],
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
    description: 'Розпорядок дня, їжа, дім та сімʼя — все, щоб упевнено розповісти про себе й свій день.',
    skills: ['Routines', 'Food', 'Family', 'House'],
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
    description: 'Головна граматика: будуй речення в теперішньому часі, став запитання та говори про свої звички.',
    skills: ['Statements', 'Questions', 'Negatives', 'Adverbs'],
    accent: '#A855F7',
    lessons: [
      { slug: 'action-verbs',      title: 'Дієслова дії',         emoji: '📚', xp: 10, type: 'vocab'    },
      { slug: 'present-simple-1',  title: 'Стверджувальні',       emoji: '✅', xp: 20, type: 'lesson'   },
      { slug: 'present-simple-2',  title: 'Питальні речення',     emoji: '❓', xp: 20, type: 'lesson'   },
      { slug: 'ps-listening',      title: 'Аудіо: запитання',     emoji: '👂', xp: 15, type: 'listening'},
      { slug: 'present-simple-3',  title: 'Заперечні речення',    emoji: '🚫', xp: 15, type: 'lesson'   },
      { slug: 'my-day-writing',    title: 'Пиши: Мій день',       emoji: '✍️', xp: 20, type: 'writing'  },
      { slug: 'adverbs-freq',      title: 'Always & Never',       emoji: '🔄', xp: 15, type: 'lesson'   },
      { slug: 'typical-day-read',  title: 'Читай: A Typical Day', emoji: '📖', xp: 15, type: 'reading'  },
      { slug: 'about-me-speaking', title: 'Говори: про себе',     emoji: '🗣️', xp: 20, type: 'speaking' },
      { slug: 'unit3-test',        title: 'Тест Юніту 3',         emoji: '🎯', xp: 35, type: 'test'     },
    ],
  },
  {
    slug: 'adventures', unit: 4, title: 'Пригоди', bossEmoji: '🗺️',
    description: 'Подорожі, зоопарк, погода й перше минуле — готуйся розказати історію про свою найкращу пригоду.',
    skills: ['Travel', 'Seasons', 'Body', 'Past Simple'],
    accent: '#F59E0B',
    lessons: [
      { slug: 'transport-vocab',    title: 'Транспорт: слова',     emoji: '📚', xp: 10, type: 'vocab'    },
      { slug: 'travel',             title: 'Travelling',           emoji: '✈️', xp: 20, type: 'lesson'   },
      { slug: 'at-the-zoo',         title: 'At the Zoo',           emoji: '🦁', xp: 15, type: 'lesson'   },
      { slug: 'seasons',            title: 'Four Seasons',         emoji: '🍂', xp: 15, type: 'lesson'   },
      { slug: 'weather-listening',  title: 'Аудіо: прогноз',       emoji: '👂', xp: 15, type: 'listening'},
      { slug: 'body-health',        title: 'Body & Health',        emoji: '💪', xp: 20, type: 'lesson'   },
      { slug: 'doctor-reading',     title: 'Читай: At the Doctor', emoji: '📖', xp: 15, type: 'reading'  },
      { slug: 'holiday-writing',    title: 'Пиши: My Holiday',     emoji: '✍️', xp: 20, type: 'writing'  },
      { slug: 'past-simple-1',      title: 'Past Simple',          emoji: '⏳', xp: 25, type: 'lesson'   },
      { slug: 'adventure-speaking', title: 'Говори: пригода',      emoji: '🗣️', xp: 20, type: 'speaking' },
      { slug: 'unit4-test',         title: 'Фінальний тест',       emoji: '🏆', xp: 40, type: 'test'     },
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

interface CardLesson extends LLesson { unitNum: number; accent: string; }

function LessonCard({ lesson, status, isCurrent, unitLabel }: {
  lesson: CardLesson; status: LessonStatus; isCurrent: boolean; unitLabel?: string;
}) {
  const cardStyle: CSSProperties = isCurrent
    ? { boxShadow: `0 0 0 4px ${lesson.accent}, 0 12px 40px ${lesson.accent}55` }
    : {};
  const tintStyle: CSSProperties = {
    background: `linear-gradient(165deg, ${lesson.accent}70 0%, rgba(0,0,0,0.58) 100%)`,
  };

  return (
    <div
      className={[
        'relative w-full h-full rounded-[28px] overflow-hidden select-none bg-[#1a1a2e]',
        !isCurrent && (status === 'done'
          ? 'shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
          : 'shadow-[0_10px_28px_rgba(0,0,0,0.22)]'),
      ].filter(Boolean).join(' ')}
      style={cardStyle}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://picsum.photos/seed/${lesson.slug}/400/540`}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover blur-[5px] saturate-[1.2] scale-110"
      />

      <div className="absolute inset-0" style={tintStyle} />

      {status === 'done' && <div className="absolute inset-0 bg-black/20" />}

      {status === 'locked' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-[clamp(44px,8vh,64px)] drop-shadow-[0_3px_8px_rgba(0,0,0,0.6)]">🔒</span>
        </div>
      )}

      {status !== 'locked' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-4 pointer-events-none">
          <div className="rounded-full flex items-center justify-center w-[72px] h-[72px] bg-white/20 backdrop-blur-md border-[1.5px] border-white/30 text-[38px] shadow-[0_6px_20px_rgba(0,0,0,0.3)]">
            {lesson.emoji}
          </div>
          <p className="font-black text-white leading-tight drop-shadow-xl text-[clamp(24px,3.2vw,34px)] -tracking-[0.02em] line-clamp-3">
            {lesson.title}
          </p>
          <p className="font-bold drop-shadow-sm text-[15px] text-white/75 tracking-[0.01em]">
            {TYPE_DESC[lesson.type ?? 'lesson']}
          </p>
          <div className="flex items-center gap-2 mt-1 rounded-full px-3.5 py-1.5 bg-white/20 backdrop-blur-sm border border-white/20">
            <img src="/coin.png" alt="coin" width={18} height={18} className="object-contain" />
            <span className="text-[15px] text-white font-black">+{lesson.xp}</span>
            <img src="/xp.png" alt="XP" width={18} height={18} className="object-contain ml-0.5" />
          </div>
        </div>
      )}

      {unitLabel && (
        <div className="absolute top-3 left-3 rounded-full px-2.5 py-1 bg-black/40 backdrop-blur-md border border-white/20">
          <span className="font-black text-white text-[10px] tracking-[0.08em]">{unitLabel}</span>
        </div>
      )}

      {status === 'done' && !unitLabel && (
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

function LessonsCarousel() {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const cardRefs   = useRef(new Map<string, HTMLDivElement>());
  const rafRef     = useRef<number | null>(null);
  const [scales, setScales] = useState(new Map<string, number>());

  const totalDone  = SECTIONS.flatMap(s => s.lessons).filter(l => getLessonStatus(l.slug) === 'done').length;
  const totalCount = SECTIONS.flatMap(s => s.lessons).length;
  const currentSection = SECTIONS.find(s => s.lessons.some(l => l.slug === ME.currentSlug)) ?? SECTIONS[0];
  const sectionDone   = currentSection.lessons.filter(l => getLessonStatus(l.slug) === 'done').length;
  const sectionTotal  = currentSection.lessons.length;
  const sectionPct    = Math.round((sectionDone / sectionTotal) * 100);
  const xpInUnit      = currentSection.lessons.reduce((sum, l) => sum + l.xp, 0);
  const currentLesson = currentSection.lessons.find(l => l.slug === ME.currentSlug) ?? currentSection.lessons[0];

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

  const getScale   = (slug: string) => { const t = scales.get(slug) ?? 0; return 0.80 + 0.25 * t; };
  const getOpacity = (slug: string) => { const t = scales.get(slug) ?? 0; return 0.52 + 0.48 * t; };

  const accentVars = { '--accent': currentSection.accent } as CSSProperties;

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden bg-[url('/kids-school-bg.jpg')] bg-cover bg-center bg-no-repeat" style={accentVars}>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/55 to-white/85" />

      {/* Unit description panel */}
      <div className="relative z-10 flex-shrink-0 px-3 pt-2 pb-2 md:px-4 md:pt-4 md:pb-3">
        <div className="mx-auto w-full max-w-[880px] rounded-2xl md:rounded-3xl bg-white/85 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_rgba(15,23,42,0.10)] overflow-hidden">
          <div className="flex items-center gap-3 p-2.5 md:items-stretch md:gap-4 md:p-5">
            <div className="flex-shrink-0 rounded-xl md:rounded-2xl flex flex-col items-center justify-center px-2 py-1.5 min-w-[52px] md:min-w-[76px] md:px-3 md:py-2.5 bg-[color:var(--accent)]/10 border-[1.5px] border-[color:var(--accent)]/30">
              <span className="text-[22px] md:text-[34px] leading-none" aria-hidden>{currentSection.bossEmoji}</span>
              <span className="font-black tracking-widest mt-1 md:mt-1.5 text-[8px] md:text-[9px] text-[color:var(--accent)]">
                UNIT {currentSection.unit}
              </span>
            </div>

            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-black text-ink leading-tight text-[15px] md:text-[clamp(17px,2.2vw,22px)] -tracking-[0.02em]">
                  {currentSection.title}
                </p>
                <span className="rounded-full px-2 py-0.5 font-black tracking-wide text-[9px] md:text-[9.5px] bg-[color:var(--accent)]/10 text-[color:var(--accent)] border border-[color:var(--accent)]/20">
                  A1
                </span>
              </div>

              <p className="hidden md:block text-ink-muted font-medium leading-snug mt-1.5 text-[13.5px]">
                {currentSection.description}
              </p>

              <div className="hidden md:flex items-center gap-1.5 flex-wrap mt-2.5">
                {currentSection.skills.map(skill => (
                  <span key={skill} className="rounded-full px-2.5 py-1 font-bold bg-surface-muted text-ink text-[10.5px]">
                    {skill}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-black bg-accent/10 text-accent-dark text-[10.5px]">
                  <img src="/xp.png" alt="" aria-hidden width={11} height={11} className="object-contain" />
                  +{xpInUnit} XP
                </span>
              </div>

              <div className="md:hidden flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 font-black text-accent-dark text-[10.5px]">
                  <img src="/xp.png" alt="" aria-hidden width={11} height={11} className="object-contain" />
                  +{xpInUnit} XP
                </span>
                <span className="text-ink-faint" aria-hidden>·</span>
                <span className="font-bold text-ink-muted text-[11px] truncate">
                  {sectionDone}/{sectionTotal} уроків
                </span>
              </div>
            </div>
          </div>

          {/* Progress strip — desktop only (mobile shows inline + thin bar below) */}
          <div className="hidden md:flex items-center gap-3 px-4 md:px-5 py-3 border-t border-black/5 bg-white/40">
            <div className="flex-1 rounded-full overflow-hidden h-[7px] bg-[color:var(--accent)]/15">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${sectionPct}%`, background: `linear-gradient(90deg, ${currentSection.accent} 0%, ${currentSection.accent}cc 100%)` }}
              />
            </div>
            <span className="font-black flex-shrink-0 text-xs text-[color:var(--accent)]">
              {sectionDone}<span className="text-ink-faint font-medium">/{sectionTotal}</span>
              <span className="text-ink-muted font-semibold ml-1.5 text-[10px]">уроків</span>
            </span>
            <span className="text-ink-faint" aria-hidden>·</span>
            <span className="font-bold text-ink-muted text-[11px]">
              Курс · {totalDone}/{totalCount}
            </span>
          </div>

          <div className="md:hidden h-[3px] bg-[color:var(--accent)]/15">
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${sectionPct}%`, background: currentSection.accent }}
            />
          </div>
        </div>
      </div>

      {/* Card carousel */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden px-[calc(50%-clamp(110px,29vw,190px))]"
      >
        <div className="flex items-center gap-4 py-4">
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
                  className="flex-shrink-0 snap-center w-[clamp(220px,58vw,380px)] aspect-[4/5] sm:aspect-[3/4] [will-change:transform,opacity] transition-[transform,opacity] duration-[120ms] ease-out"
                  style={{ transform: `scale(${getScale(lesson.slug)})`, opacity: getOpacity(lesson.slug) }}
                >
                  {status !== 'locked'
                    ? <Link href={`/courses/english-kids-starter/lessons/${lesson.slug}`} className="block w-full h-full active:scale-[0.97] transition-transform">{card}</Link>
                    : card
                  }
                </div>
              );
            })
          )}

          <div className="flex-shrink-0 flex flex-col items-center justify-center gap-3 rounded-[28px] snap-center w-[clamp(280px,62vw,380px)] aspect-[3/4] bg-gray-50 border-[2.5px] border-dashed border-gray-200 opacity-60">
            <span className="text-[64px]">🌟</span>
            <div className="text-center">
              <p className="font-black text-xl text-gray-400">Coming soon</p>
              <p className="text-sm text-gray-300 font-semibold">Unit 5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const COVER_BG: Record<Exclude<LibTabId, 'all'>, string> = {
  books:   'linear-gradient(160deg, #1e3a5f 0%, #1D4ED8 100%)',
  courses: 'linear-gradient(160deg, #064e3b 0%, #059669 100%)',
  videos:  'linear-gradient(160deg, #3b0764 0%, #7C3AED 100%)',
  games:   'linear-gradient(160deg, #78350f 0%, #D97706 100%)',
};

function LibListItem({ item, isLocked, onNavigate }: {
  item: LibItem; isLocked: boolean; onNavigate: () => void;
}) {
  const accent = TYPE_ACCENT[item.type];
  const desc   = LIB_DESCRIPTIONS[item.id] ?? '';
  const rowVars = { '--accent': accent, '--cover-bg': COVER_BG[item.type] } as CSSProperties;

  return (
    <div
      className={[
        'flex gap-3 px-3 py-3 md:gap-5 md:px-6 md:py-5 cursor-pointer transition-colors border-b border-gray-100',
        isLocked ? 'opacity-65' : 'opacity-100',
      ].join(' ')}
      style={rowVars}
      onClick={onNavigate}
    >
      <div className={[
        'flex-shrink-0 rounded-lg md:rounded-xl overflow-hidden flex items-center justify-center w-16 h-[88px] text-[36px] md:w-24 md:h-[130px] md:text-[52px] shadow-[0_4px_16px_rgba(0,0,0,0.25)] bg-[image:var(--cover-bg)]',
        isLocked && 'grayscale-50',
      ].filter(Boolean).join(' ')}>
        {item.emoji}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <p className="font-black leading-snug text-[15px] md:text-lg text-gray-900 -tracking-[0.02em]">
          {item.titleEn}
          <span className="font-medium text-[13px] md:text-[15px] text-gray-500"> — {item.subtitle}</span>
        </p>
        <p className="font-medium mt-0.5 text-[11.5px] md:text-[13px] text-gray-400">{item.titleUa}</p>

        {desc && (
          <p className="font-medium leading-snug md:leading-relaxed mt-1 md:mt-2 text-[12px] md:text-[13.5px] text-gray-700 line-clamp-2 md:line-clamp-3">
            {desc}
          </p>
        )}

        <div className="flex items-center gap-1.5 md:gap-2 mt-auto pt-2 md:pt-3 flex-wrap">
          <span className="rounded-md px-2 py-0.5 font-bold text-[10.5px] md:text-[11.5px] bg-[color:var(--accent)]/10 text-[color:var(--accent)] border border-[color:var(--accent)]/25">
            {TYPE_LABEL[item.type]}
          </span>
          <span className="rounded-md px-2 py-0.5 font-bold text-[10.5px] md:text-[11.5px] bg-gray-100 text-gray-700 border border-gray-200">
            {item.level}
          </span>
          {isLocked && <span className="text-sm">🔒</span>}
        </div>
      </div>
    </div>
  );
}

function LibraryCatalog() {
  const router = useRouter();
  const user   = mockKidsUser;
  const [libTab, setLibTab] = useState<LibTabId>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const activeCat = LIB_CATEGORIES.find(c => c.id === libTab) ?? LIB_CATEGORIES[0];

  return (
    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
      {/* Mobile: drawer trigger */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="md:hidden flex items-center justify-between gap-2 px-4 h-11 bg-white border-b border-gray-100 text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="font-black text-[14px] text-gray-900 truncate">{activeCat.label}</span>
          <span className="font-bold text-[11px] text-gray-400">{counts[activeCat.id]}</span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="flex-shrink-0 text-gray-500">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0 overflow-y-auto bg-white w-[196px] border-r border-gray-100 py-5">
        <p className="px-5 mb-2 font-black uppercase tracking-widest text-[10px] text-gray-400">
          Категорія
        </p>
        {LIB_CATEGORIES.map(cat => {
          const isActive = libTab === cat.id;
          return (
            <button key={cat.id} onClick={() => setLibTab(cat.id)}
              className={[
                'flex items-center justify-between px-5 py-2.5 text-left transition-colors border-l-[3px]',
                isActive ? 'bg-gray-100 border-gray-900' : 'bg-transparent border-transparent',
              ].join(' ')}>
              <span className={['text-[13px]', isActive ? 'text-gray-900 font-extrabold' : 'text-gray-500 font-medium'].join(' ')}>
                {cat.label}
              </span>
              <span className="font-medium text-[11px] text-gray-400">{counts[cat.id]}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile bottom sheet */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex items-end">
          <div
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-[4px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="relative w-full max-h-[85dvh] flex flex-col rounded-t-3xl bg-white shadow-[0_-10px_40px_rgba(15,23,42,0.15)] animate-[slide-up_220ms_ease-out]">
            <div className="flex-shrink-0 flex justify-center pt-2.5 pb-2">
              <span className="h-1 w-10 rounded-full bg-gray-300" aria-hidden />
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom,16px)]">
              <p className="px-5 pb-2 font-black uppercase tracking-widest text-[10px] text-gray-400">Категорія</p>
              <div className="px-2 pb-2">
                {LIB_CATEGORIES.map(cat => {
                  const isActive = libTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setLibTab(cat.id); setDrawerOpen(false); }}
                      className={[
                        'w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors',
                        isActive ? 'bg-gray-900 text-white' : 'bg-transparent text-gray-700 active:bg-gray-100',
                      ].join(' ')}
                    >
                      <span className="font-extrabold text-[15px]">{cat.label}</span>
                      <span className={['font-bold text-[12px]', isActive ? 'text-white/70' : 'text-gray-400'].join(' ')}>{counts[cat.id]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 overflow-y-auto pb-28 bg-white">
        {grouped.map((group, gi) => (
          <div key={gi}>
            {libTab === 'all' && (
              <div className="px-6 pt-6 pb-3 border-b border-gray-100">
                <p className="font-black text-xs text-gray-400 uppercase tracking-[0.08em]">
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

export default function SchoolPage() {
  const [tab, setTab] = useState<PageTab>('lessons');

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      <div className="flex flex-shrink-0 px-4 border-b border-gray-100 pt-[env(safe-area-inset-top,8px)]">
        {([
          { id: 'lessons', label: 'Уроки',      emoji: '📚' },
          { id: 'library', label: 'Бібліотека', emoji: '🎓' },
        ] as { id: PageTab; label: string; emoji: string }[]).map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={[
                'flex items-center gap-2 py-3 px-1 mr-6 font-black transition-colors text-sm border-b-[2.5px] -mb-px',
                active ? 'text-gray-900 border-gray-900' : 'text-gray-400 border-transparent',
              ].join(' ')}>
              <span className="text-base">{t.emoji}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'lessons' ? <LessonsCarousel /> : <LibraryCatalog />}
      </div>
    </div>
  );
}
