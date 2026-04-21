# EnglishBest — Architecture

> Living document. Update in the same commit as any structural change.
> Reading this file = full context without re-scanning the codebase.

---

## 1. Tech stack

| Layer          | Tool / version                                          |
|----------------|---------------------------------------------------------|
| Monorepo       | npm workspaces (`frontend`, `backend`)                  |
| Frontend FW    | Next.js 16.2 (App Router, React 19.2)                   |
| Language       | TypeScript 5 (strict)                                   |
| Styling        | Tailwind CSS v4 + CSS custom properties (`@theme`)      |
| Fonts          | Nunito (400–900) via `next/font/google`                 |
| Testing        | Jest 30 + Testing Library + jsdom                       |
| Stories        | Storybook 8 (Vite builder)                              |
| Linting        | ESLint 9 + `eslint-config-next`                         |
| Backend        | Strapi v5.42 (TypeScript)                               |
| Database       | PostgreSQL 16                                           |
| Local dev DB   | `docker-compose.yml` (postgres + redis + minio)         |
| Frontend host  | Vercel                                                  |
| Backend host   | Railway (Strapi + managed Postgres)                     |
| Node           | 20.19+ (root), 20–24 (backend)                          |

> **Next.js v16 is newer than most model training data.** Before writing framework code, read the relevant guide in `frontend/node_modules/next/dist/docs/`. Heed deprecation notices.

---

## 2. Repository layout

```
englishbest/
├── frontend/           ← Next.js app (deployed to Vercel)
├── backend/            ← Strapi app (deployed to Railway)
├── docker-compose.yml  ← local postgres + redis + minio
├── railway.json        ← Railway build / start config (backend)
├── package.json        ← npm workspaces entrypoint + scripts
├── README.md
├── AGENTS.md           ← notes for AI agents working in this repo
├── CLAUDE.md           ← imports AGENTS.md
└── ARCHITECTURE.md     ← this file
```

Root scripts (run from repo root):

```
npm run dev:frontend      # next dev in frontend/
npm run dev:backend       # strapi develop in backend/
npm run build:frontend    # next build
npm run build:backend     # strapi build
npm run start:frontend    # next start
npm run start:backend     # strapi start
npm run lint              # all workspaces
npm run test              # all workspaces
```

---

## 3. Frontend (`frontend/`)

### 3.1 Directory layout

