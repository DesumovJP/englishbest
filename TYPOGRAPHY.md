# Typography System — EnglishBest
> Duolingo-style type hierarchy. Updated: 2026-04-09

## Font

**Nunito** (Google Fonts) — rounded, friendly, Duolingo-feel.
Replaces Geist Sans. Subsets: `latin`, `latin-ext` (Ukrainian support).

## Type Scale (CSS tokens in `@theme`)

| Token                      | Size   | Use                          |
|----------------------------|--------|------------------------------|
| `--text-display`           | 3rem   | Hero headlines               |
| `--text-h1`                | 2rem   | Page title                   |
| `--text-h2`                | 1.5rem | Section title                |
| `--text-h3`                | 1.125rem | Card / widget title        |
| `--text-body-lg`           | 1rem   | Lead paragraph               |
| `--text-body`              | 0.875rem | Standard body              |
| `--text-label`             | 0.75rem  | Caps label                 |
| `--text-tiny`              | 0.6875rem| Meta / footnote            |

## Semantic Utility Classes (`@layer utilities`)

| Class           | Replaces                                                                      |
|-----------------|-------------------------------------------------------------------------------|
| `.type-display` | `text-4xl md:text-5xl font-black tracking-tight leading-[1.05]`               |
| `.type-h1`      | `text-3xl font-black tracking-tight leading-snug`                             |
| `.type-h2`      | `text-2xl font-black leading-snug`                                            |
| `.type-h3`      | `text-lg font-black leading-snug`                                             |
| `.type-body-lg` | `text-base font-semibold leading-relaxed`                                     |
| `.type-body`    | `text-sm font-medium leading-relaxed`                                         |
| `.type-label`   | `text-xs font-black uppercase tracking-widest` (appears 50+ times in project) |
| `.type-tiny`    | `text-[10px] font-bold tracking-wide`                                         |

## Rules

- **Headings**: always `font-black` (900), tight leading
- **Body**: minimum `font-medium` (500), never `font-normal`
- **Labels/caps**: always `.type-label` — uppercase + tracking-widest + font-black
- **Buttons**: always `font-black`
- **Numbers/stats**: `font-black` + large size
- **No inline style for font properties** — use utility classes only

## Progress

### Phase 1 — Foundation
- [x] Font: Nunito in `layout.tsx`
- [x] `@theme` — type tokens added to `globals.css`
- [x] `@layer base` — body/h1-h3/button/input defaults
- [x] `@layer utilities` — semantic type classes

### Phase 2 — Public pages ✓
- [x] `app/home/page.tsx`
- [x] `app/(onboarding)/login/page.tsx`
- [x] `app/(onboarding)/placement/page.tsx`
- [x] `app/(onboarding)/welcome/page.tsx`
- [x] `app/(onboarding)/companion/page.tsx`

### Phase 3 — Dashboard ✓
- [x] `app/dashboard/layout.tsx` (sidebar nav)
- [x] `app/dashboard/student/page.tsx`
- [x] `app/dashboard/teacher/page.tsx`
- [x] `app/dashboard/analytics/page.tsx`
- [x] `app/dashboard/lessons/page.tsx`
- [x] `app/dashboard/students/page.tsx`

### Phase 4 — Kids zone ✓
- [x] `app/(kids)/kids/dashboard/page.tsx`
- [x] `app/(kids)/kids/room/page.tsx`
- [x] `app/(kids)/kids/shop/page.tsx`
- [x] `app/(kids)/kids/achievements/page.tsx`

### Phase 5 — Components ✓
- [x] `components/molecules/QuizWidget.tsx`
- [x] `components/molecules/Sidebar.tsx`
- [x] `components/organisms/DashboardOverview.tsx`
