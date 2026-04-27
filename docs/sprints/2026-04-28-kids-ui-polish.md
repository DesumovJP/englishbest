# Kids UI Polish Sprint — 2026-04-28

5 UX/UI fixes across kids pages. One commit per task.

## 1. Center lesson card titles in carousel
- **File:** `frontend/components/kids/LessonCarouselSection.tsx`
- **Where:** `LessonCard` component, lines 126–142 (CENTRE block).
- **Change:** add `justify-center` to the flex container; add `text-center` and remove left bias on the `h3`.

## 2. Lesson close (X) returns to correct course; accordion polish
- **Files:**
  - `frontend/components/kids/LessonCarouselSection.tsx` + `LessonTreeSection.tsx`
    - On course-select, persist slug to `sessionStorage['kids:lastCourseSlug']`.
    - Read it in default-course pickers — if present and matches a visible course, use it.
  - `frontend/components/lesson/LessonEngine.tsx`
    - On mount, write `lesson.courseSlug` to the same key so the X / Success → /kids/school resolves correctly.
  - `frontend/components/kids/LessonTreeSection.tsx`
    - Accordion items: add course description (clamp 2 lines) + a "Слова курсу" Link button to `/kids/library/{slug}` (course detail also lists the vocab) — keeps semantics consistent.

## 3. Dashboard widgets: Tasks + Streak/Progress
- **File:** `frontend/components/kids/MiniTaskWidget.tsx`
  - Re-balance: task TITLE becomes the prominent line; small icon + label collapses; coin reward becomes an inline pill, not a separate row.
- **File:** `frontend/app/(kids)/kids/dashboard/page.tsx` — `ProgressWidget`
  - Replace "не зривай!" with positive copy ("ще +1 день").
  - Tighten layout below progress bar — flame + count + soft pill chip on one line, no border-only separator.

## 4. Full-width navbar on kids/vocab and kids/library detail
- **Files:**
  - `frontend/app/(kids)/kids/vocab/[id]/page.tsx` — Header
  - `frontend/app/(kids)/kids/library/[id]/page.tsx` — Header
- **Change:** remove `max-w-screen-md mx-auto` from the **Header**'s inner row so back-button hugs the left edge and the bar spans the viewport. Content sections keep their `max-w-screen-md` centring.

## 5. Homework pages — unify with library/vocab
- **List** (`frontend/app/(kids)/kids/homework/page.tsx`)
  - Add a `Header` (sticky, surface-raised, no back) matching library/vocab look — title row + counter chip.
  - Tabs become an `ios-seg`-like row below the header.
  - Body: rows already use a list pattern; align hairline + spacing with vocab/library.
- **Detail** (`frontend/app/(kids)/kids/homework/[id]/page.tsx`)
  - Replace `KidsPageHeader` with the library/vocab `Header` (full-width navbar, back + breadcrumb).
  - HERO: chip row (status + due) + title + description, like vocab/library.
  - Card stack stays centred via `max-w-screen-sm mx-auto`.
