# Motivation System — Refactor Plan

> Living document. Updated at each phase boundary so a fresh session can pick up
> without re-doing the audit. Pair with `PROJECT.md` for full architecture.

---

## Strategic principle — 3 currencies, 3 roles

| Concept     | Role                                              | Spent? | Visible to kid          |
|-------------|---------------------------------------------------|--------|-------------------------|
| **Grade**   | Academic fact. Quiet record for teacher / parent. | n/a    | Delicate stars only     |
| **XP**      | Effort tracker → levels → small unlocks.          | never  | XP bar + level chip     |
| **Coins**   | Soft currency. Buys cosmetics in shop.            | yes    | HUD wallet              |
| **Achievement** | Milestone marker + small XP+coin bonus.       | n/a    | Badge + earn-modal      |

**Anti-pull-the-blanket rule:** never let one mechanic dominate. Reward animations
≤ 1.5 s; HUD pills small; the lesson/mini-task is always the centre of attention.

---

## Reward Matrix (single source of truth)

Lives in `backend/src/lib/rewards.ts` as `REWARD_MATRIX`. Every earn path routes
through `awardOnAction()` so deltas can never drift between modules.

| Action                                 | XP  | Coins              | Achievement check | Source key                          |
|----------------------------------------|-----|--------------------|-------------------|-------------------------------------|
| Lesson complete                        | +15 | +10                | yes               | `lesson:<progressId>`               |
| Mini-task PASS (first, ≥50 %)          | +5  | floor(reward·s/100)| yes               | `minitask:<attemptId>`              |
| Mini-task PERFECT (first, 100 %)       | +10 | full reward        | yes               | `minitask:<attemptId>`              |
| Homework graded ≥ 80 %                 | +25 | +20                | yes               | `hw:<submissionId>:<gradedAt>`      |
| Homework graded ≥ 50 %                 | +10 | +5                 | yes               | `hw:<submissionId>:<gradedAt>`      |
| Attendance present                     | +5  | 0                  | yes               | `att:<recordId>`                    |
| Attendance late / excused              | +2  | 0                  | yes               | `att:<recordId>`                    |
| Streak +1 (daily milestone, 3/7/14/30) | mile-stone bonus | mile-stone bonus | yes | `streak:<userId>:<dayISO>`          |

Idempotency: every award row in `reward-event` carries the source key.
`awardOnAction` short-circuits when a key already exists — retries cannot
double-credit.

---

## Level system

```
threshold(n) = 100 · n²        # level 1 = 100 XP, level 2 = 400, level 3 = 900, …
level(xp)    = floor(sqrt(xp / 100))
```

Quadratic so high levels feel earned. `levelUp` flag returned from
`awardOnAction` whenever `level(xp+delta) > level(xp)` so the kid HUD can
trigger the celebrate animation.

Per-level unlocks live in a small static table (Phase E):
1, 3, 5, 7, 10, 15, 20 — each unlocks a character emotion / pose / room item.

---

## Phased plan & status

- [x] **Phase A — Reward backbone** (server-side plumbing)
  - [x] `reward-event` content type (audit ledger).
  - [x] `lib/rewards.ts` service with matrix + idempotency.
  - [x] Level computation helper.
  - [x] Migrate `user-progress` lifecycle to the service.
  - [x] Migrate `mini-task-attempt.submitMine` to the service.
  - [x] Wire `homework-submission` grading to the service.
  - [x] Wire `attendance-record` create to the service.
  - [x] Lock down `kids-profile.updateMe` — earning is server-owned;
        spending via negative coin delta still allowed for legacy room-bg
        cosmetic until Phase E.
  - [x] Permissions seed — `reward-event.find` / `findOne` for AUTH_ALL
        (scoped read).

- [x] **Phase B — Achievement engine extended**
  - [x] New criterion types: `homeworks-graded-good`, `perfect-week-attendance`,
        `level-reached` (XP-level), `mini-tasks-completed`, `mini-tasks-perfect`.
  - [x] Eval triggered from every `awardOnAction` call (not just lesson lifecycle).
  - [x] Seed +9 new achievements covering the new criteria
        (`first-homework-good`, `homework-streak-5`, `homework-streak-20`,
        `first-mini-task`, `mini-task-master-10`, `mini-task-perfect-5`,
        `perfect-week-attendance`, `level-5`, `level-10`, `level-20`).
        Old CEFR-shaped `level-up-a2` / `level-up-b1` slugs deprecated —
        clean up manually in DB if previously seeded.

