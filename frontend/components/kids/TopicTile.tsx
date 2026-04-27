/**
 * TopicTile — vocabulary set rendered as a colourful 5:4 tile.
 *
 * The colour comes from a stable hash of the slug (kid-friendly palette)
 * so each topic has a distinctive identity without needing per-set
 * curation. If we ever want admin-set covers, add a `coverColor` field
 * on `vocabulary-set` and let it override `colorForSlug()`.
 */
'use client';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { VocabularySet } from '@/lib/vocabulary';

const PALETTE: { bg: string; bgDark: string }[] = [
  { bg: '#fb923c', bgDark: '#c2410c' }, // orange
  { bg: '#3b82f6', bgDark: '#1e40af' }, // blue
  { bg: '#22c55e', bgDark: '#15803d' }, // green
  { bg: '#a855f7', bgDark: '#7e22ce' }, // purple
  { bg: '#06b6d4', bgDark: '#0e7490' }, // cyan
  { bg: '#f43f5e', bgDark: '#be123c' }, // rose
  { bg: '#eab308', bgDark: '#a16207' }, // amber
  { bg: '#ec4899', bgDark: '#be185d' }, // pink
];

function colorForSlug(slug: string): { bg: string; bgDark: string } {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
}

interface Props {
  set: VocabularySet;
  isLocked?: boolean;
}

export function TopicTile({ set, isLocked }: Props) {
  const { bg, bgDark } = colorForSlug(set.slug);
  const style: CSSProperties = {
    background: `linear-gradient(150deg, ${bg} 0%, ${bgDark} 100%)`,
  };

  const tile = (
    <div
      className="relative aspect-[5/4] rounded-3xl overflow-hidden text-white shadow-card-md flex flex-col p-4 sm:p-5"
      style={style}
    >
      {/* Dot pattern overlay for texture. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />

      <div className="relative flex items-start justify-between gap-2">
        <span aria-hidden className="text-[44px] sm:text-[52px] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
          {set.iconEmoji}
        </span>
        <span className="font-black text-[10.5px] tracking-[0.12em] uppercase rounded-full px-2 py-1 bg-white/20 border border-white/25 backdrop-blur-sm">
          {set.level}
        </span>
      </div>

      <div className="relative mt-auto">
        <p className="font-black text-[16px] sm:text-[18px] leading-tight tracking-tight">
          {set.titleUa}
        </p>
        <p className="font-bold text-[11.5px] sm:text-[12.5px] text-white/85 mt-1 tabular-nums">
          {set.words.length} слів
        </p>
      </div>

      {isLocked && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
          <span className="text-3xl" aria-hidden>🔒</span>
        </div>
      )}
    </div>
  );

  if (isLocked) {
    return <div aria-disabled>{tile}</div>;
  }
  return (
    <Link
      href={`/kids/vocab/${set.slug}`}
      className="block active:scale-[0.98] transition-transform"
    >
      {tile}
    </Link>
  );
}
