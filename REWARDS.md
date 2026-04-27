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

- [ ] **Phase B — Achievement engine extended**
  - [ ] New criterion types: `homeworks-graded-good`, `perfect-week-attendance`,
        `level-reached`, `mini-tasks-completed`, `mini-task-perfect-streak`.
  - [ ] Eval triggered from every `awardOnAction` call (not just lesson lifecycle).
  - [ ] Seed +5–8 new achievements covering the new criteria.

- [ ] **Phase C — Kid-facing HUD**
  - [ ] XP bar + level chip in kids top HUD.
  - [ ] Streak chip visible to kid.
  - [ ] Achievement-earned modal (character celebrate + confetti).
  - [ ] Unified result screen (lesson / mini-task) — "+XP · +coins · level up?".
  - [ ] Subtle grade-stars on homework detail / lesson recap.

- [ ] **Phase D — Teacher / parent dashboards**
  - [ ] Teacher: per-student "motivation card" — level, streak, recent
        achievements, grade trend, last-active.
  - [ ] Parent: same + weekly summary report.
  - [ ] Bonus coin-grant action for teacher (with audit).

- [ ] **Phase E — Polish**
  - [ ] Achievement catalog with proper icons + bronze / silver / gold tier.
  - [ ] Free loot box refresh — 1 / week at streak ≥ 5.
  - [ ] `mini-task.coinReward` server-side clamp 5 .. 100.

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