- [x] **Phase C — Kid-facing HUD**
  - [x] XP bar + level chip in kids top HUD (`KidsLevelBar`,
        `ProgressWidget` — combines level + streak inside one HudCard).
  - [x] Streak chip visible to kid (always, no `streak ≥ 3` gate).
  - [x] Achievement-earned celebration in mini-task result screen — XP
        delta pill, coin pill, level-up banner, per-achievement banner
        with reward summary.
  - [x] `kids:server-state-stale` event → `kidsStateStore.refresh()` so the
        HUD reflects fresh server totals after every server-side credit
        (mini-task submit, real lesson complete via `LessonPlayer`).
  - [x] Subtle grade-stars on kids homework detail (1–5 ⭐ + "%" — never a
        red FAIL bar; anti-blanket rule keeps the gamified pieces as the
        celebration carrier).
  - Note: kids course-mocks `LessonEngine` was always disconnected from
    the BE lifecycle (it operates on `mocks/lessons/`); reward flow there
    stays purely optimistic until the lesson catalog migration. Real
    lessons via `LessonPlayer` (server-backed) are wired through the new
    pipeline.

- [x] **Phase D — Teacher / parent dashboards**
  - [x] BE `motivationSummary` aggregate endpoint
        (`GET /rewards/student/:studentId/motivation`) — level, streak,
        coins, XP, recent achievements, recent reward-events; scoped
        per role (admin all, teacher any, parent own kids, self own).
  - [x] BE `grant` endpoint (`POST /rewards/grant`) — teacher / admin
        awards bonus coins (≤ 500) and / or XP (≤ 200) with optional
        reason; routes through `awardOnAction({ action:'grant',
        skipAchievementEval:true })` so the bonus appears in the kids
        HUD with full audit trail.
  - [x] Teacher StudentDetail "Мотивація" tab: level + XP bar, streak,
        coin/XP totals, last-active, achievements list (tiered chips),
        recent reward-events stream, "+ Бонус" button → grant modal.
  - [x] Parent dashboard ChildBlock: per-child level KPI, fetches
        motivation summary, surfaces top 3 recent achievements as a
        small card.
  - ~~Note: teacher → student relationship not yet formalised in schema —
    `motivationSummary` allows any teacher to read any student. Tighten
    this when groups / teacher.students relation lands.~~ TIGHTENED in
    Phase G via shared `lib/teacher-students.ts:teacherTeachesStudent`
    (de-facto link = `session.attendees`); applies to motivation
    summary, manual grant, and `reward-event.find`.

