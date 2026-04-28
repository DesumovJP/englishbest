# Admin Account — Production Readiness Plan

**Created:** 2026-04-28
**Owner:** TBD
**Scope:** End-to-end admin role: identity, authorization, UI surface, accountability, security, ops.
**Reading order:** §1 (mission) → §2 (current state) → §10 (roadmap) for the action list. Sections 3-9 are reference depth.

**Companion plan:** `CONTENT_LIFECYCLE_PLAN.md` covers the library content
moderation flow (teachers propose → admin approves) in depth — that work
lands as Phase 2.5 of this admin roadmap (between audit lifecycle and
user management). Read it before starting Phase 2.5.

---

## 1. Mission

A **production-grade admin** is the operator of the platform — not a "super-teacher". Their job is to:

1. **Provision** users (teachers, parents, learners) and orgs.
2. **Moderate** shared content (platform lessons, courses, vocab) and reviews.
3. **Operate** finances (lesson payments, teacher payouts).
4. **Audit** every staff/admin action (who, what, when, before/after).
5. **Configure** the platform (organization profile, feature flags, integrations).
6. **Recover** from incidents (impersonate, restore deleted, force-reset passwords).

A teacher manages their classroom; an admin manages the school. The two roles **must not blur** — this is enforced both in the BE permission matrix (`seeds/03-permissions.ts`) and in the FE sidebar IA.

---

## 2. Current state — what's done and what's missing

> Source: agent audit run on 2026-04-28 across `backend/src/api/**`, `frontend/app/dashboard/admin/**`, `seeds/03-permissions.ts`, `frontend/components/molecules/Sidebar.tsx`.

### 2.1 Done ✅

| Layer | Item | File / detail |
|---|---|---|
| Identity | Admin role (`type: 'admin'`) seeded | `backend/src/seeds/00-roles.ts` |
| Identity | Demo admin account | `backend/src/seeds/04-demo-accounts.ts` (added 2026-04-28) — `demo-admin@englishbest.app` / `Demo2026!` |
| Identity | Admin card on login page | `frontend/app/(onboarding)/login/page.tsx` — first row in cohort block, `bg-ink` tone |
| Routing | Login → `/dashboard/admin` for `role: 'admin'` | `redirectForRole()` switch case, line 55 of login page |
| Routing | Server-side guard on `/dashboard/admin/*` | `frontend/app/dashboard/admin/layout.tsx` — `requireRole(['admin'])` |
| UI | Admin landing page (KPIs + analytics) | `frontend/app/dashboard/admin/page.tsx` (262 LOC) — uses `DashboardPageShell`, `KPICard`, `Card`, `Avatar`, `LevelBadge` |
| UI | Sidebar nav grouped (`Огляд` / `Користувачі` / `Контент` / `Платформа`) | `frontend/components/molecules/Sidebar.tsx` — `ADMIN_NAV` (added 2026-04-28) |
| UI | Stub pages for new nav links | `dashboard/admin/{audit-log,organization,settings}/page.tsx` — `WipSection` placeholders, no 404s |
| BE | Admin role bypasses scoping in 17 controllers | inline `if (role === 'admin') return super.X(ctx)` |
| BE | `audit-log` content-type schema | fields: `actor`, `actorIp`, `actorUserAgent`, `action`, `entityType`, `entityId`, `before`, `after`, `requestId`, `statusCode`, `metadata` |
| BE | Permissions matrix — 26 admin-only actions | `seeds/03-permissions.ts` — achievement, shop-item, character, room, lesson-payment, teacher-payout, audit-log, consent-log, organization.update |
| BE | Course delete + publish/unpublish controllers | `api/course/controllers/course.ts` (custom Documents API to avoid 500) |
| BE | DigitalOcean Spaces upload provider | `backend/config/plugins.ts` — switches on `DO_SPACE_BUCKET` |

### 2.2 Missing ❌ (ordered by severity)

