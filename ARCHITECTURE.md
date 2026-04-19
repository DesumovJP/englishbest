# EnglishBest — Architecture Reference

> Living document. Update in the same commit as any structural change.
> Reading this file = full context without re-scanning the codebase.

---

## 1. Tech stack

| Layer           | Tool / version                                         |
|-----------------|--------------------------------------------------------|
| Framework       | Next.js 16.2 (App Router, React 19.2)                  |
| Language        | TypeScript 5 (strict)                                  |
| Styling         | Tailwind CSS v4 + CSS custom properties (`@theme`)     |
| Fonts           | Nunito (weights 400–900) via `next/font/google`        |
| Testing         | Jest 30 + Testing Library + jsdom                      |
| Stories         | Storybook 8 (Vite builder)                             |
| Linting         | ESLint 9 + `eslint-config-next`                        |
| Data (current)  | JSON under `mocks/` + `app/api/mock/**` REST routes    |
| Data (planned)  | Strapi / REST backend behind `NEXT_PUBLIC_API_BASE_URL`|
| Persistence     | IndexedDB (kids zone) via `lib/kids-store.ts`          |

> **Next.js v16 is newer than training data.** Before writing framework code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices — APIs, conventions, and file structure may differ.

---

## 2. Directory layout

```
englishbest/
├── app/                 ← Next.js App Router entry (see §3)
├── components/          ← Atomic-design React components (see §7)
├── lib/                 ← Data clients, hooks, domain catalogs
├── mocks/               ← JSON fixtures + TS mock types
├── public/              ← Static assets served as-is
├── __tests__/           ← Jest tests (co-located when feasible)
├── docs/                ← Long-form design notes (not shipped)
├── proxy.ts             ← Dev proxy config
├── next.config.ts       ← Framework config
├── postcss.config.mjs   ← Tailwind v4 pipeline
├── eslint.config.mjs    ← Flat ESLint config
├── tsconfig.json        ← Path alias `@/*` → repo root
├── jest.config.ts       ← Jest config (jsdom env, swc transform)
├── README.md            ← Quick start
├── AGENTS.md            ← Notes for AI agents working in this repo
├── CLAUDE.md            ← Imports AGENTS.md
├── ARCHITECTURE.md      ← This file
└── REFACTOR_PLAN.md     ← Live refactor tracker
```

Rules:
- **Never create new top-level markdown files** beyond those listed above.
- **Never add new top-level folders** without updating this section.

---

## 3. Routing map

All routes live under `app/`. Groups in parentheses (`(kids)`, `(onboarding)`) carry a shared layout but do not affect URLs.

### Public / onboarding

| Path                  | File                                           | Purpose                       |
|-----------------------|------------------------------------------------|-------------------------------|
| `/`                   | `app/page.tsx`                                 | Root — redirect/landing stub  |
| `/home`               | `app/home/page.tsx`                            | Marketing home                |
| `/welcome`            | `app/(onboarding)/welcome/page.tsx`            | Welcome splash                |
| `/login`              | `app/(onboarding)/login/page.tsx`              | Login (mocked)                |
| `/onboarding`         | `app/(onboarding)/onboarding/page.tsx`         | Role/level selection          |
| `/placement`          | `app/(onboarding)/placement/page.tsx`          | Placement test                |
| `/auth/register`      | `app/auth/register/page.tsx`                   | Registration form             |
| `/auth/profile`       | `app/auth/profile/page.tsx`                    | Profile edit                  |

### Adult / shared app

| Path                              | File                                           |
|-----------------------------------|------------------------------------------------|
| `/dashboard`                      | `app/dashboard/page.tsx`                       |
| `/dashboard/lessons`              | `app/dashboard/lessons/page.tsx`               |
| `/dashboard/students`             | `app/dashboard/students/page.tsx`              |
| `/dashboard/student`              | `app/dashboard/student/page.tsx`               |
| `/dashboard/teachers`             | `app/dashboard/teachers/page.tsx`              |
| `/dashboard/teacher`              | `app/dashboard/teacher/page.tsx`               |
| `/dashboard/parent`               | `app/dashboard/parent/page.tsx`                |
| `/dashboard/analytics`            | `app/dashboard/analytics/page.tsx`             |
| `/dashboard/calendar`             | `app/dashboard/calendar/page.tsx`              |
| `/dashboard/teacher-calendar`     | `app/dashboard/teacher-calendar/page.tsx`      |
| `/dashboard/chat`                 | `app/dashboard/chat/page.tsx`                  |
| `/dashboard/library`              | `app/dashboard/library/page.tsx`               |
| `/dashboard/payments`             | `app/dashboard/payments/page.tsx`              |
| `/dashboard/prizes`               | `app/dashboard/prizes/page.tsx`                |
| `/dashboard/profile`              | `app/dashboard/profile/page.tsx`               |
| `/dashboard/settings`             | `app/dashboard/settings/page.tsx`              |
| `/dashboard/course-builder`       | `app/dashboard/course-builder/page.tsx`        |
| `/dashboard/teacher-library`      | `app/dashboard/teacher-library/page.tsx`       |
| `/dashboard/teacher-library/:id/edit` | `app/dashboard/teacher-library/[id]/edit/page.tsx` |
| `/dashboard/groups`               | `app/dashboard/groups/page.tsx`                |
| `/dashboard/homework`             | `app/dashboard/homework/page.tsx`              |
| `/dashboard/homework/:id/review`  | `app/dashboard/homework/[id]/review/page.tsx`  |
| `/dashboard/mini-tasks`           | `app/dashboard/mini-tasks/page.tsx`            |
| `/dashboard/attendance`           | `app/dashboard/attendance/page.tsx`            |
| `/courses/:slug`                  | `app/courses/[courseSlug]/page.tsx`            |
| `/courses/:slug/lessons/:slug`    | `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx` |
| `/library`                        | `app/library/page.tsx`                         |
| `/library/:slug`                  | `app/library/[programSlug]/page.tsx`           |
| `/calendar`                       | `app/calendar/page.tsx`                        |

### Kids zone (`(kids)` group)

| Path                     | File                                               |
|--------------------------|----------------------------------------------------|
| `/kids/dashboard`        | `app/(kids)/kids/dashboard/page.tsx`               |
| `/kids/lessons`          | `app/(kids)/kids/lessons/page.tsx`                 |
| `/kids/library/:id`      | `app/(kids)/kids/library/[id]/page.tsx`            |
| `/kids/school`           | `app/(kids)/kids/school/page.tsx`                  |
| `/kids/shop`             | `app/(kids)/kids/shop/page.tsx`                    |
| `/kids/room`             | `app/(kids)/kids/room/page.tsx`                    |
| `/kids/characters`       | `app/(kids)/kids/characters/page.tsx`              |
| `/kids/coins`            | `app/(kids)/kids/coins/page.tsx`                   |
| `/kids/achievements`     | `app/(kids)/kids/achievements/page.tsx`            |

### Mock API (REST)

All mock endpoints return JSON from `mocks/*.json` and live under `/api/mock`:

| Method | Path                                       | File                                               |
|--------|--------------------------------------------|----------------------------------------------------|
| GET    | `/api/mock/users`                          | `app/api/mock/users/route.ts`                      |
| GET/POST | `/api/mock/users/:slug/progress`         | `app/api/mock/users/[userSlug]/progress/route.ts`  |
| GET    | `/api/mock/courses`                        | `app/api/mock/courses/route.ts`                    |
| GET    | `/api/mock/lessons`                        | `app/api/mock/lessons/route.ts`                    |
| GET    | `/api/mock/calendar`                       | `app/api/mock/calendar/route.ts`                   |
| GET    | `/api/mock/quiz`                           | `app/api/mock/quiz/route.ts`                       |

---

## 4. Data layer

### Current shape

```
components/pages ──► lib/api.ts ──► fetch('/api/mock/…') ──► mocks/*.json
                                                         └─► lib/mockClient.ts (server-side)
```

- **`lib/api.ts`** — typed fetch helpers. The single module to edit when switching to a real backend.
- **`lib/fetcher.ts`** — tiny `fetcher<T>(url)` used by SWR-style patterns and non-typed reads.
- **`lib/mockClient.ts`** — server-side mock reader, exports `Course | Lesson | User | CalendarSession | Exercise` type definitions used across the app. These types are the **shared data contract**.

### Planned backend seam (F5)

```ts
// lib/config.ts (to add)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/mock';
```

Every helper in `lib/api.ts` will prefix URLs with `API_BASE_URL`. Swapping `.env.local` flips the entire app to the real backend:

```
NEXT_PUBLIC_API_BASE_URL=https://api.englishbest.example/v1
```

The mock route handlers stay as a local fallback (useful for tests + dev without a backend).

### Types contract (must stay stable for backend team)

- `Course`, `Lesson`, `Exercise`, `User`, `CalendarSession` — defined in `lib/mockClient.ts`
- `Role` = `"kids" | "adult" | "teacher" | "parent" | "admin"` — `mocks/user.ts`
- `CompanionAnimal`, `CompanionMood` — `mocks/user.ts` and `lib/kids-store.ts`

> When backend is wired, move these to `lib/types.ts` so both `api.ts` and `mockClient.ts` import them.

---

## 5. State & persistence

| Scope                 | Mechanism                              | Location                              |
|-----------------------|----------------------------------------|---------------------------------------|
| Current user role     | React context                          | `lib/roleContext.tsx`                 |
| Kids profile state    | IndexedDB (`englishbest-kids` DB)      | `lib/kids-store.ts` + `use-kids-store.ts` |
| Kids room layout      | IndexedDB (`placedItems` in state)     | `lib/kids-store.ts`                   |
| Kids custom assets    | IndexedDB (base64 DataURLs)            | `lib/kids-store.ts` (items/rooms/characters stores) |
| Cross-component sync  | `window` `CustomEvent` bus             | `emitKidsEvent` / `onKidsEvent`       |
| Transient UI state    | Local `useState` in the owning page    | —                                     |

**Seed version bump** (`SEED_VERSION` in `kids-store.ts`) reseeds coins + owned items on existing installs. Bump when adding new default inventory.

**Event names** (must stay in sync with `KidsStoreEvent` type):
`kids:items-changed`, `kids:rooms-changed`, `kids:characters-changed`, `kids:state-changed`.

---

## 6. Design system

### Single source: `app/globals.css`

All tokens live in `@theme {}`. Tailwind v4 auto-generates utility classes from them — e.g. `--color-primary` → `bg-primary`, `text-primary`, `border-primary`.

#### Color tokens

```
Brand:     --color-primary / -dark / -light
           --color-secondary / -dark
           --color-accent / -dark
           --color-danger / -dark
           --color-success / -dark
           --color-purple / -dark

Coin:      --color-coin, --color-coin-bg, --color-coin-border

Surface:   --color-surface, --color-surface-muted, --color-border
Text:      --color-ink, --color-ink-muted, --color-ink-faint
```

#### Radii

`--radius-sm` 8, `--radius-md` 12, `--radius-lg` 16, `--radius-xl` 24.

#### Typography scale

```
--text-display  48px   (hero headlines)
--text-h1       32px   (page titles)
--text-h2       24px   (section titles)
--text-h3       18px   (card/widget titles)
--text-body-lg  16px   (lead paragraphs)
--text-body     14px   (standard body)
--text-label    12px   (caps labels)
--text-tiny     11px   (meta / footnotes)
```

Use the semantic utility classes (`.type-display`, `.type-h1`, …, `.type-label`, `.type-tiny`) instead of composing `text-* + font-* + leading-* + tracking-*`.

#### Line-height / tracking

`--leading-{display|heading|body|relaxed}` · `--tracking-{tight|normal|label|wide}`.

#### Shadows & surfaces

- 3D press shadows: `.shadow-press-{primary|secondary|accent|danger|purple|success}` — pair with `active:translate-y-1`.
- Cards: `.shadow-card`, `.shadow-card-md`.
- Glassmorphism: `.glass-subtle | .glass | .glass-strong | .glass-input | .glass-nav`.
- HUD: `.hud-card`, `.hud-card-flat` (frosted widget panels).
- Speech: `.speech-bubble` (white pill with bottom pointer).

#### Gradients (prebuilt utilities)

`.bg-hero-kids`, `.bg-xp-bar`, `.bg-lesson-map`, `.bg-lesson-engine`, `.bg-lesson-success`, `.bg-room-dark`, `.bg-wall-gradient`, `.bg-wall-sunlight`, `.bg-wall-edge-left/right`, `.bg-dado-rail`, `.bg-shop-rare`, `.bg-floor-wood`, `.bg-floor-vignette`, `.bg-wall-floor-edge`.

#### Animations (shared)

`animate-slide-up · fade-in-up · pop-in · bounce-in · float · shake · box-shake · lid-fly · item-emerge · confetti · star-twinkle · rarity-glow`.
Delays: `anim-delay-{100|150|200|300|400|450|500|600}`.

### Kids "Toca" subsystem (scoped to `.toca`)

All rules prefixed `tk-*` are scoped to `<div class="toca">…</div>` so they never leak into adult UI:

- CSS variables: `--tk-{blue|green|yellow|pink|purple|orange|red|teal}` + each `-dk`, plus `--tk-bg`, `--tk-card`, `--tk-border`, `--tk-ink`, `--tk-muted`.
- Components: `.tk-card`, `.tk-btn` + `-{blue|green|yellow|pink|purple|orange|ghost}`, `.tk-nav-tile`, `.tk-badge` + `-{common|uncommon|rare|legendary}`, `.tk-progress-track/-fill`, `.tk-item-card`, `.tk-character-card`, `.tk-hud`, `.tk-modal-overlay/-sheet`, `.tk-tab-bar/-tab`.
- Animations: `tk-animate-{bounce|pop|wiggle|float|slide-up|coin-pop}`.
- Image states: `.tk-img-idle/-hover/-active` + container `.tk-item-display`.

### Style rules (enforced)

| Rule | Detail |
|------|--------|
| No hardcoded colors | Use Tailwind tokens (`bg-primary`, `text-danger`). Legal exceptions only inside `globals.css`. |
| No `style={{…}}` | Allowed only for: computed CSS variables (e.g. rarity glow color), SVG transforms, absolute-position geometry that depends on runtime values. |
| No mixed token + hex | Don't write `bg-[var(--color-primary)]` when `bg-primary` exists. |
| Typography | Use `.type-*` classes, not ad-hoc compositions. |
| Font weight | UI labels ≥ `font-semibold`; headings/CTAs use `font-black`. |

---

## 7. Responsive contract

### Breakpoints (Tailwind defaults)

| Token | Min width | Target                                              |
|-------|-----------|-----------------------------------------------------|
| `xs`  | —         | <480 — small phones portrait (≥320)                |
| `sm`  | 640       | phones landscape, small tablets portrait            |
| `md`  | 768       | tablets portrait                                    |
| `lg`  | 1024      | tablets landscape, small laptops                    |
| `xl`  | 1280      | desktop                                             |
| `2xl` | 1536      | large desktop                                       |

### Viewport + orientation

- **Full-screen surfaces** (lesson engine, kids room, onboarding hero) use `100dvh` / `min-h-dvh` to survive mobile browser chrome.
- **Safe area**: sticky headers/footers pad with `env(safe-area-inset-top/bottom)`.
- **Short landscape** (`@media (max-height: 480px)`): collapse large headers into compact bars, hide decorative whitespace.
- **Typography**: hero / display sizes use `clamp()` so they scale between `xs` and `2xl` without ad-hoc breakpoints.
- **Grids**: prefer `grid-cols-{n}` with `sm:`, `md:`, `lg:` upgrades over JS-driven column counts.

### Test matrix (canonical)

| Device           | Resolution (portrait × landscape) |
|------------------|-----------------------------------|
| iPhone SE        | 375×667 / 667×375                 |
| iPhone 15        | 393×852 / 852×393                 |
| iPad             | 820×1180 / 1180×820               |
| Laptop (13")     | 1440×900                          |
| Desktop          | 1920×1080                         |
| Wide desktop     | 2560×1440                         |

Every page must lay out correctly on all 11 combinations.

---

## 8. Component taxonomy

```
components/
├── atoms/            Stateless, single-purpose
│   Avatar · Badge · Button · Card · DemoBar · Icon · InfoPopover
│   Input · LanguageSwitcher · Modal · ProgressBar · RoleGuard
│   RoleSwitcher · SectionHeader · Select · SlideOver
│
├── molecules/        Compositions of atoms
│   CalendarGrid · CourseCard · FAQ · HeroSlider · LessonPlayer
│   PopupTimer · PricingSection · ProgramDetail · QuizWidget
│   ReviewsSlider · Sidebar · StudentDetail · TeacherDetail
│
├── organisms/        Full page sections
│   CalendarView · CoursePage · DashboardOverview
│
├── lesson/           Lesson engine + step components
│   FeedbackPanel · LessonCharacter · LessonEngine · LessonProgress
│   LessonSuccess · OptionButton
│   Step{FillBlank|Frame|Image|MatchPairs|MultipleChoice|Reading|
│        Theory|Translate|Video|WordOrder}
│
├── kids/             Kids zone components
│   AddCustomModal · CharacterAvatar · CharacterDisplay
│   CompanionSVG · ItemDisplay · KidsFooter · LootBox
│   └── ui/           Kids design system primitives (barrel: @/components/kids/ui)
│       KidsButton · KidsCard · KidsChallengeItem · KidsCoinBadge
│       KidsNavCard · KidsPageHeader · KidsProgressBar · KidsStatBar
│       KidsTabBar · KidsToast
│
└── teacher/          Teacher portal components
    AssignLessonModal · BlockPicker · CreateHomeworkModal
    CreateLessonModal · LessonActionSheet · LessonBlockEditor
    LessonBlockPreview · MassMessageModal · MiniTaskBuilder
    TeacherAnalytics
    └── ui/           Teacher design system primitives (barrel: @/components/teacher/ui)
        CoinTag · EmptyState · FilterChips · LevelBadge · PageHeader
        SearchInput · SegmentedControl · StatTile · StatusPill
```

### Rules

- Kids pages import ONLY from `@/components/kids/ui` (barrel) for UI primitives.
- Teacher pages import shared primitives from `@/components/teacher/ui` (barrel); domain types/mocks from `@/lib/teacher-mocks`.
- Do not promote a component between tiers without updating this section.
- Stories (`*.stories.tsx`) live beside components; not shipped to prod.

---

## 9. Kids zone subsystem

### Companion (mascot)

- 6 animals × 10 moods → `components/kids/CompanionSVG.tsx`.
- Types: `AnimalKind`, `CharacterMood` (kids-store) and `CompanionAnimal`, `CompanionMood` (mocks/user) must stay aligned.

### Inventory / catalog

- Static catalog: `lib/shop-catalog.ts`.
- User-added items: IndexedDB (`itemsStore`).
- Purchase + place flow writes to `kidsStateStore` (ownedItemIds, placedItems, equippedItemIds).

### Room (`/kids/room`)

- Isometric 2.5D, draggable furniture, persisted in `placedItems` (normalized 0..1 coordinates for viewport resilience).
- Heavy SVG — inline `transform` on SVG children IS allowed (F2 audit exception).

### Shop (`/kids/shop`)

- Tabs map to variants: `furniture`→secondary · `decor`→purple · `outfit`→accent · `special`→danger.
- "+" button opens `AddCustomModal` to upload custom assets (idle/hover/active image states).

### Dashboard (`/kids/dashboard`)

- Mobile: vertical stack. Desktop (`md:` and up): sticky companion left, scrollable right.
- Mood click cycles through 10 moods (bounce-in re-trigger via `bounceKey`).

### Loot box

- `components/kids/LootBox.tsx` — uses `box-shake → lid-fly → item-emerge → confetti-burst` animation chain from `globals.css`.

---

## 10. Coding conventions

| Topic               | Rule                                                                    |
|---------------------|-------------------------------------------------------------------------|
| Imports             | Always `@/...` (alias to repo root). No relative `../../..`.            |
| Kids UI imports     | From barrel `@/components/kids/ui` — never deep-import a file.          |
| `"use client"`      | Only on files that use state, effects, events, browser APIs.            |
| Data fetching       | Pages use helpers from `lib/api.ts`. No raw `fetch()` in components.    |
| Types               | Shared types live in `lib/mockClient.ts` (will move to `lib/types.ts`). |
| File naming         | Components `PascalCase.tsx`; hooks `use-kebab-case.ts`.                 |
| Comments            | Only when *why* is non-obvious. No narrated history.                    |
| Commits             | Small, scoped, imperative subject. Update `REFACTOR_PLAN.md` in same commit when touching a phase. |

---

## 11. Backend integration checklist

When the real backend is ready:

1. Add `lib/config.ts` with `API_BASE_URL` reading `NEXT_PUBLIC_API_BASE_URL`.
2. Add `.env.example` and document the variable in `README.md`.
3. Prefix every URL in `lib/api.ts` with `API_BASE_URL`.
4. Move shared types from `lib/mockClient.ts` to `lib/types.ts`; update both `api.ts` and mock route handlers to import from there.
5. Add auth header injection in a single place (fetch wrapper) — preferably inside `lib/fetcher.ts`.
6. Decide whether `/api/mock/**` routes stay (useful for e2e/dev) or get deleted.
7. Replace `lib/roleContext.tsx` stub with the real session source.
8. Audit client components for direct `fetch(/api/mock/...)` — none should remain; all go through `lib/api.ts`.

If all of the above hold true, backend swap is a config change + type move, not a refactor.

---

## 12. Adding a new kids page (quick checklist)

1. Create `app/(kids)/kids/[name]/page.tsx` with `"use client"` if stateful.
2. Wrap content in `<div className="toca">` to scope Kids DS.
3. Import primitives from `@/components/kids/ui`.
4. Use `.type-*` for text; no inline colors.
5. Layout: portrait-first; add `md:`/`lg:` variants for tablet/desktop.
6. Test at full test matrix (§7).
7. Update §3 (Routing map) here.

---

## 13. Adding a new design token

1. Add `--color-*` / `--text-*` / `--radius-*` inside `@theme {}` in `globals.css`.
2. If it is a composed utility (shadow, gradient), add under `@layer utilities`.
3. Reference via Tailwind class — never `var(--token)` inline.
4. Update §6 here.
