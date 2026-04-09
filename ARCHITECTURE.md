# EnglishBest — Architecture Reference

> Living document. Update after every structural change.
> Reading this file = instant full context, no codebase re-analysis needed.

---

## Tech Stack
| Layer | Tool |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 + CSS custom properties (`@theme`) |
| Language | TypeScript (strict) |
| Mock data | `mocks/user.ts`, `app/api/mock/**` |
| Components | Atomic Design (atoms → molecules → organisms) |

---

## Design System

### Single Source of Truth: `app/globals.css`
All design tokens live in `@theme {}`. Change here → changes everywhere.

```
Color tokens:    --color-primary/dark/light
                 --color-secondary/dark
                 --color-accent/dark
                 --color-danger/dark
                 --color-success/dark
                 --color-purple/dark
                 --color-coin, --color-coin-bg, --color-coin-border
                 --color-surface, --color-surface-muted, --color-border
                 --color-ink, --color-ink-muted, --color-ink-faint

Shadow utilities: .shadow-press-primary/secondary/accent/danger/purple/success
                  .shadow-card, .shadow-card-md
Gradient utils:   .bg-hero-kids (green→blue), .bg-xp-bar (primary gradient)
Animations:       .animate-float, .animate-bounce-in, .animate-pop-in,
                  .animate-slide-up, .animate-fade-in-up, .animate-shake
```

**Rule:** Never use hardcoded hex colors in components. Use `text-primary`, `bg-danger`, etc.

---

## Component Architecture

```
components/
├── atoms/              ← Stateless, single-purpose (Button, Badge, Input, Modal…)
│   ├── Button.tsx      adult/shared button (variants: primary/secondary/outline/ghost/danger)
│   ├── Badge.tsx       status badge
│   ├── Input.tsx       form input with label + error
│   ├── Modal.tsx       overlay modal
│   ├── Select.tsx      form select
│   └── …
│
├── molecules/          ← Composed of atoms (PageHeader, Card, TabBar…)
│   ├── Sidebar.tsx     dashboard sidebar nav
│   ├── CourseCard.tsx  course listing card
│   ├── CalendarGrid.tsx calendar UI
│   └── …
│
├── organisms/          ← Full sections (DashboardOverview, CalendarView…)
│   └── …
│
├── lesson/             ← Lesson engine + step components
│   ├── LessonEngine.tsx       orchestrates lesson flow
│   ├── LessonProgress.tsx     progress bar + hearts
│   ├── LessonCharacter.tsx    companion reaction in lessons
│   ├── StepMultipleChoice.tsx
│   ├── StepFillBlank.tsx
│   ├── StepMatchPairs.tsx
│   ├── StepTranslate.tsx
│   ├── StepWordOrder.tsx
│   ├── StepTheory.tsx
│   ├── StepReading.tsx
│   ├── StepImage.tsx
│   └── StepVideo.tsx
│
└── kids/               ← Kids section components
    ├── CompanionSVG.tsx       6 animals × 10 moods SVG mascot
    │                          export type CompanionMood (10 values)
    └── ui/                    ← Kids design system primitives
        ├── index.ts           barrel export (import from here)
        ├── KidsButton.tsx     3D press button (variants → shadow-press-* tokens)
        ├── KidsCard.tsx       card variants (default/hero/special/success/flat)
        ├── KidsPageHeader.tsx sticky header (back + title + right slot)
        ├── KidsStatBar.tsx    streak 🔥 + XP bar + coins 🪙
        ├── KidsCoinBadge.tsx  coin balance pill (coin-* tokens)
        ├── KidsTabBar.tsx     colored tab bar with counter badges
        ├── KidsChallengeItem.tsx  daily challenge row (done/todo states)
        ├── KidsNavCard.tsx    3D colored nav tile
        ├── KidsToast.tsx      slide-up success toast
        └── KidsProgressBar.tsx    gamified XP progress bar
```

---

## Routing Structure

