"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { mockKidsUser } from "@/mocks/user";
import CompanionSVG from "@/components/kids/CompanionSVG";
import type { CompanionMood } from "@/components/kids/CompanionSVG";

/* ── Constants ───────────────────────────────────────────────────────────── */
const WALL_H  = 50;  // % of scene for back wall
const FLOOR_H = 50;  // % of scene for floor (100 - WALL_H)

/* ── Room list ───────────────────────────────────────────────────────────── */
const ROOMS = [
  { id: "bedroom", label: "Спальня", emoji: "🛏️", unlockedAt: 1 },
  { id: "garden",  label: "Садок",   emoji: "🌿",  unlockedAt: 5  },
  { id: "castle",  label: "Замок",   emoji: "🏰",  unlockedAt: 10 },
];

/* ══════════════════════════════════════════════════════════════════════════ */
/*  SVG Furniture                                                             */
/* ══════════════════════════════════════════════════════════════════════════ */

function BedSVG() {
  return (
    <img
      src="/bed.png"
      alt="bed"
      width={260}
      height={220}
      className="block object-contain"
    />
  );
}

function DeskSVG() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" className="block">
      {/* Shadow */}
      <ellipse cx="80" cy="118" rx="72" ry="5" fill="#000" opacity="0.08"/>
      {/* Monitor */}
      <rect x="44" y="0" width="72" height="48" rx="6" fill="#1e293b"/>
      <rect x="49" y="5" width="62" height="38" rx="4" fill="#0ea5e9"/>
      {/* Screen glare */}
      <rect x="51" y="7" width="22" height="10" rx="2" fill="white" opacity="0.12"/>
      {/* Screen content */}
      <rect x="53" y="20" width="54" height="4" rx="2" fill="white" opacity="0.2"/>
      <rect x="53" y="27" width="40" height="3" rx="1" fill="white" opacity="0.15"/>
      <rect x="53" y="33" width="48" height="3" rx="1" fill="white" opacity="0.15"/>
      {/* Stand */}
      <rect x="74" y="48" width="12" height="9" rx="2" fill="#334155"/>
      <rect x="62" y="56" width="36" height="4" rx="2" fill="#475569"/>
      {/* Desk surface */}
      <rect x="0" y="61" width="160" height="12" rx="6" fill="#b45309"/>
      <rect x="0" y="61" width="160" height="5" rx="5" fill="#f59e0b"/>
      {/* Books stacked */}
      <rect x="6"  y="43" width="12" height="19" rx="2" fill="#ef4444"/>
      <rect x="19" y="46" width="12" height="16" rx="2" fill="#3b82f6"/>
      <rect x="32" y="48" width="10" height="14" rx="2" fill="#22c55e"/>
      {/* Pencil cup */}
      <rect x="118" y="50" width="18" height="12" rx="4" fill="#fbbf24"/>
      <rect x="118" y="50" width="18" height="4" rx="4" fill="#fde68a"/>
      <line x1="122" y1="50" x2="120" y2="40" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
      <line x1="127" y1="50" x2="127" y2="38" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
      <line x1="132" y1="50" x2="134" y2="41" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
      {/* Legs */}
      <rect x="4"   y="73" width="12" height="47" rx="4" fill="#9a4612"/>
      <rect x="144" y="73" width="12" height="47" rx="4" fill="#9a4612"/>
    </svg>
  );
}

