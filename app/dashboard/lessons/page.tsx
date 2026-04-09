'use client';
import Link from 'next/link';

type LessonStatus = 'done' | 'current' | 'locked';
type NodePos = 'left' | 'center' | 'right';

type LessonType = 'lesson' | 'vocab' | 'reading' | 'listening' | 'speaking' | 'writing' | 'test';

const TYPE_CFG: Record<LessonType, { label: string; color: string; bg: string }> = {
  lesson:    { label: 'Урок',       color: 'text-secondary-dark', bg: 'bg-secondary/10' },
  vocab:     { label: 'Слова',      color: 'text-purple-dark',    bg: 'bg-purple/10'    },
  reading:   { label: 'Читання',    color: 'text-success-dark',   bg: 'bg-success/10'   },
  listening: { label: 'Аудіо',      color: 'text-secondary-dark', bg: 'bg-secondary/15' },
  speaking:  { label: 'Говоріння',  color: 'text-accent-dark',    bg: 'bg-accent/10'    },
  writing:   { label: 'Письмо',     color: 'text-ink-muted',      bg: 'bg-surface-muted'},
  test:      { label: 'Тест',       color: 'text-danger-dark',    bg: 'bg-danger/10'    },
};

interface Lesson {
  slug: string; title: string; emoji: string; xp: number;
  type?: LessonType;
}
interface Section {
  slug: string; unit: number; title: string; bossEmoji: string;
  color: string; ring: string; dot: string; light: string; path: string;
  lessons: Lesson[];
}
interface Progress {
  doneSlugs: string[]; currentSlug: string;
  name: string; photo: string; level: string; totalXp: number; streak: number;
}