| # | Capability | Layer gap | User-visible impact |
|---|---|:-:|---|
| 1 | **User management UI** (suspend / role-change / soft-delete / impersonate) | FE+BE | Admin can't onboard new staff or kill abusive accounts without DB access |
| 2 | **Audit-log viewer** | FE | 26 admin-only actions exist but no way to *see* what staff did; the entire compliance story sits behind a stub |
| 3 | **Lifecycle hook for audit logging** | BE | No mutation auto-logs; audit-log is empty unless manually populated |
| 3a | **Vocab controller has zero scoping** (any STAFF edits any vocab) | BE | Wild-west — teacher A can rewrite teacher B's vocab. See `CONTENT_LIFECYCLE_PLAN.md` §4 |
| 3b | **No `reviewStatus` field on lesson / course / vocab** | BE | Approval workflow can't ship without it |
| 3c | **No content-moderation queue** (admin sees teacher submissions) | FE+BE | Teachers can't propose content for review; admin can't gatekeep |
| 3d | **Course + vocab missing `owner` / `source`** | BE | No way to distinguish platform-curated vs. teacher-original |
| 4 | **Lesson-payment / teacher-payout admin UI** | FE+BE | Schema exists, but no FE; payouts must be done in Strapi admin |
| 5 | **Catalog admin** (achievements, shop-items, characters, rooms) | FE | Schema + perms wired; no FE means content drift requires Strapi admin login |
| 6 | **Consent-log viewer** | FE | GDPR audit needs admin to read consent history; only Strapi admin can today |
| 7 | **Organization settings form** | FE | `api::organization.organization.update` perms set, no form |
| 8 | **Generic admin-bypass helper** | BE | 17 controllers do inline `if role === 'admin'`; one missed `if` is a security hole |
| 9 | **Admin-profile content-type** (2FA, IP allowlist, last-seen) | BE | No 2FA enforcement specifically for admins; no IP guardrails |
| 10 | **Confirmation modals for destructive actions** | FE | One-click delete is not a production pattern for admin tools |
| 11 | **Platform settings / feature flags** | BE+FE | No schema yet; needed to gate experimental modules |
| 12 | **Bulk operations** (mass-delete, mass-export, bulk-reassign) | FE+BE | Each op requires N round-trips; no progress UI |
| 13 | **Data export / GDPR right-to-be-forgotten** | FE+BE | Compliance gap |
| 14 | **Push notifications for admin** (incident alerts) | BE | No real-time signal for failed payouts, suspicious logins, etc. |
| 15 | **Rate-limiting on admin write endpoints** | BE | Stolen admin token = unbounded mutation rate |

---

## 3. Identity & authentication

### 3.1 Demo credentials (post 2026-04-28)

```
email:    demo-admin@englishbest.app
password: Demo2026!
```

The seed `04-demo-accounts.ts` is gated by `SEED_DEMO_ACCOUNTS=1` — set once on Railway, redeploy, then unset. Idempotent: skips if user exists.

### 3.2 Real-admin onboarding

Today an admin is provisioned by:

1. Creating a Strapi user with `role.type === 'admin'` (Strapi admin panel or seed).
2. Creating a `user-profile` row with `role: 'admin'`, linked via `user`.
3. (Future) Creating an `admin-profile` row for security metadata.

### 3.3 Admin-profile schema (proposed)

`backend/src/api/admin-profile/content-types/admin-profile/schema.json`:

```json
{
  "kind": "collectionType",
  "collectionName": "admin_profiles",
  "info": { "singularName": "admin-profile", "pluralName": "admin-profiles" },
  "options": { "draftAndPublish": false },
  "attributes": {
    "user":          { "type": "relation", "relation": "oneToOne", "target": "api::user-profile.user-profile" },
    "totpSecret":    { "type": "string", "private": true },
    "totpEnabledAt": { "type": "datetime" },
    "allowedIpCidrs": { "type": "json" },
    "lastSeenAt":     { "type": "datetime" },
    "lastSeenIp":     { "type": "string" },
    "scopes":         { "type": "json", "comment": "Future: granular admin scopes (financial-only, content-only)" }
  }
}
```

