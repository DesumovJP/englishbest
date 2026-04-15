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
  PlacedItem,
  DEFAULT_STATE,
} from "./kids-store";

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
   * Purchase a shop item: atomically deducts coins and appends to ownedItemIds.
   * Returns false if the user can't afford it or already owns it.
   */
  const purchaseItem = useCallback(
    async (itemId: string, price: number): Promise<boolean> => {
      const current = await kidsStateStore.get();
      if (current.ownedItemIds.includes(itemId)) return false;
      if (current.coins < price) return false;
      await kidsStateStore.patch({
        coins: current.coins - price,
        ownedItemIds: [...current.ownedItemIds, itemId],
      });
      emitKidsEvent("kids:state-changed");
      return true;
    },
    []
  );

  /** Add a placement for an owned item. Returns the new placement id. */
  const placeItem = useCallback(
    async (itemId: string, pos?: { x?: number; y?: number }): Promise<string> => {
      const current = await kidsStateStore.get();
      const id = generateId("place");
      const next: PlacedItem = {
        id,
        itemId,
        x: pos?.x ?? 0.5,
        y: pos?.y ?? 0.78,
        scale: 1,
      };
      await kidsStateStore.patch({
        placedItems: [...current.placedItems, next],
      });
      emitKidsEvent("kids:state-changed");
      return id;
    },
    []
  );

  const movePlacement = useCallback(
    async (id: string, x: number, y: number): Promise<void> => {
      const current = await kidsStateStore.get();
      await kidsStateStore.patch({
        placedItems: current.placedItems.map((p) =>
          p.id === id ? { ...p, x, y } : p
        ),
      });
      emitKidsEvent("kids:state-changed");
    },
    []
  );

  const removePlacement = useCallback(
    async (id: string): Promise<void> => {
      const current = await kidsStateStore.get();
      await kidsStateStore.patch({
        placedItems: current.placedItems.filter((p) => p.id !== id),
      });
      emitKidsEvent("kids:state-changed");
    },
    []
  );

  return {
    state,
    loading,
    patch,
    spendCoins,
    purchaseItem,
    placeItem,
    movePlacement,
    removePlacement,
  };
}
