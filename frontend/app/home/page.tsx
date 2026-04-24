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
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border">
        <div className={`${G} ${W} h-16 flex items-center justify-between`}>
          <FoxLogo size={36} />

          <nav aria-label="Навігація" className="hidden md:flex items-center gap-1">
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

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <div className="w-px h-5 bg-border mx-1 hidden md:block" aria-hidden />
            <Link
              href="/login"
              className="hidden md:inline-flex items-center text-[13px] font-semibold text-ink-muted hover:text-ink px-3 h-9 rounded-lg hover:bg-surface-muted transition-colors"
            >
              Увійти
            </Link>
            <Link
              href="/welcome"
              className="inline-flex items-center justify-center bg-primary text-white font-black text-[13px] px-4 h-10 rounded-xl shadow-press-primary active:translate-y-1 active:shadow-none transition-transform"
            >
              <span className="sm:hidden">Спробувати</span>
              <span className="hidden sm:inline">Спробувати безкоштовно</span>
            </Link>
          </div>
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
                  Онлайн-школа · 1 200+ учнів
                </span>
              </div>
              <h1 className="text-[2.25rem] sm:text-5xl lg:text-[3.75rem] font-black text-ink leading-[1.02] tracking-tight">
                Дитина заговорить<br />
                <span className="text-primary">англійською</span><br />
                вже за місяць
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

            {/* Right column — fox mascot + stat card */}
            <div className="relative">
              <div className="relative rounded-[2rem] bg-gradient-to-br from-primary/10 via-surface to-accent/10 border border-border p-6 sm:p-8 overflow-hidden">
                <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/15 blur-3xl" />
                <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-accent/15 blur-3xl" />

                <div className="relative flex flex-col items-center gap-5 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/characters/fox/hi.png"
                    alt="Лисеня EnglishBest"
                    className="w-48 h-48 sm:w-60 sm:h-60 object-contain drop-shadow-[0_20px_40px_rgba(21,128,61,0.25)]"
                  />

                  {/* Mini stats strip (teacher-dashboard style) */}
                  <div className="grid grid-cols-3 w-full bg-surface rounded-2xl border border-border overflow-hidden">
                    <div className="px-3 py-3">
                      <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Вчителі</p>
                      <p className="text-[20px] font-black text-ink tabular-nums mt-0.5">50+</p>
                    </div>
                    <div className="px-3 py-3 border-l border-border">
                      <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Країн</p>
                      <p className="text-[20px] font-black text-ink tabular-nums mt-0.5">5</p>
                    </div>
                    <div className="px-3 py-3 border-l border-border">
                      <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Рейтинг</p>
                      <p className="text-[20px] font-black text-ink tabular-nums mt-0.5">4.9</p>
                    </div>
                  </div>

                  <Link
                    href="/welcome"
                    className="inline-flex items-center justify-center gap-2 w-full h-14 rounded-2xl bg-primary text-white font-black text-[15px] shadow-press-primary active:translate-y-1 active:shadow-none transition-transform"
                  >
                    Підібрати вчителя безкоштовно →
                  </Link>
                </div>
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
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">Простий старт</p>
                <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Як відбувається запис</h2>
              </div>
              <PressLink href="/welcome" variant="primary" className="h-11 px-4">
                Залишити заявку
              </PressLink>
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

        {/* ── Методика ── */}
        <section id="methodology" className={`py-16 lg:py-20 bg-surface-muted/60 ${G}`}>
          <div className={`${W} flex flex-col gap-10`}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">Наша методика</p>
                <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Ми навчаємо по-іншому</h2>
              </div>
              <p className="text-ink-muted max-w-sm text-[13px] leading-relaxed">
                Структуровані програми, живі вчителі та щоденна мікро-практика — замість зазубрювання.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Big green stat card */}
              <div className="md:col-span-2 relative overflow-hidden rounded-2xl min-h-[220px] bg-gradient-to-br from-primary to-primary-dark p-7 flex flex-col justify-between">
                <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
                <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
                <div className="relative">
                  <p className="text-[10px] font-semibold text-white/70 uppercase tracking-widest">Наша спільнота</p>
                  <p className="text-5xl font-black text-white leading-none mt-2 tabular-nums">1 200+</p>
                </div>
                <div className="relative flex items-center gap-3">
                  <div className="flex">
                    {[{ id: 12, g: 'women' }, { id: 44, g: 'women' }, { id: 32, g: 'men' }, { id: 65, g: 'women' }, { id: 23, g: 'women' }].map((a, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={a.id}
                        src={`https://randomuser.me/api/portraits/${a.g}/${a.id}.jpg`}
                        alt=""
                        aria-hidden
                        className={`w-9 h-9 rounded-full border-2 border-primary/60 object-cover ${i > 0 ? '-ml-2.5' : ''}`}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">учнів у 5+ країнах</p>
                    <p className="text-white/70 text-[12px] mt-0.5">навчаються з нами з 2019 року</p>
                  </div>
                </div>
              </div>

              {[
                { title: 'Урок — про те, що цікаво', sub: 'Minecraft, футбол, TikTok — все стає приводом говорити англійською.' },
                { title: 'Вчитель підібраний, не призначений', sub: 'Не хто вільний у розкладі — а хто підходить саме вашій дитині.' },
                { title: 'Батьки у курсі після кожного уроку', sub: 'Короткий звіт у застосунку — без зайвих дзвінків і питань.' },
                { title: 'Спробуйте без ризику', sub: 'Перший урок безкоштовний. Не підійде — жодних зобов\'язань.' },
              ].map(item => (
                <div
                  key={item.title}
                  className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-2 min-h-[180px] hover:border-primary/30 transition-colors"
                >
                  <p className="font-black text-ink leading-snug text-[14px]">{item.title}</p>
                  <p className="text-[12px] text-ink-muted leading-relaxed">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Формати + Вчителі ── */}
        <section id="formats" className={`py-16 lg:py-20 ${G}`}>
          <div className={`${W} grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12`}>
            {/* Formats */}
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">Формати та ціни</p>
                <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Оберіть формат навчання</h2>
              </div>
              <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
                {[
                  { img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=120&h=120&fit=crop&q=80', label: 'Індивідуальний', sub: 'Максимальний прогрес — без компромісів', price: '₴ 380', per: 'за урок', highlight: false },
                  { img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=120&h=120&fit=crop&q=80', label: 'Парний', sub: 'Вдвічі дешевше — вдвічі веселіше', price: '₴ 220', per: 'за урок / особа', highlight: true, badge: 'Топ' },
                  { img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=120&h=120&fit=crop&q=80', label: 'Груповий', sub: 'Жива атмосфера і командна динаміка', price: '₴ 150', per: 'за урок / особа', highlight: false },
                  { img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=120&h=120&fit=crop&q=80', label: 'Розмовний клуб', sub: 'Говоріть вільно — без страху', price: '₴ 120', per: 'за заняття', highlight: false },
                ].map(f => (
                  <div
                    key={f.label}
                    className={`flex items-center gap-4 px-4 py-3.5 ${f.highlight ? 'bg-primary/5' : ''}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.img} alt="" aria-hidden className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-ink text-sm">{f.label}</p>
                        {f.badge && (
                          <span className="text-[9px] font-black bg-primary text-white px-1.5 py-0.5 rounded-md leading-none uppercase tracking-wider">
                            {f.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-ink-muted mt-0.5 truncate">{f.sub}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-ink text-sm leading-none tabular-nums">{f.price}</p>
                      <p className="text-[10px] text-ink-muted mt-0.5">{f.per}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teachers */}
            <div id="teachers" className="flex flex-col gap-5">
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">Наші вчителі</p>
                <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">50+ педагогів</h2>
                <p className="text-ink-muted text-[13px] leading-relaxed mt-2 max-w-sm">
                  Кожен проходить відбір і пробні уроки перед тим, як потрапити до команди.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[{ id: 44, g: 'women' }, { id: 65, g: 'women' }, { id: 32, g: 'men' }, { id: 23, g: 'women' }, { id: 12, g: 'men' }, { id: 55, g: 'men' }].map((a, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={a.id}
                        src={`https://randomuser.me/api/portraits/${a.g}/${a.id}.jpg`}
                        alt=""
                        aria-hidden
                        className={`w-10 h-10 rounded-full border-2 border-surface object-cover${i > 0 ? ' -ml-2.5' : ''}`}
                      />
                    ))}
                  </div>
                  <p className="text-[13px] text-ink-muted">і ще 44+ професіоналів</p>
                </div>

                <ul className="flex flex-col gap-3">
                  {[
                    { label: 'Сертифікація', text: 'CELTA / TEFL або вища педагогічна освіта' },
                    { label: 'Досвід',        text: 'Від 3 до 15 років роботи з дітьми' },
                    { label: 'Підбір',        text: 'Під характер і темп дитини, не за розкладом' },
                    { label: 'Заміна',        text: 'Безкоштовна, якщо вчитель не підійшов' },
                  ].map(item => (
                    <li key={item.label} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-20 px-2 py-1 rounded-lg bg-primary/8 text-primary-dark text-[10px] font-black uppercase tracking-wider">
                        {item.label}
                      </span>
                      <p className="text-[13px] text-ink leading-snug">{item.text}</p>
                    </li>
                  ))}
                </ul>

                <PressLink href="/welcome" variant="ghost" className="w-full h-11 text-[13px]">
                  Познайомитися з вчителем
                </PressLink>
              </div>
            </div>
          </div>
        </section>

        {/* ── Відгуки ── */}
        <section id="reviews" className={`py-16 lg:py-20 bg-surface-muted/60 ${G}`}>
          <div className={`${W} flex flex-col gap-8`}>
            <div>
              <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">Відгуки батьків</p>
              <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Що кажуть наші учні</h2>
            </div>
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
                <Link
                  href="#methodology"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 h-14 font-black text-[15px] bg-white/10 text-white border-2 border-white/20 hover:bg-white/15 transition-colors"
                >
                  Дізнатись більше
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