/* ─── Дані секцій ────────────────────────────── */
const SECTIONS: Section[] = [
  {
    slug: 'basics', unit: 1, title: 'Знайомство', bossEmoji: '👋',
    color: 'text-secondary', ring: 'ring-secondary/60', dot: 'bg-secondary',
    light: 'bg-secondary/8 border-secondary/15', path: 'var(--color-secondary)',
    lessons: [
      { slug: 'hello-goodbye',      title: 'Hello & Goodbye',    emoji: '👋', xp: 10, type: 'lesson' },
      { slug: 'greetings-vocab',    title: 'Слова привітань',    emoji: '📚', xp: 10, type: 'vocab' },
      { slug: 'my-name-is',         title: 'My name is...',      emoji: '🙋', xp: 10, type: 'speaking' },
      { slug: 'numbers-colors',     title: 'Numbers & Colors',   emoji: '🎨', xp: 15, type: 'lesson' },
      { slug: 'numbers-vocab',      title: 'Числа та кольори',   emoji: '📚', xp: 10, type: 'vocab' },
      { slug: 'animals',            title: 'Animals',            emoji: '🐶', xp: 15, type: 'lesson' },
      { slug: 'animals-listening',  title: 'Слухай тварин',      emoji: '👂', xp: 10, type: 'listening' },
      { slug: 'classroom',          title: 'In the Classroom',   emoji: '🏫', xp: 10, type: 'lesson' },
      { slug: 'my-profile-reading', title: 'Читай: My Profile',  emoji: '📖', xp: 15, type: 'reading' },
      { slug: 'unit1-test',         title: 'Тест Юніту 1',       emoji: '🎯', xp: 25, type: 'test' },
    ],
  },
  {
    slug: 'daily-life', unit: 2, title: 'Щоденне життя', bossEmoji: '🏠',
    color: 'text-success', ring: 'ring-success/60', dot: 'bg-success',
    light: 'bg-success/8 border-success/15', path: 'var(--color-success)',
    lessons: [
      { slug: 'daily-routines',     title: 'Daily Routines',     emoji: '⏰', xp: 15, type: 'lesson' },
      { slug: 'routines-vocab',     title: 'Слова: розпорядок',  emoji: '📚', xp: 10, type: 'vocab' },
      { slug: 'food-drinks',        title: 'Food & Drinks',      emoji: '🍎', xp: 15, type: 'lesson' },
      { slug: 'food-listening',     title: 'Аудіо: на кухні',    emoji: '👂', xp: 10, type: 'listening' },
      { slug: 'my-house',           title: 'My House',           emoji: '🏡', xp: 15, type: 'lesson' },
      { slug: 'my-room-reading',    title: 'Читай: My Room',     emoji: '📖', xp: 15, type: 'reading' },
      { slug: 'family-friends',     title: 'Family & Friends',   emoji: '👨‍👩‍👧', xp: 15, type: 'lesson' },
      { slug: 'family-speaking',    title: 'Розкажи про сімʼю',  emoji: '🗣️', xp: 15, type: 'speaking' },
      { slug: 'weather',            title: 'The Weather',        emoji: '☀️', xp: 10, type: 'lesson' },
      { slug: 'shopping',           title: "Let's Shop!",        emoji: '🛒', xp: 15, type: 'lesson' },
      { slug: 'unit2-test',         title: 'Тест Юніту 2',       emoji: '🎯', xp: 30, type: 'test' },
    ],
  },
  {
    slug: 'grammar', unit: 3, title: 'Present Simple', bossEmoji: '✏️',
    color: 'text-purple', ring: 'ring-purple/60', dot: 'bg-purple',
    light: 'bg-purple/8 border-purple/15', path: 'var(--color-purple)',
    lessons: [
      { slug: 'action-verbs',       title: 'Дієслова дії',       emoji: '📚', xp: 10, type: 'vocab' },
      { slug: 'present-simple-1',   title: 'Стверджувальні',     emoji: '✅', xp: 20, type: 'lesson' },
      { slug: 'present-simple-2',   title: 'Питальні речення',   emoji: '❓', xp: 20, type: 'lesson' },
      { slug: 'ps-listening',       title: 'Аудіо: запитання',   emoji: '👂', xp: 15, type: 'listening' },
      { slug: 'present-simple-3',   title: 'Заперечні речення',  emoji: '🚫', xp: 15, type: 'lesson' },
      { slug: 'my-day-writing',     title: 'Пиши: Мій день',     emoji: '✍️', xp: 20, type: 'writing' },
      { slug: 'adverbs-freq',       title: 'Always & Never',     emoji: '🔄', xp: 15, type: 'lesson' },
      { slug: 'typical-day-read',   title: 'Читай: A Typical Day', emoji: '📖', xp: 15, type: 'reading' },
      { slug: 'about-me-speaking',  title: 'Говори: про себе',   emoji: '🗣️', xp: 20, type: 'speaking' },
      { slug: 'unit3-test',         title: 'Тест Юніту 3',       emoji: '🎯', xp: 35, type: 'test' },
    ],
  },
  {
    slug: 'adventures', unit: 4, title: 'Пригоди', bossEmoji: '🗺️',
    color: 'text-accent', ring: 'ring-accent/60', dot: 'bg-accent',
    light: 'bg-accent/8 border-accent/15', path: 'var(--color-accent)',
    lessons: [
      { slug: 'transport-vocab',    title: 'Транспорт: слова',   emoji: '📚', xp: 10, type: 'vocab' },
      { slug: 'travel',             title: 'Travelling',         emoji: '✈️', xp: 20, type: 'lesson' },
      { slug: 'at-the-zoo',         title: 'At the Zoo',         emoji: '🦁', xp: 15, type: 'lesson' },
      { slug: 'seasons',            title: 'Four Seasons',       emoji: '🍂', xp: 15, type: 'lesson' },
      { slug: 'weather-listening',  title: 'Аудіо: прогноз',     emoji: '👂', xp: 15, type: 'listening' },
      { slug: 'body-health',        title: 'Body & Health',      emoji: '💪', xp: 20, type: 'lesson' },
      { slug: 'doctor-reading',     title: 'Читай: At the Doctor', emoji: '📖', xp: 15, type: 'reading' },
      { slug: 'holiday-writing',    title: 'Пиши: My Holiday',   emoji: '✍️', xp: 20, type: 'writing' },
      { slug: 'past-simple-1',      title: 'Past Simple',        emoji: '⏳', xp: 25, type: 'lesson' },
      { slug: 'adventure-speaking', title: 'Говори: пригода',    emoji: '🗣️', xp: 20, type: 'speaking' },
      { slug: 'unit4-test',         title: 'Фінальний тест',     emoji: '🏆', xp: 40, type: 'test' },
    ],
  },
];