function BookshelfSVG() {
  return (
    <svg width="100" height="150" viewBox="0 0 100 150" className="block">
      {/* Shadow */}
      <ellipse cx="50" cy="148" rx="44" ry="5" fill="#000" opacity="0.1"/>
      {/* Frame */}
      <rect x="0" y="0" width="100" height="148" rx="5" fill="#7c3e1a"/>
      <rect x="5" y="5" width="90" height="138" rx="4" fill="#fffbf0"/>
      {/* Shelves */}
      <rect x="5" y="52" width="90" height="7" rx="2" fill="#9a4612"/>
      <rect x="5" y="100" width="90" height="7" rx="2" fill="#9a4612"/>
      {/* Top shelf — books */}
      {[
        { x: 9,  h: 38, c: "#ef4444" },
        { x: 23, h: 34, c: "#3b82f6" },
        { x: 36, h: 40, c: "#f59e0b" },
        { x: 52, h: 36, c: "#8b5cf6" },
        { x: 65, h: 38, c: "#10b981" },
        { x: 79, h: 34, c: "#f43f5e" },
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={52 - b.h} width="12" height={b.h} rx="2" fill={b.c}/>
          <rect x={b.x} y={52 - b.h} width="12" height="4" rx="1" fill="white" opacity="0.2"/>
        </g>
      ))}
      {/* Mid shelf — books */}
      {[
        { x: 9,  h: 38, c: "#0ea5e9" },
        { x: 23, h: 34, c: "#f97316" },
        { x: 37, h: 40, c: "#84cc16" },
        { x: 53, h: 36, c: "#ec4899" },
        { x: 67, h: 38, c: "#6366f1" },
        { x: 80, h: 34, c: "#14b8a6" },
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={100 - b.h} width="12" height={b.h} rx="2" fill={b.c}/>
          <rect x={b.x} y={100 - b.h} width="12" height="4" rx="1" fill="white" opacity="0.2"/>
        </g>
      ))}
      {/* Bottom shelf — decor (no emoji sticker) */}
      <rect x="9"  y="110" width="22" height="30" rx="4" fill="#fbbf24"/>
      <circle cx="55" cy="122" r="13" fill="#c4b5fd"/>
      <circle cx="55" cy="122" r="8"  fill="#a78bfa"/>
      <rect x="74" y="110" width="18" height="30" rx="3" fill="#34d399"/>
    </svg>
  );
}

function PlantSVG() {
  return (
    <svg width="80" height="110" viewBox="0 0 80 110" className="block">
      {/* Shadow */}
      <ellipse cx="40" cy="108" rx="28" ry="5" fill="#000" opacity="0.08"/>
      {/* Pot */}
      <path d="M18,80 L62,80 L56,106 L24,106 Z" fill="#dc2626"/>
      <rect x="14" y="74" width="52" height="10" rx="5" fill="#ef4444"/>
      <rect x="14" y="74" width="52" height="5" rx="4" fill="#fca5a5" opacity="0.4"/>
      {/* Soil */}
      <ellipse cx="40" cy="74" rx="26" ry="6" fill="#713f12"/>
      <ellipse cx="40" cy="72" rx="22" ry="4" fill="#854d0e"/>
      {/* Stems */}
      <path d="M40,72 Q28,54 20,38" stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M40,72 Q52,52 60,34" stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M40,72 Q40,50 40,28" stroke="#15803d" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      {/* Leaves */}
      <ellipse cx="18" cy="34" rx="17" ry="11" fill="#22c55e" transform="rotate(-30 18 34)"/>
      <ellipse cx="18" cy="34" rx="10" ry="6" fill="#4ade80" transform="rotate(-30 18 34)"/>
      <ellipse cx="62" cy="30" rx="17" ry="11" fill="#16a34a" transform="rotate(30 62 30)"/>
      <ellipse cx="62" cy="30" rx="10" ry="6" fill="#22c55e" transform="rotate(30 62 30)"/>
      <ellipse cx="40" cy="22" rx="14" ry="20" fill="#4ade80"/>
      <ellipse cx="40" cy="22" rx="9" ry="14" fill="#86efac"/>
      {/* Veins */}
      <line x1="40" y1="8" x2="40" y2="40" stroke="#15803d" strokeWidth="1.5" opacity="0.4"/>
      <line x1="33" y1="16" x2="47" y2="28" stroke="#15803d" strokeWidth="1" opacity="0.3"/>
    </svg>
  );
}

