# Teacher Module — Implementation Plan & Progress

> **Live tracker for the teacher account build.** Every non-trivial change during the build updates this file so the next session (after compaction) has full context.
>
> **Source spec:** `/Users/oleksandrsimcenko/Downloads/Викладачі.pdf` (13 pages, sections 1–9).
> **Goal:** production-ready frontend for the teacher portal. Backend = placeholders (local `useState`, mock data, fake async). Single Tailwind design system, zero inline styles, reusable primitives.
> **Rule:** no `git push`. Local commits only.

---

## Ground rules (restate each session)

1. Tailwind-only styling — tokens live in `app/globals.css` `@theme`. No `style={{}}` except for genuinely dynamic values (progress width, runtime transforms).
2. No new top-level markdown or folders beyond what `ARCHITECTURE.md` lists.
3. Reuse existing atoms (`Button`, `Card`, `Badge`, `Modal`, `SlideOver`, `Input`, `InfoPopover`). New shared teacher primitives live in `components/teacher/ui/` (barrel export).
4. Shared types + mocks live in `lib/teacher-mocks.ts`. Replace with real API in a single swap.
5. Every new route: under `app/dashboard/*`, reuse `app/dashboard/layout.tsx` which already mounts the Sidebar.
6. Sidebar teacher nav must be expanded to cover every section (currently only 2 items).
7. After every phase: update this file's "Progress" + "Running log"; commit locally; don't push.

---

## Directory targets

```
app/dashboard/
├── teacher/                   ← dashboard (Section 2) — exists, needs upgrade
├── teacher-calendar/          ← schedule (Section 4) — exists, needs day/week + actions
├── teacher-library/           ← lesson library (Section 3) — NEW
│   └── [id]/edit/             ← lesson editor — NEW
├── students/                  ← students (Section 5) — exists, extend for teacher role
├── groups/                    ← groups list (5.3) — NEW
├── homework/                  ← homework list (Section 6) — NEW
│   └── [id]/review/           ← HW review — NEW
├── mini-tasks/                ← mini-tasks builder (Section 7) — NEW
├── chat/                      ← chat (Section 8) — exists, rewrite
├── analytics/                 ← analytics (Section 9) — exists, extend
└── attendance/                ← attendance journal (4.4) — NEW

components/teacher/ui/         ← shared primitives (barrel)
lib/teacher-mocks.ts           ← all teacher types + fixtures
```

---

## Phases

### ✅ Phase A — Foundation

**Done:**
- [x] `lib/teacher-mocks.ts` — types: `Level`, `LessonStatus`, `HomeworkStatus`, `LessonSource`, `LessonMode`, `BlockKind`, `HomeworkKind`, `MiniTaskKind`. Entities: `Student`, `Group`, `ScheduledLesson`, `LibraryLesson`, `LessonBlock`, `HomeworkTask`, `MiniTask`, `ChatThread`, `ChatMessage`, `TeacherNote`. Fixtures: `MOCK_STUDENTS`, `MOCK_GROUPS`, `MOCK_SCHEDULE`, `MOCK_LIBRARY`, `MOCK_HOMEWORK`, `MOCK_MINI_TASKS`, `MOCK_CHAT_THREADS`. Style maps: `LEVEL_STYLES`, `LESSON_STATUS_STYLES`, `HOMEWORK_STATUS_STYLES`, `LESSON_SOURCE_LABELS`, `HOMEWORK_KIND_LABELS`, `BLOCK_KIND_LABELS`, `MINI_TASK_LABELS`. Helpers: `getStudent`, `getGroup`, `lessonsOnDate`, `upcomingLessons`, `pendingHomework`, `atRiskStudents`.
- [x] `components/teacher/ui/` barrel with: `LevelBadge`, `StatusPill`, `SearchInput`, `FilterChips`, `EmptyState`, `StatTile`, `CoinTag`, `PageHeader`, `SegmentedControl`.

**Remaining:**
- [ ] Expand Sidebar teacher nav (add Розклад, Бібліотека, ДЗ, Міні-завдання, Чат, Аналітика, Групи).

### Phase B — Dashboard (Section 2)

Target file: `app/dashboard/teacher/page.tsx` (existing).

- [ ] Block 2.1 "Schedule today" — keep + polish (use shared primitives).
- [ ] Block 2.2 "Unchecked homework" — list (submitted HW, oldest first), counter with badge: yellow if >10, red if >20. Button "Перевірити" → `/dashboard/homework/[id]/review`.
- [ ] Block 2.3 "Students at risk" — low-balance (1–2 lessons left) OR `missedHomeworkStreak >= 3`. Per-row "Написати" (student chat) / "Написати батькам" (parent chat).

