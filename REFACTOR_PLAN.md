# EnglishBest — Refactor Plan (live tracker)

> Single source of truth for the production-readiness refactor.
> Updated after every completed step. Read top-to-bottom.
>
> **Goal:** Production-ready frontend, fully responsive (portrait + landscape, all devices),
> unified design system with zero inline styles, clean seam for future backend integration.

---

## Session rules

- No `git push` during this refactor (local commits only). User must approve any push explicitly.
- No new markdown files except this one and `ARCHITECTURE.md`.
- Every structural change → update this file + `ARCHITECTURE.md` in the same commit.
- Commits are small and scoped per step.

---

## Phases

### F0 — Repo cleanup
- [x] Delete stale md: `PLAN.md`, `PROGRESS.md`, `TODO_FRONTEND.md`, `FRONTEND_AUDIT.md`, `REFACTOR.md`, `TYPOGRAPHY.md`, `KIDS_ZONE.md`, `LESSON_PLAN.md`, `ROOM_2_5D_PLAN.md`, `tasks.md`, `prompt.md`
- [x] Delete stray root PNGs: `dash-initial.png`, `hero-current.png`, `hero-new.png`, `login-current.png`
- [x] Delete empty route groups: `app/(admin)`, `app/(adult)`, `app/(parent)`, `app/(teacher)`
- [x] Remove `@source not "../PLAN.md"` from `globals.css`
- [x] Remove `.playwright-mcp/` if not committed artifacts
- [x] Keep: `README.md`, `AGENTS.md`, `CLAUDE.md`, `ARCHITECTURE.md` (to be rewritten), `REFACTOR_PLAN.md` (this file)

### F1 — Architecture document
Rewrite `ARCHITECTURE.md` from scratch to cover:
- [x] Tech stack + version pins
- [x] Directory layout (every top-level folder, purpose, conventions)
- [x] Routing map (every route, layout, group, dynamic segment)
- [x] Data layer: mock → `lib/fetcher.ts` seam → planned REST contracts (for backend)
- [x] State model: where local state lives, what persists, IndexedDB stores
- [x] Design tokens reference (colors, radii, typography, shadows, gradients)
- [x] Responsive contract (breakpoints, orientation, safe-area, viewport units)
- [x] Component taxonomy (atoms → molecules → organisms → kids → lesson)
- [x] Kids zone subsystem (companion, inventory, shop, room, school)
- [x] Coding conventions (imports, `"use client"`, styling rules)
- [x] Backend integration checklist (what to swap when API is ready)

### F2 — Design system audit
**Baseline inventory (2026-04-15):** 522 inline `style={{…}}` across 30 files, 591 hex literals across 18 files. Target: retain only genuinely dynamic inline styles (per-item colors, SVG/geometry transforms); replace the rest.

Kids pages:
- [x] `/kids/achievements` — 18→0 inline, 17→0 hex
- [x] `/kids/coins` — 52→0 inline, 41→0 hex
- [x] `/kids/library/[id]` — 54→1 inline (dynamic cover), 49→0 hex
- [x] `/kids/dashboard` — 15→dynamic-only, 6 hex are data (event colors)
- [x] `/kids/lessons` — 37→dynamic-only, 24→0 hex
- [x] `/kids/school` — 65→dynamic-only, 38→data-only (per-unit accent, COVER_BG per type)
- [x] `/kids/shop` — 131→2 dynamic (bgValue preview, slot coords), 111 hex → data-only (BACKGROUNDS gradients); RARITY consolidated from 3 hex maps into 1 Tailwind class map
- [x] `/kids/characters` — 65→dynamic-only, 57→0 hex
- [x] `/kids/room` — 30→1 dynamic (activeRoom.bg), 17 hex are room data gradients

