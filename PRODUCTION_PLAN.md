# EnglishBest — Production Readiness Plan

> Single tracker. Updated after every completed step.
> Goal: backend + frontend deployed on Railway / Vercel are **production-ready** — auth, real data, monitoring, security, content workflow.

---

## Rules

- No `git push` during this work — local commits only, user approves pushes.
- One phase at a time. Every structural change → update `ARCHITECTURE.md` in the same commit.
- Each phase has: **deliverable · acceptance criteria · blockers**.
- No new top-level markdown files.

Legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Phase 0 — Baseline hygiene

- [x] Monorepo wired (`npm workspaces`), root scripts for dev / build / start both apps.
- [x] Backend builds and boots on Railway with Postgres.
- [x] Frontend builds and deploys on Vercel.
- [x] Required env vars validated at Strapi boot.
- [x] Bootstrap admin seed via `db.query`.
- [x] `public/uploads/.gitkeep` committed (Strapi startup fix).
- [x] Repo cleaned of stale screenshots / old plan docs.

**Exit criteria met — moving to Phase 1.**

---

## Phase 1 — Backend data model (Strapi)

Deliverable: all content types the frontend currently reads from mocks exist in Strapi, with correct relations and role permissions.

- [ ] Skip `organization-branch` (single-branch for now; re-evaluate in Phase 13)
- [x] `course` (slug, title, description, level, price, currency, thumbnail, teacher → `teacher-profile`, organization, sections, lessons inverse, tags, ratingAvg, reviewCount, status, audience, durationWeeks, maxStudents; `draftAndPublish: true`)
- [x] `course.section` component (slug, title, order, lessonSlugs)
- [x] `lesson` (slug, title, course, sectionSlug, orderIndex, type, durationMin, video, videoUrl, transcript, cover, exercises, isFree; `draftAndPublish: true`)
- [x] `lesson.exercise` component (slug, type, question, options, answer, explanation, meta, points)
- [x] Teacher — reuse existing `teacher-profile` (already has bio, rating, publicSlug, hourlyRate); no separate `teacher` type
- [x] `session` (title, course, teacher, attendees, organization, startAt, durationMin, type, status, joinUrl, recordingUrl, notes, grade, maxAttendees)
- [x] Regenerate TS types (`npx strapi ts:generate-types`)
- [x] `npm run build:backend` green with new types
- [x] `user-progress` (user, lesson, course, status, score, attempts, completedAt, lastAttemptAt, timeSpentSec)
- [x] `achievement` (catalog: slug, title, description, icon, category, tier, coinReward, xpReward, criteria, hidden) + `user-achievement` (user, achievement, earnedAt, progress)
- [x] `review` (course, author → `user-profile`, rating 1-5, title, body, verified; aggregate into `course.ratingAvg/reviewCount` via lifecycle hook — deferred to Phase 2)
- [x] `shop-item` (slug, nameEn/Ua, phonetic, emoji, category, rarity, price, levelRequired, imageIdle/Hover/Active, isNew, slotOffset)
- [x] `homework` (title, teacher, assignees m:n → user-profile, lesson, course, description, exercises component, dueAt, status)
- [x] `mini-task` (slug, title, author → teacher-profile, level, topic, exercise single component, coinReward, isPublic)
- [x] Reconcile `kids-profile.companionAnimal` + `characterMood` enums → aligned to frontend `lib/kids-store.ts` (canonical). Frontend `mocks/user.ts` still drifts; fix in Phase 5 via `lib/types.ts` consolidation.
- [x] Regenerate TS types + green `npm run build:backend`

**Acceptance:** `curl /api/courses?populate=*` returns shape compatible with `lib/mockClient.ts` types.

**Phase 1 status: complete** (except review aggregation lifecycle — moved to Phase 2 so it runs alongside policy wiring).

---

## Phase 2 — Roles & permissions

- [x] Define users-permissions permissions per role per endpoint (`public`, `kids`, `adult`, `teacher`, `parent`, `admin`) — `backend/src/seeds/03-permissions.ts`, declarative GRANTS matrix, idempotent
- [x] `user-progress` self-scoped by `user-profile.documentId` in controller override (non-staff filter + ownership check + payload sanitize)
- [x] `review` lifecycle hook re-aggregates `course.ratingAvg` + `reviewCount` on create/update/delete
- [ ] Apply `is-authenticated`, `is-owner`, `has-role`, `is-organization-member` policies to remaining mutating routes (homework, mini-task, kids-profile)
- [ ] Teacher write endpoints scoped by `is-organization-member` + `has-role:teacher`
- [ ] Admin-only endpoints for content management (covered by seed; verify no drift)

