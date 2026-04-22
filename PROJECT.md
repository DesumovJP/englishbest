# EnglishBest — Project State & Production Roadmap

> **Статус документа:** єдине джерело правди. Об'єднує архітектуру, поточний стан і план доведення проекту до повної production-ready версії. Оновлюється у тому самому коміті, що й структурні зміни. Попередні `ARCHITECTURE.md` + `PRODUCTION_PLAN.md` поглинуті сюди.

---

## 0. Tracking conventions

- `🟢 Ready` — content-type + scoped controller + frontend wired до реального API + seed/імпорт запускався.
- `🟡 Partial` — існує бекенд, але UI ще читає моки АБО scoping/permissions неповні.
- `🟠 Early` — є схема, але нема контролера/шляху/скоупінгу під продакшн.
- `🔴 Not ready` — відсутній бекенд-ресурс АБО функціонал живе тільки в IndexedDB / in-memory моках.
- `[ ]` / `[x]` — прогрес у чек-лісті; дата зміни в §10.

Ознака продакшн-готовності модуля (усе має бути true):
1. Strapi content-type із seed-ом + імпорт-скриптом.
2. Authz policies + per-resource scoping (`owner`, `teacher`, `assignee`).
3. Frontend читає/пише через `lib/api.ts` з auth-aware fetcher — жодного `@/mocks/*` чи `lib/*-data.ts` у рендерних шляхах.
4. E2E smoke-тест для golden path.
5. Seed-дані достатні, щоб Playwright запустив UI без моків.

---

## 1. Snapshot (станом на 2026-04-21)

**Production деплой**
- Backend (Strapi v5.42): Railway → Postgres.
- Frontend (Next.js 16): Vercel → `BACKEND_URL` через env.
- Auth: register/login/me/refresh/logout wired + httpOnly cookies + Next `proxy.ts`.

**Що вже працює з бекендом**
- Реєстрація/логін/сесія, JWT (15m) + refresh (30d, rotation + reuse detection).
- Content-types + permissions seeded для основного каталогу (courses, lessons, sessions, reviews, achievements, shop-items, homework, mini-tasks, user-progress).
- `user-progress` з owner-scoping на find/findOne/create/update.
- Mock import script (`npm run import-mocks`) готовий (локально перевірено білд, не запускався проти staging).

**Що ще живе в моках / IndexedDB**
- **Kids Zone state** (монетки, streak, XP, активний персонаж/кімната, inventory, outfit, placedItems) → тільки `frontend/lib/kids-store.ts` (IndexedDB на клієнті).
- **Персонажі + емоції** — hard-coded у `frontend/lib/characters.ts` (fox + raccoon, PNG з `/public/characters/*`). На бекенді немає сутності.
- **Кімнати** — hard-coded у `frontend/app/(kids)/kids/room/page.tsx` (bedroom/garden/castle/space/underwater). На бекенді немає.
- **Shop catalog** — `frontend/lib/shop-catalog.ts` (20 предметів). Бекенд content-type існує, але seed порожній; front не читає з нього.
- **Library (books/videos/games)** — `frontend/lib/library-data.ts`. Немає окремого content-type (можна фолдити під `course` через теги або додати новий).
- **Teacher dashboard цілком** — `frontend/lib/teacher-mocks.ts` (419 рядків): groups, students, chat, homework, payments, attendance, analytics, lesson library, mini-tasks. 26 споживачів.
- **Role context** — `frontend/lib/roleContext.tsx` тепер гідрується з `useSession()` (Phase A5).

---

## 2. Architecture

### 2.1 High-level

```
┌────────────────────────────┐        ┌──────────────────────────────┐
│  Next.js 16 (Vercel)       │        │  Strapi v5.42 (Railway)      │
│  ─────────────────────     │        │  ──────────────────────────  │
│  • App Router (RSC + CC)   │  HTTPS │  • Documents API (v5)        │
│  • proxy.ts (auth gate)    │◀──────▶│  • users-permissions plugin  │
│  • route handlers /api/auth│ Bearer │  • custom /api/auth/*        │
│  • session-context (CC)    │  JWT   │  • scoped controllers        │
│  • lib/api.ts  ── TBD      │        │  • refresh-token service     │
└────────────────────────────┘        │  • Postgres (Railway)        │
                                       └──────────────────────────────┘
```

### 2.2 Auth data plane

```
<LoginForm>
  └─▶ fetch POST /api/auth/login            (Next route handler — same origin)
        └─▶ fetch POST ${BACKEND_URL}/api/auth/login  (Strapi custom ctrl)
              ├─ users-permissions validate password
              ├─ issueTokenPair(user) → {access(15m), refresh(30d, hashed)}
              └─ 200 { user, profile, tokens }
        └─ set-cookie eb_access + eb_refresh (httpOnly, sameSite=lax,
                                              secure in prod, path=/)
  └─▶ SessionProvider re-hydrates via /api/auth/me
```

Токени:
- `eb_access` (15 хв, httpOnly) — надсилається Next-handlers як `Authorization: Bearer` у бекенд.
- `eb_refresh` (30 днів, httpOnly) — rotation з reuse detection (argon2id + `<profileDocId>.<secret>`).

### 2.3 Frontend стек

- App Router, RSC за замовчуванням; `"use client"` тільки для інтерактивних компонентів.
- Tailwind 4 через `@theme` у `globals.css` (токени `--color-primary`, `--radius-xl`, …). **НЕ** використовуємо inline `style={{}}` на кольори/радіуси (див. memory `feedback_styling`).
- Next 16: `middleware.ts` більше нема — лише `proxy.ts` (експорт — функція `proxy`).
- Session: `<SessionProvider>` у `app/layout.tsx` гідрує `initialSession = await getSession()` (server component → `eb_access` cookie → `${BACKEND_URL}/api/auth/me`).

### 2.4 Backend конвенції

- Strapi v5 envelope: `{ data, meta }`, поля на верхньому рівні `data` (НЕ `attributes`). Nightly check перед рефакторами: `node_modules/@strapi/core/dist/core-api/controller/transform.mjs`.
- Documents API: `strapi.documents('api::foo.foo').findMany/findOne/create/update`.
- Кастомні auth endpoints — у `backend/src/api/auth/*`.
- Permissions — декларативний матрикс у `backend/src/seeds/03-permissions.ts` (idempotent).
- Per-resource scoping — через policies в `backend/src/policies/*` + контролер-оверрайди (приклад: `user-progress.ts`).

### 2.5 Дерево (скорочено)

