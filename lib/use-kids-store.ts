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
  CustomItem,
  CustomRoom,
  CustomCharacter,
  KidsState,
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

  return { state, loading, patch, spendCoins };
}