Kids components:
- [x] `AddCustomModal.tsx` — 2 redundant `borderWidth:3` removed; RARITIES / TABS hex + custom-room bg upload are genuine user-data (kept)
- [x] `LootBox.tsx` — 11 static inline → Tailwind (sizes, fixed delays, modal bg, coin imgs); remaining 8 are dynamic (per-rarity glow/filter/bg, per-particle geom, per-star xy)
- [x] `ItemDisplay.tsx` — 1 inline is dynamic (per-item `color` user data with `#e0f2fe` fallback)
- [x] `CharacterAvatar.tsx` — 1 inline is dynamic (`size` prop) + OUTFIT_STYLE is a per-slot CSSProperties table (keep; 3 static rows, used by dynamic keys)
- [x] `KidsFooter.tsx` — 3 inline → Tailwind (safe-area pb, icon size, badge font-size); active transform/filter moved to classes
- [x] `kids/ui/*` primitives — KidsStatBar/KidsCoinBadge coin+xp imgs → width/height attrs; KidsChallengeItem label styling → conditional classes; KidsTabBar hardcoded white text + white/30 + black/08 → Tailwind classes. ProgressBar/KidsProgressBar `width: pct%` and SpeechBubble `maxWidth` prop kept inline (dynamic).
- [ ] `CompanionSVG.tsx` — 173 hex (SVG fill art, NOT to refactor)

Other:
- [ ] `/dashboard/analytics`, `/dashboard/lessons` — small counts
- [ ] `/home` — 1 inline
- [ ] `/(onboarding)/*` — 1 inline each
- [ ] Lesson step components — small
- [x] `components/molecules/*` — PopupTimer overlay `bg-slate-900/55 backdrop-blur-[6px]`. ReviewsSlider transform/width are index/perPage-driven (dynamic, kept).

- [ ] Confirm typography uses `.type-*` classes everywhere (still ad-hoc `text-[Npx]` in rewritten files; revisit once all conversions done)
- [ ] Add missing tokens exposed by the audit to `@theme` (e.g. shadow-press-sm for `[0_3px_0_*]` repeats)
- [ ] Dedupe overlapping animations (`.animate-*` vs `.tk-animate-*`)

### F3 — Responsive contract
- [x] Use Tailwind v4 default breakpoints (sm 640, md 768, lg 1024, xl 1280, 2xl 1536); no custom xs needed — mobile-first base handles <640
- [x] Adopt `dvh` in full-screen/interactive surfaces (lesson engine + success, onboarding welcome/login/onboarding/placement/layout, app/layout body, home, dashboard/lessons, dashboard/chat, dashboard/parent, Sidebar md:h) and `svh` in stable scroll layouts (dashboard/library/calendar/auth layouts)
- [x] Safe-area paddings already applied via `pt-[env(safe-area-inset-top,...)]` in kids pages + `pb-[env(safe-area-inset-bottom,0px)]` in KidsFooter (F2 batch 6)
- [x] Typography: `--text-display` → `clamp(2.25rem, 4vw + 1.25rem, 3.5rem)`, `--text-h1` → `clamp(1.625rem, 2vw + 1rem, 2.25rem)`, `--text-h2` → `clamp(1.25rem, 1vw + 0.9rem, 1.5rem)`
- [ ] Landscape rules: short-viewport (`@media (max-height: 480px)`) compact headers/collapsible sidebars — deferred until F4 per-page pass reveals specific offenders
- [ ] Test matrix execution — rolled into F4 (iPhone SE / 15 / iPad portrait / iPad landscape / 13" / 27")

### F4 — Page-by-page responsive pass
For each page: verify layout + interactions at all 6 viewports, portrait + landscape.
- [ ] `/` + `/home` (landing)
- [ ] `/welcome`, `/login`, `/onboarding`, `/placement`, `/companion`
- [ ] `/auth/register`, `/auth/profile`
- [ ] `/dashboard` + every subpage (lessons, students, teachers, analytics, calendar, chat, library, payments, prizes, profile, settings, course-builder)
- [ ] `/kids/dashboard`, `/kids/lessons`, `/kids/library`, `/kids/school`, `/kids/shop`, `/kids/room`, `/kids/characters`, `/kids/coins`, `/kids/achievements`
- [ ] `/courses/[slug]` + `/courses/[slug]/lessons/[slug]`
- [ ] `/library` + `/library/[slug]`
- [ ] `/calendar`

### F5 — Component + data refactor
- [ ] Extract duplication (repeated layout shells, headers)
- [ ] Split large components (>300 LOC) where it improves clarity
- [ ] Ensure every data read goes through `lib/fetcher.ts` (no raw `fetch` in pages)
- [ ] Type all API boundaries (`lib/api.ts` exports `Types` used everywhere)
- [ ] Add `.env.example` with `NEXT_PUBLIC_API_BASE_URL` (default `/api/mock`)

