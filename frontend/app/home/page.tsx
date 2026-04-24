import Link from 'next/link';
import { LanguageSwitcher } from '@/components/atoms/LanguageSwitcher';
import { PopupTimer } from '@/components/molecules/PopupTimer';
import { ReviewsSlider } from '@/components/molecules/ReviewsSlider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EnglishBest — Онлайн-уроки англійської для дітей',
  description:
    'Індивідуальні онлайн-уроки англійської для дітей. Перший урок безкоштовно. Сертифіковані вчителі.',
};

const G = 'px-4 sm:px-6 lg:px-10 xl:px-16';
const W = 'max-w-6xl mx-auto w-full';

/* ── Fox logo — used in header and footer ─────────────────────── */
function FoxLogo({ size = 36, darkText = false }: { size?: number; darkText?: boolean }) {
  return (
    <Link href="/home" className="flex items-center gap-2.5">
      <span
        className="relative flex-shrink-0 rounded-2xl bg-primary/10 ring-1 ring-primary/20 overflow-hidden flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/characters/fox/hi.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-[120%] h-[120%] object-contain -translate-x-[2px] translate-y-[2px]"
        />
      </span>
      <span className={`text-lg font-black ${darkText ? 'text-white' : 'text-ink'}`}>
        English<span className="text-primary">Best</span>
      </span>
    </Link>
  );
}