### ✅ Phase C — Library (Section 3)

**Done:**
- [x] `app/dashboard/teacher-library/page.tsx` — source + level filters, search, grid/list toggle, LessonCard + ListView, AssignLessonModal trigger.
- [x] `components/teacher/AssignLessonModal.tsx` — reusable assign flow (student/group, format, date, deadline, coins).
- [x] `app/dashboard/teacher-library/[id]/edit/page.tsx` — editor with breadcrumb + autosave indicator, title + level + topic, Save/Template/Versions buttons, edit↔preview SegmentedControl, BlockDivider between blocks, version history SlideOver, toast feedback.
- [x] `components/teacher/BlockPicker.tsx` — modal grid of all 12 block kinds.
- [x] `components/teacher/LessonBlockEditor.tsx` — per-kind edit panels with move/duplicate/delete toolbar.
- [x] `components/teacher/LessonBlockPreview.tsx` — read-only renderer for all 12 kinds (interactive MCQ + flashcards flip).

### ✅ Phase D — Schedule (Section 4)

**Done:**
- [x] `app/dashboard/teacher-calendar/page.tsx` rewritten — day/week/month SegmentedControl, ‹/›/Сьогодні date navigator, +Урок button, month view uses existing CalendarGrid with MOCK_SCHEDULE.
- [x] DayView — 08:00–22:00 timeline, click empty slot → prefilled CreateLessonModal, click lesson → LessonActionSheet.
- [x] WeekView — Mon–Sun columns × hours grid with compact LessonPill cells.
- [x] `components/teacher/CreateLessonModal.tsx` — student/group, date+time, duration, level, mode (4 options), lesson ref from library, recurrence, notes.
- [x] `components/teacher/LessonActionSheet.tsx` — Modal with Почати/Провести/Відвідуваність (group)/Призначити ДЗ/Нотатка/Перенести/Скасувати, with inline sub-forms for cancel-reason, reschedule-date, note.
- [x] `app/dashboard/attendance/page.tsx` — scope toggle (students/groups), group picker, month navigator, sticky first column, deterministic mark seed from schedule + homework rate, cell cycle (present→late→absent→empty), per-row % + footer stats, Excel/PDF export mock alerts.

### ✅ Phase E — Students & Groups (Section 5)

**Done:**
- [x] `app/dashboard/students/page.tsx` — teacher mode now gets Level FilterChips + Status/low-balance FilterChips + new "Дії" column with 3 quick-action icon buttons (chat, lessons, assign HW).
- [x] `components/molecules/StudentDetail.tsx` — teacher tab list extended to 5 (Уроки, Історія, ДЗ, Прогрес, Нотатки). "ДЗ" renders from MOCK_HOMEWORK with status pill. "Нотатки" has textarea + chronological list with local add.
- [x] `app/dashboard/groups/page.tsx` — group cards with level, members avatar stack, attendance%, HW%. Row click opens SlideOver with stats, members list, next/last lessons, "Призначити ДЗ" (AssignLessonModal) + "Чат групи" buttons.

### ✅ Phase F — Homework (Section 6)

**Done:**
- [x] `components/teacher/CreateHomeworkModal.tsx` — title + 7-kind grid + description + attachments placeholder + target toggle (student/group) + deadline + coins (5–50) + bonus (0–10) + save-as-template checkbox + toast on submit.
- [x] `app/dashboard/homework/page.tsx` — SegmentedControl tabs (Всі / На перевірці / Перевірено / Повернуто / Прострочено) + search + table (учень/група · завдання · дедлайн з warn/danger toning · статус · монети · action). Opens CreateHomeworkModal.
- [x] `app/dashboard/homework/[id]/review/page.tsx` — subject card, description, submission preview (text/audio/video/file/library-lesson), grade panel (qualitative Excellent/Good/NI OR numeric 1–12 with auto default coins), coins + bonus sliders, comment textarea with required-on-return guard, Підтвердити / Повернути actions with success screen + redirect.
- [x] "Правила нарахування" sidebar card with 5-row coin table (6.5) on review page.

### ✅ Phase G — Mini-tasks (Section 7)