**Acceptance:** unauthorized requests return 401/403 with no body leakage; authorized requests return scoped data.

**Phase 2 status: core seed + user-progress scoping + review aggregation done.** Remaining per-resource policies tracked alongside Phase 4 (once real auth flows exist to exercise them).

---

## Phase 3 — Seed & content import

- [ ] Write `backend/scripts/import-mocks.ts` — reads `frontend/mocks/*.json`, creates Strapi entries
- [ ] Run on staging Railway environment
- [ ] Verify counts + spot-check sample entries in Strapi admin
- [ ] Add `backend/scripts/export-content.ts` for snapshot/restore
- [ ] Document the import in `backend/README.md`

**Acceptance:** Strapi admin shows every course/lesson/teacher/session currently in mocks.

---

## Phase 4 — Auth flow (end-to-end)

- [ ] `POST /api/auth/local/register` — creates `user` + `user-profile` + role-specific profile in one transaction
- [ ] `POST /api/auth/local` login — returns JWT
- [ ] Next route handler `app/api/auth/login/route.ts` — stores JWT in httpOnly secure SameSite=Lax cookie
- [ ] Next route handler `app/api/auth/logout/route.ts` — clears cookie + Strapi token revoke
- [ ] `app/api/auth/me/route.ts` — returns current session (reads cookie, hits Strapi `/users/me?populate=*`)
- [ ] Refresh-token rotation (uses existing `refresh-token` content type)
- [ ] `middleware.ts` at `frontend/` root — redirects unauthenticated users off protected routes
- [ ] Replace `lib/roleContext.tsx` with session-backed context
- [ ] Forgot-password + email confirmation (needs Phase 6 email)

**Acceptance:** login at `/login`, see authenticated `/dashboard`, logout clears session, protected routes redirect.

---

## Phase 5 — Frontend data migration

- [ ] Add `STRAPI_API_TOKEN` handling in `lib/fetcher.ts` (server-side only; client gets JWT cookie)
- [ ] Add normalizer helpers `lib/normalize.ts` (Strapi v5 `{ data, meta }` → flat objects)
- [ ] Rewrite every helper in `lib/api.ts` to hit Strapi endpoints (§6 of ARCHITECTURE.md)
- [ ] Move shared types from `lib/mockClient.ts` → `lib/types.ts`
- [ ] Set `NEXT_PUBLIC_API_BASE_URL` on Vercel (prod + preview)
- [ ] Delete `app/api/mock/**` (or keep behind an e2e-only flag)
- [ ] Audit components for stray `fetch('/api/mock/…')`
- [ ] Update tests / Storybook fixtures

**Acceptance:** frontend renders real content end-to-end with `NEXT_PUBLIC_API_BASE_URL` pointing to Railway.

---

## Phase 6 — Email & notifications

- [ ] Pick provider (Resend / Postmark / SendGrid)
- [ ] Configure `@strapi/provider-email-*` in `backend/config/plugins.ts`
- [ ] Templates: welcome, email confirmation, password reset, parental-consent request
- [ ] From-address + DKIM/SPF verified
- [ ] Test all flows in staging

**Acceptance:** full auth email loop works with real inbox delivery.

---

## Phase 7 — Media / uploads

- [ ] Pick storage provider (Cloudinary / S3 / Railway volumes)
- [ ] Configure `@strapi/provider-upload-*`
- [ ] Migrate existing `backend/public/uploads/*` (currently empty) + mock public assets
- [ ] CDN rules / cache-control
- [ ] Signed URL strategy for private media (if needed)

**Acceptance:** Strapi admin uploads land in the cloud provider; frontend loads them over HTTPS.

---

## Phase 8 — Security hardening

- [ ] Strict CORS allowlist in `backend/config/middlewares.ts` (Vercel prod + preview domains only)
- [ ] Rate limit login + register endpoints (strapi-plugin-rate-limit or Cloudflare)
- [ ] CSP, HSTS, X-Frame-Options via `next.config.ts` headers
- [ ] Audit Strapi permissions (no implicit `public` on sensitive endpoints)
- [ ] Rotate all secrets; document rotation cadence in Railway secret manager
- [ ] CSRF strategy documented (SameSite cookie + Origin check)
- [ ] Dependency audit: `npm audit --workspaces` clean or risk-accepted
- [ ] GDPR: consent UI (wires to `consent-log`), data-export endpoint, delete-me endpoint (soft-delete via `user-profile.status=deleted` + `deletedAt`)