const ALL_SLUGS = SECTIONS.flatMap(s => s.lessons.map(l => l.slug));
const TOTAL     = ALL_SLUGS.length;
const ME: Progress = {
  name: 'Аліса К.', photo: 'https://randomuser.me/api/portraits/girls/44.jpg',
  level: 'A1', totalXp: 1847, streak: 14,
  doneSlugs: ['hello-goodbye', 'greetings-vocab', 'my-name-is', 'numbers-colors', 'numbers-vocab', 'animals', 'animals-listening', 'classroom', 'my-profile-reading', 'unit1-test', 'daily-routines', 'routines-vocab', 'food-drinks'],
  currentSlug: 'food-listening',
};

function getStatus(slug: string, p: Progress): LessonStatus {
  if (p.doneSlugs.includes(slug)) return 'done';
  if (p.currentSlug === slug) return 'current';
  const ci = ALL_SLUGS.indexOf(p.currentSlug);
  const ti = ALL_SLUGS.indexOf(slug);
  return ti <= ci ? 'done' : 'locked';
}

const POSITIONS: NodePos[] = ['left', 'center', 'right', 'center', 'left', 'right', 'center', 'left'];
const NODE_SIZE  = 88;
const CONN_H     = 44; // px
const PATH_W     = 320; // px — фіксована ширина шляху, щоб зигзаг не розтягувався