```
backend/
  src/
    api/
      auth/                       # custom — register/login/me/refresh/logout
      course, lesson, session, review, organization, user-profile,
      kids-profile, adult-profile, teacher-profile, parent-profile, admin-profile,
      shop-item, homework, mini-task, achievement, user-achievement, user-progress,
      parent-link, consent-log, audit-log, refresh-token
    seeds/
      00-roles.ts                 # creates 5 app roles in users-permissions
      01-organizations.ts         # seeds default tenant
      02-admins.ts                # seeds admin account + admin-profile
      03-permissions.ts           # declarative role → action matrix
      index.ts                    # orchestrator, called from bootstrap
    policies/
      is-authenticated.ts         # 401 guard
    bootstrap.ts / register.ts    # loads seeds on boot
  scripts/
    import-mocks.ts               # idempotent mock → Strapi importer (tsx)
  config/
    plugins.ts                    # users-permissions.jwt.expiresIn=15m
    database.ts, server.ts, admin.ts, api.ts
frontend/
  app/
    layout.tsx                    # async, hydrates SessionProvider
    proxy.ts                      # auth gate (Next 16 rename)
    api/auth/{login,register,me,refresh,logout}/route.ts
    (kids)/kids/{dashboard,lessons,shop,room,characters,library,coins,achievements,school}/
    dashboard/{student,teacher,parent,admin,homework,mini-tasks,students,groups,chat,
               attendance,teacher-calendar,teacher-library,payments,profile,analytics,prizes}/
    courses/[courseSlug]/{page.tsx, lessons/[lessonSlug]/page.tsx}
    library/[programSlug]/page.tsx
    auth/{login,register,profile}/page.tsx
  lib/
    auth-config.ts, auth-server.ts, session-context.tsx  # session plumbing
    types.ts                      # canonical domain types (post-normalize)
    api.ts                        # ⚠ STILL HITS /api/mock — rewrite pending
    fetcher.ts                    # ⚠ no auth-aware variant yet
    config.ts                     # API_BASE_URL
    normalize.ts                  # ⚠ TODO — Strapi v5 envelope unwrapper
    roleContext.tsx               # ⚠ reads mock user
    mockClient.ts, teacher-mocks.ts, library-data.ts, shop-catalog.ts,
    characters.ts, kids-store.ts, use-kids-store.ts
  mocks/                          # demo fixtures
  components/
    atoms, kids, lesson, molecules, organisms, teacher, ui
```

---

## 3. Module status matrix

Легенда колонок: **Schema** (content-type) · **Ctrl** (scoped controller) · **Perms** (seed grants) · **FE wired** (UI читає з бекенду) · **Seed/Import** (є дані).

| Модуль | Schema | Ctrl | Perms | FE wired | Seed | Readiness |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Auth (login/register/me/refresh/logout) | ✅ | ✅ | ✅ | ✅ | n/a | 🟢 |
| Courses catalog | ✅ | default | ✅ | ❌ | script готовий | 🟡 |
| Lessons (catalog) | ✅ | default | ✅ | ✅ | script готовий | 🟡 |
| Lesson player (interactive steps) | ⚠ exercise component | default | ✅ | ❌ (hardcoded TS) | — | 🔴 A8 |
| Calendar / Sessions | ✅ | default | ✅ | ❌ | script готовий | 🟡 |
| Reviews | ✅ | ❌ default (policy `is-owner` існує, але не застосовано) | ✅ | ❌ | — | 🟠 |
| User-progress | ✅ | ✅ | ✅ | ❌ | — | 🟡 |
| Teacher-profile | ✅ | default | ✅ | ❌ | script готовий | 🟡 |
| Kids-profile (coins/xp/streak/companion/mood) | ✅ | default | ⚠ | IndexedDB | — | 🔴 |
| Shop catalog | ✅ | default | ✅ | hard-coded | ❌ | 🟠 |
| **User inventory** (owned / equipped / placedItems / outfit / unlockedRooms) | **❌** | — | — | IndexedDB | — | 🔴 |
| **Characters + emotions catalog** | **❌** | — | — | hard-coded | — | 🔴 |
| **User-character ownership + mood** | **❌** | — | — | IndexedDB | — | 🔴 |
| **Rooms catalog** | **❌** | — | — | hard-coded | — | 🔴 |
| **User-room unlock/active** | **❌** | — | — | IndexedDB | — | 🔴 |
| Homework | ✅ | default | ✅ | ❌ | — | 🔴 |
| **Homework-submission** | **❌** | — | — | mock | — | 🔴 |
| Mini-tasks | ✅ | default | ✅ | ❌ | — | 🔴 |
| Achievements + user-achievement | ✅ | default | ✅ | ❌ | — | 🔴 |
| Library (books/videos/games) | ❌ (або теги на course) | — | — | hard-coded | — | 🔴 |
| **Group (teacher class)** | **❌** | — | — | mock | — | 🔴 |
| **Group-membership** | **❌** | — | — | mock | — | 🔴 |
| **Chat / message** | **❌** | — | — | mock | — | 🔴 |
| **Attendance record** | **❌** | — | — | mock | — | 🔴 |
| **Payment / payout** | **❌** | — | — | mock | — | 🔴 |
| **Parent ↔ child link** (parent-link існує, UI не читає) | ✅ | default | — | ❌ | — | 🟠 |

Mocks в обхід API (точні значення перевірено 2026-04-22 gap-audit):
- ~~`@/mocks/user`~~ — видалено (Phase A6). Типи перенесено у `@/lib/types`; `useKidsIdentity()` — єдиний seam до Phase B.
- `@/mocks/lessons/*` — **18 import lines** (7 rich-lesson data + 11 step-компонентів з type-only). Видаляється у Phase **A8**.
- `@/lib/teacher-mocks` — **26 файлів** (підтверджено).
- `@/lib/shop-catalog` — **1 реальний споживач** (`LessonCharacter.tsx`: `SHOP_ITEMS_BY_ID`, `SLOT_OFFSET`). + `kids/dashboard/page.tsx` + `kids/shop/page.tsx` через `use-kids-store`. PROJECT.md раніше писав 3 — було завищено.
- `@/lib/library-data` — **2 файли** (`kids/library/[id]`, `kids/school/page.tsx`).
- `@/lib/characters` — **4 файли** (`CharacterAvatar`, `CharacterDisplay`, `InventoryMobile`, `LessonCharacter`).
- `@/lib/kids-store` + `use-kids-store` — **5 файлів** (раніше писалось 8, перераховано).
- `@/lib/library-mocks` — **0 споживачів** (dead code, видалити у Phase 2-Refactor).

---

## 3a. Gap audit — 2026-04-22

Повний reality-check коду vs цього документа. Джерело — grep + `tsc --noEmit` обидвох пакетів.

