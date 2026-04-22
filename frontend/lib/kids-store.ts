/**
 * kids-store.ts
 * IndexedDB-backed store for Kids Zone custom assets.
 * No external dependencies — works on Vercel prod, persists across page reloads.
 *
 * Stores:
 *   - customItems     — furniture / decor added via "+" in Shop
 *   - customRooms     — room backgrounds uploaded in Shop
 *   - customCharacters — characters with per-mood image overrides
 *   - kidsState       — active character, coin balance, unlocked rooms, etc.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ItemCategory = "furniture" | "decor" | "outfit" | "special";

export interface CustomItem {
  id: string;
  nameEn: string;
  nameUa: string;
  category: ItemCategory;
  emojiFallback: string;
  price: number;
  /** base64 DataURL, shown at rest */
  imageIdle?: string;
  /** base64 DataURL, shown on hover */
  imageHover?: string;
  /** base64 DataURL, shown on tap/active */
  imageActive?: string;
  createdAt: number;
}

export interface CustomRoom {
  id: string;
  nameEn: string;
  nameUa: string;
  coinsRequired: number;
  /** base64 DataURL for background */
  backgroundImage?: string;
  createdAt: number;
}

export type CharacterMood =
  | "happy"
  | "excited"
  | "neutral"
  | "thinking"
  | "surprised"
  | "sleepy"
  | "proud"
  | "sad"
  | "confused"
  | "celebrating";

export type AnimalKind = "fox" | "cat" | "dragon" | "rabbit" | "raccoon" | "frog";

export interface CustomCharacter {
  id: string;
  nameEn: string;
  nameUa: string;
  /** fallback animal SVG if no image uploaded */
  animalFallback: AnimalKind;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  /** per-mood image overrides, base64 DataURL */
  moodImages: Partial<Record<CharacterMood, string>>;
  createdAt: number;
}

/**
 * A single placement of a shop item on the dashboard canvas.
 * Coordinates are normalized (0..1) so layouts survive viewport changes.
 */
export interface PlacedItem {
  /** Unique placement instance — same itemId can be placed multiple times. */
  id: string;
  /** Shop item id (catalog or custom) to look up visuals. */
  itemId: string;
  /** 0..1 normalized x from left edge of dashboard canvas. */
  x: number;
  /** 0..1 normalized y from top edge of dashboard canvas. */
  y: number;
  /** Visual scale. Defaults to 1. */
  scale?: number;
  /** Stacking order. */
  z?: number;
}

export interface KidsState {
  coins: number;
  streak: number;
  xp: number;
  level: number;
  activeCharacterId: string;
  activeRoomId?: string;
  unlockedRoomIds: string[];
  /** Characters the user owns (slug list). */
  ownedCharacterIds: string[];
  /** CSS background value or image URL for the dashboard room */
  roomBackground?: string;
  /** outfit slots for the active character */
  outfit: {
    hat?: string;
    glasses?: string;
    scarf?: string;
    bag?: string;
  };
  /** Shop items the user has purchased. */
  ownedItemIds: string[];
  /** Shop items currently equipped on the active character (outfit/special). */
  equippedItemIds: string[];
  /** Items placed on the dashboard home canvas. */
  placedItems: PlacedItem[];
  /** Seed version — used to re-apply new DEFAULT_STATE fields to existing installs. */
  seedVersion?: number;
}

// ─── DB setup ────────────────────────────────────────────────────────────────

const DB_NAME = "englishbest-kids";
const DB_VERSION = 1;

const STORE_ITEMS      = "customItems";
const STORE_ROOMS      = "customRooms";
const STORE_CHARACTERS = "customCharacters";
const STORE_STATE      = "kidsState";

let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ITEMS)) {
        db.createObjectStore(STORE_ITEMS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_ROOMS)) {
        db.createObjectStore(STORE_ROOMS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_CHARACTERS)) {
        db.createObjectStore(STORE_CHARACTERS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_STATE)) {
        db.createObjectStore(STORE_STATE, { keyPath: "key" });
      }
    };

    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result;
      resolve(_db);
    };

    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(storeName, mode);
        const req = fn(t.objectStore(storeName));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

function txAll<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T[]>
): Promise<T[]> {
  return tx<T[]>(storeName, mode, fn);
}

// ─── Custom Items ─────────────────────────────────────────────────────────────

export const itemsStore = {
  getAll: (): Promise<CustomItem[]> =>
    txAll(STORE_ITEMS, "readonly", (s) => s.getAll()),

  get: (id: string): Promise<CustomItem | undefined> =>
    tx(STORE_ITEMS, "readonly", (s) => s.get(id)),

  put: (item: CustomItem): Promise<string> =>
    tx(STORE_ITEMS, "readwrite", (s) => s.put(item)) as Promise<string>,

  delete: (id: string): Promise<undefined> =>
    tx(STORE_ITEMS, "readwrite", (s) => s.delete(id)) as Promise<undefined>,
};

