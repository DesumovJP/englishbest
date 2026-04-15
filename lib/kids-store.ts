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

// ─── Kids State ───────────────────────────────────────────────────────────────

const STATE_KEY = "main";

/**
 * Bump this when seed fields (coins, ownedItemIds) should be re-applied
 * to existing local installs. On load, if stored.seedVersion < current,
 * coins + ownedItemIds are overwritten from DEFAULT_STATE.
 */
const SEED_VERSION = 2;

export const DEFAULT_STATE: KidsState = {
  coins: 2000,
  streak: 3,
  xp: 40,
  level: 1,
  activeCharacterId: "fox",
  unlockedRoomIds: [],
  outfit: {},
  ownedItemIds: [
    "sofa", "bookshelf", "armchair", "lamp",
    "globe", "plant", "clock", "rainbow",
    "hat", "scarf", "backpack",
    "trophy", "rocket",
  ],
  placedItems: [],
  equippedItemIds: [],
  seedVersion: SEED_VERSION,
};

export const kidsStateStore = {
  get: async (): Promise<KidsState> => {
    const row = await tx<{ key: string; value: Partial<KidsState> } | undefined>(
      STORE_STATE,
      "readonly",
      (s) => s.get(STATE_KEY)
    );
    // Merge defaults so rows written before a field was introduced still work.
    const storedSeed = row?.value?.seedVersion ?? 0;
    const merged = { ...DEFAULT_STATE, ...(row?.value ?? {}) };
    // Re-seed coins + ownedItemIds if local copy is below current seed version.
    if (storedSeed < SEED_VERSION) {
      merged.coins = DEFAULT_STATE.coins;
      merged.ownedItemIds = [...DEFAULT_STATE.ownedItemIds];
      merged.seedVersion = SEED_VERSION;
      await tx(STORE_STATE, "readwrite", (s) =>
        s.put({ key: STATE_KEY, value: merged })
      );
    }
    return merged;
  },

  set: (state: KidsState): Promise<string> =>
    tx(STORE_STATE, "readwrite", (s) =>
      s.put({ key: STATE_KEY, value: state })
    ) as Promise<string>,

  patch: async (partial: Partial<KidsState>): Promise<KidsState> => {
    const current = await kidsStateStore.get();
    const next = { ...current, ...partial };
    await kidsStateStore.set(next);
    return next;
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