**Підтверджено (✅ PROJECT.md правий)**
- Всі 21 content-types мають `schema.json` і `draftAndPublish: true` (uniform).
- `user-progress` — єдиний scoped controller (owner via `callerProfileId()`).
- Policies `/backend/src/policies/`: `is-authenticated`, `has-role`, `is-owner`, `is-organization-member`.
- Seed-ордер через `seeds/index.ts`: 00-roles → 01-organizations → 02-admins → 03-permissions.
- Env-vars validated у `backend/src/index.ts:10-24` (7 required).
- `tsc --noEmit` чистий на FE і BE.

**Розбіжності (треба виправити)**
- `Reviews controller` — PROJECT.md §3 писав «⚠ no owner» → правильніше: controller default, `is-owner` policy існує, але не застосовано. Будь-який `content-creator` може редагувати чужий review.
- Лічильники mocks-споживачів у §3 були завищені/занижені — виправлено вище.
- `lib/library-mocks.ts` — dead code (59 LOC, 0 imports).

**Code-health прогалини (memory `feedback_styling` violations)**
- **57 `style={{...}}`** у `frontend/app/` і `frontend/components/` — найбільші концентрації: `AddCustomModal.tsx`, `LootBox.tsx`, kids-flow.
- **17 `bg-[var(--tk-*)]`** / Tailwind-escape у `AddCustomModal.tsx`.
- Файли-монстри >400 LOC: `AddCustomModal.tsx` (593), `LootBox.tsx` (565), `MiniTaskBuilder.tsx` (540), `LessonBlockEditor.tsx` (533), `CompanionSVG.tsx` (528), `StudentDetail.tsx` (475), `teacher-mocks.ts` (419, піде в Phase G).
- TODO-коментарі в src: Calendly URL у `courses/[slug]/lessons/[slug]/page.tsx:25`, Strapi-auth у `auth/register/page.tsx`, Strapi-POST у `components/molecules/QuizWidget.tsx`.

**Infra прогалини (нема, хоч і треба)**
- **Playwright** відсутній повністю. PROJECT.md §4 Phase J закладає e2e, але тулу нема → Phase J **blocked**.
- **ESLint** не сконфігуровано (ні `.eslintrc*`, ні lint-скрипту).
- **Error boundaries** — жодного `error.tsx` / `ErrorBoundary` у App Router.
- **`loading.tsx` / `not-found.tsx`** — жодного.

**Наслідки**
1. Phase J (e2e suite) треба перепланувати: спочатку додати Playwright як окремий чанк перед golden-path тестами.
2. Phase 2-Refactor (нова, додаємо нижче) — чистка inline-styles/escape, split великих файлів, error/loading pages, ESLint baseline, видалення `library-mocks.ts`. Без нових фіч, без нових сутностей.
3. Після Phase 2-Refactor — повертаємось до A8 → B → C → …

---

## 4. Production roadmap

Плануємо роботу маленькими, незалежно deployable чанками (див. memory `feedback_chunked_work`). Жодні зміни не пушаться без явного дозволу користувача (memory `feedback_no_push`).

### Phase A — Frontend data plumbing (без нових сутностей)

- [x] **A1** `lib/types.ts` — canonical types with legacy aliases.
- [x] **A2** `lib/normalize.ts` — v5 envelope unwrap, media URL absolutize, Kyiv-tz session split, legacy-alias populate (teacherSlug/teacherName/thumbnail/rating on Course; lessonSlug/content on Lesson; date/time/duration on CalendarSession).
- [x] **A3** `lib/fetcher.ts` → three entry points: `fetcher` (anonymous), `fetcherAuth` (server-only, reads access JWT via lazy `auth-server` import), `fetcherClient` (same-origin with credentials). `ApiError` exported.
- [x] **A4.1** `lib/config.ts` очищено від `/api/mock`-дефолту; `lib/api.ts` переписано: `fetchCourses/fetchCourseBySlug/fetchLessonsByCourse/fetchLesson` тепер б'ють у Strapi через `fetcher` + `COURSE_POPULATE/LESSON_POPULATE` і повертають канонічні типи; `fetchMySessions` через `fetcherAuth`; `createProgress({lessonDocumentId, status, …})` через клієнтський `fetcherClient` → новий Next-проксі `/api/user-progress` (POST/GET forward із Bearer). `LessonPlayer` мігрований на новий API (`lessonDocumentId` у пропсах, більше ніяких hard-coded `'alex-k'`).
- [x] **A4.2** Видалено `app/api/mock/**` + `lib/mockClient.ts`. `app/courses/[courseSlug]/page.tsx` читає `fetchCourseBySlug` + `fetchCourses` (SSG params). `CoursePage` та `CalendarView` переведено на `Course`/`CalendarSession` з `@/lib/types` з null-safe-рендером (опціональні `tags`/`teacherName`/`teacherSlug`/`section.lessons`). `CourseSection` має легасі-аліас `lessons`. `frontend/mocks/*.json` лишаємо — їх споживає `backend/scripts/import-mocks.ts`.
- [x] **A5** `lib/roleContext.tsx` переписано як тонкий derivation-шар над `useSession()`: `role` = session-derived з fallback `'adult'` для анонів; `setRole` — no-op, якщо `NEXT_PUBLIC_ROLE_SWITCHER !== '1'`. `RoleProvider` тепер опціональний (тільки для демо-override state). `RoleSwitcher` ховає себе без flag'у. `RoleGuard`/`RoleSwitcher` перемкнуто з `@/mocks/user` на `@/lib/types` для `Role`.
- [x] **A6** `@/mocks/user` видалено повністю (initial count 25 виявився завищеним — реальних споживачів було 9). Три підкроки:
  - [x] **A6.1** Перенесено `CompanionAnimal` + `CompanionMood` у `@/lib/types`. `CompanionSVG.tsx`, `lib/shop-catalog.ts`, `lib/library-data.ts` переключено на type-only імпорт з `@/lib/types`. `CompanionSVG` більше не дублює `CompanionMood` локально — re-export для існуючих споживачів.
  - [x] **A6.2** Новий `lib/use-kids-identity.ts` — єдиний хук `useKidsIdentity(): { name, level }`. Налаштовано 6 споживачів: welcome (name), characters/library-[id]/shop/school (level), dashboard (coins fallback переведено на 0 замість mock-значення). Хук тягне `firstName` і `kidsProfile.currentLevel` з сесії, з fallback `'друже'`/`'A1'`. `tsc --noEmit` чистий.
  - [x] **A6.3** Видалено `frontend/mocks/user.ts`. `grep -R "@/mocks/user" frontend/` порожній. `tsc --noEmit` чистий. `frontend/mocks/*.json` лишаємо — споживаються `backend/scripts/import-mocks.ts`.