**Done:**
- [x] `lib/teacher-mocks.ts` — added `MINI_TASK_ICONS` + `MINI_TASK_DESCRIPTIONS` maps.
- [x] `components/teacher/MiniTaskBuilder.tsx` — 5-step wizard (stepper with done/active states). Step 1: 6-type grid. Step 2: dynamic content per kind (quiz → MCQ editor up to 10Q; word-of-day → word/translation/example; listening → URL + comprehension Q; sentence-builder → words string). Step 3: Level picker + topic + duration slider. Step 4: coins 1–20. Step 5: target (student/group/library) + save-as-template checkbox + summary card. Validates before advancing.
- [x] `app/dashboard/mini-tasks/page.tsx` — kind FilterChips + search + responsive card grid (type icon, title, level badge, topic/duration/questions pills, CoinTag, assigned count, avgScore toned by threshold). Per-card "Призначити" + "Перегляд" toasts. Opens MiniTaskBuilder.

### ✅ Phase H — Chat (Section 8)

**Done:**
- [x] `components/teacher/MassMessageModal.tsx` — audience picker (all-students / all-parents / group / level) with dynamic group/level selector, recipient count, body textarea, toast on send.
- [x] `app/dashboard/chat/page.tsx` — rewritten for teacher role.
  - Tabs (Усі/Учні/Батьки/Групи) via SegmentedControl.
  - Thread list: search, avatar fallback (🧩 for groups), unread badge, pinned 📌, last-message preview, last-message time.
  - Active pane: thread header, search-in-thread toggle, pinned-banner (first pinned message), reply-quoting with preview strip, emoji tray toggle, 📎 / 🎙 placeholders, read-receipt ✓/✓✓.
  - Mobile: stacked list/thread panes with back button.
  - "Написати всім" opens MassMessageModal.

### ✅ Phase I — Analytics (Section 9)

**Done:**
- [x] `components/teacher/TeacherAnalytics.tsx` — 4 KPI tiles (lessons/month, HW pending, attendance %, avg grade), 6-month bar chart with metric switcher (lessons/homework/grade), student level distribution sidebar, honor-roll top-3 (🥇🥈🥉 by HW completion).
- [x] `app/dashboard/analytics/page.tsx` — detects role from localStorage (demo_role / sidebar_role) and renders TeacherAnalytics for teacher; falls back to existing admin analytics otherwise.

### ✅ Phase J — Verification

**Done:**
- [x] `npx tsc --noEmit` clean (0 errors).
- [x] `jest` green (23/23 passing).
- [x] `next build` succeeds (50 routes prerendered — up from 34; 9 new teacher routes).
- [x] `ARCHITECTURE.md` §3 (routing map: +8 teacher entries) + §8 (component taxonomy: teacher/ui barrel).
- [x] `REFACTOR_PLAN.md` — F7 section added with phase breakdown + running log entry.
- [x] Local commit (user rule: no push).

---

## Running log

- **2026-04-19** — Plan file created. Phase A scaffolding done:
  - `lib/teacher-mocks.ts` (all types + fixtures + style maps + helpers).
  - `components/teacher/ui/` with 9 primitives (barrel).
  - Next: expand Sidebar, then move to Phase B.
- **2026-04-19** — Phases A1 (Sidebar), B (dashboard), C (library + editor) complete. `npx tsc --noEmit` clean.
  - Sidebar grouped teacher nav (Огляд / Учні / Навчання / Комунікація).
  - Dashboard rewritten around sections 2.1–2.3 (today schedule, pending HW with yellow>10/red>20 thresholds, at-risk students with chat links).
  - Library list + lesson editor: 12-kind block picker, per-kind editors, interactive preview mode, version history drawer, autosave mock.
- **2026-04-19** — Phase D complete. `npx tsc --noEmit` clean.
  - Calendar rewritten: day/week/month views, shared LessonPill, date navigator.
  - CreateLessonModal + LessonActionSheet shared across views.
  - Attendance journal: sticky student column, cycle-click marks, per-row + overall %, Excel/PDF export mock.
- **2026-04-19** — Phase E complete. `npx tsc --noEmit` clean.
  - Students page: teacher filters + quick actions.
  - StudentDetail: ДЗ + Нотатки tabs for teacher.
  - Groups page with card grid + SlideOver detail.
- **2026-04-19** — Phase F complete. `npx tsc --noEmit` clean.
  - CreateHomeworkModal (all fields per 6.1–6.3: title/kind/desc/attachments/target/deadline/coins/bonus/template).
  - Homework list: 5-tab SegmentedControl with counts, search, table with dynamic deadline toning (danger<0, warn≤2d).
  - Review page: 2-column layout (submission + grading on left, rules + summary sidebar). Dual grade modes (qualitative/numeric) with auto-default coin mapping. Comment required on return, success screen before redirect.