- [x] **Phase E — Polish**
  - [x] Achievement catalog with tier visuals on `/kids/achievements`
        (bronze / silver / gold / platinum ring + medal + reward
        chip in tier hue; locked entries stay neutral so the page
        doesn't rainbow).
  - [x] Free loot box on streak milestones — `STREAK_MILESTONES`
        carries `freeLootBoxes` for the days that should drop a box
        (7 / 30 / 60); rewards service writes it to the kid's
        user-inventory atomically with the milestone bonus, idempotent
        through the streak ledger row.
  - [x] `mini-task.coinReward` server-side clamp 5..100 (and
        `durationMin` 1..30) — applied on both create and update.
  - [x] Server-side shop room-background purchase (closed in Phase F).
        New `activeRoomBackground` + `ownedRoomBackgrounds` fields on
        `user-inventory`; `lib/room-backgrounds.ts` server catalog with
        slug + price; `POST /user-inventory/me/select-room-background`
        endpoint validates slug, debits on first paid purchase, records
        ownership, atomically activates. FE shop migrated; legacy
        `totalCoinsDelta` (positive AND negative) is now fully closed in
        `kids-profile.updateMe`.

---

## Audit findings (frozen as baseline)

- **Coins** — wired E2E. Earned (lesson lifecycle, mini-task first attempt,
  achievement bonus) + spent (shop, room, character, loot box).
- **XP** — written but invisible to kid; no level system; no spend; placeholder.
- **Grades** — recorded (`homework-submission.score`, `user-progress.score`,
  `attendance-record.status`) but disconnected from any reward path. Kid never
  sees own grades.
- **Achievements** — engine wires only on lesson-completion lifecycle. Three
  criterion types only (`lessons-completed`, `streak-days`, `coins-earned`).
  Self-reinforcing loop: coins → coin-achievement → coins. Catalog has 11 entries.

### Critical defects fixed by this refactor
1. `kids-profile.updateMe` accepted `totalCoinsDelta` / `totalXpDelta` from the
   client — server-side currency forge. **Phase A removes this.**
2. Stacking with no observability — `+10 coins +15 XP +bonus` on lesson without
   a paper trail. **`reward-event` ledger fixes this.**
3. Achievement engine deaf to homework / attendance / mini-task triggers.
   **Phase B extends.**
4. Streak invisible to kid (only parent). **Phase C surfaces it.**
5. XP earnable but unspendable / never displayed. **Phase C HUD + level system.**

---

## Working notes

- **2026-04-27** — audit complete; matrix + level formula locked; starting Phase A.
- **2026-04-27** — Phase A done. `reward-event` ledger + `lib/rewards.ts`
  service with matrix-driven deltas, `sourceKey` idempotency, level
  computation. All four earn paths routed through it: user-progress
  lifecycle (lesson), mini-task-attempt.submitMine (per-task first attempt),
  homework-submission.update (teacher grade), attendance-record.create.
  `kids-profile.updateMe` hardened: earning blocked, only legacy negative
  coin delta still passes (shop room-bg). Eight criterion types in the
  achievement engine, eval triggered on every award. Permissions seeded.
- **2026-04-27** — Phase B done. Seed file rewritten to exercise the new
  criterion types: 9 new achievements covering homework quality,
  mini-tasks volume + perfection, perfect-week attendance, XP levels 5 / 10 / 20.
  Old CEFR-shaped slugs deprecated in catalog (engine never matched
  their `{ level: 'A2' }` shape).
- **2026-04-27** — Phase C done. `KidsLevelBar` (compact + stacked layouts);
  dashboard `ProgressWidget` combines level bar + streak in one HUD card,
  always visible. Mini-task result screen now shows XP delta, coin
  delta, level-up banner, per-achievement card with reward summary.
  `kids:server-state-stale` event invalidates the kids cache after
  server-side credits (mini-task submit, lesson complete via
  `LessonPlayer`). Kids homework detail shows delicate ⭐+% grade row;
  no red-FAIL bar.
- **2026-04-27** — Phase D done. BE `motivationSummary` + `grant`
  endpoints (with caps, audit). FE `lib/rewards.ts` typed wrapper.
  StudentDetail gains a "Мотивація" tab with level bar, totals, recent
  achievements + reward-event stream, and "+ Бонус" grant modal.
  Parent dashboard ChildBlock derives level from totalXp and surfaces
  top 3 recent achievements. Permissions seed extended for `grant` /
  `motivationSummary`.
- **2026-04-27** — Hotfix on Railway boot: `mini-task-attempt` route
  factory was gating `create` behind a non-existent
  `admin::is-authenticated` policy. Replaced with `only: [...]` so the
  factory simply doesn't register the public POST. Custom POST
  /mini-task-attempts/me unaffected.
- **2026-04-27** — Phase E (partial). mini-task `coinReward` clamp 5..100
  + `durationMin` 1..30 in controller normalize step. Streak milestones
  7 / 30 / 60 now drop a free loot-box credit into user-inventory
  atomically with the bonus award (ledger sourceKey makes it idempotent).
  `/kids/achievements` page now reads `tier` and renders bronze / silver
  / gold / platinum styling — ring colour, medal emoji, reward chip in
  tier hue. Locked entries stay neutral so the catalog doesn't become a
  rainbow. Shop room-bg server migration deferred to Phase F (needs
  schema field + BG catalog mirror).
- **2026-04-27** — Phase F (shop bg + currency lockdown). New
  `activeRoomBackground` + `ownedRoomBackgrounds` fields on
  `user-inventory`. Server catalog `backend/src/lib/room-backgrounds.ts`
  + FE mirror `frontend/lib/room-bg-catalog.ts` (slugs in lockstep, FE
  carries the visual CSS). `POST /user-inventory/me/select-room-background`
  validates slug, debits on first paid purchase with append-then-debit
  compensating order, persists ownership. FE shop `handleBuyBackground`
  routes through the new endpoint. `kids-profile.updateMe` now hard-blocks
  every currency / XP / streak field — the legacy `totalCoinsDelta`
  fallback (positive AND negative) is closed.