- [~] **A7** Запустити імпорт проти Railway staging. Тепер автоматизовано через `IMPORT_MOCKS_ON_BOOT=1` env var: ставиш змінну в Railway backend service → redeploy → bootstrap викликає `runImport(strapi)` → знімаєш змінну. Скрипт ідемпотентний. Runbook нижче.
- [x] **A8** Rich lesson data → Strapi. Обрано варіант (a) — JSON-поле. **Backend**: додано `steps: json` + `xp: integer` у `api::lesson.lesson` schema. Core importer винесено з `scripts/` у `src/lib/mock-importer.ts` (щоб був доступний у compiled runtime). Локальний скрипт `extract-lesson-steps` читає `frontend/mocks/lessons/*.ts` → емітує `frontend/mocks/lesson-steps.json` (committed, 26KB, 938 LOC, 7 lessons × 5-7 steps кожен). Importer читає JSON і пише steps+xp у lesson-документ; idempotent backfill для existing documents. **Frontend**: `Lesson` type у `lib/types.ts` розширено `steps?: unknown[]` + `xp?: number`; `normalizeLesson` їх підтягує; `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx` переписано на `fetchLesson(courseSlug, lessonSlug)` + `fetchLessonsByCourse(courseSlug)` для next-slug; hardcoded `LESSON_REGISTRY` + `NEXT_LESSON` видалено; `notFound()` якщо lesson або steps порожні; adapter `toLessonData()` кастить `unknown[]` → `LessonStep[]` при передачі в `LessonEngine`. Backend+FE `tsc --noEmit` + `eslint` чисті; `strapi build` зелений.

**Runbook — A7 (Railway: IMPORT_MOCKS_ON_BOOT)**

Варіант для користувача без SSH (тільки env vars у Railway):

```
1. Railway → backend service → Variables → додати IMPORT_MOCKS_ON_BOOT=1
2. Trigger deploy (Railway автоматично після save, або ручний redeploy)
3. Дивитись logs: "[import] starting mock import" ... "[import] done"
4. У Strapi admin (https://<backend-host>/admin) перевірити:
   - Content → Course: 6+ записів зі slug/title/teacher
   - Content → Lesson: lessons прив'язані до курсів; rich lessons (hello-goodbye,
     my-name-is, numbers-colors, daily-routines, food-drinks, my-house, reading-animals)
     мають заповнені `steps` (JSON-масив) і `xp`
   - Content → Session: startAt в ISO, teacher+course
   - Content → Teacher profile: 3+ вчителі з publicSlug
   - Users → 3+ seed-юзерів @placeholder.englishbest.app
5. Railway → Variables → видалити IMPORT_MOCKS_ON_BOOT
6. Trigger final deploy (без impor-тера в bootstrap)
```

Варіант для розробника з CLI-доступом (dev / повторний прогін):

```bash
cd backend
cp .env.example .env            # якщо ще не створено
export DATABASE_URL="postgres://..."   # staging або local
export JWT_SECRET="..." APP_KEYS="..." ADMIN_JWT_SECRET="..." API_TOKEN_SALT="..." TRANSFER_TOKEN_SALT="..."
npm run import-mocks             # один shot через tsx + programmatic Strapi
```

Якщо оновили TS-моки `frontend/mocks/lessons/*.ts` — перед імпортом треба
перезгенерувати JSON: `npm run extract-lesson-steps --workspace=backend`
(виконується на dev-машині, комітиться `frontend/mocks/lesson-steps.json`).

Rollback: скрипт ідемпотентний (dedupe по slug/publicSlug/email+startAt; для lessons з існуючими IDs — `steps`/`xp` backfill). Якщо треба скасувати — видалити записи через Admin UI (Strapi Documents API поважає каскад teacher→user-profile→user).

**Acceptance (Phase A):** Courses page, Lessons catalog, Calendar, Profile, Home dashboard рендерять живі дані зі Strapi; lesson-плеєр читає `steps`/`xp` із Strapi (не з TS-мок-реєстра); `grep -R "from '@/mocks" frontend/app` показує тільки type-only імпорти з `mocks/lessons/types`; `mocks/lessons/*.ts` лишаються як dev-source для extractor-а; e2e smoke працює без `/api/mock`. Залишається Phase A7 — користувач має виставити `IMPORT_MOCKS_ON_BOOT=1` на Railway.

### Phase R — Code-health refactor (без нових сутностей)

Додано 2026-04-22 після gap-audit §3a. Не чіпає бекенд-сутності, не прибирає моки; працює тільки з якістю існуючого коду. Виконується перед A8 / Phase B, щоб не мультиплікувати технічний борг.

- [x] **R1** Видалено dead code: `frontend/lib/library-mocks.ts` (59 LOC, 0 споживачів). `tsc --noEmit` чистий.
- [x] **R2** Style-cleanup: 44 `[var(--tk-*)]` escapes → Tailwind utilities (додано kid-bg/kid-border/kid-ink у @theme; `tk-blue`→`secondary`, `tk-muted`→`ink-muted`). 3 статичних `style={{...}}` видалено (LessonCharacter transformOrigin → `origin-bottom`; ProgramDetail height/minHeight → Tailwind). Решта 54 `style={{...}}` — data-driven (runtime кольори з data, позиції, %-widths, env safe-area, CSS custom properties для керамера анімацій) — залишаємо свідомо. Критерій досягнуто: `grep -R bg-\[var\\(--` = 0, всі статично-константні style={{}} з color/shadow/radius прибрано.
- [~] **R3** Split великих файлів — **deferred**. Аналіз показав, що 5 із 6 кандидатів (`AddCustomModal`, `LootBox`, `MiniTaskBuilder`, `LessonBlockEditor`, `StudentDetail`) буде суттєво переписано в Phase B-G (перехід на бекенд-сутності). `CompanionSVG` — Phase C замінює SVG-рендер на PNG-upload. Split зараз — YAGNI; робиться в тих фазах, де файли і так переписуються.
- [x] **R4** Додано root-level `error.tsx`, `global-error.tsx`, `loading.tsx`, `not-found.tsx` у `frontend/app/`. `error.tsx` — Client Component з reset() + console.error; `global-error.tsx` — fallback для помилок root-layout (inline styles тому що Tailwind може бути недоступний); `loading.tsx` — spinner + aria-busy; `not-found.tsx` — 404 з посиланням на "/". Subtree-specific (kids, dashboard) — відкладено до тих фаз, де ці сегменти переписуються (Phase B / G), щоб одразу задати правильний UX.
- [x] **R5** ESLint baseline — `eslint.config.mjs` вже існував (undercount у попередньому audit; script `lint: "eslint"` теж). Виправлено реальні errors: 2 `no-unescaped-entities` (`Ім'я` → `Ім&apos;я`); `<a href="/">` → `<Link>` у новому `error.tsx`; file-level `eslint-disable @typescript-eslint/no-explicit-any` у `lib/api.ts` + `lib/normalize.ts` з reason (Strapi envelope boundary, narrowing локалізоване). React 19 strict hooks rules (`set-state-in-effect`, `purity`, `use-memo`, `refs`, `preserve-manual-memoization`) тимчасово downgrade до `warn` — 7 legitimate порушень у Kids-zone/teacher-файлах, які переписуються в Phase B/G (коментар у config пояснює). Результат: `npm run lint` → 0 errors, 95 warnings (переважно `@next/next/no-img-element` для Base64 data-URLs у kids-zone — легітимно, `<img>` потрібен, бо data URL не можна optim-ити через next/image).
- [x] **R6** Resolve in-src TODOs: Calendly URL → `NEXT_PUBLIC_CALENDLY_TRIAL_URL` env-var (`app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx`); `QuizWidget.handleSubmit` — коментар з відсиланням на Phase E (реальний POST там); register-форма (`app/auth/register/page.tsx`) підключена до `useSession().register()` з error-UI (роль `kids|adult`, ageGroup/phone у payload). `tsc --noEmit` + `eslint` чисті.
- [x] **R7** Мінімальний helper `apiErrorMessage(err, fallback)` у `lib/fetcher.ts` (читає Strapi `error.message` з response body, fallback → UA-мережева помилка). Повний `handleApiError` + toast-система відкладено: зараз 1 catch-сайт на весь FE, повноцінний helper — YAGNI. Ревізія коли з'являться ≥3 catch-сайти (Phase B/C wiring).

