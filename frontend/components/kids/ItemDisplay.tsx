"use client";

/**
 * ItemDisplay
 * Renders a shop/room item with 3 visual states: idle → hover → active.
 * If custom images are stored in IndexedDB, they take priority.
 * Falls back to emoji + colored background.
 */

import { useEffect, useState } from "react";
import { itemsStore, CustomItem } from "@/lib/kids-store";
import { onKidsEvent } from "@/lib/kids-store";

interface DefaultItem {
  id: string;
  nameEn: string;
  nameUa: string;
  emojiFallback: string;
  /** optional bg color for the fallback tile */
  color?: string;
}

interface ItemDisplayProps {
  item: DefaultItem;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  sm: { wrapper: "w-14 h-14", emoji: "text-3xl" },
  md: { wrapper: "w-20 h-20", emoji: "text-4xl" },
  lg: { wrapper: "w-28 h-28", emoji: "text-5xl" },
};

export function ItemDisplay({
  item,
  size = "md",
  showLabel = false,
  className = "",
  onClick,
}: ItemDisplayProps) {
  const [custom, setCustom] = useState<CustomItem | undefined>(undefined);
  const sz = SIZE_MAP[size];

  useEffect(() => {
    itemsStore.get(item.id).then(setCustom);
    return onKidsEvent("kids:items-changed", () =>
      itemsStore.get(item.id).then(setCustom)
    );
  }, [item.id]);

  const hasIdle   = Boolean(custom?.imageIdle);
  const hasHover  = Boolean(custom?.imageHover);
  const hasActive = Boolean(custom?.imageActive);

  return (
    <div
      className={`tk-item-display flex flex-col items-center gap-2 cursor-pointer select-none ${className}`}
      onClick={onClick}
    >
      <div
        className={`${sz.wrapper} rounded-2xl overflow-hidden relative flex items-center justify-center`}
        style={{ background: item.color ?? "#e0f2fe" }}
      >
        {hasIdle ? (
          <>
            {/* idle */}
            <img
              src={custom!.imageIdle}
              alt={item.nameEn}
              className="tk-img-idle w-full h-full object-contain"
              draggable={false}
            />
            {/* hover */}
            {hasHover && (
              <img
                src={custom!.imageHover}
                alt={item.nameEn}
                className="tk-img-hover w-full h-full object-contain absolute inset-0"
                draggable={false}
              />
            )}
            {/* active */}
            {hasActive && (
              <img
                src={custom!.imageActive}
                alt={item.nameEn}
                className="tk-img-active w-full h-full object-contain absolute inset-0"
                draggable={false}
              />
            )}
            {/* fallback hover = idle if no hover image */}
            {!hasHover && (
              <img
                src={custom!.imageIdle}
                alt={item.nameEn}
                className="tk-img-hover w-full h-full object-contain absolute inset-0 scale-110"
                draggable={false}
              />
            )}
          </>
        ) : (
          <span className={sz.emoji} role="img" aria-label={item.nameEn}>
            {item.emojiFallback}
          </span>
        )}
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="font-black text-xs text-[var(--tk-ink)] leading-tight">
            {item.nameEn}
          </p>
          <p className="font-bold text-[10px] text-[var(--tk-muted)]">
            {item.nameUa}
          </p>
        </div>
      )}
    </div>
  );
}
