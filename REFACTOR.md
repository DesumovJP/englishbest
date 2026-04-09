# EnglishBest — Refactoring Plan

> Goal: Single design system, zero inline styles, component library, architecture docs.
> Rule: Update status here after every session. Work top-down.

---

## Phase 1: Design Tokens (globals.css) — ✅ Done
- [x] Add missing color tokens (ink-faint, coin-*, danger-dark, purple-*, success-dark)
- [x] Add `shadow-press-*` utilities (primary/secondary/accent/danger/purple/success)
- [x] Add `shadow-card`, `shadow-card-md` utilities
- [x] Add `bg-hero-kids`, `bg-xp-bar` gradient utilities
- [x] Add `animate-shake` keyframe
- [x] Add `anim-delay-*` utilities (100/150/200/300/400/450/500/600ms)
- [x] Add `bg-lesson-map`, `bg-lesson-engine` gradient utilities
- [x] Add `select-arrow-primary` utility (custom select dropdown arrow)

## Phase 2: Kids UI Component System — ✅ Done
### components/kids/ui/ (all export via index.ts barrel)
- [x] `KidsButton` — 3D press, 5 color variants, href support, fullWidth
- [x] `KidsCard` — 5 variants (default/hero/special/success/flat)
- [x] `KidsPageHeader` — sticky, back link + title + subtitle + right slot
- [x] `KidsTabBar` — colored tabs, 3D active state, counter badges
- [x] `KidsCoinBadge` — coin balance pill (coin-* tokens)
- [x] `KidsChallengeItem` — daily challenge row (done/todo states)
- [x] `KidsNavCard` — 3D colored nav tile (5 color variants)
- [x] `KidsStatBar` — streak + XP bar + coins top bar
- [x] `KidsToast` — slide-up success toast
- [x] `KidsProgressBar` — thick gamified bar (sm/md/lg heights)

## Phase 3: Page Refactoring — ✅ Done
### Kids section
- [x] `/kids/dashboard` — uses all kids/ui components, zero inline hex colors
- [x] `/kids/shop` — uses KidsPageHeader/TabBar/Button/Toast, zero inline hex colors
- [x] `/kids/room` — SVG-heavy, inline styles in SVG transforms are exempt (documented)

### Adult section
- [x] `/dashboard/lessons` — bg-lesson-map utility, Tailwind arbitrary values
- [x] `/dashboard/analytics` — dynamic % widths/heights only (valid)
- [x] `/dashboard/student` — max-h class, dynamic % (valid)
- [x] `/dashboard/students` — select-arrow-primary utility
- [x] `/dashboard/teachers` — select-arrow-primary utility
- [x] `/dashboard/teacher` — TS error fixed (keyof typeof STATUS_CFG cast)
- [x] `/dashboard/chat` — max-h class
- [x] `/library/page` — select-arrow-primary utility

### Onboarding
- [x] `/welcome` — anim-delay-* classes
- [x] `/onboarding` — dynamic delay (idx-based, valid exception)
- [x] `/placement` — anim-delay-* classes, dynamic % (valid)
- [x] `/companion` — anim-delay-* classes, dynamic delay (idx-based, valid)

### Lesson components
- [x] `LessonEngine` — bg-lesson-engine utility, Tailwind arbitrary delays
- [x] `LessonProgress` — dynamic % widths (valid)
- [x] `LessonCharacter` — Tailwind drop-shadow arbitrary; CSS triangle exempt
- [x] `LessonSuccess` — rotate-[15deg] Tailwind classes
- [x] `StepFillBlank` — dynamic width (valid)
- [x] `StepVideo` — aspect-video class replaces paddingBottom trick

### Other components
- [x] `DashboardOverview` — dynamic % (valid)
- [x] `QuizWidget` — dynamic % (valid)