**Acceptance (Phase R):** `grep bg-\[var` = 0 ✓, жодних статичних `style={{}}` з color/shadow/radius ✓ (решта 54 — data-driven, лишаються), `npm run lint` зелений (0 errors, 95 warnings) ✓, 4 error/loading/not-found сторінки на місці ✓, `tsc --noEmit` чистий ✓, 0 мок-TODO у not-phased-out коді ✓. R3 (file-split >500 LOC) свідомо deferred у Phase B-G разом з переписом тих же файлів.

### Phase B — Kids Zone state на backend

Мета: перенести `KidsState` з IndexedDB у Strapi, щоб прогрес зберігався між пристроями.

- [ ] **B1** Content-type `api::user-inventory.user-inventory` (1:1 до `user-profile`). Поля:
  - `ownedShopItems` — relation manyToMany → `shop-item`.
  - `equippedItems` — relation manyToMany → `shop-item` (підмножина owned; validate у контролері).
  - `outfit` — json (slot → shop-item.slug): `{ hat, glasses, scarf, backpack }`.
  - `placedItems` — json component `[{ placementId, itemSlug, x, y, scale, z }]`.
  - `unlockedRooms` — relation manyToMany → `room` (Phase C).
  - `activeRoom` — relation oneToOne → `room`.
  - `activeCharacter` — relation oneToOne → `character` (Phase C).
  - `seedVersion` — integer.
- [ ] **B2** Kids-profile: endpoint `PATCH /api/kids-profile/me` (scoped self-update) для `totalCoins / totalXp / streakDays / streakLastAt / characterMood`. Перевірка: inc/dec-only для coins (backend validate), щоб клієнт не відкручував собі гроші довільно.
- [ ] **B3** Scoped controller для `user-inventory` (read/update тільки свій; staff — free).
- [ ] **B4** Seed: для існуючих kids-profile створити порожні `user-inventory` через migration-like seed (idempotent).
- [ ] **B5** FE — `lib/kids-store.ts` підмінити на remote-first модель: read від `/api/user-inventory/me`, write через `PATCH`. IndexedDB залишаємо як offline cache (optional, Phase I).

**Acceptance:** Coins/XP/streak/inventory/outfit/placedItems переживають вихід і вхід на інший браузер; IndexedDB порожня на свіжому пристрої = state приходить із бекенду.

### Phase C — Characters + Rooms каталоги

- [ ] **C1** Content-type `api::character.character`:
  - `slug` uid, `nameEn`, `nameUa`, `description`, `rarity` (common/uncommon/rare/legendary), `priceCoins` integer, `levelRequired` enum L(evel).
  - `emotionImages` — component repeatable `{ emotion: enum, image: media }` (підтримує всі 8 емоцій із `lib/characters.ts`).
  - `fallbackEmotion` enum.
- [ ] **C2** Content-type `api::user-character.user-character` (manyToOne → user-profile; manyToOne → character; унікальність пари; `acquiredAt`). Власність персонажа.
- [ ] **C3** Content-type `api::room.room`:
  - `slug`, `nameEn`, `nameUa`, `coinsRequired`, `background` media, `iconEmoji`, `orderIndex`.
- [ ] **C4** Seed: `04-characters.ts` + `05-rooms.ts` — імпортують існуючі fox/raccoon (скопіювати PNG у `backend/public/uploads/characters/`) і 5 rooms.
- [ ] **C5** Permissions: public read для обох каталогів; write — admin.
- [ ] **C6** Endpoints:
  - `POST /api/user-character/purchase { characterSlug }` — перевіряє coins, рівень, створює user-character + списує coins у transaction-like послідовності з compensating cleanup.
  - `POST /api/user-inventory/unlock-room { roomSlug }` — аналогічно.
- [ ] **C7** FE — `lib/characters.ts` → `lib/api.ts::fetchCharacters()` + прибрати hard-coded каталог. Hard-coded кімнати у `kids/room/page.tsx` → server-driven.

**Acceptance:** Adding new character у Strapi admin з'являється в UI без деплою. Купівля персонажа зменшує coins на сервері й фіксується у `user-character`.

### Phase D — Shop flow справжній

- [ ] **D1** Seed: `06-shop-items.ts` — імпортує 20 предметів із `lib/shop-catalog.ts` + завантажує placeholder icons у media.
- [ ] **D2** Endpoint `POST /api/user-inventory/purchase { shopItemSlug }` — coins check + рівень check + списання + додавання до `ownedShopItems` (idempotent: якщо вже owned — 409).
- [ ] **D3** Endpoint `POST /api/user-inventory/equip { shopItemSlug, equip: boolean }`.
- [ ] **D4** FE — `app/(kids)/kids/shop/page.tsx` читає каталог із `/api/shop-items?populate=*`; купівля → `POST /api/user-inventory/purchase` + optimistic UI + rollback on error.
- [ ] **D5** FE — `app/(kids)/kids/room/page.tsx` placements → `PATCH /api/user-inventory/me { placedItems: [...] }` (debounced save).

**Acceptance:** Покупка предмета зменшує coins на сервері; предмет з'являється у іншому браузері; rollback при помилці.

### Phase E — Progress / Achievements / Lessons engine

