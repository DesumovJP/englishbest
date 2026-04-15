# EnglishBest — Frontend Build Plan

## Архітектура
- **Framework:** Next.js 16.2.1, App Router
- **Styles:** Tailwind CSS v4 — всі токени в `@theme` в `globals.css`, лише Tailwind-класи в компонентах
- **Дані:** mock JSON у `/mocks`, Next.js Route Handlers у `/app/api/mock/*`
- **Ключове правило:** тільки `slug`/`documentId`, ніколи числовий `id`

## Правила стилів (ОБОВ'ЯЗКОВО)
- Всі дизайн-токени — в `@theme {}` в `app/globals.css`
- В компонентах — тільки Tailwind utility classes: `bg-primary`, `text-ink`, `rounded-xl`
- **Заборонено:** `bg-[var(--color-primary)]`, `style={{ color: '...' }}`, inline styles будь-якого виду

## Мапінг токенів → класи
| Токен | Tailwind клас |
|---|---|
| `--color-primary` | `bg-primary`, `text-primary`, `border-primary` |
| `--color-primary-dark` | `bg-primary-dark`, `text-primary-dark` |
| `--color-primary-light` | `bg-primary-light`, `text-primary-light` |
| `--color-secondary` | `bg-secondary`, `text-secondary` |
| `--color-secondary-dark` | `bg-secondary-dark` |
| `--color-accent` | `bg-accent`, `text-accent` |
| `--color-danger` | `bg-danger`, `text-danger`, `border-danger` |
| `--color-success` | `bg-success` |
| `--color-surface` | `bg-surface` (білий) |
| `--color-surface-muted` | `bg-surface-muted` (сірий фон) |
| `--color-border` | `border-border`, `bg-border` |
| `--color-ink` | `text-ink` (основний текст) |
| `--color-ink-muted` | `text-ink-muted` (сірий текст) |
| `--radius-sm` | `rounded-sm` |
| `--radius-md` | `rounded-md` |
| `--radius-lg` | `rounded-lg` |
| `--radius-xl` | `rounded-xl` |
| `--radius-full` | `rounded-full` |

---

## Кроки та статус

### ✅ Крок 1 — Ініціалізація проекту
- Next.js 16.2.1 + Tailwind v4 + TypeScript

### ✅ Крок 2 — Mock-дані
- `mocks/courses.json`, `lessons.json`, `users.json`, `quizSamples.json`, `calendar.json`

### ✅ Крок 3 — Lib + API routes
- `lib/api.ts`, `lib/fetcher.ts`, `lib/mockClient.ts`
- `app/api/mock/courses`, `lessons`, `users`, `calendar`, `quiz`

### ✅ Крок 4 — Компоненти (scaffold)
- Atoms: Button, Badge, Avatar, Input, Select, Modal, Icon
- Molecules: Sidebar, CourseCard, QuizWidget, LessonPlayer
- Organisms: DashboardOverview, CoursePage, CalendarView

### ✅ Крок 5 — Сторінки (scaffold)
- `/home`, `/dashboard`, `/library`, `/courses/[courseSlug]`
- `/courses/[courseSlug]/lessons/[lessonSlug]`, `/calendar`
- `/auth/login`, `/auth/register`, `/auth/profile`

### ✅ Крок 6 — Рефакторинг стилів → Tailwind theme
- [x] Оновити `globals.css`: `@theme {}` з токенами (--color-primary, --color-ink, --radius-xl тощо)
- [x] Перейменовано: `--color-text` → `--color-ink`, `--color-surface-alt` → `--color-surface-muted`
- [x] Замінено всі `bg-[var(...)]` / `text-[var(...)]` → Tailwind-класи в усіх компонентах і сторінках
- Виняток: `style={{ width: \`${n}%\` }}` в progress bars — допустимо (динамічне значення)

### ✅ Крок 7 — Storybook (базова конфігурація)
- [x] `.storybook/main.ts` — framework: `@storybook/react-vite` (Next.js 16 несумісний з `@storybook/nextjs@8`)
- [x] `.storybook/preview.ts` — імпорт `globals.css`, Tailwind через `viteFinal`
- [x] `@/` alias налаштований через `resolve.alias` у viteFinal
- [x] Stories: Button, Badge, Avatar, Modal, CourseCard
- [x] Скрипти: `npm run storybook`, `npm run build-storybook`
- [x] `storybook build` — успішно ✓

### ✅ Крок 8 — Базові тести
- [x] `jest.config.ts` — через `next/jest`, `@/` alias, `jsdom` env
- [x] `jest.setup.ts` — `@testing-library/jest-dom`
- [x] `__tests__/components/Button.test.tsx` — 7 тестів
- [x] `__tests__/components/Badge.test.tsx` — 7 тестів
- [x] `__tests__/components/CourseCard.test.tsx` — 9 тестів
- [x] `npm test` — 23/23 ✓

