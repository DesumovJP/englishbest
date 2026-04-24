/**
 * Library catalog loader.
 *
 * Reads `course` records with `kind in (book, video, game, course)` from
 * Strapi. One collection, one endpoint — the UI splits by `kind` client-side.
 * Types and UI constants that used to live in the now-removed
 * `library-data.ts` are co-located here since the library is the only
 * consumer.
 */

export type LibKind = "book" | "course" | "video" | "game";
export type LibTabId = "all" | LibKind;

export type Level = "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface LibraryItem {
  slug: string;
  kind: LibKind;
  iconEmoji: string;
  title: string;        // English title
  titleUa: string;
  subtitle: string;
  level: Level;
  price: number;
  isNew: boolean;
  provider: string | null;
  externalUrl: string | null;
  descriptionShort: string;
  descriptionLong: string[] | null;
  preview: { title: string; text: string } | null;
}

const LEVELS = new Set<Level>(["A0", "A1", "A2", "B1", "B2", "C1", "C2"]);
const KINDS = new Set<LibKind>(["book", "course", "video", "game"]);

function pickLevel(v: unknown): Level {
  return typeof v === "string" && LEVELS.has(v as Level) ? (v as Level) : "A1";
}

function pickKind(v: unknown): LibKind {
  return typeof v === "string" && KINDS.has(v as LibKind) ? (v as LibKind) : "course";
}

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v !== "" && !Number.isNaN(Number(v))) return Number(v);
  return 0;
}

function toStringArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const out = v.filter((x): x is string => typeof x === "string");
  return out.length ? out : null;
}

function toPreview(v: unknown): { title: string; text: string } | null {
  if (!v || typeof v !== "object") return null;
  const title = (v as { title?: unknown }).title;
  const text = (v as { text?: unknown }).text;
  if (typeof title !== "string" || typeof text !== "string") return null;
  return { title, text };
}

function normalize(raw: any): LibraryItem | null {
  if (!raw?.slug || !raw?.title) return null;
  return {
    slug: String(raw.slug),
    kind: pickKind(raw.kind),
    iconEmoji: typeof raw.iconEmoji === "string" && raw.iconEmoji ? raw.iconEmoji : "📘",
    title: String(raw.title),
    titleUa: typeof raw.titleUa === "string" ? raw.titleUa : String(raw.title),
    subtitle: typeof raw.subtitle === "string" ? raw.subtitle : "",
    level: pickLevel(raw.level),
    price: toNum(raw.price),
    isNew: Boolean(raw.isNew),
    provider: typeof raw.provider === "string" && raw.provider ? raw.provider : null,
    externalUrl: typeof raw.externalUrl === "string" && raw.externalUrl ? raw.externalUrl : null,
    descriptionShort:
      typeof raw.descriptionShort === "string" ? raw.descriptionShort : "",
    descriptionLong: toStringArray(raw.descriptionLong),
    preview: toPreview(raw.preview),
  };
}

let _cache: LibraryItem[] | null = null;
let _inflight: Promise<LibraryItem[]> | null = null;

export async function fetchLibraryItems(): Promise<LibraryItem[]> {
  if (_cache) return _cache;
  if (_inflight) return _inflight;

  const url = `/api/courses?filters[kind][$in][0]=book&filters[kind][$in][1]=video&filters[kind][$in][2]=game&filters[kind][$in][3]=course&pagination[pageSize]=200&sort=title:asc`;

  _inflight = (async () => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`fetchLibraryItems ${res.status}`);
    const json = await res.json().catch(() => ({}));
    const rows: any[] = Array.isArray(json?.data) ? json.data : [];
    const out = rows.map(normalize).filter((x): x is LibraryItem => x !== null);
    _cache = out;
    return out;
  })();

  try {
    return await _inflight;
  } finally {
    _inflight = null;
  }
}

export function resetLibraryCache(): void {
  _cache = null;
}

// ─── UI constants (co-located; only the library uses these) ──────────────────

export const LIB_CATEGORIES: { id: LibTabId; label: string }[] = [
  { id: "all",    label: "Все"    },
  { id: "book",   label: "Книги"  },
  { id: "course", label: "Курси"  },
  { id: "video",  label: "Відео"  },
  { id: "game",   label: "Ігри"   },
];

export const TYPE_ACCENT: Record<LibKind, string> = {
  book:   "#4F9CF9",
  course: "#22C55E",
  video:  "#A855F7",
  game:   "#F59E0B",
};

export const TYPE_LABEL: Record<LibKind, string> = {
  book:   "Книга",
  course: "Курс",
  video:  "Відео",
  game:   "Гра",
};

export const TYPE_SECTION: Record<LibKind, string> = {
  book:   "Книги 📚",
  course: "Курси 🎓",
  video:  "Відео 🎬",
  game:   "Ігри 🎮",
};

export const TYPE_ICON: Record<LibKind, string> = {
  book:   "📚",
  course: "🎓",
  video:  "🎬",
  game:   "🎮",
};

export const COVER_BG: Record<LibKind, string> = {
  book:   "linear-gradient(160deg, #1e3a5f 0%, #1D4ED8 100%)",
  course: "linear-gradient(160deg, #064e3b 0%, #059669 100%)",
  video:  "linear-gradient(160deg, #3b0764 0%, #7C3AED 100%)",
  game:   "linear-gradient(160deg, #78350f 0%, #D97706 100%)",
};

const LEVEL_ORDER: Level[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

export function canAccessLevel(userLevel: Level, req: Level): boolean {
  return LEVEL_ORDER.indexOf(userLevel) >= LEVEL_ORDER.indexOf(req);
}