Why optional fields: no admin-profile row → admin works as today (full access, no 2FA). Adding the row enables hardening progressively.

### 3.4 Login flow checklist (post-implementation)

- [x] `/login` form accepts admin credentials.
- [x] Demo card prefills email + password on click.
- [x] Successful login → `/dashboard/admin`.
- [x] Sidebar shows admin-grouped nav (`ADMIN_NAV` in Sidebar.tsx).
- [x] Server-side `requireRole(['admin'])` guards `/dashboard/admin/*`.
- [ ] (Future) 2FA challenge if `admin-profile.totpEnabledAt` set.
- [ ] (Future) IP check against `admin-profile.allowedIpCidrs`.
- [ ] (Future) Force re-auth for sensitive ops (`/users/*` writes).

---

## 4. Authorization model

### 4.1 Current pattern (inline)

Every scoped controller ends with:

```ts
const role = (ctx.state.user?.role?.type ?? '').toLowerCase();
if (role === 'admin') return (super.find as any)(ctx);
// …owner-scoped fallback…
```

**Risk:** 17 controllers each repeat this. A new controller authored without the bypass either over-restricts admin (frustrating) or under-restricts non-admin (security hole).

### 4.2 Proposed: `lib/admin-bypass.ts` helper

```ts
// backend/src/lib/admin-bypass.ts
export function isAdmin(ctx: any): boolean {
  return (ctx.state?.user?.role?.type ?? '').toLowerCase() === 'admin';
}
export function passthroughIfAdmin<T>(ctx: any, action: () => T): T | undefined {
  return isAdmin(ctx) ? action() : undefined;
}
```

Then in controllers:

```ts
import { isAdmin } from '../../../lib/admin-bypass';

async find(ctx) {
  if (isAdmin(ctx)) return (super.find as any)(ctx);
  // …owner-scoped fallback…
}
```

### 4.3 Permission matrix (admin-only actions, current)

26 actions. Source: `seeds/03-permissions.ts` (lines with `roles: ADMIN`).

- **Catalog** — achievement / shop-item / character / room — `create + update + delete`
- **Finance** — lesson-payment / teacher-payout — `create + update + delete`
- **Audit** — audit-log / consent-log — `find + findOne`
- **Mass action** — review.delete, mini-task-attempt.delete, user-achievement.create
- **Organization** — `organization.update`

### 4.4 Future admin-only actions (to add)

- `api::user-profile.user-profile.suspend` / `unsuspend` (custom controller actions)
- `api::user-profile.user-profile.changeRole`
- `api::user-profile.user-profile.softDelete` / `restore`
- `api::auth.auth.impersonate` (issues a token for any user, audit-logged)
- `api::audit-log.audit-log.export` (CSV streaming endpoint)
- `api::organization.organization.export` (GDPR data export)

---

## 5. UI surface area

### 5.1 Done today

| Route | File | Status |
|---|---|---|
| `/dashboard/admin` | `frontend/app/dashboard/admin/page.tsx` | ✅ KPIs, top teachers, level distribution, groups glance |
| `/dashboard/analytics` | `frontend/app/dashboard/analytics/page.tsx` | ✅ Admin variant: platform-wide aggregates |
| `/dashboard/students` | `frontend/app/dashboard/students/page.tsx` | ✅ Admin variant: all students |
| `/dashboard/groups` | `frontend/app/dashboard/groups/page.tsx` | ✅ Admin variant: all groups |
| `/dashboard/library` | `frontend/app/dashboard/library/page.tsx` | ✅ Admin can edit platform-source lessons (since 2026-04-28) |
| `/dashboard/admin/audit-log` | scaffold | ⏳ WipSection placeholder |
| `/dashboard/admin/organization` | scaffold | ⏳ WipSection placeholder |
| `/dashboard/admin/settings` | scaffold | ⏳ WipSection placeholder |

### 5.2 Missing pages (target spec)

#### `/dashboard/admin/users` — User management