```
frontend/
├── app/                 ← Next.js App Router entry (§3.2)
├── components/          ← Atomic-design React components (§3.6)
├── lib/                 ← Data clients, hooks, domain catalogs (§3.3)
├── mocks/               ← JSON fixtures + TS mock types
├── public/              ← Static assets (images, characters)
├── __tests__/           ← Jest tests (co-located when feasible)
├── proxy.ts             ← Dev proxy config
├── next.config.ts
├── postcss.config.mjs   ← Tailwind v4 pipeline
├── eslint.config.mjs
├── tsconfig.json        ← Path alias `@/*` → frontend root
└── jest.config.ts
```

### 3.2 Routing map (App Router)

Groups in parentheses (`(kids)`, `(onboarding)`) carry a shared layout but do not affect URLs.

**Public / onboarding:** `/`, `/home`, `/welcome`, `/login`, `/onboarding`, `/placement`, `/auth/register`, `/auth/profile`.

**Adult / teacher / admin dashboards:** `/dashboard/*` (lessons, students, student, teachers, teacher, parent, analytics, calendar, teacher-calendar, chat, library, payments, prizes, profile, settings, course-builder, teacher-library, teacher-library/[id]/edit, groups, homework, homework/[id]/review, mini-tasks, attendance).

**Course / library:** `/courses/[courseSlug]`, `/courses/[courseSlug]/lessons/[lessonSlug]`, `/library`, `/library/[programSlug]`, `/calendar`.

**Kids zone (`(kids)` group):** `/kids/dashboard`, `/kids/lessons`, `/kids/library/[id]`, `/kids/school`, `/kids/shop`, `/kids/room`, `/kids/characters`, `/kids/coins`, `/kids/achievements`.

**Mock REST API** (temporary, under `/api/mock`): `users`, `users/[userSlug]/progress`, `courses`, `lessons`, `calendar`, `quiz`. Returns JSON from `mocks/*.json`. To be replaced by Strapi calls (see §5.2).

### 3.3 Data layer

```
components/pages ──► lib/api.ts ──► fetch(`${API_BASE_URL}${path}`)
                                      │
                        dev default   │   prod
                           ▼          ▼
                    /api/mock/…   https://<railway-backend>/api/…
```

- **`lib/config.ts`** exposes `API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/mock"`.
- **`lib/api.ts`** — typed fetch helpers. **Single module to edit** when swapping to Strapi.
- **`lib/fetcher.ts`** — tiny `fetcher<T>(url)` wrapper.
- **`lib/mockClient.ts`** — server-side mock reader + shared domain types (`Course`, `Lesson`, `Exercise`, `User`, `CalendarSession`). These types are the data contract.

Mock routes under `app/api/mock/**` serve the same shapes as target Strapi endpoints so the swap stays small. See §6 for the migration checklist.

### 3.4 State & persistence

| Scope                 | Mechanism                              | Location                                            |
|-----------------------|----------------------------------------|-----------------------------------------------------|
| Current user role     | React context                          | `lib/roleContext.tsx`                               |
| Kids profile state    | IndexedDB (`englishbest-kids` DB)      | `lib/kids-store.ts` + `lib/use-kids-store.ts`       |
| Kids room layout      | IndexedDB (`placedItems`)              | `lib/kids-store.ts`                                 |
| Kids custom assets    | IndexedDB (base64 DataURLs)            | `lib/kids-store.ts` (items/rooms/characters stores) |
| Cross-component sync  | `window` `CustomEvent` bus             | `emitKidsEvent` / `onKidsEvent`                     |
| Transient UI state    | Local `useState` in the owning page    | —                                                   |

Seed version bump (`SEED_VERSION` in `kids-store.ts`) reseeds coins + owned items on existing installs. Bump when adding new default inventory.

Event names (must match `KidsStoreEvent`): `kids:items-changed`, `kids:rooms-changed`, `kids:characters-changed`, `kids:state-changed`.

### 3.5 Design system

Single source: `frontend/app/globals.css`. All tokens live in `@theme {}`. Tailwind v4 auto-generates utility classes from them — `--color-primary` → `bg-primary`, `text-primary`, `border-primary`.

**Color tokens:** Brand (`--color-primary/-dark/-light`, `--color-secondary/-dark`, `--color-accent/-dark`, `--color-danger/-dark`, `--color-success/-dark`, `--color-purple/-dark`), Coin (`--color-coin`, `-bg`, `-border`), Surface (`--color-surface/-muted`, `--color-border`), Text (`--color-ink/-muted/-faint`).

**Radii:** `--radius-sm` 8, `--radius-md` 12, `--radius-lg` 16, `--radius-xl` 24.

**Typography scale:** `--text-display` 48, `--text-h1` 32, `--text-h2` 24, `--text-h3` 18, `--text-body-lg` 16, `--text-body` 14, `--text-label` 12, `--text-tiny` 11. Use `.type-display/.type-h1/.../.type-tiny` utility classes, not ad-hoc compositions.

**Line-height / tracking:** `--leading-{display|heading|body|relaxed}`, `--tracking-{tight|normal|label|wide}`.

**Shadows / surfaces:** `.shadow-press-{primary|secondary|accent|danger|purple|success}` (pair with `active:translate-y-1`); `.shadow-card`, `.shadow-card-md`; `.glass-subtle|.glass|.glass-strong|.glass-input|.glass-nav`; `.hud-card`, `.hud-card-flat`; `.speech-bubble`.

**Gradients:** `.bg-hero-kids`, `.bg-xp-bar`, `.bg-lesson-map`, `.bg-lesson-engine`, `.bg-lesson-success`, `.bg-room-dark`, `.bg-wall-gradient`, `.bg-wall-sunlight`, `.bg-wall-edge-left/right`, `.bg-dado-rail`, `.bg-shop-rare`, `.bg-floor-wood`, `.bg-floor-vignette`, `.bg-wall-floor-edge`.

**Animations:** `animate-slide-up · fade-in-up · pop-in · bounce-in · float · shake · box-shake · lid-fly · item-emerge · confetti · star-twinkle · rarity-glow`. Delays: `anim-delay-{100|150|200|300|400|450|500|600}`.

**Kids "Toca" subsystem** (scoped to `<div class="toca">`): `--tk-{blue|green|yellow|pink|purple|orange|red|teal}` + each `-dk`, `--tk-{bg|card|border|ink|muted}`; components `.tk-card`, `.tk-btn + -{blue|green|yellow|pink|purple|orange|ghost}`, `.tk-nav-tile`, `.tk-badge + -{common|uncommon|rare|legendary}`, `.tk-progress-track/-fill`, `.tk-item-card`, `.tk-character-card`, `.tk-hud`, `.tk-modal-overlay/-sheet`, `.tk-tab-bar/-tab`; animations `tk-animate-{bounce|pop|wiggle|float|slide-up|coin-pop}`.

**Style rules (enforced):**

| Rule | Detail |
|------|--------|
| No hardcoded colors | Use Tailwind tokens (`bg-primary`). Legal exceptions only inside `globals.css`. |
| No `style={{…}}` | Allowed only for computed CSS variables (rarity glow), SVG transforms, absolute-position geometry depending on runtime values. |
| No mixed token + hex | Don't write `bg-[var(--color-primary)]` when `bg-primary` exists. |
| Typography | Use `.type-*` classes. |
| Font weight | UI labels ≥ `font-semibold`; headings/CTAs use `font-black`. |

**iOS / Notion contract** (teacher & admin surfaces): `.ios-card`, `.ios-list`, `.ios-row`, `.ios-btn/-primary/-secondary/-ghost`, `.ios-chip`, `.ios-toolbar` — no shadows on cards (hairline border only), max one accent per view, monochrome icons.

### 3.6 Responsive contract

| Breakpoint | Min width | Target                                         |
|------------|-----------|------------------------------------------------|
| `xs`       | —         | <480 small phones portrait (≥320)              |
| `sm`       | 640       | phones landscape, small tablets portrait       |
| `md`       | 768       | tablets portrait                               |
| `lg`       | 1024      | tablets landscape, small laptops               |
| `xl`       | 1280      | desktop                                        |
| `2xl`      | 1536      | large desktop                                  |

- Full-screen surfaces use `100dvh` / `min-h-dvh`.
- Sticky headers/footers pad with `env(safe-area-inset-{top|bottom})`.
- Short landscape (`@media (max-height: 480px)`) collapses large headers.
- Hero sizes use `clamp()`.
- Prefer `grid-cols-{n}` + `sm:`/`md:`/`lg:` over JS column counts.

**Test matrix** (every page must lay out on all 11 combinations): iPhone SE 375×667 / 667×375, iPhone 15 393×852 / 852×393, iPad 820×1180 / 1180×820, Laptop 1440×900, Desktop 1920×1080, Wide 2560×1440.

### 3.7 Component taxonomy

```
components/
├── atoms/       Avatar · Badge · Button · Card · DemoBar · Icon · InfoPopover
│                Input · LanguageSwitcher · Modal · ProgressBar · RoleGuard
│                RoleSwitcher · SectionHeader · Select · SlideOver
├── molecules/   CalendarGrid · CourseCard · FAQ · HeroSlider · LessonPlayer
│                PopupTimer · PricingSection · ProgramDetail · QuizWidget
│                ReviewsSlider · Sidebar · StudentDetail · TeacherDetail
├── organisms/   CalendarView · CoursePage · DashboardOverview
├── lesson/      FeedbackPanel · LessonCharacter · LessonEngine · LessonProgress
│                LessonSuccess · OptionButton · Step{FillBlank|Frame|Image|
│                MatchPairs|MultipleChoice|Reading|Theory|Translate|Video|
│                WordOrder}
├── kids/        AddCustomModal · CharacterAvatar · CharacterDisplay
│                CompanionSVG · ItemDisplay · KidsFooter · LootBox
│                └── ui/ (barrel @/components/kids/ui)  KidsButton · KidsCard
│                        KidsChallengeItem · KidsCoinBadge · KidsNavCard
│                        KidsPageHeader · KidsProgressBar · KidsStatBar
│                        KidsTabBar · KidsToast
└── teacher/     AssignLessonModal · BlockPicker · CreateHomeworkModal
                 CreateLessonModal · LessonActionSheet · LessonBlockEditor
                 LessonBlockPreview · MassMessageModal · MiniTaskBuilder
                 TeacherAnalytics
                 └── ui/ (barrel @/components/teacher/ui)  CoinTag · EmptyState
                         FilterChips · LevelBadge · PageHeader · SearchInput
                         SegmentedControl · StatTile · StatusPill
```

**Rules:**
- Kids pages import ONLY from `@/components/kids/ui` (barrel).
- Teacher pages import shared primitives from `@/components/teacher/ui`; domain types/mocks from `@/lib/teacher-mocks`.
- Don't promote a component between tiers without updating this section.
- Stories (`*.stories.tsx`) live beside components; not shipped to prod.

### 3.8 Kids zone subsystem

- **Companion (mascot):** 6 animals × 10 moods → `components/kids/CompanionSVG.tsx`. Types `AnimalKind`, `CharacterMood` (kids-store) and `CompanionAnimal`, `CompanionMood` (mocks/user) must stay aligned.
- **Inventory / catalog:** static in `lib/shop-catalog.ts`; user-added items in IndexedDB (`itemsStore`); purchase + place writes to `kidsStateStore` (`ownedItemIds`, `placedItems`, `equippedItemIds`).
- **Room (`/kids/room`):** isometric 2.5D, draggable furniture, persisted with normalized 0..1 coordinates. Inline SVG `transform` is allowed here.
- **Shop (`/kids/shop`):** tabs → variants (`furniture`→secondary · `decor`→purple · `outfit`→accent · `special`→danger). "+" opens `AddCustomModal` to upload idle/hover/active images.
- **Dashboard (`/kids/dashboard`):** mobile vertical stack; `md:+` sticky companion left, scrollable right. Mood click cycles 10 moods (bounce-in re-trigger via `bounceKey`).
- **Loot box:** `components/kids/LootBox.tsx` — `box-shake → lid-fly → item-emerge → confetti-burst` chain.

### 3.9 Coding conventions

| Topic            | Rule                                                                    |
|------------------|-------------------------------------------------------------------------|
| Imports          | Always `@/...` (alias to frontend root). No relative `../../..`.        |
| Kids UI imports  | From barrel `@/components/kids/ui` — never deep-import a file.          |
| `"use client"`   | Only on files that use state, effects, events, browser APIs.            |
| Data fetching    | Pages use helpers from `lib/api.ts`. No raw `fetch()` in components.    |
| Types            | Shared types live in `lib/mockClient.ts` (move to `lib/types.ts` when Strapi lands). |
| File naming      | Components `PascalCase.tsx`; hooks `use-kebab-case.ts`.                 |
| Comments         | Only when *why* is non-obvious. No narrated history.                    |

---

## 4. Backend (`backend/`)

### 4.1 Directory layout

```
backend/
├── config/
│   ├── admin.ts
│   ├── api.ts
│   ├── database.ts        ← Postgres-only (no sqlite fallback)
│   ├── middlewares.ts     ← + global::audit-log
│   ├── plugins.ts         ← users-permissions jwtSecret wiring
│   └── server.ts
├── database/              ← Strapi migrations
├── public/
│   └── uploads/.gitkeep   ← required (Strapi assumes folder exists)
├── src/
│   ├── api/               ← content types (§4.2)
│   ├── extensions/        ← users-permissions overrides
│   ├── middlewares/
│   │   └── audit-log.ts
│   ├── policies/
│   │   ├── has-role.ts
│   │   ├── is-authenticated.ts
│   │   ├── is-organization-member.ts
│   │   └── is-owner.ts
│   ├── seeds/
│   │   ├── 00-roles.ts
│   │   ├── 01-organizations.ts
│   │   ├── 02-admins.ts
│   │   ├── 03-permissions.ts
│   │   └── index.ts
│   └── index.ts           ← register(): env-var check; bootstrap(): runSeeds
├── scripts/
│   └── import-mocks.ts    ← one-shot mock → Strapi importer (`npm run import-mocks`)
├── types/                 ← generated Strapi types
├── favicon.png
└── package.json
```

### 4.2 Content types (current)

All under `src/api/<name>/content-types/<name>/schema.json`.

**Identity / auth:**

| Type              | Purpose                                                              |
|-------------------|----------------------------------------------------------------------|
| `organization`    | Tenant / school entity                                               |
| `user-profile`    | 1:1 with `plugin::users-permissions.user`; role + org + i18n + 1:1 refs to role-specific profile |
| `kids-profile`    | Role-specific data for kids (inventory, coins, companion)            |
| `adult-profile`   | Role-specific data for adult learners                                |
| `teacher-profile` | Role-specific data for teachers (bio, rating, slug, hourly rate)     |
| `parent-profile`  | Role-specific data for parents                                       |
| `admin-profile`   | Role-specific data for admins                                        |
| `parent-link`     | Links parent ↔ kid user accounts                                     |
| `refresh-token`   | JWT refresh token storage                                            |
| `consent-log`     | Terms / privacy / marketing consent audit trail                      |
| `audit-log`       | Request-level audit events (written by `global::audit-log`)          |

**Learning content:**

| Type               | Purpose                                                                      |
|--------------------|------------------------------------------------------------------------------|
| `course`           | Top-level curriculum. `slug`, `level`, `price`, `currency`, `thumbnail`, `teacher` (→ `teacher-profile`), `sections` (component repeatable), `lessons` (relation inverse), `tags`, `ratingAvg`, `reviewCount`, `status`, `audience`, `organization`. `draftAndPublish: true`. |
| `lesson`           | Atomic learning unit. `slug`, `title`, `course` (→ `course`), `sectionSlug`, `orderIndex`, `type` (`video/quiz/reading/interactive`), `durationMin`, `video`, `videoUrl`, `transcript`, `cover`, `exercises` (component repeatable), `isFree`. `draftAndPublish: true`. |
| `session`          | Live calendar event. `title`, `course`, `teacher`, `attendees` (m:n → `user-profile`), `organization`, `startAt`, `durationMin`, `type` (`group/one-to-one/trial/consultation`), `status`, `joinUrl`, `recordingUrl`, `grade`, `maxAttendees`, `notes`. |

**Progress, achievements, reviews:**

| Type               | Purpose                                                                      |
|--------------------|------------------------------------------------------------------------------|
| `user-progress`    | Lesson-level progress per user: `user`, `lesson`, `course`, `status` (`notStarted/inProgress/completed/skipped`), `score`, `attempts`, `completedAt`, `lastAttemptAt`, `timeSpentSec`. |
| `achievement`      | Catalog of unlockables: `slug`, `title`, `description`, `icon`, `category`, `tier`, `coinReward`, `xpReward`, `criteria (json)`, `hidden`. `draftAndPublish: true`. |
| `user-achievement` | Join table: `user`, `achievement`, `earnedAt`, `progress`.                   |
| `review`           | Course review: `course`, `author` (→ `user-profile`), `rating` 1–5, `title`, `body`, `verified`. `draftAndPublish: true`. |

**Kids commerce + teacher authoring:**

| Type        | Purpose                                                                         |
|-------------|---------------------------------------------------------------------------------|
| `shop-item` | Kids shop catalog: `slug`, `nameEn`, `nameUa`, `phonetic`, `emoji`, `category` (`furniture/decor/outfit/special`), `rarity`, `price`, `levelRequired`, `imageIdle/Hover/Active`, `isNew`, `slotOffset (json)`. `draftAndPublish: true`. |
| `homework`  | Teacher-assigned homework: `title`, `teacher`, `assignees` (m:n), `lesson`, `course`, `description`, `exercises` (component), `dueAt`, `status` (`draft/published/closed/archived`). |
| `mini-task` | Teacher-authored short exercise: `slug`, `title`, `author` (→ `teacher-profile`), `level`, `topic`, `exercise` (single component), `coinReward`, `isPublic`. `draftAndPublish: true`. |

**Components:**

| Name              | Attached to         | Attributes                                                |
|-------------------|---------------------|-----------------------------------------------------------|
| `course.section`  | `course.sections`   | `slug`, `title`, `order`, `lessonSlugs (json)`            |
| `lesson.exercise` | `lesson.exercises`  | `slug`, `type` (mcq / fill-blank / match-pairs / translate / word-order / reading / theory / frame / image / video), `question`, `options (json)`, `answer (json)`, `explanation`, `meta (json)`, `points` |

**Role enum** (must match frontend `Role`): `kids | adult | teacher | parent | admin`.

**Content types NOT yet created:** none for Phase 1. Future types (parent-reports, invoices, etc.) tracked in `PRODUCTION_PLAN.md`.

**Known drift** (to reconcile):
- `kids-profile.companionAnimal` + `characterMood` aligned to frontend `lib/kids-store.ts` (`AnimalKind`, `CharacterMood`). Frontend `mocks/user.ts` (`CompanionAnimal`, `CompanionMood`) diverges — **frontend-side normalization owed**.
- Frontend `CalendarSession` uses `date` + `time` + `duration`; Strapi `session` uses `startAt` + `durationMin`. Adapter required in `lib/normalize.ts` (Phase 5).

### 4.3 Policies, controller overrides & lifecycles

**Route-level policies** (in `src/policies/`):
- `is-authenticated.ts` — guards routes requiring a logged-in user.
- `has-role.ts` — role-based authorization.
- `is-owner.ts` — ensures the entity belongs to the current user.
- `is-organization-member.ts` — tenant-scope guard.
- `middlewares/audit-log.ts` (global) — writes request metadata to `audit-log`.

**Controller-level enforcement** (single source of truth for self-scoping):
- `api/user-progress/controllers/user-progress.ts` overrides `find`/`findOne`/`create`/`update`. Non-staff callers (not `teacher`/`admin`) are filtered to their own `user-profile.documentId`; `create` forces the `user` relation server-side; `update` blocks ownership reassignment. Staff bypass via explicit `filters[user][...]` query params.

**Lifecycle hooks**:
- `api/review/content-types/review/lifecycles.ts` — after create/update/delete, re-aggregates `course.ratingAvg` (rounded 2 dp) + `reviewCount`. `beforeDelete` stashes the course id on `event.state` so `afterDelete` can still resolve it once the row is gone. Uses the global `strapi` reference (lifecycle Events don't carry one).

### 4.4 Seeds

Runs on `bootstrap()` via `src/seeds/index.ts`. All seeds idempotent; failures are logged but non-fatal:

1. `00-roles.ts` — users-permissions roles (`public`, `authenticated`, `kids`, `adult`, `teacher`, `parent`, `admin`).
2. `01-organizations.ts` — default organization.
3. `02-admins.ts` — super admin from env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
4. `03-permissions.ts` — declarative `GRANTS` matrix mapping each action (`api::<x>.<x>.<verb>`) to role types. Groupings: `PUBLIC_ALL`, `AUTH_ALL`, `STAFF` (teacher/admin), `ADMIN`, `LEARNERS` (kids/adult/admin). Skips rows where `(action, role)` already exists. This is the authoritative permissions source — no clicking through the admin UI.

### 4.5 Environment variables (required)

Checked at boot in `src/index.ts`. Missing vars are logged as errors.

```
APP_KEYS               comma-separated rotating keys
API_TOKEN_SALT         Strapi API-token HMAC salt
ADMIN_JWT_SECRET       admin panel JWT
TRANSFER_TOKEN_SALT    Strapi transfer feature
JWT_SECRET             users-permissions plugin JWT
ENCRYPTION_KEY         Strapi field encryption
DATABASE_URL           postgres connection string
# optional but recommended:
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true
ADMIN_EMAIL, ADMIN_PASSWORD     ← consumed by 02-admins seed
```

Local dev also honors `DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD` (defaults match `docker-compose.yml`).

---

## 5. Deployment

### 5.1 Current state

| Surface  | Host     | URL                                                     | Status    |
|----------|----------|---------------------------------------------------------|-----------|
| Frontend | Vercel   | (set `NEXT_PUBLIC_API_BASE_URL` to backend `/api`)      | deployed  |
| Backend  | Railway  | Strapi + managed Postgres service                       | deployed  |
| Storage  | Railway / MinIO (dev) | `backend/public/uploads/` + cloud provider (TBD) | dev only  |

**Railway build** (see `railway.json`): NIXPACKS builder, `npm run build:backend` → `npm run start:backend`. Restart policy ON_FAILURE, max 3 retries.

**Vercel build:** root directory `frontend/`, `next build`, env var `NEXT_PUBLIC_API_BASE_URL` points to Railway backend `/api`.

### 5.2 Local development

```bash
# 1. start postgres + redis + minio
docker compose up -d

# 2. backend (Strapi admin on :1337)
cp backend/.env.example backend/.env      # fill secrets first
npm run dev:backend

# 3. frontend (Next dev on :3000)
npm run dev:frontend
```

Frontend with no `NEXT_PUBLIC_API_BASE_URL` falls back to `/api/mock` so the app runs without the backend.

---

## 6. Backend integration checklist (frontend ↔ Strapi)

Single-module swap point: `frontend/lib/api.ts`. When the real backend is ready:

1. Model missing content types in Strapi: Course, Lesson, Section, Exercise, Teacher, Session, UserProgress, Achievement, Review, ShopItem.
2. Seed them from `frontend/mocks/*.json` (Strapi content-import script).
3. Configure `users-permissions` roles — per-endpoint read/write permissions per role.
4. Prefix every URL in `lib/api.ts` with `API_BASE_URL`.
5. Add normalizer adapters (Strapi v5 returns `{ data: { documentId, ...attrs } }`).
6. Wire auth: `POST /api/auth/local` → JWT → httpOnly cookie via a Next route handler.
7. Move shared types from `lib/mockClient.ts` to `lib/types.ts`.
8. Replace `lib/roleContext.tsx` stub with the authenticated user session.
9. Decide: delete `/api/mock/**` or keep as e2e fixtures.
10. Audit client components — no direct `fetch(/api/mock/...)` should remain.

If all of the above hold, backend swap is a config + type move, not a refactor. See `PRODUCTION_PLAN.md` for phased delivery of this work.

---

## 7. Adding new pieces

**New kids page:**
1. `app/(kids)/kids/[name]/page.tsx` with `"use client"` if stateful.
2. Wrap in `<div className="toca">` to scope Kids DS.
3. Import primitives from `@/components/kids/ui`.
4. Use `.type-*`; no inline colors.
5. Portrait-first; add `md:`/`lg:` variants.
6. Test at full matrix (§3.6).
7. Update §3.2 here.

**New design token:**
1. Add `--color-*` / `--text-*` / `--radius-*` inside `@theme {}` in `globals.css`.
2. Composed utilities (shadow, gradient) go under `@layer utilities`.
3. Reference via Tailwind class — never `var(--token)` inline.
4. Update §3.5 here.

**New Strapi content type:**
1. Generate via Content-Type Builder or add `schema.json` + `controllers` + `routes` + `services` under `backend/src/api/<name>/`.
2. Add role permissions in users-permissions.
3. Add a seed file if default rows are needed.
4. Update §4.2 here.
5. Mirror the shape in `frontend/lib/types.ts` and `frontend/lib/api.ts`.