### F6 — Verification
- [ ] `npm run lint` clean
- [ ] `tsc --noEmit` clean
- [ ] `jest` green
- [ ] `next build` succeeds
- [ ] Manual Playwright pass on test matrix
- [ ] Final `ARCHITECTURE.md` matches the codebase

---

## Running log

- **2026-04-15** — Plan created. Beginning F0 cleanup.
- **2026-04-15** — F0 done (stale md, root PNGs, empty route groups removed; `@source not "../PLAN.md"` stripped).
- **2026-04-15** — F1 done: `ARCHITECTURE.md` rewritten (13 sections: stack, directory, routing, data, state, design tokens, responsive contract, components, kids subsystem, conventions, backend checklist, per-page + per-token how-tos).
- **2026-04-15** — F2 batch 1: achievements, coins, library/[id] fully detoxed (124 inline + 107 hex eliminated, only legitimate dynamic values remain).
- **2026-04-15** — F2 batch 2: kids/lessons, kids/characters detoxed (102 inline + 81 hex → only runtime-dynamic values remain: scroll-scale, per-card accent gradient, per-outfit slot accent). tsc clean; lint errors all pre-existing.
- **2026-04-15** — F2 batch 3: kids/dashboard, kids/room detoxed. All static styling moved to Tailwind; remaining inline = activeRoom.bg, per-event color, placed-item coords, equipped-item slot offsets. Hex literals that remain are pure data (event colors, gradient room presets).
- **2026-04-15** — F2 batch 4: kids/school detoxed (732 LOC). Per-unit accent fed via CSS var `--accent`; `bg-[color:var(--accent)]/10` etc. Library row gets `--accent` + `--cover-bg`. Carousel: scroll-snap + `px-[calc(50%-clamp(140px,31vw,190px))]`; per-card transform/opacity kept inline (runtime scroll-driven).
- **2026-04-15** — F2 batch 5: kids/shop detoxed (largest file). 131 inline → 2 dynamic (bgValue preview, equipped-slot coords). RARITY collapsed from 3 parallel hex records into 1 Tailwind class record (text/bg/border). BACKGROUNDS gradient hex retained as data. **All 9 kids pages done.**
- **2026-04-15** — F2 batch 6: kids/components (LootBox, KidsFooter, AddCustomModal, ItemDisplay, CharacterAvatar) swept. LootBox: 11 static inline → Tailwind (box/modal sizes, fixed animation delays, `bg-black/80 backdrop-blur-lg`); remaining 8 are dynamic per-rarity theming (glow, drop-shadow, rarity badge bg/color) or per-particle geometry. KidsFooter: safe-area pb, icon sizes, badge font moved to Tailwind; active-state transform/filter moved to conditional classes. AddCustomModal: removed 2 redundant `borderWidth:3` duplicates (already had `border-3`).
- **2026-04-16** — F3: responsive contract landed. All `min-h-screen` → `min-h-dvh` in full-screen surfaces (lesson engine/success, onboarding, home, dashboard/lessons, layout body, sidebar) and `min-h-svh` in stable scroll layouts (dashboard/library/calendar/auth). All `calc(100vh-*)` → `100dvh` (chat, parent). Fluid typography via `clamp()` on --text-display/h1/h2. Landscape short-viewport rules + physical device test matrix deferred into F4.
- **2026-04-16** — F2 batch 7: kids/ui primitives + components/molecules swept. KidsStatBar/KidsCoinBadge/KidsChallengeItem: coin+xp imgs switched to width/height attrs; label conditional styling → `text-ink-faint line-through` classes. KidsTabBar: active `color:"#fff"` + `rgba(255,255,255,0.3)` + `rgba(0,0,0,0.08)` → `text-white` + `bg-white/30` + `bg-black/[0.08]`. PopupTimer overlay → `bg-slate-900/55 backdrop-blur-[6px]`. Remaining inline across app is now exclusively dynamic: per-item/per-rarity color data, per-particle geometry, progress-pct widths, scroll-driven transforms.