**Hierarchy:** lives under `/dashboard/admin` (inherits role-guard).
**Components to reuse:**
- `DashboardPageShell` (title + toolbar slot for filters/search + state-aware body).
- `DataTable` (sortable, with row-click → user detail modal).
- `Avatar`, `LevelBadge`, `Badge` (status), `Button`.
- `SearchInput` + `FilterChips` from `components/teacher/ui` for the toolbar.
- `Modal` for user detail / edit.
- `ConfirmDialog` (new — see §6.3).

**Columns:** Avatar + name | email | role | org | lastSeen | status (active/suspended) | actions.

**Row actions:** Edit, Change role, Suspend, Reset password, Impersonate, Delete (soft).

**Backend additions needed:**
- `user-profile` controller — custom actions `suspend`, `unsuspend`, `changeRole`, `softDelete`, `restore`.
- `auth` controller — `impersonate(userId)` returns a session token for the target.
- All actions audit-logged with `before`/`after`.

#### `/dashboard/admin/audit-log` — Audit log viewer

**Layout:** Filter sidebar (actor, action, entity-type, date range) + main `DataTable`.
**Columns:** Timestamp | Actor | Action | Entity (type + id, link) | Status | IP | Diff (modal).
**Backend:**
- Already-existing `api::audit-log` collection.
- Need `find` proxy `/api/audit-logs` already perm-gated to admin.
- Lifecycle hook proposal: a single `src/lib/audit.ts` writes a row from any controller via `await writeAudit(ctx, { action, entityType, entityId, before, after })`. Wire into mutation paths progressively.

#### `/dashboard/admin/payments` — Lesson payments + teacher payouts

**Two tabs:**
- **Lesson payments** (incoming) — student × course × amount × status (paid/pending/refunded).
- **Teacher payouts** (outgoing) — teacher × period × hours × computed amount × status (pending/sent/failed).

**Components:** `Tabs`, `DataTable`, `KPICard` (total this month), `StatTile`.

#### `/dashboard/admin/catalog/*` — content catalog

Sub-tabs (one route, four DataTables behind a `<Tabs>`):
- Achievements (12 seeded)
- Shop items (20 seeded)
- Characters (2 seeded)
- Rooms (5 seeded)

Each tab: `DataTable` with sortable columns, row-click → edit modal. CRUD via existing scoped endpoints.

#### `/dashboard/admin/consent-log` — GDPR consent

Append-only timeline. `DataTable` columns: User | Type (terms/privacy/marketing) | At | IP | Details.

#### `/dashboard/admin/organization` — Organization form

Single edit form: name, slug, default locale, default timezone, billing address, integration keys (Calendly URL, Stripe key tail, Google Workspace domain). Reuses `FormField` + `Input` + `Select` + `Switch`.

#### `/dashboard/admin/settings` — Platform feature flags

Requires new content-type `platform-config` (key/value/scope). Or hardcoded list backed by env. Phase 6.

---

## 6. Component reuse map (consistency principle)

> User mandate (2026-04-28): "не треба інлайнів, юзай наявні компоненти або створюй нові якщо треба. Консистентність всюди."

Every new admin page **must**:

1. Wrap in `DashboardPageShell` (title, subtitle, toolbar slot, status, error, empty, loading).
2. Use `Card` for sectioned content (no raw `<div>`-with-borders).
3. Use `KPICard` / `StatTile` for metrics — never reimplement.
4. Use `DataTable` for tabular data — provides sort, sticky headers, empty state.
5. Use `Modal` for detail views and `ConfirmDialog` (proposed) for destructive actions.
6. Use `Button` (variants: `primary` / `secondary` / `danger` / `ghost`) — never custom `<button>` with bespoke classes.
7. Use design tokens (`bg-surface`, `text-ink`, `border-border`) via Tailwind utilities — **never** `style={{...}}`.
8. Use `LevelBadge`, `Badge`, `Chip`, `StatusPill` for in-row markers.
9. Use `SearchInput`, `FilterChips`, `SegmentedControl`, `Select` from `components/teacher/ui` and `components/ui` for filters/toolbar.
10. Server-side route guard via existing `requireRole(['admin'])` — don't reinvent client-side guards.

