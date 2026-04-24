/**
 * Achievement catalog + earned lookups.
 *
 * `fetchAchievements()` — public catalog from `/api/achievements`.
 * `fetchUserAchievements()` — caller's earned rows from
 * `/api/user-achievements?populate=achievement` (scoped server-side).
 *
 * Both cached module-level with inflight-promise dedup; both cleared on
 * logout via `resetAchievementsCache()`.
 */

export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";
export type AchievementCategory =
  | "streak"
  | "lessons"
  | "coins"
  | "social"
  | "kids"
  | "mastery"
  | "special";

export interface ServerAchievement {
  documentId: string;
  slug: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  coinReward: number;
  xpReward: number;
  criteria: Record<string, unknown> | null;
  hidden: boolean;
  iconUrl: string | null;
}

export interface ServerUserAchievement {
  documentId: string;
  earnedAt: string;
  progress: number;
  achievement: ServerAchievement | null;
}

const TIERS = new Set<AchievementTier>(["bronze", "silver", "gold", "platinum"]);
const CATEGORIES = new Set<AchievementCategory>([
  "streak",
  "lessons",
  "coins",
  "social",
  "kids",
  "mastery",
  "special",
]);

function pickTier(v: unknown): AchievementTier {
  return typeof v === "string" && TIERS.has(v as AchievementTier)
    ? (v as AchievementTier)
    : "bronze";
}

function pickCategory(v: unknown): AchievementCategory {
  return typeof v === "string" && CATEGORIES.has(v as AchievementCategory)
    ? (v as AchievementCategory)
    : "lessons";
}

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v !== "" && !Number.isNaN(Number(v))) return Number(v);
  return 0;
}

function mediaUrl(media: unknown): string | null {
  if (!media || typeof media !== "object") return null;
  const url = (media as { url?: unknown }).url;
  return typeof url === "string" && url.length > 0 ? url : null;
}

function normalizeAchievement(raw: any): ServerAchievement | null {
  if (!raw?.documentId || !raw?.slug || !raw?.title) return null;
  return {
    documentId: String(raw.documentId),
    slug: String(raw.slug),
    title: String(raw.title),
    description: typeof raw.description === "string" ? raw.description : "",
    category: pickCategory(raw.category),
    tier: pickTier(raw.tier),
    coinReward: toNum(raw.coinReward),
    xpReward: toNum(raw.xpReward),
    criteria:
      raw.criteria && typeof raw.criteria === "object"
        ? (raw.criteria as Record<string, unknown>)
        : null,
    hidden: Boolean(raw.hidden),
    iconUrl: mediaUrl(raw.icon),
  };
}

let _catalogCache: ServerAchievement[] | null = null;
let _catalogInflight: Promise<ServerAchievement[]> | null = null;

export async function fetchAchievements(): Promise<ServerAchievement[]> {
  if (_catalogCache) return _catalogCache;
  if (_catalogInflight) return _catalogInflight;

  _catalogInflight = (async () => {
    const res = await fetch("/api/achievements", { cache: "no-store" });
    if (!res.ok) throw new Error(`fetchAchievements ${res.status}`);
    const json = await res.json().catch(() => ({}));
    const rows: any[] = Array.isArray(json?.data) ? json.data : [];
    const out = rows
      .map(normalizeAchievement)
      .filter((a): a is ServerAchievement => a !== null && !a.hidden);
    _catalogCache = out;
    return out;
  })();

  try {
    return await _catalogInflight;
  } finally {
    _catalogInflight = null;
  }
}

let _earnedCache: ServerUserAchievement[] | null = null;
let _earnedInflight: Promise<ServerUserAchievement[]> | null = null;

export async function fetchUserAchievements(): Promise<ServerUserAchievement[]> {
  if (_earnedCache) return _earnedCache;
  if (_earnedInflight) return _earnedInflight;

  _earnedInflight = (async () => {
    const res = await fetch(
      "/api/user-achievements?populate[achievement][populate]=icon&pagination[pageSize]=200&sort=earnedAt:desc",
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`fetchUserAchievements ${res.status}`);
    const json = await res.json().catch(() => ({}));
    const rows: any[] = Array.isArray(json?.data) ? json.data : [];
    const out: ServerUserAchievement[] = rows
      .map((raw) => {
        if (!raw?.documentId) return null;
        return {
          documentId: String(raw.documentId),
          earnedAt: typeof raw.earnedAt === "string" ? raw.earnedAt : "",
          progress: toNum(raw.progress),
          achievement: normalizeAchievement(raw.achievement),
        };
      })
      .filter((ua): ua is ServerUserAchievement => ua !== null);
    _earnedCache = out;
    return out;
  })();

  try {
    return await _earnedInflight;
  } finally {
    _earnedInflight = null;
  }
}

export function resetAchievementsCache(): void {
  _catalogCache = null;
  _earnedCache = null;
}