function WindowSVG() {
  return (
    <svg width="150" height="150" viewBox="0 0 150 160" className="block">
      {/* Wall inset shadow */}
      <rect x="2" y="2" width="146" height="156" rx="6" fill="#00000015"/>
      {/* Outer frame */}
      <rect x="0" y="0" width="146" height="154" rx="6" fill="#b45309"/>
      {/* Sky */}
      <rect x="7" y="7" width="132" height="140" rx="4" fill="#bae6fd"/>
      {/* Light gradient — sunlight */}
      <radialGradient id="sun-glow" cx="80%" cy="25%" r="60%">
        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#bae6fd" stopOpacity="0"/>
      </radialGradient>
      <rect x="7" y="7" width="132" height="140" rx="4" fill="url(#sun-glow)"/>
      {/* Sun */}
      <circle cx="108" cy="36" r="20" fill="#fde047" opacity="0.95"/>
      <circle cx="108" cy="36" r="14" fill="#fef08a"/>
      {/* Sun rays */}
      {[0,45,90,135,180,225,270,315].map(a => (
        <line key={a}
          x1={108 + 22*Math.cos(a*Math.PI/180)} y1={36 + 22*Math.sin(a*Math.PI/180)}
          x2={108 + 28*Math.cos(a*Math.PI/180)} y2={36 + 28*Math.sin(a*Math.PI/180)}
          stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      ))}
      {/* Clouds */}
      <ellipse cx="34" cy="34" rx="20" ry="11" fill="white" opacity="0.9"/>
      <ellipse cx="50" cy="28" rx="16" ry="10" fill="white" opacity="0.95"/>
      <ellipse cx="22" cy="40" rx="12" ry="8" fill="white" opacity="0.8"/>
      {/* Hills */}
      <ellipse cx="30" cy="147" rx="40" ry="24" fill="#4ade80"/>
      <ellipse cx="90" cy="147" rx="52" ry="22" fill="#22c55e"/>
      <ellipse cx="55" cy="147" rx="32" ry="18" fill="#86efac"/>
      {/* Tree */}
      <rect x="118" y="118" width="5" height="28" fill="#854d0e"/>
      <ellipse cx="120" cy="112" rx="12" ry="14" fill="#16a34a"/>
      <ellipse cx="120" cy="108" rx="9" ry="10" fill="#22c55e"/>
      {/* Window dividers */}
      <rect x="7"  y="78" width="132" height="7" rx="0" fill="#b45309"/>
      <rect x="69" y="7"  width="8"   height="140" rx="0" fill="#b45309"/>
      {/* Inner frame highlight */}
      <rect x="7" y="7" width="132" height="3" rx="2" fill="white" opacity="0.2"/>
      {/* Curtains */}
      <path d="M7,7 Q20,50 14,147 L7,147Z" fill="#fca5a5" opacity="0.75"/>
      <path d="M7,7 Q22,60 16,147 L7,147Z" fill="#fda4af" opacity="0.4"/>
      <path d="M139,7 Q126,50 132,147 L139,147Z" fill="#fca5a5" opacity="0.75"/>
      <path d="M139,7 Q124,60 130,147 L139,147Z" fill="#fda4af" opacity="0.4"/>
      {/* Curtain top pelmets */}
      <rect x="0" y="0" width="146" height="14" rx="6" fill="#e11d48"/>
      <path d="M0,14 Q18,22 36,14 Q54,22 73,14 Q91,22 109,14 Q128,22 146,14 L146,0 Q128,6 109,0 Q91,6 73,0 Q54,6 36,0 Q18,6 0,0Z" fill="#fb7185" opacity="0.6"/>
    </svg>
  );
}