### 6.1 Components to create (one each)

| Component | Purpose | API sketch |
|---|---|---|
| `ConfirmDialog` (`components/ui/`) | Destructive-action confirmation | `<ConfirmDialog open onClose onConfirm title description tone="danger">` |
| `UserAvatarCell` (`components/ui/`) | Avatar + name + role badge — used in DataTable rows | `<UserAvatarCell name email avatarUrl role>` |
| `JsonDiffView` (`components/ui/`) | before/after JSON diff for audit-log detail | `<JsonDiffView before after>` |

### 6.2 Pages to refactor for consistency

`/dashboard/admin/page.tsx` line 236 has a local `StatCell` function. Replace with the canonical `KPICard` from `components/ui/`.

### 6.3 Anti-patterns to avoid

- ❌ Inline `style={{...}}` (memory `feedback_styling`).
- ❌ One-off `<div className="border rounded-lg p-4">` instead of `<Card>`.
- ❌ One-off `<button onClick={...} className="...lots of utilities...">` instead of `<Button>`.
- ❌ `confirm("Точно?")` — use `ConfirmDialog`.
- ❌ Client-side role guard via `if (role !== 'admin') return null` — let `requireRole` in layout handle it.

---

## 7. Backend gaps & proposed shape

### 7.1 Audit lifecycle hook

`backend/src/lib/audit.ts`:

```ts
export async function writeAudit(strapi: any, ctx: any, payload: {
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
}) {
  const userProfile = await callerProfile(strapi, ctx.state.user?.id);
  await strapi.documents('api::audit-log.audit-log').create({
    data: {
      actor: userProfile?.documentId ?? null,
      actorIp: ctx.request.ip,
      actorUserAgent: ctx.request.headers['user-agent'],
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId,
      before: payload.before ?? null,
      after: payload.after ?? null,
      requestId: ctx.state.requestId,
      statusCode: ctx.status,
      metadata: payload.metadata ?? null,
    },
  });
}
```

Wire into write paths progressively:
1. `course.delete` / `lesson.delete` / `homework.delete` — destructive ops first
2. Role / status changes on `user-profile`
3. `lesson-payment` / `teacher-payout` mutations
4. Achievement / shop-item / character / room CRUD

### 7.2 User management endpoints

Extend `api::user-profile.user-profile` controller:

```
POST   /api/user-profile/:id/suspend       → admin, audit-logged
POST   /api/user-profile/:id/unsuspend     → admin, audit-logged
PATCH  /api/user-profile/:id/role          → admin, audit-logged, body: { role }
DELETE /api/user-profile/:id               → admin, soft-delete (sets deletedAt)
POST   /api/user-profile/:id/restore       → admin, audit-logged
```

Each: gates `if (!isAdmin(ctx)) return ctx.forbidden();`.

### 7.3 Impersonation

`POST /api/auth/impersonate { userId }` (admin-only) → issues a session token for the target user. Returns access+refresh + `impersonatedBy: adminProfileId` claim. Frontend stores both, shows a banner "Ви входите як <name> — вийти" that drops the impersonation cookie. Audit-log entry on issuance.

### 7.4 Rate-limit middleware (for admin writes)

`backend/src/middlewares/admin-rate-limit.ts` — token-bucket per `actor.documentId` (e.g. 30 writes / 60s). Apply to `/api/user-profile/*` mutations and `/api/auth/impersonate`. Fail-open if Redis unavailable.

---

## 8. Audit & accountability

### 8.1 What to log

Every **mutation by staff or admin**: create / update / delete / publish / unpublish / suspend / role-change / impersonate.

### 8.2 What NOT to log

- Pure reads (too noisy; cover via web access logs if needed).
- User-progress writes from learners (covered by domain analytics).
- Self-edits to own profile (kept in user-profile updatedAt).