// ─── Custom Rooms ─────────────────────────────────────────────────────────────

export const roomsStore = {
  getAll: (): Promise<CustomRoom[]> =>
    txAll(STORE_ROOMS, "readonly", (s) => s.getAll()),

  get: (id: string): Promise<CustomRoom | undefined> =>
    tx(STORE_ROOMS, "readonly", (s) => s.get(id)),

  put: (room: CustomRoom): Promise<string> =>
    tx(STORE_ROOMS, "readwrite", (s) => s.put(room)) as Promise<string>,

  delete: (id: string): Promise<undefined> =>
    tx(STORE_ROOMS, "readwrite", (s) => s.delete(id)) as Promise<undefined>,
};

// ─── Custom Characters ───────────────────────────────────────────────────────

export const charactersStore = {
  getAll: (): Promise<CustomCharacter[]> =>
    txAll(STORE_CHARACTERS, "readonly", (s) => s.getAll()),

  get: (id: string): Promise<CustomCharacter | undefined> =>
    tx(STORE_CHARACTERS, "readonly", (s) => s.get(id)),

  put: (char: CustomCharacter): Promise<string> =>
    tx(STORE_CHARACTERS, "readwrite", (s) => s.put(char)) as Promise<string>,

  delete: (id: string): Promise<undefined> =>
    tx(STORE_CHARACTERS, "readwrite", (s) => s.delete(id)) as Promise<undefined>,
};

// ─── Kids State (remote-first, Phase B) ──────────────────────────────────────
//
// Backed by Strapi: `/api/kids-profile/me` (coins/xp/streak/mood) and
// `/api/user-inventory/me` (owned/equipped items, outfit, placedItems).
//
// Wire transport — slugs for item relations, integer deltas for coins/xp
// (server enforces inc/dec-only for coins; see backend/src/api/kids-profile
// controller). We keep the synchronous `KidsState` shape so existing
// consumers (shop, dashboard, characters) don't change.
//
// IndexedDB is still used below for user-uploaded custom items/rooms/
// characters — those are Phase I work (offline cache will re-add local
// mirroring of KidsState). For now KidsState only lives in memory + server.

export const DEFAULT_STATE: KidsState = {
  coins: 0,
  streak: 0,
  xp: 0,
  level: 1,
  activeCharacterId: "fox",
  unlockedRoomIds: [],
  ownedCharacterIds: [],
  outfit: {},
  ownedItemIds: [],
  placedItems: [],
  equippedItemIds: [],
  seedVersion: 0,
};

type InventoryDto = {
  documentId: string;
  outfit?: KidsState["outfit"] | null;
  placedItems?: PlacedItem[] | null;
  seedVersion?: number | null;
  ownedShopItems?: Array<{ slug: string }>;
  equippedItems?: Array<{ slug: string }>;
  ownedCharacters?: Array<{ slug: string }>;
  activeCharacter?: { slug: string } | null;
  unlockedRooms?: Array<{ slug: string }>;
  activeRoom?: { slug: string } | null;
};

type KidsProfileDto = {
  documentId: string;
  totalCoins?: number | string | null;
  totalXp?: number | string | null;
  streakDays?: number | null;
  characterMood?: string | null;
};

let _cache: KidsState | null = null;
let _inflight: Promise<KidsState> | null = null;

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v !== "" && !Number.isNaN(Number(v))) return Number(v);
  return 0;
}

async function fetchState(): Promise<KidsState> {
  const [profRes, invRes] = await Promise.all([
    fetch("/api/kids-profile/me", { credentials: "include", cache: "no-store" }),
    fetch("/api/user-inventory/me", { credentials: "include", cache: "no-store" }),
  ]);
  const prof: { data?: KidsProfileDto } = profRes.ok ? await profRes.json() : {};
  const inv: { data?: InventoryDto } = invRes.ok ? await invRes.json() : {};

  const p = prof.data;
  const i = inv.data;

  const state: KidsState = {
    ...DEFAULT_STATE,
    coins: p ? toNum(p.totalCoins) : 0,
    xp: p ? toNum(p.totalXp) : 0,
    streak: p ? toNum(p.streakDays) : 0,
    ownedItemIds: (i?.ownedShopItems ?? []).map((x) => x.slug),
    equippedItemIds: (i?.equippedItems ?? []).map((x) => x.slug),
    ownedCharacterIds: (i?.ownedCharacters ?? []).map((x) => x.slug),
    activeCharacterId: i?.activeCharacter?.slug ?? DEFAULT_STATE.activeCharacterId,
    unlockedRoomIds: (i?.unlockedRooms ?? []).map((x) => x.slug),
    activeRoomId: i?.activeRoom?.slug ?? undefined,
    outfit: (i?.outfit as KidsState["outfit"]) ?? {},
    placedItems: Array.isArray(i?.placedItems) ? (i!.placedItems as PlacedItem[]) : [],
    seedVersion: toNum(i?.seedVersion),
  };
  return state;
}