**Acceptance:** security review checklist signed off; no high-severity npm audit findings.

---

## Phase 9 — Observability

- [ ] Sentry (frontend + backend DSNs, sourcemaps upload on Vercel build)
- [ ] Structured logs (Strapi logger → Railway logs; Next.js → Vercel logs)
- [ ] Uptime monitor (Better Stack / UptimeRobot) pinging `/` and `/api/_health`
- [ ] Add `backend/src/api/_health/` content-type-less route returning `{ ok, version, db }`
- [ ] Vercel Analytics + PostHog (product analytics)
- [ ] Alert channel (Slack / email) wired to Sentry + uptime

**Acceptance:** simulated error in prod shows up in Sentry within 1 min; a forced downtime triggers an alert.

---

## Phase 10 — Performance & SEO

- [ ] Lighthouse pass on `/home`, `/dashboard`, `/courses/[slug]`, `/kids/dashboard` (mobile + desktop) — target ≥90 perf, ≥95 a11y
- [ ] Tree-shake unused dependencies; analyze bundle with `@next/bundle-analyzer`
- [ ] ISR / SSG for public marketing + course pages
- [ ] `next/image` for all raster assets (already in place — verify)
- [ ] `metadata` exports on every route
- [ ] `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`
- [ ] Open Graph + Twitter card defaults
- [ ] Favicon set (multiple sizes)

**Acceptance:** Lighthouse targets met; sitemap reachable at `/sitemap.xml`.

---

## Phase 11 — Accessibility

- [ ] Axe run on key pages, fix all serious/critical issues
- [ ] Keyboard nav: focus rings, skip links, tab order on dashboards + lesson engine
- [ ] Screen-reader labels on icon-only buttons
- [ ] Color contrast audit for Kids "Toca" palette
- [ ] Reduced-motion respecting `prefers-reduced-motion` across all animations

**Acceptance:** zero axe serious+ issues on critical paths.

---

## Phase 12 — Testing & CI

- [ ] GitHub Actions workflow: lint + typecheck + jest on PR
- [ ] Separate job: backend build + `strapi ts:generate-types` diff check
- [ ] Playwright e2e for golden paths: register → onboarding → first lesson → progress saved
- [ ] Smoke suite against Railway staging on every deploy
- [ ] Visual regression (optional: Chromatic / Percy) on Storybook

**Acceptance:** merging to `main` blocked on green CI; staging smoke run green before prod promotion.

---

## Phase 13 — Environments & release flow

- [ ] Staging env: Railway `staging` service + Vercel preview aliased domain
- [ ] Custom domains: `englishbest.app` (frontend), `api.englishbest.app` (backend) with TLS
- [ ] Env promotion checklist: staging → prod
- [ ] DB backups: Railway daily snapshot + weekly offsite (S3) via `pg_dump` cron
- [ ] Documented restore runbook in `backend/README.md`
- [ ] Version tags on `main` (semver-ish), release notes captured in git annotated tags

**Acceptance:** full staging → prod promotion exercised once end-to-end with rollback tested.

---

## Phase 14 — Content & editorial

- [ ] Strapi admin walkthrough doc (inside `backend/README.md`)
- [ ] Editor role (Strapi admin role, not app role) for content managers
- [ ] Preview mode: frontend route that reads draft content (Strapi draftAndPublish where needed)
- [ ] On-publish webhook → Vercel `/api/revalidate` route handler
- [ ] Media naming + alt-text conventions

**Acceptance:** a non-engineer can publish a new course end-to-end.

---

## Cross-cutting watchlist

- [ ] Keep `ARCHITECTURE.md` in lockstep with every structural change.
- [ ] Keep `frontend/lib/types.ts` and Strapi schemas aligned; regenerate types in CI.
- [ ] No secrets in repo; `.env.example` stays current.
- [ ] Review this file after every phase — re-scope or reorder as reality shifts.

---

## Immediate next action

**Start Phase 3** — write `backend/scripts/import-mocks.ts` to seed real content from `frontend/mocks/*` into Strapi, so Phase 5 (frontend data migration) has something to read.