function PosterSVG() {
  return (
    <svg width="90" height="115" viewBox="0 0 90 115" className="block">
      {/* Frame shadow */}
      <rect x="3" y="3" width="86" height="111" rx="5" fill="#00000018"/>
      {/* Frame */}
      <rect x="0" y="0" width="86" height="108" rx="5" fill="#7c3aed"/>
      <rect x="4" y="4" width="78" height="100" rx="4" fill="white"/>
      {/* TOP — ABC colorful */}
      <rect x="8" y="8" width="70" height="44" rx="3" fill="#f0fdf4"/>
      <text x="10" y="38" fontSize="32" fontWeight="bold" fill="#16a34a">ABC</text>
      <rect x="8" y="8" width="70" height="5" rx="2" fill="#bbf7d0" opacity="0.6"/>
      {/* BOTTOM — Hello */}
      <rect x="8" y="56" width="70" height="44" rx="3" fill="#eff6ff"/>
      <text x="14" y="76" fontSize="13" fontWeight="bold" fill="#1d4ed8">Hello!</text>
      <text x="14" y="90" fontSize="12" fill="#3b82f6">Привіт! 👋</text>
      {/* Star decorations */}
      <text x="62" y="24" fontSize="12">⭐</text>
      <text x="8"  y="24" fontSize="10">✨</text>
      {/* Hanger nail */}
      <rect x="38" y="0" width="10" height="5" rx="2" fill="#5b21b6"/>
      <circle cx="43" cy="2" r="2" fill="#7c3aed"/>
    </svg>
  );
}

function FloorLampSVG() {
  return (
    <svg width="60" height="140" viewBox="0 0 60 140" className="block">
      {/* Shadow */}
      <ellipse cx="30" cy="138" rx="22" ry="5" fill="#000" opacity="0.08"/>
      {/* Base */}
      <ellipse cx="30" cy="132" rx="20" ry="6" fill="#78350f"/>
      <ellipse cx="30" cy="130" rx="16" ry="4" fill="#92400e"/>
      {/* Pole — straight up from base */}
      <rect x="27" y="40" width="6" height="92" rx="3" fill="#a16207"/>
      {/* Shade — wider at bottom (light opens downward) */}
      <path d="M18,40 L42,40 L54,64 L6,64 Z" fill="#fbbf24"/>
      <path d="M18,40 L42,40 L40,48 L20,48 Z" fill="#fef08a"/>
      {/* Inner shade dark bottom rim */}
      <path d="M6,64 L54,64 L50,58 L10,58 Z" fill="#d97706" opacity="0.5"/>
      {/* Bulb inside shade */}
      <circle cx="30" cy="52" r="7" fill="#fefce8"/>
      <circle cx="30" cy="52" r="5" fill="#fef08a"/>
      {/* Light cone downward */}
      <path d="M6,64 L54,64 L62,120 L-2,120 Z" fill="#fef08a" opacity="0.07"/>
    </svg>
  );
}

function RugSVG() {
  return (
    <svg width="220" height="70" viewBox="0 0 220 70" className="block">
      {/* Shadow */}
      <ellipse cx="110" cy="68" rx="105" ry="5" fill="#000" opacity="0.06"/>
      {/* Rug layers */}
      <ellipse cx="110" cy="36" rx="108" ry="32" fill="#6366f1"/>
      <ellipse cx="110" cy="36" rx="96"  ry="27" fill="#818cf8"/>
      <ellipse cx="110" cy="36" rx="80"  ry="21" fill="#6366f1"/>
      <ellipse cx="110" cy="36" rx="64"  ry="16" fill="#818cf8"/>
      <ellipse cx="110" cy="36" rx="48"  ry="11" fill="#6366f1"/>
      {/* Pattern */}
      {[30,60,90,110,130,160,190].map(x => (
        <circle key={x} cx={x} cy={36} r={3.5} fill="#4338ca" opacity="0.5"/>
      ))}
      <ellipse cx="110" cy="36" rx="14" ry="5" fill="#4338ca" opacity="0.3"/>
      {/* Fringe */}
      {[8,18,28,38,48,58,68,78,88,98,108,118,128,138,148,158,168,178,188,198,208].map(x => (
        <line key={x} x1={x} y1="66" x2={x+2} y2="70" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"/>
      ))}
    </svg>
  );
}