```
app/
├── page.tsx                  → / (landing / redirect)
├── home/page.tsx             → /home (marketing home)
├── auth/
│   ├── register/page.tsx     → /auth/register
│   └── profile/page.tsx      → /auth/profile
│
├── (onboarding)/             ← Onboarding flow (shared layout)
│   ├── layout.tsx
│   ├── welcome/page.tsx      → /welcome
│   ├── login/page.tsx        → /login
│   ├── onboarding/page.tsx   → /onboarding (role/level selection)
│   ├── placement/page.tsx    → /placement (placement test)
│   └── companion/page.tsx    → /companion (pick mascot)
│
├── dashboard/                ← Adult/teacher dashboard
│   ├── layout.tsx            sidebar nav
│   ├── page.tsx              → /dashboard
│   ├── lessons/page.tsx      → /dashboard/lessons
│   ├── students/page.tsx     → /dashboard/students
│   ├── student/page.tsx      → /dashboard/student
│   ├── teachers/page.tsx     → /dashboard/teachers
│   ├── teacher/page.tsx      → /dashboard/teacher
│   ├── analytics/page.tsx    → /dashboard/analytics
│   ├── calendar/page.tsx     → /dashboard/calendar
│   ├── teacher-calendar/     → /dashboard/teacher-calendar
│   ├── chat/page.tsx         → /dashboard/chat
│   ├── library/page.tsx      → /dashboard/library
│   ├── payments/page.tsx     → /dashboard/payments
│   ├── prizes/page.tsx       → /dashboard/prizes
│   ├── profile/page.tsx      → /dashboard/profile
│   ├── settings/page.tsx     → /dashboard/settings
│   └── course-builder/       → /dashboard/course-builder
│
├── (kids)/                   ← Kids section (separate layout)
│   ├── layout.tsx
│   └── kids/
│       ├── dashboard/page.tsx → /kids/dashboard ⭐ (gamified home)
│       ├── room/page.tsx      → /kids/room       ⭐ (2.5D isometric room)
│       └── shop/page.tsx      → /kids/shop       ⭐ (item shop)
│
├── courses/[courseSlug]/     → /courses/:slug
│   ├── page.tsx
│   ├── layout.tsx
│   └── lessons/[lessonSlug]/page.tsx → /courses/:slug/lessons/:slug
│
├── library/
│   ├── page.tsx              → /library
│   ├── layout.tsx
│   └── [programSlug]/page.tsx → /library/:slug
│
├── calendar/page.tsx         → /calendar
│
└── api/mock/                 ← Mock REST endpoints (no real backend)
    ├── users/route.ts
    ├── users/[userSlug]/progress/route.ts
    ├── courses/route.ts
    ├── lessons/route.ts
    ├── calendar/route.ts
    └── quiz/route.ts
```

---

## Data Layer

### Mock Data (`mocks/user.ts`)
All user types and mock instances. Used across frontend for demo.

```typescript
Role: "kids" | "adult" | "teacher" | "parent" | "admin"
CompanionAnimal: "fox" | "cat" | "dragon" | "rabbit" | "raccoon" | "frog"
CompanionMood: "idle"|"happy"|"sad"|"celebrate"|"excited"|"sleepy"|"surprised"|"love"|"angry"|"cool"
```

### API Mocks (`app/api/mock/`)
REST routes returning JSON. Used via `lib/fetcher.ts` or `lib/mockClient.ts`.

### Role Context (`lib/roleContext.tsx`)
React context for current user role. Used by `RoleGuard` atom.

---

## Kids Section — Detailed

### `/kids/dashboard` (KidsDashboardPage)
- **Layout:** mobile=vertical, desktop=2-col (sticky companion left, scrollable right)
- **State:** `mood` (CompanionMood), `bubble` (string), `bounceKey` (number)
- **Companion:** click cycles through 10 moods → bounce-in animation
- **Components used:** `KidsStatBar`, `KidsCard(hero)`, `KidsChallengeItem`, `KidsNavCard`, `KidsButton(primary)`, `KidsProgressBar`

### `/kids/shop` (ShopPage)
- **Layout:** full-width grid, responsive 2→3→4 columns
- **State:** `activeTabId`, `bought` (Set), `balance` (coins), `toast`
- **Tab → variant map:** furniture=secondary, decor=purple, outfit=accent, special=danger
- **Components used:** `KidsPageHeader`, `KidsCoinBadge`, `KidsTabBar`, `KidsButton`, `KidsToast`, `ShopItemCard` (local)

### `/kids/room` (KidsRoomPage)
- **Complex 2.5D isometric room** with draggable furniture
- **Coordinate system:** `rx` (left-right 0-100), `ry` (back-front 0-100)
- **Projection:** `itemBottom(ry)`, `itemScale(ry)` for perspective
- **Persistence:** localStorage key `room-layout-v1`
- **State:** `floorItems`, `wallItems`, `zOrder`, `sizes`, `companionMood`
- **SVG furniture:** BedSVG→real PNG, DeskSVG, BookshelfSVG, PlantSVG, FloorLampSVG, RugSVG
- **Note:** Heavy SVG/interaction code — inline styles partially exempt (SVG transforms)

---

## Conventions

| Rule | Detail |
|------|--------|
| Imports | `@/components/...`, `@/mocks/...`, `@/lib/...` |
| Kids UI | Always import from `@/components/kids/ui` (barrel) |
| Colors | Use `text-primary`, `bg-danger` etc. — never `#hex` |
| Shadows | Use `shadow-press-*` utilities — never inline `boxShadow` |
| Inline styles | Forbidden except: SVG transforms, dynamic CSS var values in KidsTabBar |
| `"use client"` | Only on pages/components with state or event handlers |
| Font weight | Minimum `font-semibold` for UI labels; `font-black` for headings/CTAs |

---

## Adding a New Kids Page Checklist
1. Create `app/(kids)/kids/[page]/page.tsx`
2. Add `"use client"` if state needed
3. Import from `@/components/kids/ui` for all primitives
4. Use design tokens (no hex)
5. Add mobile + desktop layout (`flex-col md:flex-row`)
6. Update this file → Routing section + Kids Section detail