## Phase 4: TypeScript Fixes — ✅ Done
- [x] `room/page.tsx:448` — `JSX.Element` → `React.ReactElement`, added React import
- [x] `teacher/page.tsx:117` — `lesson.status as keyof typeof STATUS_CFG`
- [x] `middleware.ts` — removed reference to non-existent `/auth/login` page

## Phase 5: Documentation — ✅ Done
- [x] `ARCHITECTURE.md` — full routing map, component tree, design system, conventions, kids section detail
- [x] JSDoc on all kids/ui components (props + usage examples)
- [x] `REFACTOR.md` — this file, tracks progress

---

## Build Status
**✅ `npm run build` — CLEAN (0 errors, 0 warnings)**
All pages prerender successfully. Ready for Vercel deploy.

---

## Documented Inline Style Exceptions

These are intentional and acceptable. Do not remove.

| Location | Style | Reason |
|----------|-------|--------|
| `room/page.tsx` | All SVG/transform inline styles | 2.5D isometric room — complex computed geometry |
| `dashboard/page.tsx` (kids) | `borderLeft/Right/Top` triangle | CSS border triangle trick — no Tailwind equivalent |
| `dashboard/page.tsx` (kids) | `scale(1.85) transformOrigin` | Non-standard scale value, no Tailwind class |
| `LessonCharacter.tsx` | `borderLeft/Right/Top` triangle | CSS border triangle trick |
| `KidsChallengeItem.tsx` | `accent`, `accentDark` prop colors | Runtime data values — not hardcoded hex |
| `KidsTabBar.tsx` | `color`, `colorDark` prop values | Runtime data values — not hardcoded hex |
| `shop/page.tsx` | `background: activeTab.color` | Runtime CSS var string — design system compliant |
| All progress bars | `width: \`${pct}%\`` | Dynamic runtime percentage |
| `StepFillBlank.tsx` | Dynamic input width | Runtime text measurement |
| Onboarding pages | `animationDelay: \`${idx * N}s\`` | Truly dynamic — no static class equivalent |

---

## Hardcoded Values to Replace (All Done)
| Value | Token | Class |
|-------|-------|-------|
| `#1f1f1f` | `--color-ink` | `text-ink` |
| `#6b7280` | `--color-ink-muted` | `text-ink-muted` |
| `#afafaf` | `--color-ink-faint` | `text-ink-faint` |
| `#f7f7f7` | `--color-surface-muted` | `bg-surface-muted` |
| `#e5e5e5` | `--color-border` | `bg-border` / `border-border` |
| `#52c41a` | `--color-primary` | `bg-primary` |
| `#389e0d` | `--color-primary-dark` | `bg-primary-dark` |
| `#95de64` | `--color-primary-light` | `bg-primary-light` |
| `#1CB0F6` | `--color-secondary` | `bg-secondary` |
| `#0e8bc2` | `--color-secondary-dark` | `bg-secondary-dark` |
| `#FF9600` | `--color-accent` | `bg-accent` |
| `#cc7800` | `--color-accent-dark` | `bg-accent-dark` |
| `#FF4B4B` | `--color-danger` | `bg-danger` |
| `#cc2e2e` | `--color-danger-dark` | `bg-danger-dark` |
| `#b45309` | `--color-coin` | `text-coin` |
| `#fffbeb` | `--color-coin-bg` | `bg-coin-bg` |
| `#fde68a` | `--color-coin-border` | `border-coin` |
| `#CE82FF` | `--color-purple` | `bg-purple` |
| `#9b5dd5` | `--color-purple-dark` | `bg-purple-dark` |
| `0 5px 0 #389e0d` | shadow-press-primary | `shadow-press-primary` |
| `0 5px 0 #0e8bc2` | shadow-press-secondary | `shadow-press-secondary` |
| `0 5px 0 #cc7800` | shadow-press-accent | `shadow-press-accent` |
| `0 5px 0 #cc2e2e` | shadow-press-danger | `shadow-press-danger` |
| `0 5px 0 #9b5dd5` | shadow-press-purple | `shadow-press-purple` |