### ✅ Крок 9 — Документація інтеграції Strapi
- [x] `docs/strapi-integration.md` — маппінг всіх полів, endpoints, адаптери нормалізації, checklist переходу

---

## Поточне завдання
**Крок 10:** Редизайн головної сторінки — production-ready UI, українська мова, стиль AllRight

### Крок 10 — Редизайн (production-ready)
- [x] 10.1 Дизайн-стиль: Duolingo (зелений #58CC02, білий фон, яскраві акценти)
- [x] 10.2 Hero — УКР заголовок, floating lesson card, streak badge, мікро-статистика
- [x] 10.3 Статистика (10 000+ учнів, 600+ вчителів, 47 країн, 7 років)
- [x] 10.4 Як проходить навчання — 3 кроки
- [x] 10.5 Наш підхід — 4 feature cards (кольорові)
- [x] 10.6 Вчителі — 4 картки
- [x] 10.7 Відгуки батьків — 3 відгуки з рейтингом
- [x] 10.8 Ціни — 3 плани (Старт / Стандарт / Інтенсив), highlighted середній
- [x] 10.9 FAQ — client component з expand/collapse
- [x] 10.10 Фінальний CTA — зелений банер
- [x] 10.11 Footer — 4 колонки, соцмережі
- [ ] 10.12 Інші сторінки — переклад на українську

---

### Крок 11 — Типи акаунтів + Demo login
- [x] 11.1 Login page: 4 картки типів акаунту (Student, Teacher, Admin, Parent) + Demo кнопки без пароля
- [x] 11.2 Sidebar: прибрати inline role-switcher, читати роль з localStorage('demo_role')
- [x] 11.3 Kids dashboard: додати 📅 calendar HUD кнопку + CalendarModal (game-style)

**Порядок:** 11.1 → 11.2 → 11.3

---

### Крок 12 — Kids Zone: Library list + Dashboard game HUD

#### 12.1 Library list view + Detail modal (`school/page.tsx`)
- [x] Replace `LibCard` grid → `LibListRow` horizontal list (emoji tile + title + action)
- [x] Group by type headers when tab === 'all'
- [x] Add `LibDetailModal` bottom sheet (large emoji, description, level/price, action btn)

#### 12.2 Dashboard left column HUD (`dashboard/page.tsx`)
- [x] Calendar widget card: date display + event dots → opens CalendarModal
- [x] Streak card: flame + days + animated ring
- [x] Loot box quick-buy: mystery-box img + coin price → opens LootBoxModal

#### 12.3 Dashboard right column refactor (`dashboard/page.tsx`)
- [x] Continue lesson card: emoji + title + slim progress bar + PLAY button (3D press)
- [x] Daily challenges card: 3 tasks list + mystery box reward chip at bottom

**Порядок:** 12.1 → 12.2 → 12.3

#### 12.4 Carousel center-focus effect (`school/page.tsx`)
- [x] CSS scroll-snap (x mandatory) + padding trick so first/last cards reach center
- [x] Per-card scale via scroll listener + RAF: off-center 0.80, center 1.05
- [x] Per-card opacity: off-center 0.52, center 1.0
- [x] transition: transform 0.12s + opacity 0.12s for smooth real-time scaling
- [x] Auto-scroll to current still uses getBoundingClientRect (works with new layout)

#### 12.5 Library: proper center modal + bigger child-friendly list rows
- [x] Replace bottom-sheet LibDetailModal with a true centered overlay modal
- [x] LibListRow: taller rows (min 80px), bigger emoji tile (62px), larger text (15px title)
- [x] Keep shop-matching style (accent-tinted borders, rounded cards)

#### 12.6 Remove Rewards footer tab + coins page
- [x] KidsFooter: 3 tabs only — Home, School, Shop
- [x] coins/page.tsx left in place but unlinked from footer

#### 12.7 Replace XP text with `/public/xp.png` image everywhere in kids zone
- [x] school/page.tsx — lesson card XP icon
- [x] lessons/page.tsx — lesson card XP icon
- [x] dashboard/page.tsx — CONTINUE card "+N" + xp.png
- [x] components/lesson/LessonProgress.tsx — progress bar XP badge
- [x] components/lesson/LessonSuccess.tsx — success screen XP display
- [x] components/kids/ui/KidsChallengeItem.tsx — challenge XP badge
- [x] components/kids/ui/KidsStatBar.tsx — XP stat
- [x] achievements/page.tsx — header, mini-stat grid, per-achievement badge

**Порядок:** 12.4 → 12.5 → 12.6 → 12.7

---

### Крок 13 — Kids Zone: UI Polish Round 2

#### 13.1 Library list rows — bigger & bolder
- [x] LibListRow in `school/page.tsx`: minHeight 80px → 96px, emoji tile 62px → 72px, title font 15px → 17px
- [x] Added bottom separator `border-b border-[#F3F4F6]` between rows for clarity

#### 13.2 Calendar modal — game-style redesign
- [x] Replaced dark-navy CalendarModal with bright white bottom-sheet modal (rounded-t-3xl)
- [x] White card bg, streak strip in warm orange tint, calendar cells min 42px with green today
- [x] Colored event rows with accent borders/bg, larger fonts throughout

#### 13.3 Lessons carousel center-focus + bigger cards (`lessons/page.tsx`)
- [x] Added `cardRefs`, `scales`, `calcScales`, RAF scroll listener (same as `school/page.tsx`)
- [x] Added `scrollSnapType: 'x mandatory'` + padding trick on scroll container
- [x] Per-card: `scrollSnapAlign: center`, scale 0.80→1.05, opacity 0.52→1.0
- [x] Increased card width: `clamp(180px, 42vw, 250px)`
- [x] Auto-scroll uses getBoundingClientRect approach

#### 13.4 Continue button → direct lesson link (`dashboard/page.tsx`)
- [x] Added `slug: 'food-listening'` to LESSON constant
- [x] ContinueCard href: `/courses/english-kids-starter/lessons/${LESSON.slug}`

#### 13.5 Shop tabs visual consistency (`shop/page.tsx`)
- [x] Backgrounds tab: warm green info card + clean grid (no plain description text)
- [x] Boxes tab: purple info card + clean grid + tip pill at bottom
- [x] My Character tab: purple section label header to visually separate from other tabs

#### 13.6 Character + speech bubble animation fix (`dashboard/page.tsx`)
- [x] Bubble + CharacterAvatar wrapped in single `animate-bounce-in` container
- [x] Both elements bounce together when tapped
- [x] Re-enabled `animate` on CharacterAvatar (idle float animation)

#### 13.7 LessonCharacter speech bubble unified style + bubble bounces with character
- [x] `LessonCharacter.tsx`: wrap bubble + CharacterAvatar in single `animate-bounce-in` container
- [x] `SpeechBubble`: rewritten to match home dashboard style (white bg, shadow, triangle pointer)
- [x] Idle state: `animate={true}` (float animation active), correct/wrong: `animate={false}`
- [x] `bounceKey` bumps on every emotion change — container re-mounts the animation

#### 13.8 Lesson card text bigger (both carousels)
- [x] `school/page.tsx` LessonCard: title 17→20px, type label 10.5→12px, coin/xp icons 12→14px
- [x] `lessons/page.tsx` LessonCard: same sizes

**Порядок:** 13.1 → 13.2 → 13.3 → 13.4 → 13.5 → 13.6 → 13.7 → 13.8

---

### Крок 14 — Library catalog redesign + Character emotions fix

#### 14.1 Library catalog — повноцінний каталог електронних книг
- [x] Замінено `LibListRow` + `LibDetailModal` на `LibCatalogCard` (великі картки, 2-col grid)
- [x] Кожна картка: colored cover area (emoji 88px), назва, опис (2 рядки), рівень, CTA
- [x] Клік по картці — навігація до `/kids/library/[id]` (а не модалка)
- [x] Extracted library data → `lib/library-data.ts` (спільний файл для catalog + detail page)

#### 14.2 Сторінка деталей продукту `/kids/library/[id]`
- [x] Full-screen detail page: великий cover hero з emoji + градієнт
- [x] Назва, UA переклад, повний опис, метадані (рівень, обсяг, тип)
- [x] Details grid: 4 картки (рівень, тип, обсяг, доступ)
- [x] Sticky action bar: купити / отримати / заблоковано / вже є
- [x] Back button → повернення до бібліотеки

#### 14.3 Fix: символ завжди думає (`idle → thinking`)
- [x] `LessonCharacter.tsx`: `EMOTION_MAP.idle: 'thinking'` → `'idle'`
- [x] Тепер idle-стан показує idle-позу замість thinking

#### 14.4 Emotion gallery на сторінці персонажів
- [x] `/kids/characters/page.tsx`: горизонтальна стрічка з 8 емоціями
- [x] Тап на емоцію — превʼю на персонажі у главній картці
- [x] Показуються тільки емоції, що мають PNG для поточного персонажа
- [x] Скидається на `idle` при зміні персонажа

**Порядок:** 14.3 → 14.4 → 14.1 → 14.2
