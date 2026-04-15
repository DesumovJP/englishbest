# Inventory & Home Placement — Architecture

Production-ready localStorage/IndexedDB flow for shop purchases, inventory, and
home-screen item placement. No backend required — works offline & on Vercel prod.

## 1. Data model

Extends the existing `KidsState` in `lib/kids-store.ts`:

```ts
interface KidsState {
  // ...existing coins, xp, streak, level, activeCharacterId, outfit...

  /** Shop item IDs the user has purchased (persists across sessions). */
  ownedItemIds: string[];

  /** Items the user has placed onto their home (dashboard) screen. */
  placedItems: PlacedItem[];
}

interface PlacedItem {
  /** Unique placement instance — a single item can be placed multiple times. */
  id: string;
  /** Matches `ShopItem.id` so we can look up emoji / custom image. */
  itemId: string;
  /** Normalized position on the dashboard canvas, 0..1 from top-left. */
  x: number;
  y: number;
  /** Visual scale, defaults to 1. */
  scale?: number;
  /** Stacking order. */
  z?: number;
}
```

### Why normalized coordinates (0..1)?

The dashboard is a full-viewport canvas whose dimensions change per device
(mobile portrait ≠ tablet landscape). Storing pixel offsets would break layout
when resuming on a different screen. Normalized percentages keep layouts
responsive and let the same stored state look correct on every device.

### Why separate `ownedItemIds` from `placedItems`?

A purchase gives the user an item in their inventory. Placing it on the home
screen is a *separate* action — so the user can collect items, place/unplace
them freely, and place the same item in more than one spot. This mirrors the
Toca Boca / Sims mental model already recorded in memory.

### Forward-compat with existing stored state

`kidsStateStore.get()` now merges `DEFAULT_STATE` with the stored value so that
users who already have a row without these new fields won't read `undefined`.

## 2. Store API (hooks)

Added to `useKidsState()`:

| API | Behavior |
|---|---|
| `isOwned(itemId)` | `true` if item is in `ownedItemIds` |
| `purchaseItem(itemId, price)` | Deducts coins, adds to `ownedItemIds`. Returns `false` if insufficient coins |
| `placeItem(itemId, pos?)` | Appends a `PlacedItem` with default center-ish position; returns placement id |
| `movePlacement(id, x, y)` | Persists new normalized position |
| `removePlacement(id)` | Deletes placement |

All mutations call `kidsStateStore.patch` → IndexedDB `put`, then dispatch
`kids:state-changed` so every subscribed component refreshes in real time.

## 3. UI flow

```
Shop  →  buy (spelling challenge)  →  ownedItemIds += [item.id]
                                      coins -= price

Інвентар (in shop)  →  "На домівку"  →  placedItems += [{itemId, x:0.5, y:0.5}]
                   →  "Зняти"        →  ownedItemIds stays; placement removed

Dashboard  →  edit toggle  →  drag items    →  movePlacement
                           →  ✕ delete      →  removePlacement
                           →  close toggle  →  items locked in place
```

### Shop changes
- "Dress Up" tab renamed → **Інвентар**.
- Outfit items: tap to equip (existing).
- Furniture / decor / special: tap owned item → toggle "На домівку" (add a placement) or "Зняти" (remove latest placement of that itemId).
- Purchases now call `purchaseItem` → IndexedDB persistence, not page-local `Set`.

### Dashboard changes
- Placed-items layer renders behind HUD widgets, above background.
- A small "Edit" button (pencil icon) in a free corner toggles edit mode.
- In edit mode each placement gets a subtle outline + delete button; pointer drag updates position (percentage of container dims).
- Exit edit mode persists state and locks items (no pointer events).

### Drag implementation
- Native pointer events (no external dep — we want zero new packages).
- On `pointerdown`: record offset within item; call `setPointerCapture`.
- On `pointermove` (while dragging): update local transient position.
- On `pointerup`: compute normalized x/y and call `movePlacement`.
- Local transient state avoids a store write per frame.

## 4. Persistence

- Primary: IndexedDB (`kidsState` object store, key `"main"`).
- Works in all modern browsers & Vercel prod with no server.
- IndexedDB survives hard reloads, tab closes, and browser restarts (unless the user clears site data).

## 5. Non-goals (intentional)

- No backend sync — single-device only for now.
- No drag-to-resize (scale is set once, defaults to 1). Can be added later without schema change.
- No multi-room "rooms" separation — placements live on the dashboard, which already supports background swapping via `roomBackground`.
