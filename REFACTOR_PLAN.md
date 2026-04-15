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
- [ ] Inventory every inline `style={{…}}` across `app/`, `components/`
- [ ] Justify each (allowed only for: dynamic CSS vars, SVG transforms, computed geometry)
- [ ] Replace the rest with tokens / utility classes / CSS variables
- [ ] Inventory every hardcoded color (hex/rgb) outside `globals.css`
- [ ] Move legitimate color constants into `@theme`, reference via Tailwind token
- [ ] Confirm typography uses `.type-*` classes everywhere (no ad-hoc `text-xs font-black …`)
- [ ] Add missing tokens exposed by the audit to `@theme`
- [ ] Dedupe overlapping animations (`.animate-*` vs `.tk-animate-*`)

### F3 — Responsive contract
- [ ] Define breakpoints: `xs` (<480), `sm` (480), `md` (768), `lg` (1024), `xl` (1280), `2xl` (1536)
- [ ] Adopt `100dvh` / `100svh` in full-screen layouts (lesson engine, kids room, onboarding)
- [ ] Add safe-area paddings to sticky headers/footers (`env(safe-area-inset-*)`)
- [ ] Landscape rules: short-viewport (`@media (max-height: 480px)`) → compact headers, collapsible sidebars
- [ ] Typography: switch hero / display to `clamp()` based on viewport
- [ ] Test matrix: iPhone SE / iPhone 15 / iPad portrait / iPad landscape / MacBook 13" / 27" desktop

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