### 8.3 Retention

Default: **365 days** rolling. Older rows archived to cold storage (DO Spaces) via cron. Configurable via `platform-config.auditRetentionDays`.

### 8.4 Viewer requirements

- Admin can search by actor, action, entityType, date range.
- Admin can drill into a row to see `before` / `after` JSON diff.
- Admin can export filtered set as CSV.
- Audit-log itself is **immutable** — no update/delete actions seeded.

---

## 9. Security guardrails

### 9.1 Authentication hardening

- **2FA (TOTP)**: opt-in via `admin-profile.totpSecret`. If set, login flow shows a 6-digit code prompt.
- **IP allowlist**: `admin-profile.allowedIpCidrs` array of CIDRs. If set, requests from outside CIDRs return 403.
- **Session timeout**: shorter for admins — `JWT_EXPIRES_IN_ADMIN=5m` env override.
- **Force re-auth** before destructive ops (delete user, change role, impersonate).

### 9.2 Action confirmation

`ConfirmDialog` for: any delete, role change, suspend, impersonate. Type-to-confirm pattern for delete-user (must type the email).

### 9.3 Rate limiting

- `/api/user-profile/:id/*` mutations: 30 / minute per admin.
- `/api/auth/impersonate`: 10 / hour.
- General admin writes: 100 / minute soft cap.

### 9.4 Visibility

- Sticky banner during impersonation: "Ви — <admin>, входите за <user>. Вийти".
- Audit-log notification when an admin's last-seen IP changes drastically.
- Daily digest email (future): summary of admin actions yesterday.

---

## 10. Phased roadmap

> One phase ≈ one PR. Order is dependency-driven; later phases build on earlier ones.

### Phase 1 — Foundation ✅ DONE 2026-04-28

- [x] Demo admin in `04-demo-accounts.ts`.
- [x] Admin card on login page (first row, `bg-ink`).
- [x] Admin sidebar refactored to grouped sections (`ADMIN_NAV`).
- [x] Stub pages for `audit-log` / `organization` / `settings` so nav doesn't 404.
- [x] This planning document.

### Phase 2 — Audit lifecycle (high priority)

- [ ] `backend/src/lib/audit.ts` writeAudit helper.
- [ ] Wire into destructive ops first: course/lesson/homework delete; user role/suspend.
- [ ] Audit-log viewer page (`/dashboard/admin/audit-log`) with `DataTable` + filters.
- [ ] CSV export endpoint.

### Phase 2.5 — Content moderation workflow (added 2026-04-28)

> Detailed design in **`CONTENT_LIFECYCLE_PLAN.md`** — read it first.
> Goal: teachers propose content (lesson / course / vocab), admin
> approves to publish; admin can also create + publish directly.

- [ ] **L1** — Schema additions: `reviewStatus` / `rejectionReason` /
  `reviewedBy` / `reviewedAt` on lesson, course, vocab; `owner` /
  `source` on course + vocab; `originalVocabularySet` self-rel on vocab.
- [ ] **L2** — Idempotent backfill script
  (`backend/scripts/backfill-content-lifecycle.ts`) — sets
  `reviewStatus='approved'` on existing rows; derives `owner` + `source`
  for course / vocab from existing relations.
- [ ] **L3** — Vocab controller scoping: replace default with scoped
  controller mirroring `lesson` (find/findOne/create/update/delete +
  custom `clone`). Closes the "any teacher edits any vocab" hole.
- [ ] **L4** — Course controller hardening: enforce `owner` on
  create/update/delete (custom controller already exists, just adds
  ownership checks).
- [ ] **L5** — Approval-workflow backend: custom `submit` / `approve` /
  `reject` actions per content type; audit-log integration via Phase 2
  helper; new permissions in matrix.
- [ ] **L6** — Editor FE: status badge + role-aware action set via a
  `useEditorActions(role, source, status, isOwner)` hook. Same hook
  drives lesson, course, vocab editors. **No bespoke buttons — reuse
  `<Button>` + `<StatusPill>`.**