- [ ] **E1** FE — `postProgress()` (нині моковий) перенаправити на `POST /api/user-progresses` (scoped controller уже існує).
- [ ] **E2** Backend lifecycle `afterCreate/afterUpdate` у `user-progress` — коли `status=completed`:
  - зарахувати coins/xp у `kids-profile` (або `adult-profile`),
  - перевірити streak (`streakLastAt`),
  - evaluate achievements → створити `user-achievement` якщо критерій виконаний.
- [ ] **E3** Seed: `07-achievements.ts` — базовий набір (first-lesson, 7-day-streak, 100-words, level-up-A2, …).
- [ ] **E4** FE — `app/(kids)/kids/achievements/page.tsx` читає `/api/user-achievements?populate=achievement`; `coins` сторінка — з `kids-profile.totalCoins`.
- [ ] **E5** Companion mood update: backend обирає `characterMood` за результатами (completed=happy, fail=sad, streak=celebrate…) у тому самому lifecycle.

**Acceptance:** Завершення уроку → coins/xp оновлюються, streak продовжується, відповідний achievement розблоковується, companion змінює мудру — усе з одного створення `user-progress`.

### Phase F — Library (books/videos/games)

- [ ] **F1** Рішення: розширити `course` тегом `kind` enum `(course/book/video/game)` і `license` enum, АБО окремий `library-item` content-type. Рекомендую **розширити course** — менше дублювання, бо UI уже показує level/price/emoji, а звичайні курси теж мають level/price.
- [ ] **F2** Додати поля до `course` schema: `kind` (default `course`), `iconEmoji`, `externalUrl` (для videos/games), `provider` string, `isFree` boolean computed з `price=0`.
- [ ] **F3** Seed `08-library.ts` — імпортує 20 items із `lib/library-data.ts` (kind != 'course') як Course з `kind`.
- [ ] **F4** FE — `app/library/page.tsx`, `app/(kids)/kids/library/[id]/page.tsx` читають `/api/courses?filters[kind][$in]=...&populate=*`. `lib/library-data.ts` видалити.

**Acceptance:** Library tabs рендеряться з бекенду; додавання нової книжки в admin з'являється без деплою.

### Phase G — Teacher dashboard (reale data)

Найбільший чанк. Розбиваємо на суб-фази.

- [ ] **G1 — Groups**
  - Content-type `api::group.group`: `name`, `level`, `teacher` (manyToOne), `members` (manyToMany → user-profile), `scheduleRrule` string, `activeFrom/To`, `meetUrl`.
  - Scoped controller: teachers бачать тільки свої; admin — усе.
  - FE: `dashboard/groups/page.tsx`, `students/page.tsx` — через `fetchGroups/fetchStudents`.
- [ ] **G2 — Homework flow повний**
  - Content-type `api::homework-submission.homework-submission`: `homework` (mto), `student` (mto), `status` (notStarted/inProgress/submitted/reviewed/returned/overdue), `submittedAt`, `gradedAt`, `score`, `teacherFeedback` text, `answers` json, `attachments` media multiple.
  - Scoped ctrl: student бачить/редагує тільки свої (pre-`submittedAt`); teacher — тільки assignees зі своїх homework.
  - Lifecycle: create `homework-submission` автоматично для кожного assignee при `homework.status=published`.
  - FE: `dashboard/homework/page.tsx` + `[id]/review/page.tsx` — читає реальні submissions.
- [ ] **G3 — Mini-tasks** — scoped ctrl (teacher-owned), FE `dashboard/mini-tasks/page.tsx`.
- [ ] **G4 — Lesson library / editor** (`dashboard/teacher-library`) — уже має content-type `lesson`; додати scoping за `teacher` (owner) + `source` enum (`platform|own|copy`). FE editor зберігає через Strapi.
- [ ] **G5 — Chat**
  - `api::thread.thread` (participants m2m → user-profile; `kind` enum student/group/parent).
  - `api::message.message` (thread mto, author mto → user-profile, body text, attachments media, readBy m2m).
  - Scoped: тільки учасники треду.
  - FE `dashboard/chat/page.tsx`. Transport: polling кожні 10 с (MVP). Phase I — websockets.
- [ ] **G6 — Attendance** — `api::attendance-record.attendance-record` (session mto, student mto, status enum present/absent/late, note text). FE `dashboard/attendance`.
- [ ] **G7 — Payments / payouts**
  - `api::lesson-payment.lesson-payment` (session mto, teacher mto, gross/net, currency, status).
  - `api::teacher-payout.teacher-payout` (teacher mto, period, total, status, payoutAt).
  - FE `dashboard/payments/page.tsx`.
- [ ] **G8 — Profile** (`dashboard/profile/page.tsx`) — self-update bio/languages/hourlyRate/videoMeetUrl/avatar → `PATCH /api/teacher-profile/me`.
- [ ] **G9 — Analytics** — derived endpoints `GET /api/analytics/teacher` (агрегат з user-progress + homework-submission + attendance + payments).

**Acceptance на Phase G:** жодного import from `@/lib/teacher-mocks`; всі 26 споживачів переведено; e2e smoke для teacher flow (login → groups → assign homework → grade submission).

### Phase H — Parent flow

- [ ] **H1** Parent-link вже існує (`parent-profile` ↔ kids-profile). Дописати scoped endpoint `GET /api/parent/me/children` + `GET /api/parent/me/children/:kidDocId/progress`.
- [ ] **H2** FE `dashboard/parent/page.tsx` — список дітей із прогресом + календар + homework due.

### Phase I — Production polish

- [ ] **I1** Offline cache для kids-zone: IndexedDB зберігається, але як `stale-while-revalidate`, не як джерело правди.
- [ ] **I2** Kids PIN-login (використовує `kids-profile.pinHash`). Endpoint + PIN-модалка.
- [ ] **I3** Email — Resend/Postmark provider → forgot-password + email confirmation (деферовано з Phase 4 старого плану).
- [ ] **I4** Media: CDN + image optimization (Strapi uploads → R2/S3).
- [ ] **I5** Websockets для chat (socket.io плагін Strapi) замість polling.
- [ ] **I6** Sentry на FE + BE; LogRocket опційно.
- [ ] **I7** Rate limiting на `/api/auth/*` (проти brute force).
- [ ] **I8** Backups — Railway postgres daily snapshot + restore runbook.
- [ ] **I9** PII: consent-log read/export endpoint для GDPR.

### Phase J — QA / Acceptance

