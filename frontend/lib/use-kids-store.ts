"use client";
/**
 * use-kids-store.ts
 * React hooks for Kids Zone IndexedDB store.
 * Each hook subscribes to cross-component sync events.
 */

import { useEffect, useState, useCallback } from "react";
import {
  itemsStore,
  roomsStore,
  charactersStore,
  kidsStateStore,
  onKidsEvent,
  emitKidsEvent,
  generateId,
  CustomItem,
  CustomRoom,
  CustomCharacter,
  KidsState,
  LootResult,
  PlacedItem,
  DEFAULT_STATE,
} from "./kids-store";
import { fetchRooms, peekRooms, ServerRoom } from "./rooms";
import { fetchCharacters, peekCharacters, ServerCharacter } from "./character-catalog";
import { fetchShopItems, peekShopItems, ServerShopItem } from "./shop-items";
import {
  fetchAchievements,
  fetchUserAchievements,
  ServerAchievement,
  ServerUserAchievement,
} from "./achievements";
import { fetchLibraryItems, peekLibraryItems, LibraryItem } from "./library";

// ─── useCustomItems ───────────────────────────────────────────────────────────

export function useCustomItems() {
  const [items, setItems] = useState<CustomItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    itemsStore.getAll().then((all) => {
      setItems(all.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
    return onKidsEvent("kids:items-changed", load);
  }, [load]);

  const addItem = useCallback(async (item: CustomItem) => {
    await itemsStore.put(item);
    emitKidsEvent("kids:items-changed");
  }, []);

  const removeItem = useCallback(async (id: string) => {
    await itemsStore.delete(id);
    emitKidsEvent("kids:items-changed");
  }, []);

  return { items, loading, addItem, removeItem };
}

// ─── useCustomRooms ───────────────────────────────────────────────────────────

export function useCustomRooms() {
  const [rooms, setRooms] = useState<CustomRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    roomsStore.getAll().then((all) => {
      setRooms(all.sort((a, b) => a.coinsRequired - b.coinsRequired));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
    return onKidsEvent("kids:rooms-changed", load);
  }, [load]);

  const addRoom = useCallback(async (room: CustomRoom) => {
    await roomsStore.put(room);
    emitKidsEvent("kids:rooms-changed");
  }, []);

  const removeRoom = useCallback(async (id: string) => {
    await roomsStore.delete(id);
    emitKidsEvent("kids:rooms-changed");
  }, []);

  return { rooms, loading, addRoom, removeRoom };
}

// ─── useRoomCatalog ──────────────────────────────────────────────────────────
//
// Fetches the server-managed Room catalog once per page mount. Cached by
// `fetchRooms()` so repeat mounts don't re-hit the network unless the cache
// is manually reset.

export function useRoomCatalog() {
  // Synchronous hydration from module-level cache: if a previous mount on this
  // page-load already fetched the catalog, render immediately without flashing
  // a skeleton. Background revalidate via `fetchRooms()` keeps it fresh.
  const cached = peekRooms();
  const [rooms, setRooms] = useState<ServerRoom[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    fetchRooms()
      .then((r) => {
        if (!alive) return;
        setRooms(r);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { rooms, loading, error };
}

// ─── useCharacterCatalog ─────────────────────────────────────────────────────
//
// Fetches the server-managed Character catalog once per page mount. Side
// effect: emotion maps are registered into `lib/characters.ts` so
// CharacterAvatar auto-renders admin-added characters.

export function useCharacterCatalog() {
  const cached = peekCharacters();
  const [characters, setCharacters] = useState<ServerCharacter[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    fetchCharacters()
      .then((c) => {
        if (!alive) return;
        setCharacters(c);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { characters, loading, error };
}

// ─── useShopCatalog ──────────────────────────────────────────────────────────
//
// Fetches the server-managed shop catalog once per page mount. Side effect:
// each item is registered into `lib/shop-catalog.ts` so placed-item and
// equipped-overlay lookups resolve admin-uploaded items without a redeploy.

export function useShopCatalog() {
  const cached = peekShopItems();
  const [items, setItems] = useState<ServerShopItem[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    fetchShopItems()
      .then((i) => {
        if (!alive) return;
        setItems(i);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { items, loading, error };
}

// ─── useLibrary ──────────────────────────────────────────────────────────────
//
// Loads the library catalog (books / videos / games / courses) from Strapi.
// One call per page mount, cached at module level.

export function useLibrary() {
  const cached = peekLibraryItems();
  const [items, setItems] = useState<LibraryItem[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    fetchLibraryItems()
      .then((it) => {
        if (!alive) return;
        setItems(it);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { items, loading, error };
}

// ─── useAchievements ─────────────────────────────────────────────────────────
//
// Loads the public achievements catalog AND the caller's earned user-achievements
// in parallel. The page derives earned/locked state by joining on slug.

export function useAchievements() {
  const [catalog, setCatalog] = useState<ServerAchievement[]>([]);
  const [earned, setEarned] = useState<ServerUserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchAchievements(), fetchUserAchievements()])
      .then(([c, e]) => {
        if (!alive) return;
        setCatalog(c);
        setEarned(e);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { catalog, earned, loading, error };
}

// ─── useCustomCharacters ──────────────────────────────────────────────────────

export function useCustomCharacters() {
  const [characters, setCharacters] = useState<CustomCharacter[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    charactersStore.getAll().then((all) => {
      setCharacters(all.sort((a, b) => a.createdAt - b.createdAt));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
    return onKidsEvent("kids:characters-changed", load);
  }, [load]);

  const addCharacter = useCallback(async (char: CustomCharacter) => {
    await charactersStore.put(char);
    emitKidsEvent("kids:characters-changed");
  }, []);

  const removeCharacter = useCallback(async (id: string) => {
    await charactersStore.delete(id);
    emitKidsEvent("kids:characters-changed");
  }, []);

  const updateMoodImage = useCallback(
    async (charId: string, mood: string, dataUrl: string) => {
      const char = await charactersStore.get(charId);
      if (!char) return;
      char.moodImages = { ...char.moodImages, [mood]: dataUrl };
      await charactersStore.put(char);
      emitKidsEvent("kids:characters-changed");
    },
    []
  );

  return { characters, loading, addCharacter, removeCharacter, updateMoodImage };
}

// ─── useKidsState ─────────────────────────────────────────────────────────────

export function useKidsState() {
  const [state, setState] = useState<KidsState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    kidsStateStore.get().then((s) => {
      setState(s);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
    return onKidsEvent("kids:state-changed", load);
  }, [load]);

  const patch = useCallback(async (partial: Partial<KidsState>) => {
    const next = await kidsStateStore.patch(partial);
    setState(next);
    emitKidsEvent("kids:state-changed");
    return next;
  }, []);

  const spendCoins = useCallback(
    async (amount: number): Promise<boolean> => {
      const current = await kidsStateStore.get();
      if (current.coins < amount) return false;
      await kidsStateStore.patch({ coins: current.coins - amount });
      emitKidsEvent("kids:state-changed");
      return true;
    },
    []
  );

  /**
   * Purchase a shop item via the server-authoritative endpoint. Server
   * validates level + balance, appends to ownedShopItems, and debits coins
   * atomically. Returns true on success, false on any 4xx (insufficient
   * funds, level gate, already owned).
   */
  const purchaseShopItem = useCallback(
    async (slug: string): Promise<boolean> => {
      try {
        await kidsStateStore.purchaseShopItem(slug);
        emitKidsEvent("kids:state-changed");
        return true;
      } catch {
        emitKidsEvent("kids:state-changed");
        return false;
      }
    },
    [],
  );

  /**
   * Open a loot box via the server-authoritative endpoint. Returns the loot
   * result (item awarded, duplicate flag) on success or null on error. State
   * is always refreshed — server may have debited coins or refunded.
   */
  const openLootBox = useCallback(
    async (boxType: "common" | "silver" | "gold" | "legendary"): Promise<LootResult | null> => {
      try {
        const { loot } = await kidsStateStore.openLootBox(boxType);
        emitKidsEvent("kids:state-changed");
        return loot;
      } catch {
        emitKidsEvent("kids:state-changed");
        return null;
      }
    },
    [],
  );

  /** Toggle equip state for an owned shop item (server-authoritative). */
  const equipShopItem = useCallback(
    async (slug: string, equip: boolean): Promise<boolean> => {
      try {
        await kidsStateStore.equipShopItem(slug, equip);
        emitKidsEvent("kids:state-changed");
        return true;
      } catch {
        emitKidsEvent("kids:state-changed");
        return false;
      }
    },
    [],
  );

  /**
   * Add a placement for an owned item. Returns the new placement id. Cache
   * updates instantly; the server PATCH is debounced (see kidsStateStore
   * `updatePlacedItems` / `flushPendingPlacedItems`).
   */
  const placeItem = useCallback(
    async (itemId: string, pos?: { x?: number; y?: number }): Promise<string> => {
      const id = generateId("place");
      await kidsStateStore.updatePlacedItems((prev) => [
        ...prev,
        { id, itemId, x: pos?.x ?? 0.5, y: pos?.y ?? 0.78, scale: 1 },
      ]);
      emitKidsEvent("kids:state-changed");
      return id;
    },
    [],
  );

  const movePlacement = useCallback(
    async (id: string, x: number, y: number): Promise<void> => {
      await kidsStateStore.updatePlacedItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, x, y } : p)),
      );
      emitKidsEvent("kids:state-changed");
    },
    [],
  );

  const removePlacement = useCallback(
    async (id: string): Promise<void> => {
      await kidsStateStore.updatePlacedItems((prev) => prev.filter((p) => p.id !== id));
      emitKidsEvent("kids:state-changed");
    },
    [],
  );

  return {
    state,
    loading,
    patch,
    spendCoins,
    purchaseShopItem,
    equipShopItem,
    openLootBox,
    placeItem,
    movePlacement,
    removePlacement,
  };
}