- [ ] **L7** — Admin review-queue page
  (`/dashboard/admin/review-queue`) with three tabs (lessons / courses
  / vocab), badge counts, `DataTable` rows.
- [ ] **L8** — Library filters: status filter chips + ownership filter
  in lessons / courses / vocab tabs of `/dashboard/library`.
- [ ] **L9** — Vocab cover-image upload via the existing DO Spaces flow
  (`AvatarUpload` extracted to a shared `<MediaPickerCard>`).
- [ ] **L10** — Polish: word-cap + dedup in vocab controller; force
  `vocab.course = vocab.lesson.course` consistency; notification bell.
- [ ] **L11** — (deferred) Email notifications on submit / approve /
  reject — needs SMTP infra.

### Phase 3 — User management

- [ ] `lib/admin-bypass.ts` helper, refactor 17 controllers.
- [ ] User-profile custom actions (suspend / role-change / softDelete / restore).
- [ ] Impersonation endpoint + FE banner.
- [ ] `/dashboard/admin/users` page (DataTable + UserAvatarCell + ConfirmDialog).
- [ ] `ConfirmDialog` component in `components/ui/`.

### Phase 4 — Financial admin

- [ ] `/dashboard/admin/payments` page (Tabs: payments + payouts).
- [ ] Backend audit on every lesson-payment / teacher-payout mutation.
- [ ] Bulk payout CSV import (low-priority).

### Phase 5 — Catalog admin + Org settings

- [ ] `/dashboard/admin/catalog` page (Tabs for achievements / shop / characters / rooms).
- [ ] `/dashboard/admin/organization` form (replace WipSection).
- [ ] Image upload reused from `AvatarUpload` pattern (DO Spaces).

### Phase 6 — Hardening

- [ ] `admin-profile` content-type + 2FA enrollment UI.
- [ ] IP allowlist enforcement.
- [ ] Rate-limit middleware.
- [ ] Force re-auth flow for destructive ops.
- [ ] `/dashboard/admin/settings` with feature flags via new `platform-config` content-type.

### Phase 7 — Compliance & polish

- [ ] Consent-log viewer.
- [ ] GDPR data export tool.
- [ ] Right-to-be-forgotten flow (cascading delete + retention exemptions).
- [ ] Daily digest email of admin activity.
- [ ] Real-time alerts for suspicious admin behavior (login from new country, mass-delete bursts).

---

## 11. Open decisions for the user

Before Phase 2 starts, please answer:

1. **Multi-org future?** Today there's one organization. If we plan multi-tenancy, every admin endpoint needs an `organizationId` filter. If never multi-tenant, drop the `organization` relation from new controllers.
2. **Audit retention** — 365 days OK? Or shorter (e.g. 90) for cost?
3. **Impersonation** — yes or no? Risk is high (admin can act as any user); benefit is huge for support. If yes, must be heavily audit-logged + banner-flagged.
4. **2FA enforcement** — opt-in (any admin can skip) or mandatory (refuse login without it)?
5. **Can teachers be promoted to admin via UI**, or admin role only created via seed/Strapi-admin? Affects whether `changeRole` includes `→ admin`.
6. **Admin password reset** — self-service or admin-of-admins? If self-service, need email integration (currently no SMTP wired).
7. **Soft-delete window** — how long do soft-deleted users / courses stay recoverable before hard-delete?

---

## 12. Cross-references

- **PROJECT.md §10** — change log entries for admin-related work.
- **CLAUDE.md** — Next.js conventions; design-token rule; "no inline styles".
- **`backend/src/seeds/03-permissions.ts`** — canonical permission matrix.
- **`frontend/components/ui/`** + **`frontend/components/teacher/ui/`** — component inventory; **read before building any new admin page**.
- **`backend/config/plugins.ts`** — DO Spaces upload provider config (already wired).
- **`/Users/oleksandrsimcenko/CoffeePOS`** — reference repo for similar admin patterns (especially employee management UI).