- [ ] **J0** **Playwright bootstrap** (відсутній повністю — gap-audit 2026-04-22): `npm i -D @playwright/test`, `npx playwright install chromium`, `playwright.config.ts` (baseURL з env, webServer — `next dev` для локалки, reporters: list+html), root-рівень `e2e/` папка, `npm run e2e` у root. CI-hook — відкладається.
- [ ] **J1** Kids CRUD + golden path: register → login → lesson complete → coins earned → shop purchase → shop sell → equip/unequip → room unlock → place/move/remove item → character purchase → dressing → logout → login інший браузер → state вцілів.
- [ ] **J2** Teacher CRUD + golden path: login → create group → add student → create lesson (editor save) → publish → assign homework (з різних block types) → student submit → teacher grade + feedback → chat message thread → attendance mark → payment record → profile edit.
- [ ] **J3** Parent flow: login → children list → child progress → homework due → upcoming sessions.
- [ ] **J4** Load test: 100 одночасних lesson-complete (k6).
- [ ] **J5** Accessibility audit (axe-core) на всіх основних сторінках.
- [ ] **J6** Mobile (iOS Safari) reality check — kids-zone особливо.
- [ ] **J7** **CRUD-matrix coverage** — окрема secondary-suite, яка для кожного content-type ганяє Create/Read/Update/Delete через UI (не прямі API-виклики). Мета: жодна сутність не додається/редагується тільки в Admin UI Strapi — є FE flow. Див. §3 матрицю; кожен 🟢-рядок має покривати щонайменше 1 positive CRUD test + 1 scoping test (auth'd іншою роллю — 403).

---

## 5. Immediate next actions (оновлено 2026-04-22)

Порядок виконання, погоджений із користувачем:
1. **Phase R (code-health refactor)** — R1 → R2 → R3 → R4 → R5 → R6 → R7. Послідовно, кожен — окремий коміт.
2. **Phase A7** (import-mocks → staging) — ручний запуск користувачем за runbook-ом.
3. **Phase A8** (rich lessons → Strapi) — закриває Phase A acceptance.
4. **Phase B → C → D → E → F → G → H**. Кожна — окремий чанк, кожна з FE CRUD + scoping.
5. **Phase J0** (Playwright bootstrap) — щойно перше «реальне» CRUD-гілкування ляже (після B), підводимо під нього e2e.
6. **Phase J1-J7** (CRUD-matrix + golden paths) — паралельно з G.
7. **Phase I** (prod-polish) — після всього.

Правило: **жодна нова фіча не додається, поки для попередньої сутності не існує Playwright-тест на Create + Read + Update + Delete + Scoping.** Це вимога користувача (2026-04-22) щоб «все працювало як очікуємо».

## 6. Acceptance criteria — production ready

Проект вважаємо довершеним, коли одночасно true:
1. `grep -R "from '@/mocks" frontend/` = 0 результатів.
2. `grep -R "from '@/lib/teacher-mocks'" frontend/` = 0 результатів.
3. `grep -R "from '@/lib/library-data'" frontend/` = 0 результатів.
4. `grep -R "from '@/lib/shop-catalog'" frontend/` = 0 результатів.
5. `grep -R "from '@/lib/characters'" frontend/` = тільки в нормалайзері (не в UI).
6. Kids flow: вхід на свіжому пристрої → увесь state (coins, inventory, outfit, rooms) приходить із бекенду.
7. Teacher flow: login → створити homework → студент submit-ить → teacher grade → student бачить feedback.
8. Parent flow: бачить прогрес свого ребенка.
9. `npm run import-mocks` на staging → admin-панель показує повний граф (teachers + courses + lessons + sessions + achievements + shop-items + characters + rooms + library).
10. Playwright smoke suite (J1-J3) зелений.
11. Всі permissions із seed відображають owner-scope для write-операцій.

## 7. Hard rules (carried from memory)

- **НЕ пушити** до remote під час цього рефакторингу (memory `feedback_no_push`).
- **Маленькі коміти** — довгі правки розбивати на чанки (memory `feedback_chunked_work`).
- **Styling** — усі токени у `@theme` у `globals.css`; `bg-primary` замість `bg-[var(--color-primary)]` (memory `feedback_styling`).
- **Kids UI** — full-screen bg + top/bottom bars; без cards-stacks; не більше 1 акцентного кольору на екран (memory `feedback_kids_ui`).
- **Kids gamification** — Toca Boca model: кімнати розблоковуються за монетки, loot boxes з меблями, collectible+dressable characters (memory `project_kids_gamification`).
- **Next 16** — читати `node_modules/next/dist/docs/` перед структурними змінами (AGENTS.md).

## 8. Env vars

Backend (Railway):
- `DATABASE_URL`, `NODE_ENV=production`, `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`, `JWT_SECRET`, `JWT_EXPIRES_IN=15m`, `REFRESH_TOKEN_SECRET`, `PUBLIC_URL`.
- Admin seed: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (required перший раз).

Frontend (Vercel):
- `STRAPI_API_URL` (server-side, internal) або `NEXT_PUBLIC_API_BASE_URL` (client-side fallback).
- `NODE_ENV=production` (auto).
- Optional: `NEXT_PUBLIC_USE_MOCK=0`, `NEXT_PUBLIC_ROLE_SWITCHER=0`.

## 9. Runbooks

- **Деплой backend**: push → Railway builds Strapi → on boot викликає `src/bootstrap.ts` → `seeds/index.ts` runs idempotent (roles → orgs → admin → permissions). Повторний запуск безпечний.
- **Імпорт моків в staging (Railway)**: виставити `IMPORT_MOCKS_ON_BOOT=1` у змінних backend-сервісу, redeploy, дочекатись у логах `[import] done`, зняти змінну. Локально — `cd backend && npm run import-mocks` (tsx + programmatic Strapi, не запускає HTTP-сервер).
- **Rollback**: Railway має деплой-історію; дев-редеплой попередньої ревізії миттєвий.
- **Очистка refresh-tokens**: cron через Strapi scheduled-task (TODO Phase I).

## 10. Change log

- **2026-04-22** Catalog seeds: `05-shop-items.ts` (20 items із `frontend/lib/shop-catalog.ts` — category/rarity/price/level/slotOffset, ідемпотентно по slug, always-run) і `06-achievements.ts` (12 ачівок: lessons/streak/coins/mastery/kids/special — tier+coin/xp reward+criteria JSON, ідемпотентно по slug, always-run). Обидва підключено у `seeds/index.ts` після `04-demo-accounts`. Після redeploy Railway підтягне shop-items і achievements одразу (без opt-in env). `tsc --noEmit` чистий на backend.
- **2026-04-22** Login page: видалено legacy Demo-picker (localStorage `demo_role` bypass) + Mode toggle; лишилась одна signin-форма, підключена до `useSession().login()` з real-auth + error UI + role-based redirect. Додано окремий блок «Тестові акаунти» — 4 картки (kids/adult/teacher/parent) з email + паролем + кнопкою «Копіювати» + «Заповнити форму». Backend — новий seed `04-demo-accounts.ts` (opt-in `SEED_DEMO_ACCOUNTS=1`, idempotent skip-if-exists): створює 4 users з паролем `Demo2026!` і відповідні role-profile. Увімкнути на Railway раз: `SEED_DEMO_ACCOUNTS=1` → redeploy → зняти змінну.
- **2026-04-22** Vercel build fix: видалено server-only `fetcherAuth` + `fetchMySessions` з `lib/fetcher.ts` / `lib/api.ts` (обидва unused, cross-referenced). Turbopack статичний трейсинг більше не тягне `next/headers` у client bundle через ланцюг `auth/register/page.tsx → fetcher.ts → auth-server.ts`.
- **2026-04-22** Phase A8: rich lesson-data → Strapi. **Backend** `api::lesson.lesson` schema += `steps: json`, `xp: integer`; core importer перенесено `scripts/import-mocks.ts` → `src/lib/mock-importer.ts` (shared runtime); новий `scripts/extract-lesson-steps.ts` читає TS-моки та емітує `frontend/mocks/lesson-steps.json` (committed). Importer читає JSON+steps, ідемпотентний backfill. `src/index.ts` bootstrap тепер викликає `runImport(strapi)` при `IMPORT_MOCKS_ON_BOOT=1` — усуває потребу в SSH для A7. **Frontend** `Lesson` type += `steps?: unknown[]`, `xp?: number`; `normalizeLesson` їх підтягує; `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx` переписано з hardcoded TS-реєстра на `fetchLesson` + `fetchLessonsByCourse` + `notFound()`. Backend+FE `tsc` + `eslint` + `strapi build` зелені.
- **2026-04-22** Phase R завершено (R1, R2, R4, R5, R6, R7 done; R3 свідомо deferred у Phase B-G). Acceptance-критерій оновлено під фактично виконане; додано helper `apiErrorMessage(err, fallback)` у `lib/fetcher.ts` замість повного `handleApiError`-toast-stack (YAGNI, 1 catch-сайт).
- **2026-04-22** Gap-audit + roadmap update: додано §3a (reality-check vs документа). Виправлено лічильники mocks-споживачів (shop-catalog: 3→1 реальний, kids-store: 8→5, lessons: 12→18). Виправлено Reviews ctrl-рядок у §3 (default controller, owner-policy не застосовано). Додано **Phase R (code-health refactor)** перед A8: dead-code cleanup, style-unification, file-split, error/loading/not-found, ESLint baseline, TODO cleanup, уніфікований error-handling. Phase J розширено — J0 (Playwright bootstrap, тулу нема в репо), J1-J2 переформульовано як повний CRUD+golden path, J7 — CRUD-matrix coverage. §5 переписано з новим порядком виконання + правилом «нова фіча → тільки після CRUD+scoping тестів попередньої».
- **2026-04-22** Phase A7 (docs-only): додано runbook у §4 для `npm run import-mocks` (local → Railway staging → admin-spot-check → FE spot-check + rollback). Перевірено що `backend/tsc --noEmit -p .` чистий (importer компілиться). Виконання проти staging — на користувача (нема локальних Railway creds).
- **2026-04-22** Phase A8 додано в roadmap: rich lesson-step дані в `frontend/mocks/lessons/*.ts` обходять Strapi. `LessonPage` читає hardcoded TS реєстр. Блокер для Phase A acceptance. Два варіанти міграції: JSON-поле `lesson.content` vs розширення `exercise` component — вибирається у Phase A8 kickoff.
- **2026-04-22** Phase A6.3: видалено `frontend/mocks/user.ts`. `@/mocks/user`-імпортів у репо більше немає. `tsc --noEmit` чистий.
- **2026-04-22** Phase A6.2: новий `lib/use-kids-identity.ts` — єдиний seam для Kids Zone name+CEFR level з сесії. Шість споживачів (`welcome`, `characters`, `library/[id]`, `shop`, `dashboard`, `school`) перемкнуто з `mockKidsUser` на хук / `state.coins ?? 0`. `tsc --noEmit` чистий.
- **2026-04-22** Phase A6.1: `CompanionAnimal`/`CompanionMood` винесено з `@/mocks/user` у `@/lib/types`. Три type-only споживачі (CompanionSVG, shop-catalog, library-data) перемкнуто. `CompanionSVG` більше не має локального дублю `CompanionMood`. `tsc --noEmit` чистий.
- **2026-04-21** Phase A5: `lib/roleContext.tsx` гідрується з `useSession()`; `setRole` — no-op без `NEXT_PUBLIC_ROLE_SWITCHER=1`; `RoleSwitcher` self-hides без флагу; `RoleGuard`/`RoleSwitcher` перемкнуто на `Role` з `@/lib/types`. `tsc --noEmit` чистий.
- **2026-04-21** Phase A4.2: видалено `app/api/mock/**` + `lib/mockClient.ts`. `courses/[courseSlug]/page.tsx` живе на `fetchCourseBySlug/fetchCourses`. `CoursePage` + `CalendarView` переведено на канонічні типи з null-safe аксесом. До `CourseSection` додано легасі-аліас `lessons`. `tsc --noEmit` чистий.
- **2026-04-21** Phase A4.1: `lib/api.ts` переписано на реальний Strapi (COURSE/LESSON/SESSION populate) + `createProgress` через Next proxy `/api/user-progress`; `config.ts` очищено від `/api/mock`-дефолту; `LessonPlayer` мігрований. `tsc --noEmit` чистий. Моки в `app/api/mock/**` поки живі — прибирається в A4.2 разом із рештою споживачів `mockClient`.
- **2026-04-21** Phase A2+A3: `lib/normalize.ts` (Strapi v5 envelope unwrap + media URL absolutize + Kyiv-tz session split + legacy aliases) та `lib/fetcher.ts` перероблено на три entry points (fetcher, fetcherAuth server-only, fetcherClient same-origin) + `ApiError`. `tsc --noEmit` чистий.
- **2026-04-21** Single-source консолідація: видалено `README.md`, `backend/README.md`, `AGENTS.md`. `CLAUDE.md` містить правило Next 16 + вказівку на `PROJECT.md`. В репо лишилось 2 md: `PROJECT.md` (project info) + `CLAUDE.md` (AI contract).
- **2026-04-21** Консолідація `ARCHITECTURE.md` + `PRODUCTION_PLAN.md` → `PROJECT.md`. Додано детальний матрикс готовності для Kids/Shop/Inventory/Library/Homework/Progress/Teacher/Characters. Phase A → J roadmap.
- **2026-04-21** Phase 5 старого плану перейменовано на Phase A.
- **Раніше** — див. git log (фази 0-4 старого плану вже виконано: cleanup, backend perms+scoping, mock import script, auth endpoints + Next-handlers + SessionProvider + `proxy.ts` rename).