function ClockSVG() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="block">
      <circle cx="32" cy="32" r="30" fill="#f1f5f9"/>
      <circle cx="32" cy="32" r="30" fill="none" stroke="#334155" strokeWidth="3"/>
      <circle cx="32" cy="32" r="26" fill="none" stroke="#94a3b8" strokeWidth="1"/>
      {/* Hours */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => (
        <line key={i}
          x1={32 + 20*Math.sin(a*Math.PI/180)} y1={32 - 20*Math.cos(a*Math.PI/180)}
          x2={32 + 24*Math.sin(a*Math.PI/180)} y2={32 - 24*Math.cos(a*Math.PI/180)}
          stroke="#334155" strokeWidth={i%3===0?2:1} strokeLinecap="round"/>
      ))}
      {/* Hands */}
      <line x1="32" y1="32" x2="32" y2="14" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="32" y1="32" x2="44" y2="32" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="32" cy="32" r="3" fill="#ef4444"/>
      {/* Hanger */}
      <rect x="28" y="0" width="8" height="4" rx="2" fill="#334155"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  2.5D coordinate system                                                    */
/*  rx: 0-100 (left → right)                                                 */
/*  ry: 0-100 (back → front, 0=back wall, 100=front edge near viewer)        */
/* ══════════════════════════════════════════════════════════════════════════ */
interface FloorItem { id: string; rx: number; ry: number; }

function itemBottom(ry: number) {
  // ry=100 (front) → bottom=0% (very bottom of scene)
  // ry=0 (back)    → bottom=FLOOR_H% (top of floor area)
  return ((100 - ry) / 100) * FLOOR_H;
}

function itemScale(ry: number) {
  // Base × 2.2, subtle perspective (0.85→1.0). Range: ~1.87 → 2.2
  return (0.85 + (ry / 100) * 0.15) * 2.2;
}

/* ── Layout persistence ─────────────────────────────────────────────────── */
const STORAGE_KEY = "room-layout-v1";

const DEFAULT_FLOOR: FloorItem[] = [
  { id: "bookshelf",  rx: 2,  ry: 90 },
  { id: "bed",        rx: 14, ry: 85 },
  { id: "desk",       rx: 55, ry: 83 },
  { id: "plant",      rx: 76, ry: 88 },
  { id: "lamp",       rx: 85, ry: 74 },
  { id: "rug",        rx: 42, ry: 79 },
  { id: "companion",  rx: 44, ry: 81 },
];

const DEFAULT_WALL = [
  { id: "clock",      rx: 20, ry: 45 },
  { id: "poster",     rx: 82, ry: 30 },
  { id: "wallcarpet", rx: 50, ry: 40 },
];

const DEFAULT_ZORDER = [
  "wallcarpet","rug","bookshelf","bed","desk","plant","lamp",
  "clock","poster","companion",
];