/* ── Kids-style press button (used for all primary CTAs) ──────── */
function PressLink({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'ghost';
  className?: string;
}) {
  const tone =
    variant === 'primary'
      ? 'bg-primary text-white shadow-press-primary'
      : variant === 'accent'
      ? 'bg-accent text-white shadow-press-accent'
      : 'bg-surface border-2 border-border text-ink hover:border-primary/40';
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 h-12 font-black text-sm transition-transform active:translate-y-1 active:shadow-none ${tone} ${className}`}
    >
      {children}
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-surface">
      <PopupTimer />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 h-16">
        <div className="justify-self-start">
          <FoxLogo size={36} />
        </div>

        <nav aria-label="Навігація" className="hidden md:flex items-center gap-1 justify-self-center">
          {[
            { label: 'Як навчаємо', href: '#methodology' },
            { label: 'Формати та ціни', href: '#formats' },
            { label: 'Вчителі', href: '#teachers' },
            { label: 'Відгуки', href: '#reviews' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[13px] font-semibold text-ink-muted hover:text-ink transition-colors px-3 py-2 rounded-lg hover:bg-surface-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <LanguageSwitcher />
          <div className="w-px h-5 bg-border mx-1 hidden md:block" aria-hidden />
          <Link
            href="/login"
            className="inline-flex items-center text-[13px] font-semibold text-ink-muted hover:text-ink px-3 h-9 rounded-lg hover:bg-surface-muted transition-colors"
          >
            Увійти
          </Link>
        </div>
      </header>

      <main>
        {/* ── Hero — clean card-style like teacher dashboard ── */}
        <section className={`${G} py-10 sm:py-14 lg:py-20`}>
          <div className={`${W} grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center`}>
            {/* Left column — copy + CTAs */}
            <div className="flex flex-col gap-6 lg:gap-8">
              <div className="inline-flex items-center gap-2 px-3 h-7 w-fit rounded-full bg-primary/10 text-primary-dark">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black tracking-widest uppercase">
                  Перший урок безкоштовно
                </span>
              </div>
              <h1 className="text-[2.25rem] sm:text-5xl lg:text-[3.75rem] font-black text-ink leading-[1.05] tracking-tight">
                Онлайн-уроки<br />
                <span className="text-primary">англійської</span><br />
                для дітей
              </h1>
              <p className="text-ink-muted text-base sm:text-lg leading-relaxed max-w-md">
                Сертифікований вчитель, індивідуальна програма та ігровий формат —
                щоб дитина поверталася на уроки сама.
              </p>

              {/* CTA row with kids-style press buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <PressLink href="/welcome" variant="primary" className="h-14 px-6 text-[15px]">
                  Підібрати вчителя →
                </PressLink>
                <PressLink href="#methodology" variant="ghost" className="h-14 px-5 text-[15px]">
                  Як ми навчаємо
                </PressLink>
              </div>

              {/* Social proof strip — teacher-dashboard style */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center">
                  {[{ id: 12, g: 'women' }, { id: 44, g: 'women' }, { id: 32, g: 'men' }, { id: 65, g: 'women' }].map((a, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={a.id}
                      src={`https://randomuser.me/api/portraits/${a.g}/${a.id}.jpg`}
                      alt=""
                      aria-hidden
                      className={`w-9 h-9 rounded-full border-2 border-surface object-cover${i > 0 ? ' -ml-2.5' : ''}`}
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-accent text-sm" aria-hidden>★★★★★</div>
                  <p className="text-[12px] text-ink-muted leading-tight">
                    <span className="font-black text-ink">4.9</span> / 5 · більше 1 200 відгуків
                  </p>
                </div>
              </div>
            </div>

            {/* Right column — fox mascot */}
            <div className="relative">
              <div className="relative rounded-[2rem] bg-gradient-to-br from-primary/10 via-surface to-accent/10 border border-border p-6 sm:p-10 overflow-hidden aspect-square flex items-center justify-center">
                <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/15 blur-3xl" />
                <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-8 w-56 h-56 rounded-full bg-accent/15 blur-3xl" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/characters/fox/hi.png"
                  alt="Лисеня EnglishBest"
                  className="relative w-full max-w-[360px] object-contain drop-shadow-[0_20px_40px_rgba(21,128,61,0.25)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Partners strip ── */}
        <section aria-label="Партнери" className={`py-8 border-y border-border bg-surface-muted/60 ${G}`}>
          <div className={`${W} flex flex-col gap-4 items-center`}>
            <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-widest">
              Нам довіряють
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {['Lingua Kids Academy', 'Oxford Junior Club', 'StarEnglish UA', 'BrightMinds School', 'KidsLearn Online'].map(name => (
                <span key={name} className="text-[13px] font-black text-ink-faint tracking-tight whitespace-nowrap">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Як відбувається запис ── */}
        <section className={`py-16 lg:py-20 ${G}`}>
          <div className={`${W} flex flex-col gap-10`}>
            <div>
              <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">Простий старт</p>
              <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Як відбувається запис</h2>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: '01', title: 'Залишіть заявку', sub: 'Передзвонимо протягом години і узгодимо зручний час.' },
                { step: '02', title: 'Пробний урок', sub: 'Вчитель визначить рівень і підбере індивідуальну програму.' },
                { step: '03', title: 'Починаємо', sub: 'Розклад, план, доступ до платформи та щотижнева практика.' },
              ].map(s => (
                <li
                  key={s.step}
                  className="bg-surface rounded-2xl border border-border p-6 flex flex-col gap-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary-dark font-black text-sm tabular-nums">
                      {s.step}
                    </span>
                    <span className="text-[10px] font-semibold text-ink-faint uppercase tracking-widest">
                      Крок
                    </span>
                  </div>
                  <h3 className="text-[15px] font-black text-ink leading-snug">{s.title}</h3>
                  <p className="text-[13px] text-ink-muted leading-relaxed">{s.sub}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Методика — bento grid ── */}
        <section id="methodology" className={`py-16 lg:py-20 bg-surface-muted/60 ${G}`}>
          <div className={`${W} flex flex-col gap-10`}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 max-w-3xl">
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">Як ми вчимо</p>
                <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Чотири принципи, які працюють</h2>
              </div>
            </div>

            {/* Bento: 6-col grid. Featured card spans 3, small cards 3. */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-fr">
              {/* Featured card */}
              <div className="md:col-span-3 md:row-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-8 flex flex-col justify-between min-h-[300px]">
                <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-60 h-60 rounded-full bg-white/10 blur-2xl" />
                <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-12 w-60 h-60 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                  <span className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-white/15 text-white text-[10px] font-black uppercase tracking-widest">
                    Принцип №1
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mt-5">
                    Уроки <span className="text-accent">про те, що</span><br />цікаво саме зараз
                  </h3>
                  <p className="text-white/80 text-[14px] leading-relaxed mt-3 max-w-sm">
                    Minecraft, футбол, TikTok або улюблена книга — все стає приводом говорити англійською без стресу.
                  </p>
                </div>

                <div className="relative flex items-end justify-between gap-4 mt-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/characters/fox/hi.png"
                    alt=""
                    aria-hidden
                    className="w-32 h-32 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                  />
                  <div className="text-right">
                    <p className="text-white/70 text-[11px] font-black uppercase tracking-widest">У середньому</p>
                    <p className="text-5xl font-black text-white tabular-nums leading-none mt-1">92%</p>
                    <p className="text-white/70 text-[11px] mt-1 max-w-[140px] leading-snug">учнів хочуть на наступний урок</p>
                  </div>
                </div>
              </div>

              {[
                {
                  n: '02',
                  title: 'Вчитель підібраний, не призначений',
                  sub: 'Не хто вільний у розкладі — а хто підходить саме вашій дитині.',
                  iconBg: 'bg-primary/10 text-primary-dark',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  ),
                },
                {
                  n: '03',
                  title: 'Короткий звіт після кожного уроку',
                  sub: 'У застосунку — без зайвих дзвінків і питань.',
                  iconBg: 'bg-accent/10 text-accent-dark',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  ),
                },
                {
                  n: '04',
                  title: 'Перший урок безкоштовний',
                  sub: 'Спробуйте без зобов\'язань. Не підійде — просто не продовжуєте.',
                  iconBg: 'bg-purple/10 text-purple-dark',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ),
                },
                {
                  n: '05',
                  title: 'Щоденна мікро-практика',
                  sub: 'Короткі вправи в додатку — мова залишається активною між уроками.',
                  iconBg: 'bg-secondary/10 text-secondary-dark',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  ),
                },
              ].map(item => (
                <div
                  key={item.n}
                  className="md:col-span-3 bg-surface border border-border rounded-3xl p-6 flex items-center gap-4 hover:border-primary/30 transition-colors"
                >
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                    <span className="w-5 h-5 block">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-ink-faint uppercase tracking-widest tabular-nums">
                        {item.n}
                      </span>
                      <span className="h-px flex-1 bg-border" aria-hidden />
                    </div>
                    <h3 className="font-black text-ink text-[15px] leading-snug mt-2">{item.title}</h3>
                    <p className="text-[12.5px] text-ink-muted leading-relaxed mt-1">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Формати + ціни — pricing cards ── */}
        <section id="formats" className={`py-16 lg:py-20 ${G}`}>
          <div className={`${W} flex flex-col gap-10`}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">Формати та ціни</p>
                <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Оберіть свій темп</h2>
                <p className="text-ink-muted text-[13px] leading-relaxed mt-2 max-w-md">
                  Чотири формати — один вчитель, одна програма. Змінюйте у будь-який момент.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Індивідуальний',
                  tagline: 'Максимум уваги',
                  price: '380',
                  per: '/ урок',
                  features: ['1-на-1 з вчителем', 'Гнучкий розклад', 'Швидкий прогрес'],
                  highlight: false,
                  badge: null as string | null,
                },
                {
                  label: 'Парний',
                  tagline: 'З другом або сестрою',
                  price: '220',
                  per: '/ урок · особа',
                  features: ['Веселіше вчитись', 'Вартість нижча', 'Жива комунікація'],
                  highlight: true,
                  badge: 'Топ вибір',
                },
                {
                  label: 'Груповий',
                  tagline: 'Міні-група 4-6 осіб',
                  price: '150',
                  per: '/ урок · особа',
                  features: ['Командна динаміка', 'Ігри та проєкти', 'Доступна ціна'],
                  highlight: false,
                  badge: null,
                },
                {
                  label: 'Розмовний клуб',
                  tagline: 'Практика вільного мовлення',
                  price: '120',
                  per: '/ заняття',
                  features: ['Теми на щодень', 'Без оцінювання', 'Spoken English'],
                  highlight: false,
                  badge: null,
                },
              ].map(f => (
                <div
                  key={f.label}
                  className={[
                    'relative rounded-3xl p-6 flex flex-col gap-5 transition-all',
                    f.highlight
                      ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-card-md'
                      : 'bg-surface border border-border hover:border-primary/30',
                  ].join(' ')}
                >
                  {f.badge && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center px-3 h-6 rounded-full bg-accent text-white text-[10px] font-black uppercase tracking-widest shadow-card-sm whitespace-nowrap">
                      {f.badge}
                    </span>
                  )}

                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${f.highlight ? 'text-white/70' : 'text-primary'}`}>
                      {f.tagline}
                    </p>
                    <h3 className={`text-xl font-black tracking-tight mt-1 ${f.highlight ? 'text-white' : 'text-ink'}`}>
                      {f.label}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className={`text-[18px] font-black ${f.highlight ? 'text-white/80' : 'text-ink-muted'}`}>₴</span>
                    <span className={`text-5xl font-black tabular-nums leading-none ${f.highlight ? 'text-white' : 'text-ink'}`}>
                      {f.price}
                    </span>
                    <span className={`text-[12px] font-semibold ml-1 ${f.highlight ? 'text-white/70' : 'text-ink-muted'}`}>
                      {f.per}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {f.features.map(feat => (
                      <li key={feat} className="flex items-center gap-2">
                        <span
                          className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                            f.highlight ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary-dark'
                          }`}
                        >
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span className={`text-[12.5px] ${f.highlight ? 'text-white/90' : 'text-ink'}`}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/welcome"
                    className={[
                      'mt-auto inline-flex items-center justify-center h-11 rounded-xl font-black text-[13px] transition-transform active:translate-y-1 active:shadow-none',
                      f.highlight
                        ? 'bg-white text-primary-dark shadow-[0_5px_0_rgba(0,0,0,0.15)]'
                        : 'bg-primary text-white shadow-press-primary',
                    ].join(' ')}
                  >
                    Обрати →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Вчителі — showcase strip ── */}
        <section id="teachers" className={`py-16 lg:py-20 bg-surface-muted/60 ${G}`}>
          <div className={`${W} flex flex-col gap-10`}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">Команда</p>
                <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Знайомтесь — наші вчителі</h2>
                <p className="text-ink-muted text-[13px] leading-relaxed mt-2 max-w-md">
                  Кожен проходить відбір і пробні уроки перш ніж потрапити до команди.
                </p>
              </div>

              {/* Stat pills */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: '50+', l: 'вчителів' },
                  { v: 'CELTA', l: 'сертифікація' },
                  { v: '3-15', l: 'років досвіду' },
                ].map(s => (
                  <div key={s.l} className="bg-surface border border-border rounded-2xl px-3 py-3 text-center">
                    <p className="text-[16px] font-black text-ink tabular-nums leading-none">{s.v}</p>
                    <p className="text-[10px] text-ink-muted mt-1.5 leading-tight">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 44, g: 'women', name: 'Anna',    specialty: 'Kids 6-10', rating: 4.9, years: 8,  tags: ['Ігри', 'Cambridge'] },
                { id: 65, g: 'women', name: 'Olena',   specialty: 'Teens',     rating: 4.9, years: 6,  tags: ['Speaking', 'Exams'] },
                { id: 32, g: 'men',   name: 'Mykhailo', specialty: 'Кids 7-12', rating: 5.0, years: 12, tags: ['STEM', 'CELTA'] },
                { id: 23, g: 'women', name: 'Kateryna', specialty: 'Adults & Teens', rating: 4.8, years: 10, tags: ['Business', 'IELTS'] },
              ].map(t => (
                <div
                  key={t.id}
                  className="bg-surface border border-border rounded-3xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors"
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://randomuser.me/api/portraits/${t.g}/${t.id}.jpg`}
                      alt={t.name}
                      className="w-full aspect-square object-cover rounded-2xl"
                    />
                    <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 h-6 rounded-full bg-surface/95 backdrop-blur-sm border border-border shadow-card-sm">
                      <svg className="w-3 h-3 text-accent" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-[11px] font-black text-ink tabular-nums">{t.rating}</span>
                    </div>
                  </div>

                  <div>
                    <p className="font-black text-ink text-[15px] leading-tight">{t.name}</p>
                    <p className="text-[12px] text-ink-muted mt-0.5">{t.specialty} · {t.years} років</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {t.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md bg-primary/8 text-primary-dark text-[10px] font-black uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Відгуки ── */}
        <section id="reviews" className={`py-16 lg:py-20 ${G}`}>
          <div className={`${W}`}>
            <ReviewsSlider />
          </div>
        </section>

        {/* ── Фінальний CTA — kids-press buttons ── */}
        <section className={`relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark py-20 ${G}`}>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className={`${W} relative grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-10`}>
            <div className="flex flex-col gap-4 max-w-lg">
              <p className="text-[10px] font-semibold text-white/70 uppercase tracking-widest">Почніть сьогодні</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Спробуйте перший урок <span className="text-accent">безкоштовно</span>
              </h2>
              <p className="text-white/75 text-[15px] leading-relaxed">
                Зателефонуємо у зручний для вас час і підберемо вчителя для вашої дитини.
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <Link
                  href="/welcome"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 h-14 font-black text-[15px] bg-accent text-white shadow-press-accent active:translate-y-1 active:shadow-none transition-transform"
                >
                  Підібрати вчителя безкоштовно →
                </Link>
              </div>
            </div>

            <div className="relative justify-self-end hidden lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/characters/fox/hi.png"
                alt=""
                aria-hidden
                className="w-64 h-64 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
              />
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={`bg-ink py-12 ${G}`}>
        <div className={`${W} flex flex-col md:flex-row gap-10 justify-between`}>
          <div>
            <div className="mb-3"><FoxLogo size={32} darkText /></div>
            <p className="text-white/30 text-[13px] max-w-xs leading-relaxed">
              Онлайн-школа англійської для дітей та підлітків з 2019 року.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-10">
            {[
              { title: 'Навчання', links: ['Вчителі', 'Розклад', 'Ціни'] },
              { title: 'Компанія', links: ['Про нас', 'Блог', 'Вакансії'] },
              { title: 'Підтримка', links: ['Контакти', 'FAQ', 'Умови'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-4">{col.title}</p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map(link => (
                    <li key={link}>
                      <Link href="#" className="text-[13px] text-white/40 hover:text-white transition-colors">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className={`${W} border-t border-white/10 mt-10 pt-6 flex items-center justify-between`}>
          <p className="text-white/25 text-[11px]">© 2026 EnglishBest</p>
          <div className="flex gap-4">
            {['Instagram', 'Facebook', 'TikTok', 'Threads'].map(s => (
              <Link key={s} href="#" className="text-white/25 hover:text-white text-[11px] transition-colors">{s}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