export const kidsStateStore = {
  get: async (): Promise<KidsState> => {
    if (_cache) return _cache;
    if (_inflight) return _inflight;
    _inflight = fetchState()
      .then((s) => {
        _cache = s;
        return s;
      })
      .finally(() => {
        _inflight = null;
      });
    return _inflight;
  },

  /** Write a full snapshot to the server. Diffs against cache to route fields. */
  set: async (state: KidsState): Promise<string> => {
    await kidsStateStore.patch(state);
    return "ok";
  },

  patch: async (partial: Partial<KidsState>): Promise<KidsState> => {
    const current = _cache ?? (await kidsStateStore.get());

    // Route writes by field into the two backend endpoints.
    const profileBody: Record<string, unknown> = {};
    if (partial.coins !== undefined) {
      const delta = partial.coins - current.coins;
      if (delta !== 0) profileBody.totalCoinsDelta = delta;
    }
    if (partial.xp !== undefined) {
      const delta = partial.xp - current.xp;
      if (delta > 0) profileBody.totalXpDelta = delta;
      // XP never decreases on the server — negative deltas are dropped.
    }
    if (partial.streak !== undefined) profileBody.streakDays = partial.streak;

    const inventoryBody: Record<string, unknown> = {};
    if (partial.outfit !== undefined) inventoryBody.outfit = partial.outfit;
    if (partial.placedItems !== undefined) inventoryBody.placedItems = partial.placedItems;
    if (partial.ownedItemIds !== undefined) inventoryBody.ownedShopItems = partial.ownedItemIds;
    if (partial.equippedItemIds !== undefined) inventoryBody.equippedItems = partial.equippedItemIds;
    if (partial.seedVersion !== undefined) inventoryBody.seedVersion = partial.seedVersion;
    if (partial.activeCharacterId !== undefined) inventoryBody.activeCharacter = partial.activeCharacterId;
    if (partial.activeRoomId !== undefined) inventoryBody.activeRoom = partial.activeRoomId;

    const calls: Promise<Response>[] = [];
    if (Object.keys(profileBody).length > 0) {
      calls.push(
        fetch("/api/kids-profile/me", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileBody),
        }),
      );
    }
    if (Object.keys(inventoryBody).length > 0) {
      calls.push(
        fetch("/api/user-inventory/me", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inventoryBody),
        }),
      );
    }

    if (calls.length === 0) {
      // Non-persisted fields (level/roomBackground — derived UI state).
      // Update cache only so the UI reflects the change for the session.
      const merged = { ...current, ...partial };
      _cache = merged;
      return merged;
    }

    const results = await Promise.all(calls);
    const firstBad = results.find((r) => !r.ok);
    if (firstBad) {
      _cache = null;
      throw new Error(`kidsStateStore.patch failed (${firstBad.status})`);
    }

    const fresh = await fetchState();
    _cache = {
      ...fresh,
      roomBackground: partial.roomBackground ?? current.roomBackground,
      level: partial.level ?? current.level,
    };
    return _cache;
  },

  /** Purchase a character. Server debits coins and appends to ownedCharacters. */
  purchaseCharacter: async (slug: string): Promise<KidsState> => {
    const res = await fetch("/api/user-inventory/me/purchase-character", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!res.ok) {
      _cache = null;
      const body = await res.json().catch(() => null);
      const msg = body?.error?.message ?? `purchaseCharacter failed (${res.status})`;
      throw new Error(msg);
    }
    const fresh = await fetchState();
    _cache = fresh;
    return fresh;
  },

  /** Unlock a room. Server debits coinsRequired and appends to unlockedRooms. */
  unlockRoom: async (slug: string): Promise<KidsState> => {
    const res = await fetch("/api/user-inventory/me/unlock-room", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!res.ok) {
      _cache = null;
      const body = await res.json().catch(() => null);
      const msg = body?.error?.message ?? `unlockRoom failed (${res.status})`;
      throw new Error(msg);
    }
    const fresh = await fetchState();
    _cache = fresh;
    return fresh;
  },

  /** Clear in-memory cache (e.g. on logout). */
  reset: (): void => {
    _cache = null;
    _inflight = null;
  },
};

// ─── Utility: file → base64 DataURL ──────────────────────────────────────────

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Cross-component sync via CustomEvent ────────────────────────────────────

export type KidsStoreEvent =
  | "kids:items-changed"
  | "kids:rooms-changed"
  | "kids:characters-changed"
  | "kids:state-changed";

export function emitKidsEvent(type: KidsStoreEvent) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(type));
  }
}

export function onKidsEvent(
  type: KidsStoreEvent,
  handler: () => void
): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(type, handler);
  return () => window.removeEventListener(type, handler);
}