function Connector({ from, to, done, color }: { from: NodePos; to: NodePos; done: boolean; color: string }) {
  const xs: Record<NodePos, number> = { left: 12, center: 50, right: 88 };
  const x1 = xs[from], x2 = xs[to];
  const d  = x1 === x2
    ? `M ${x1} 0 L ${x2} 100`
    : `M ${x1} 0 C ${x1} 55, ${x2} 45, ${x2} 100`;
  return (
    <div className="w-full h-11">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <path d={d} stroke={done ? color : 'var(--color-border)'} strokeWidth="3.5" fill="none"
          strokeLinecap="round" strokeDasharray={done ? undefined : '8 6'}
          vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

export default function LessonsPage() {
  const p    = ME;
  const done = p.doneSlugs.length;
  const pct  = Math.round((done / TOTAL) * 100);
  return (
    <div className="-mx-6 md:-mx-8 -mt-6 md:-mt-8 px-6 md:px-8 pt-6 md:pt-8 min-h-screen relative overflow-hidden bg-lesson-map">

      {/* ── Декоративний фон ─────────────────────── */}
      <div className="pointer-events-none select-none" aria-hidden>
        {/* Пагорби внизу */}
        <svg className="absolute bottom-0 left-0 right-0 w-full" height="80" viewBox="0 0 1200 80" preserveAspectRatio="none">
          <ellipse cx="200"  cy="80" rx="260" ry="55" fill="#86efac" opacity="0.4"/>
          <ellipse cx="700"  cy="80" rx="340" ry="60" fill="#6ee7b7" opacity="0.3"/>
          <ellipse cx="1100" cy="80" rx="200" ry="45" fill="#86efac" opacity="0.35"/>
        </svg>
      </div>

      <div className="relative flex flex-col gap-6">

      {/* ── Герой ────────────────────────────────── */}
      <div className="rounded-3xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-primary to-primary-dark px-6 pt-6 pb-14">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/40" referrerPolicy="no-referrer" />
              <div>
                <p className="type-label text-white/60">{p.level}</p>
                <p className="font-black text-white text-xl">{p.name}</p>
              </div>
            </div>
            <div className="flex gap-5">
              {[{ icon: '🔥', val: p.streak, label: 'стрік' }, { icon: '⚡', val: p.totalXp.toLocaleString(), label: 'XP' }].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl leading-none">{s.icon}</p>
                  <p className="text-sm font-black text-white">{s.val}</p>
                  <p className="text-[10px] text-white/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-t-3xl -mt-6 px-6 pt-4 pb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="type-label text-ink-muted">Прогрес курсу</p>
            <span className="text-xs font-black text-primary">{done}/{TOTAL} · {pct}%</span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div key={i} className={`flex-1 h-2.5 rounded-full ${i < done ? 'bg-primary' : i === done ? 'bg-primary/25' : 'bg-border'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Карта уроків ─────────────────────────── */}
      <div>
        {SECTIONS.map((sec, sIdx) => {
          const gi        = SECTIONS.slice(0, sIdx).reduce((sum, s) => sum + s.lessons.length, 0);
          const anyActive = sec.lessons.some(l => getStatus(l.slug, p) !== 'locked');
          const allDone   = sec.lessons.every(l => getStatus(l.slug, p) === 'done');
          const poses     = sec.lessons.map((_, i) => POSITIONS[(gi + i) % POSITIONS.length]);

          return (
            <div key={sec.slug} className={`relative ${anyActive ? '' : 'opacity-35'}`}>
              {/* Мітка юніту */}
              <div className="flex justify-center mb-6 mt-2">
                <div className={`rounded-2xl border-2 ${sec.light} px-8 py-3 text-center min-w-[160px]`}>
                  <p className={`type-label ${sec.color} opacity-60`}>Юніт {sec.unit}</p>
                  <p className={`type-h3 ${sec.color}`}>{sec.title}</p>
                </div>
              </div>

              {/* Уроки */}
              {sec.lessons.map((lesson, lIdx) => {
                const s          = getStatus(lesson.slug, p);
                const accessible = s !== 'locked';
                const pos        = poses[lIdx];
                const nextPos    = poses[lIdx + 1] as NodePos | undefined;
                const isLast     = lIdx === sec.lessons.length - 1;
                const connDone   = s === 'done' && !isLast && getStatus(sec.lessons[lIdx + 1].slug, p) !== 'locked';

                const justify: Record<NodePos, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };

                const nodeEl = (
                  <div style={{ justifyContent: justify[pos] }} className="flex w-full">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`relative flex items-center justify-center rounded-full select-none transition-all duration-200 w-[88px] h-[88px] ${
                          s === 'done'    ? `${sec.dot} shadow-xl` :
                          s === 'current' ? `bg-white ring-[6px] ${sec.ring} shadow-2xl scale-110` :
                                            'bg-white border-2 border-border shadow-sm'
                        }`}
                      >
                        {s === 'current' && (
                          <div className={`absolute inset-0 rounded-full ring-[6px] ${sec.ring} animate-ping opacity-20`} />
                        )}
                        <span className={`text-[38px] ${s === 'locked' ? 'grayscale opacity-20' : ''}`}>
                          {s === 'locked' ? '🔒' : lesson.emoji}
                        </span>
                      </div>
                      <div className="text-center max-w-[100px]">
                        <p className={`text-[11px] font-black leading-tight ${s === 'locked' ? 'text-ink-muted' : 'text-ink'}`}>{lesson.title}</p>
                        {s === 'current' && lesson.type && lesson.type !== 'lesson' && (
                          <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded-full mt-0.5 ${TYPE_CFG[lesson.type].bg} ${TYPE_CFG[lesson.type].color}`}>
                            {TYPE_CFG[lesson.type].label}
                          </span>
                        )}
                      </div>
                      {s === 'current' && (
                        <span className="bg-ink text-white text-[10px] font-black px-3 py-1 rounded-full shadow animate-bounce whitespace-nowrap">Починай! ↑</span>
                      )}
                    </div>
                  </div>
                );

                return (
                  <div key={lesson.slug}>
                    {/* Рядок вузла */}
                    <div className="flex justify-center">
                      <div className="w-full max-w-[320px]">
                        {accessible
                          ? <Link href={`/courses/english-kids-starter/lessons/${lesson.slug}`} className="block">{nodeEl}</Link>
                          : <div className="pointer-events-none">{nodeEl}</div>}
                      </div>
                    </div>

                    {/* Конектор */}
                    {!isLast && nextPos && (
                      <div className="flex justify-center">
                        <div className="w-full max-w-[320px]">
                          <Connector from={pos} to={nextPos} done={connDone} color={sec.path} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {sIdx < SECTIONS.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-full max-w-[320px]">
                    <Connector from={poses[poses.length - 1]} to={POSITIONS[(gi + sec.lessons.length) % POSITIONS.length]} done={false} color="var(--color-border)" />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex justify-center py-8">
          <div className="rounded-2xl border-2 border-dashed border-border px-8 py-4 text-center min-w-[160px]">
            <p className="type-label text-ink-muted opacity-60">Юніт</p>
            <p className="type-h3 text-ink-muted">Незабаром 🌟</p>
          </div>
        </div>
      </div>
      </div> {/* /relative content */}
    </div>
  );
}