function loadLayout() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Page                                                                      */
/* ══════════════════════════════════════════════════════════════════════════ */
export default function RoomPage() {
  const user = mockKidsUser;
  const MOODS: CompanionMood[] = ["idle", "happy", "celebrate", "sad"];
  const SIZE_MULTS = [0.65, 1.0, 1.45]; // sm / md / lg

  const [companionMood, setCompanionMood] = useState<CompanionMood>(user.companion.mood as CompanionMood);
  const [activeRoom, setActiveRoom] = useState("bedroom");

  const saved = loadLayout();

  const [floorItems, setFloorItems] = useState<FloorItem[]>(saved?.floorItems ?? DEFAULT_FLOOR);
  const [wallItems,  setWallItems]  = useState<{ id: string; rx: number; ry: number }[]>(saved?.wallItems ?? DEFAULT_WALL);
  const [zOrder,     setZOrder]     = useState<string[]>(saved?.zOrder ?? DEFAULT_ZORDER);
  const [sizes,      setSizes]      = useState<Record<string, number>>(saved?.sizes ?? {});
  const getSize  = (id: string) => sizes[id] ?? 1;
  const getZ     = useCallback((id: string) => (zOrder.indexOf(id) + 1) * 10, [zOrder]);

  // Persist layout whenever anything changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ floorItems, wallItems, zOrder, sizes }));
    } catch {}
  }, [floorItems, wallItems, zOrder, sizes]);

  const bringToFront = useCallback((id: string) =>
    setZOrder(prev => [...prev.filter(i => i !== id), id]), []);
  const cycleSize    = useCallback((id: string) =>
    setSizes(prev => ({ ...prev, [id]: ((prev[id] ?? 1) + 1) % 3 })), []);

  const dragging     = useRef<{ id: string; startClientX: number; startClientY: number; startRx: number; startRy: number; moved: boolean } | null>(null);
  const wallDragging = useRef<{ id: string; startClientX: number; startClientY: number; startRx: number; startRy: number; moved: boolean } | null>(null);
  const lastTap      = useRef<{ id: string; time: number } | null>(null);
  const sceneRef     = useRef<HTMLDivElement>(null);

  const startDrag = useCallback((id: string, clientX: number, clientY: number) => {
    const item = floorItems.find(i => i.id === id);
    if (!item) return;
    dragging.current = { id, startClientX: clientX, startClientY: clientY, startRx: item.rx, startRy: item.ry, moved: false };
  }, [floorItems]);

  const startWallDrag = useCallback((id: string, clientX: number, clientY: number) => {
    const item = wallItems.find(i => i.id === id);
    if (!item) return;
    wallDragging.current = { id, startClientX: clientX, startClientY: clientY, startRx: item.rx, startRy: item.ry, moved: false };
  }, [wallItems]);

  const onMove = useCallback((clientX: number, clientY: number) => {
    if (sceneRef.current && dragging.current) {
      const rect = sceneRef.current.getBoundingClientRect();
      const dx = clientX - dragging.current.startClientX;
      const dy = clientY - dragging.current.startClientY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragging.current.moved = true;
      const floorPx = rect.height * FLOOR_H / 100;
      const newRx = Math.max(2, Math.min(87, dragging.current.startRx + (dx / rect.width) * 100));
      const newRy = Math.max(4, Math.min(96, dragging.current.startRy + (dy / floorPx) * 100));
      const activeId = dragging.current.id;
      setFloorItems(prev => prev.map(i => i.id === activeId ? { ...i, rx: newRx, ry: newRy } : i));
    }
    if (sceneRef.current && wallDragging.current) {
      const rect = sceneRef.current.getBoundingClientRect();
      const dx = clientX - wallDragging.current.startClientX;
      const dy = clientY - wallDragging.current.startClientY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) wallDragging.current.moved = true;
      const wallPx = rect.height * WALL_H / 100;
      const newRx = Math.max(2, Math.min(92, wallDragging.current.startRx + (dx / rect.width) * 100));
      const newRy = Math.max(2, Math.min(90, wallDragging.current.startRy + (dy / wallPx) * 100));
      const activeId = wallDragging.current.id;
      setWallItems(prev => prev.map(i => i.id === activeId ? { ...i, rx: newRx, ry: newRy } : i));
    }
  }, []);

  const handleTap = useCallback((id: string) => {
    bringToFront(id);
    const now = Date.now();
    if (lastTap.current?.id === id && now - lastTap.current.time < 350) {
      cycleSize(id);
      lastTap.current = null;
    } else {
      lastTap.current = { id, time: now };
      if (id === "companion") {
        setCompanionMood(prev => MOODS[(MOODS.indexOf(prev) + 1) % MOODS.length]);
      }
    }
  }, [bringToFront, cycleSize, MOODS]);

  const stopDrag = useCallback(() => {
    if (dragging.current && !dragging.current.moved)  handleTap(dragging.current.id);
    if (wallDragging.current && !wallDragging.current.moved) handleTap(wallDragging.current.id);
    dragging.current = null;
    wallDragging.current = null;
  }, [handleTap]);

  const companyLevel = user.companion.level;

  const itemContent: Record<string, React.ReactElement> = {
    bookshelf: <BookshelfSVG />,
    bed:       <BedSVG />,
    desk:      <DeskSVG />,
    plant:     <PlantSVG />,
    lamp:      <FloorLampSVG />,
    rug:       <RugSVG />,
  };

  // Sort by ry ascending so back items render first (lower z-index)
  const sorted = [...floorItems].sort((a, b) => a.ry - b.ry);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-room-dark">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 flex-shrink-0 bg-surface border-b border-border">
        <Link href="/kids/dashboard" className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span className="text-sm font-semibold hidden sm:inline">Назад</span>
        </Link>
        <h1 className="font-black text-ink text-base">Моя кімната 🏠</h1>
        <Link href="/kids/shop" className="text-sm font-bold text-primary hover:underline">Магазин 🛒</Link>
      </header>

      {/* ── Room tabs ── */}
      <div className="flex gap-2 px-4 py-2 border-b border-border overflow-x-auto flex-shrink-0 bg-surface">
        {ROOMS.map(room => {
          const locked = companyLevel < room.unlockedAt;
          const active = activeRoom === room.id;
          return (
            <button key={room.id} onClick={() => !locked && setActiveRoom(room.id)} disabled={locked}
              className={["flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all",
                active  ? "border-primary bg-primary text-white" :
                locked  ? "border-border text-ink-muted opacity-50 cursor-not-allowed" :
                          "border-border text-ink hover:border-primary/40"
              ].join(" ")}
            >
              <span>{room.emoji}</span>
              <span>{room.label}</span>
              {locked && <span className="text-[10px] bg-black/10 rounded px-1">🔒 Рів.{room.unlockedAt}</span>}
            </button>
          );
        })}
      </div>

      {/* ══ 2.5D ROOM SCENE ════════════════════════════════════════════════ */}
      <div
        ref={sceneRef}
        className="flex-1 relative overflow-hidden select-none"
        onMouseMove={e => onMove(e.clientX, e.clientY)}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchEnd={stopDrag}
        style={{ touchAction: "none" }}
      >

        {/* ── BACK WALL ── */}
        <div className="absolute inset-x-0 top-0" style={{ height: `${WALL_H}%` }}>
          {/* Wall base */}
          <div className="absolute inset-0 bg-wall-gradient"/>

          {/* Subtle wallpaper pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <pattern id="wp" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="3" fill="#d97706"/>
              <path d="M0,20 Q10,14 20,20 Q30,26 40,20" stroke="#d97706" strokeWidth="1" fill="none"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#wp)"/>
          </svg>

          {/* Sunlight from window */}
          <div className="absolute inset-0 bg-wall-sunlight"/>

          {/* Wall edge shadows for depth */}
          <div className="absolute left-0 inset-y-0 w-10 bg-wall-edge-left"/>
          <div className="absolute right-0 inset-y-0 w-10 bg-wall-edge-right"/>

          {/* Dado rail — near bottom of wall */}
          <div className="absolute inset-x-0 bg-dado-rail" style={{ bottom: "8%", height: "8px" }}/>
          <div className="absolute inset-x-0 bg-white/40" style={{ bottom: "8%", height: "2px" }}/>

          {/* WINDOW — fixed center, large */}
          <div className="absolute" style={{ left: "50%", top: "22%", transform: "translateX(-50%) scale(1.5)", transformOrigin: "top center" }}>
            <WindowSVG/>
          </div>

          {/* WALL ITEMS — draggable in 2D on wall */}
          {wallItems.map(item => {
            const sm = SIZE_MULTS[getSize(item.id)];
            return (
              <div
                key={item.id}
                className="absolute cursor-grab active:cursor-grabbing"
                style={{
                  left: `${item.rx}%`,
                  top:  `${item.ry}%`,
                  transform: `translate(-50%, -50%) scale(${sm})`,
                  transformOrigin: "center center",
                  zIndex: getZ(item.id),
                  transition: "transform 0.15s",
                }}
                onMouseDown={e => { e.preventDefault(); startWallDrag(item.id, e.clientX, e.clientY); }}
                onTouchStart={e => { e.preventDefault(); startWallDrag(item.id, e.touches[0].clientX, e.touches[0].clientY); }}
              >
                {item.id === "clock"      && <ClockSVG />}
                {item.id === "poster"     && <PosterSVG />}
                {item.id === "wallcarpet" && (
                  <img src="/wall-carpet.png" alt="wall carpet" width={180} height={130}
                    className="block object-contain rounded shadow-md"/>
                )}
              </div>
            );
          })}
        </div>

        {/* ── WALL→FLOOR SHADOW ── */}
        <div className="absolute inset-x-0 bg-wall-floor-edge" style={{ top: `${WALL_H}%`, height: "8px" }}/>

        {/* ── FLOOR ── */}
        <div className="absolute inset-x-0 bottom-0" style={{ top: `${WALL_H}%` }}>

          {/* Floor base colour — lighter at back (far), darker at front (near) */}
          <div className="absolute inset-0 bg-floor-wood"/>

          {/* Wood planks (horizontal rows) + perspective lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Horizontal plank rows */}
            {Array.from({ length: 10 }).map((_, i) => (
              <rect key={i} x="0" y={`${i * 10}%`} width="100%" height="10%"
                fill={i % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"}
                stroke="rgba(0,0,0,0.1)" strokeWidth="0.6"/>
            ))}
            {/* Converging perspective lines — all meet at vanishing point (50%, 0%) */}
            {Array.from({ length: 13 }).map((_, i) => {
              const x2 = (i / 12) * 100;
              return (
                <line key={`vp${i}`}
                  x1="50%" y1="0"
                  x2={`${x2}%`} y2="100%"
                  stroke="rgba(0,0,0,0.07)" strokeWidth="0.7"/>
              );
            })}
          </svg>

          {/* Depth vignette overlay — adds sense of perspective */}
          <div className="absolute inset-0 bg-floor-vignette"/>
        </div>

        {/* ── Draggable floor items + rug + companion (sorted back→front) ── */}
        {sorted.map(item => {
          const s = itemScale(item.ry) * SIZE_MULTS[getSize(item.id)];
          const bot = itemBottom(item.ry);
          const isCompanion = item.id === "companion";
          return (
            <div
              key={item.id}
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                left: `${item.rx}%`,
                bottom: `${bot}%`,
                zIndex: getZ(item.id),
                transform: `translateX(-50%) scale(${s})`,
                transformOrigin: "bottom center",
                transition: "transform 0.15s",
              }}
              onMouseDown={e => { e.preventDefault(); startDrag(item.id, e.clientX, e.clientY); }}
              onTouchStart={e => { e.preventDefault(); startDrag(item.id, e.touches[0].clientX, e.touches[0].clientY); }}
            >
              {isCompanion ? (
                <div className="flex flex-col items-center drop-shadow-item">
                  <div className="w-20 h-3 rounded-full blur-sm bg-black/[0.14]"/>
                  <div className="animate-float -mt-1">
                    <CompanionSVG animal={user.companion.animal} mood={companionMood}/>
                  </div>
                  <div className="bg-white/95 border border-border rounded-full px-3 py-0.5 text-xs font-black text-ink shadow-md -mt-2">
                    {user.companion.name}
                  </div>
                </div>
              ) : (
                <div className="drop-shadow-floor">
                  {itemContent[item.id]}
                </div>
              )}
            </div>
          );
        })}

      </div>{/* end scene */}

      {/* ── Hint ── */}
      <div className="px-4 py-2 text-center flex-shrink-0 bg-surface border-t border-border">
        <p className="text-xs text-ink-muted">✋ Перетягуй меблі — ліво/право і вглиб кімнати</p>
      </div>
    </div>
  );
}