- **2026-04-19** — Phase G complete. `npx tsc --noEmit` clean.
  - MiniTaskBuilder 5-step wizard with per-kind dynamic content editors.
  - Mini-tasks list page: kind filter chips + card grid + per-card actions.
  - Added MINI_TASK_ICONS/DESCRIPTIONS to teacher-mocks.
- **2026-04-19** — Phase H complete. `npx tsc --noEmit` clean.
  - Chat rewritten end-to-end: SegmentedControl tabs (Усі/Учні/Батьки/Групи), searchable thread list with pinned/unread badges, thread pane with reply-quoting, emoji tray, pinned-banner, search-in-thread, read receipts, attachment/voice placeholders, mobile stacked nav.
  - MassMessageModal with 4 audiences (all-students/all-parents/group/level) and dynamic recipient count.
- **2026-04-19** — Phase I complete. `npx tsc --noEmit` clean.
  - TeacherAnalytics component: KPI tiles, 6-month bar chart with metric switcher, level distribution, honor-roll top-3.
  - Analytics page role-switches between teacher/admin views via localStorage.
- **2026-04-19** — Phase J complete. Full verification passed.
  - `tsc --noEmit` 0 errors; `jest` 23/23 green; `next build` 50 routes prerendered.
  - ARCHITECTURE.md §3/§8 updated; REFACTOR_PLAN.md F7 section appended.
  - **Teacher module build complete.** All 9 PDF spec sections covered.

---

## Design notes worth preserving

- **STATUS_CFG pattern.** Every domain-status map lives in `lib/teacher-mocks.ts`, not in page files. Each entry: `{ label, cls, dot?, bar? }`. Consumers always pick through `X_STATUS_STYLES[status]`.
- **Level palette (memorized).** A0 = danger (red), A1 = accent-light, A2 = accent, B1 = success (green), B2 = purple, C1 = secondary (blue). Do not invent new gradients — use `LEVEL_STYLES`.
- **Primitives over page components.** If a UI element appears on 2+ teacher pages, it goes to `components/teacher/ui/`. Page files import via barrel: `import { LevelBadge, FilterChips } from '@/components/teacher/ui'`.
- **Modal vs SlideOver.** Use `Modal` for create/edit forms (≤3 fields, focused). Use `SlideOver` for detail drawers (read + tabs). Don't mix.
- **Teacher-vs-admin gating.** `app/dashboard/students/page.tsx` already checks `localStorage.getItem('sidebar_role') === 'teacher'` — follow the same convention.
- **No push.** The user is explicit about this. `git commit` locally only.

---

## Files touched (append as we go)

### Created
- `lib/teacher-mocks.ts`
- `components/teacher/ui/LevelBadge.tsx`
- `components/teacher/ui/StatusPill.tsx`
- `components/teacher/ui/SearchInput.tsx`
- `components/teacher/ui/FilterChips.tsx`
- `components/teacher/ui/EmptyState.tsx`
- `components/teacher/ui/StatTile.tsx`
- `components/teacher/ui/CoinTag.tsx`
- `components/teacher/ui/PageHeader.tsx`
- `components/teacher/ui/SegmentedControl.tsx`
- `components/teacher/ui/index.ts`
- `components/teacher/AssignLessonModal.tsx`
- `components/teacher/BlockPicker.tsx`
- `components/teacher/LessonBlockEditor.tsx`
- `components/teacher/LessonBlockPreview.tsx`
- `components/teacher/CreateLessonModal.tsx`
- `components/teacher/LessonActionSheet.tsx`
- `app/dashboard/teacher-library/page.tsx`
- `app/dashboard/teacher-library/[id]/edit/page.tsx`
- `app/dashboard/attendance/page.tsx`
- `app/dashboard/groups/page.tsx`
- `docs/teacher-module-plan.md` (this file)

### Edited
- `app/dashboard/teacher/page.tsx` — rewrote around Section 2 (schedule/HW/at-risk).
- `app/dashboard/teacher-calendar/page.tsx` — rewrote with day/week/month views + action sheet + create modal.
- `app/dashboard/students/page.tsx` — teacher mode: level/status filters + quick-action column.
- `components/molecules/StudentDetail.tsx` — added homework + notes tabs for teacher.
- `components/molecules/Sidebar.tsx` — grouped teacher nav (4 groups covering every teacher section).
