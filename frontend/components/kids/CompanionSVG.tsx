"use client";

import type { CompanionAnimal, CompanionMood } from "@/lib/types";
export type { CompanionMood };

/* ── Eye helpers ──────────────────────────────────────────────────────────── */
function EyesIdle({ lx, ly, rx, ry, r = 10 }: { lx: number; ly: number; rx: number; ry: number; r?: number }) {
  return (
    <>
      <circle cx={lx} cy={ly} r={r} fill="white" />
      <circle cx={rx} cy={ry} r={r} fill="white" />
      <circle cx={lx} cy={ly} r={r * 0.65} fill="#1e3a5f" />
      <circle cx={rx} cy={ry} r={r * 0.65} fill="#1e3a5f" />
      <circle cx={lx + r * 0.2} cy={ly - r * 0.2} r={r * 0.25} fill="white" />
      <circle cx={rx + r * 0.2} cy={ry - r * 0.2} r={r * 0.25} fill="white" />
    </>
  );
}
function EyesHappy({ lx, ly, rx, ry, r = 10 }: { lx: number; ly: number; rx: number; ry: number; r?: number }) {
  return (
    <>
      <circle cx={lx} cy={ly} r={r} fill="white" />
      <circle cx={rx} cy={ry} r={r} fill="white" />
      <path d={`M${lx - r * 0.8} ${ly} Q${lx} ${ly - r} ${lx + r * 0.8} ${ly}`} stroke="#1e3a5f" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d={`M${rx - r * 0.8} ${ry} Q${rx} ${ry - r} ${rx + r * 0.8} ${ry}`} stroke="#1e3a5f" strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  );
}
function EyesSad({ lx, ly, rx, ry, r = 10 }: { lx: number; ly: number; rx: number; ry: number; r?: number }) {
  return (
    <>
      <circle cx={lx} cy={ly + 2} r={r} fill="white" />
      <circle cx={rx} cy={ry + 2} r={r} fill="white" />
      <circle cx={lx} cy={ly + 2} r={r * 0.65} fill="#1e3a5f" />
      <circle cx={rx} cy={ry + 2} r={r * 0.65} fill="#1e3a5f" />
      <circle cx={lx + r * 0.2} cy={ly} r={r * 0.25} fill="white" />
      <circle cx={rx + r * 0.2} cy={ry} r={r * 0.25} fill="white" />
      <path d={`M${rx + 4} ${ry + 14} Q${rx + 8} ${ry + 6} ${rx + 11} ${ry + 16} Q${rx + 11} ${ry + 22} ${rx + 4} ${ry + 14}Z`} fill="#93c5fd" opacity="0.85" />
    </>
  );
}
function EyesExcited({ lx, ly, rx, ry, r = 10 }: { lx: number; ly: number; rx: number; ry: number; r?: number }) {
  return (
    <>
      <circle cx={lx} cy={ly} r={r * 1.15} fill="white" />
      <circle cx={rx} cy={ry} r={r * 1.15} fill="white" />
      <circle cx={lx} cy={ly} r={r * 0.7} fill="#1e3a5f" />
      <circle cx={rx} cy={ry} r={r * 0.7} fill="#1e3a5f" />
      <circle cx={lx + r * 0.25} cy={ly - r * 0.25} r={r * 0.3} fill="white" />
      <circle cx={rx + r * 0.25} cy={ry - r * 0.25} r={r * 0.3} fill="white" />
      <circle cx={lx - r * 0.85} cy={ly - r * 1.15} r={r * 0.18} fill="#fbbf24" />
      <circle cx={rx + r * 0.85} cy={ry - r * 1.15} r={r * 0.18} fill="#fbbf24" />
    </>
  );
}
function EyesSleepy({ lx, ly, rx, ry, r = 10 }: { lx: number; ly: number; rx: number; ry: number; r?: number }) {
  return (
    <>
      <ellipse cx={lx} cy={ly + r * 0.25} rx={r} ry={r * 0.6} fill="white" />
      <ellipse cx={rx} cy={ry + r * 0.25} rx={r} ry={r * 0.6} fill="white" />
      <circle cx={lx} cy={ly + r * 0.4} r={r * 0.4} fill="#1e3a5f" />
      <circle cx={rx} cy={ry + r * 0.4} r={r * 0.4} fill="#1e3a5f" />
      {/* Droopy top lids */}
      <path d={`M${lx - r} ${ly} Q${lx} ${ly - r * 0.55} ${lx + r} ${ly}`} stroke="#9ca3af" strokeWidth={r * 0.65} fill="none" strokeLinecap="round" />
      <path d={`M${rx - r} ${ry} Q${rx} ${ry - r * 0.55} ${rx + r} ${ry}`} stroke="#9ca3af" strokeWidth={r * 0.65} fill="none" strokeLinecap="round" />
    </>
  );
}
function EyesSurprised({ lx, ly, rx, ry, r = 10 }: { lx: number; ly: number; rx: number; ry: number; r?: number }) {
  return (
    <>
      <circle cx={lx} cy={ly - r * 0.15} r={r * 1.2} fill="white" />
      <circle cx={rx} cy={ry - r * 0.15} r={r * 1.2} fill="white" />
      <circle cx={lx} cy={ly - r * 0.15} r={r * 0.5} fill="#1e3a5f" />
      <circle cx={rx} cy={ry - r * 0.15} r={r * 0.5} fill="#1e3a5f" />
      <circle cx={lx + r * 0.15} cy={ly - r * 0.35} r={r * 0.18} fill="white" />
      <circle cx={rx + r * 0.15} cy={ry - r * 0.35} r={r * 0.18} fill="white" />
    </>
  );
}
function HeartShape({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const s = r * 0.55;
  return (
    <>
      <circle cx={cx - s * 0.52} cy={cy - s * 0.1} r={s} fill="#ef4444" />
      <circle cx={cx + s * 0.52} cy={cy - s * 0.1} r={s} fill="#ef4444" />
      <polygon
        points={`${cx - s * 1.05},${cy - s * 0.1} ${cx + s * 1.05},${cy - s * 0.1} ${cx},${cy + s * 1.05}`}
        fill="#ef4444"
      />
    </>
  );
}
function EyesLove({ lx, ly, rx, ry, r = 10 }: { lx: number; ly: number; rx: number; ry: number; r?: number }) {
  return (
    <>
      <HeartShape cx={lx} cy={ly} r={r} />
      <HeartShape cx={rx} cy={ry} r={r} />
    </>
  );
}
function EyesAngry({ lx, ly, rx, ry, r = 10 }: { lx: number; ly: number; rx: number; ry: number; r?: number }) {
  return (
    <>
      <circle cx={lx} cy={ly} r={r} fill="white" />
      <circle cx={rx} cy={ry} r={r} fill="white" />
      <circle cx={lx} cy={ly} r={r * 0.65} fill="#1e3a5f" />
      <circle cx={rx} cy={ry} r={r * 0.65} fill="#1e3a5f" />
      <circle cx={lx + r * 0.2} cy={ly - r * 0.1} r={r * 0.2} fill="white" />
      <circle cx={rx + r * 0.2} cy={ry - r * 0.1} r={r * 0.2} fill="white" />
      {/* V-shaped brows angled toward center */}
      <path d={`M${lx - r} ${ly - r * 1.1} L${lx + r * 0.7} ${ly - r * 0.65}`} stroke="#1e3a5f" strokeWidth={r * 0.35} strokeLinecap="round" />
      <path d={`M${rx + r} ${ry - r * 1.1} L${rx - r * 0.7} ${ry - r * 0.65}`} stroke="#1e3a5f" strokeWidth={r * 0.35} strokeLinecap="round" />
    </>
  );
}
function EyesCool({ lx, ly, rx, ry, r = 10 }: { lx: number; ly: number; rx: number; ry: number; r?: number }) {
  const bridgeY = (ly + ry) / 2 - r * 0.3;
  return (
    <>
      {/* Lens shapes */}
      <rect x={lx - r * 1.1} y={ly - r * 0.75} width={r * 2.2} height={r * 1.45} rx={r * 0.3} fill="#1e293b" />
      <rect x={rx - r * 1.1} y={ry - r * 0.75} width={r * 2.2} height={r * 1.45} rx={r * 0.3} fill="#1e293b" />
      {/* Bridge */}
      <rect x={lx + r * 1.1} y={bridgeY} width={Math.max(0, rx - lx - r * 2.2)} height={r * 0.28} fill="#1e293b" />
      {/* Shine */}
      <ellipse cx={lx - r * 0.35} cy={ly - r * 0.2} rx={r * 0.35} ry={r * 0.18} fill="white" opacity="0.3" />
      <ellipse cx={rx - r * 0.35} cy={ry - r * 0.2} rx={r * 0.35} ry={r * 0.18} fill="white" opacity="0.3" />
    </>
  );
}

/* ── Unified eye renderer ─────────────────────────────────────────────────── */
function Eyes({ mood, lx, ly, rx, ry, r }: { mood: CompanionMood; lx: number; ly: number; rx: number; ry: number; r?: number }) {
  switch (mood) {
    case "happy": case "celebrate": return <EyesHappy lx={lx} ly={ly} rx={rx} ry={ry} r={r} />;
    case "sad":       return <EyesSad      lx={lx} ly={ly} rx={rx} ry={ry} r={r} />;
    case "excited":   return <EyesExcited  lx={lx} ly={ly} rx={rx} ry={ry} r={r} />;
    case "sleepy":    return <EyesSleepy   lx={lx} ly={ly} rx={rx} ry={ry} r={r} />;
    case "surprised": return <EyesSurprised lx={lx} ly={ly} rx={rx} ry={ry} r={r} />;
    case "love":      return <EyesLove     lx={lx} ly={ly} rx={rx} ry={ry} r={r} />;
    case "angry":     return <EyesAngry    lx={lx} ly={ly} rx={rx} ry={ry} r={r} />;
    case "cool":      return <EyesCool     lx={lx} ly={ly} rx={rx} ry={ry} r={r} />;
    default:          return <EyesIdle     lx={lx} ly={ly} rx={rx} ry={ry} r={r} />;
  }
}

/* ── Mouth helper ─────────────────────────────────────────────────────────── */
type MouthType = "smile" | "frown" | "open" | "flat" | "tiny-smile";
function mouthType(mood: CompanionMood): MouthType {
  switch (mood) {
    case "happy": case "celebrate": case "excited": case "love": case "cool": return "smile";
    case "sad": case "angry": return "frown";
    case "surprised": return "open";
    case "sleepy": return "tiny-smile";
    default: return "smile";
  }
}

/* ── 🦊 FOX ──────────────────────────────────────────────────────────────── */
function FoxSVG({ mood }: { mood: CompanionMood }) {
  const armsUp = mood === "celebrate" || mood === "excited" || mood === "love";
  const mt = mouthType(mood);
  return (
    <svg width="100" height="130" viewBox="0 0 100 130">
      <ellipse cx="50" cy="127" rx="26" ry="5" fill="#000" opacity="0.1" />
      {/* Tail */}
      <ellipse cx="80" cy="108" rx="20" ry="12" fill="#F97316" transform="rotate(-35 80 108)" />
      <ellipse cx="87" cy="97" rx="13" ry="8" fill="#FFF7ED" transform="rotate(-48 87 97)" />
      {/* Body */}
      <ellipse cx="50" cy="94" rx="28" ry="32" fill="#F97316" />
      <ellipse cx="50" cy="100" rx="18" ry="22" fill="#FFF7ED" />
      {/* Paws */}
      {armsUp ? (
        <>
          <ellipse cx="18" cy="72" rx="12" ry="8" fill="#F97316" transform="rotate(-55 18 72)" />
          <ellipse cx="82" cy="72" rx="12" ry="8" fill="#F97316" transform="rotate(55 82 72)" />
        </>
      ) : (
        <>
          <ellipse cx="22" cy="91" rx="12" ry="8" fill="#EA580C" transform="rotate(-15 22 91)" />
          <ellipse cx="78" cy="91" rx="12" ry="8" fill="#EA580C" transform="rotate(15 78 91)" />
        </>
      )}
      {/* Feet */}
      <ellipse cx="40" cy="124" rx="13" ry="6" fill="#EA580C" />
      <ellipse cx="60" cy="124" rx="13" ry="6" fill="#EA580C" />
      {/* Head */}
      <circle cx="50" cy="50" r="28" fill="#F97316" />
      {/* Ears */}
      <polygon points="28,28 17,5 40,23" fill="#F97316" />
      <polygon points="72,28 83,5 60,23" fill="#F97316" />
      <polygon points="30,25 21,10 38,21" fill="#FDA4AF" />
      <polygon points="70,25 79,10 62,21" fill="#FDA4AF" />
      {/* Muzzle */}
      <ellipse cx="50" cy="59" rx="16" ry="12" fill="#FFF7ED" />
      {/* Eyes */}
      <Eyes mood={mood} lx={37} ly={46} rx={63} ry={46} />
      {/* Nose */}
      <ellipse cx="50" cy="63" rx="4" ry="3" fill="#1e3a5f" />
      {/* Mouth */}
      {mt === "smile" && <path d="M43,68 Q50,74 57,68" stroke="#1e3a5f" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {mt === "frown" && <path d="M43,71 Q50,65 57,71" stroke="#1e3a5f" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {mt === "open"  && <ellipse cx="50" cy="69" rx="5" ry="4" fill="#1e3a5f" />}
      {mt === "tiny-smile" && <path d="M46,68 Q50,71 54,68" stroke="#1e3a5f" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {/* Whiskers */}
      <line x1="18" y1="60" x2="40" y2="63" stroke="#92400e" strokeWidth="1.5" opacity="0.35" />
      <line x1="18" y1="66" x2="40" y2="66" stroke="#92400e" strokeWidth="1.5" opacity="0.35" />
      <line x1="82" y1="60" x2="60" y2="63" stroke="#92400e" strokeWidth="1.5" opacity="0.35" />
      <line x1="82" y1="66" x2="60" y2="66" stroke="#92400e" strokeWidth="1.5" opacity="0.35" />
      {/* Mood accents */}
      {(mood === "happy" || mood === "celebrate" || mood === "excited") && <><text x="10" y="24" fontSize="14">⭐</text><text x="68" y="20" fontSize="12">✨</text></>}
      {mood === "love"      && <><text x="10" y="24" fontSize="14">💖</text><text x="68" y="20" fontSize="12">💕</text></>}
      {mood === "angry"     && <><text x="10" y="24" fontSize="14">💢</text><text x="68" y="20" fontSize="12">😤</text></>}
      {mood === "sleepy"    && <text x="62" y="18" fontSize="12">💤</text>}
      {mood === "cool"      && <text x="10" y="24" fontSize="13">🕶️</text>}
      {mood === "surprised" && <text x="10" y="22" fontSize="13">❕</text>}
    </svg>
  );
}

/* ── 🐱 CAT ──────────────────────────────────────────────────────────────── */
function CatSVG({ mood }: { mood: CompanionMood }) {
  const armsUp = mood === "celebrate" || mood === "excited" || mood === "love";
  const mt = mouthType(mood);
  return (
    <svg width="100" height="130" viewBox="0 0 100 130">
      <ellipse cx="50" cy="127" rx="26" ry="5" fill="#000" opacity="0.1" />
      {/* Body */}
      <ellipse cx="50" cy="94" rx="27" ry="31" fill="#A78BFA" />
      <ellipse cx="50" cy="100" rx="17" ry="21" fill="#EDE9FE" />
      {/* Tail */}
      <path d="M72 120 Q90 100 85 80 Q80 65 74 75 Q78 85 74 95 Q70 110 72 120Z" fill="#8B5CF6" />
      {/* Paws */}
      {armsUp ? (
        <>
          <ellipse cx="18" cy="72" rx="11" ry="8" fill="#8B5CF6" transform="rotate(-55 18 72)" />
          <ellipse cx="82" cy="72" rx="11" ry="8" fill="#8B5CF6" transform="rotate(55 82 72)" />
        </>
      ) : (
        <>
          <ellipse cx="23" cy="92" rx="11" ry="7" fill="#8B5CF6" transform="rotate(-15 23 92)" />
          <ellipse cx="77" cy="92" rx="11" ry="7" fill="#8B5CF6" transform="rotate(15 77 92)" />
        </>
      )}
      <ellipse cx="40" cy="124" rx="12" ry="6" fill="#8B5CF6" />
      <ellipse cx="60" cy="124" rx="12" ry="6" fill="#8B5CF6" />
      {/* Head */}
      <circle cx="50" cy="50" r="28" fill="#A78BFA" />
      {/* Ears */}
      <polygon points="27,30 22,8 40,26" fill="#8B5CF6" />
      <polygon points="73,30 78,8 60,26" fill="#8B5CF6" />
      <polygon points="29,28 25,14 38,25" fill="#F5D0FE" />
      <polygon points="71,28 75,14 62,25" fill="#F5D0FE" />
      {/* Eyes */}
      <Eyes mood={mood} lx={37} ly={46} rx={63} ry={46} />
      {/* Nose */}
      <ellipse cx="50" cy="62" rx="3.5" ry="3" fill="#F472B6" />
      {/* Mouth */}
      {mt === "smile" && <path d="M44,66 Q47,70 50,66 Q53,70 56,66" stroke="#7C3AED" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {mt === "frown" && <path d="M44,69 Q50,63 56,69" stroke="#7C3AED" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {mt === "open"  && <ellipse cx="50" cy="69" rx="5" ry="4" fill="#7C3AED" opacity="0.5" />}
      {mt === "tiny-smile" && <path d="M46,66 Q50,68 54,66" stroke="#7C3AED" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {/* Whiskers */}
      <line x1="14" y1="60" x2="40" y2="62" stroke="#7C3AED" strokeWidth="1.5" opacity="0.3" />
      <line x1="14" y1="66" x2="40" y2="65" stroke="#7C3AED" strokeWidth="1.5" opacity="0.3" />
      <line x1="86" y1="60" x2="60" y2="62" stroke="#7C3AED" strokeWidth="1.5" opacity="0.3" />
      <line x1="86" y1="66" x2="60" y2="65" stroke="#7C3AED" strokeWidth="1.5" opacity="0.3" />
      {(mood === "happy" || mood === "celebrate" || mood === "excited") && <><text x="10" y="24" fontSize="14">⭐</text><text x="68" y="20" fontSize="12">✨</text></>}
      {mood === "love"      && <><text x="10" y="24" fontSize="14">💖</text><text x="68" y="20" fontSize="12">💕</text></>}
      {mood === "angry"     && <text x="10" y="24" fontSize="14">💢</text>}
      {mood === "sleepy"    && <text x="62" y="18" fontSize="12">💤</text>}
      {mood === "cool"      && <text x="10" y="24" fontSize="13">🕶️</text>}
    </svg>
  );
}

/* ── 🐉 DRAGON ───────────────────────────────────────────────────────────── */
function DragonSVG({ mood }: { mood: CompanionMood }) {
  const armsUp = mood === "celebrate" || mood === "excited" || mood === "love";
  const mt = mouthType(mood);
  return (
    <svg width="100" height="130" viewBox="0 0 100 130">
      <ellipse cx="50" cy="127" rx="26" ry="5" fill="#000" opacity="0.1" />
      {/* Wings */}
      <ellipse cx="16" cy="80" rx="14" ry="22" fill="#0369A1" transform="rotate(15 16 80)" opacity="0.85" />
      <ellipse cx="84" cy="80" rx="14" ry="22" fill="#0369A1" transform="rotate(-15 84 80)" opacity="0.85" />
      {/* Body */}
      <ellipse cx="50" cy="94" rx="26" ry="30" fill="#0891B2" />
      <ellipse cx="50" cy="100" rx="16" ry="20" fill="#E0F2FE" />
      {/* Tail */}
      <path d="M68 122 Q84 112 88 96 Q90 84 80 88 Q82 96 76 106 Q70 116 68 122Z" fill="#0369A1" />
      <polygon points="86,88 96,82 92,96" fill="#0369A1" />
      {/* Spikes */}
      <polygon points="40,66 36,52 44,64" fill="#0369A1" />
      <polygon points="50,62 46,48 54,60" fill="#0369A1" />
      <polygon points="60,66 56,52 64,64" fill="#0369A1" />
      {/* Arms */}
      {armsUp ? (
        <>
          <ellipse cx="20" cy="70" rx="11" ry="8" fill="#0369A1" transform="rotate(-55 20 70)" />
          <ellipse cx="80" cy="70" rx="11" ry="8" fill="#0369A1" transform="rotate(55 80 70)" />
        </>
      ) : (
        <>
          <ellipse cx="24" cy="92" rx="11" ry="7" fill="#0369A1" transform="rotate(-15 24 92)" />
          <ellipse cx="76" cy="92" rx="11" ry="7" fill="#0369A1" transform="rotate(15 76 92)" />
        </>
      )}
      <ellipse cx="40" cy="124" rx="12" ry="6" fill="#0369A1" />
      <ellipse cx="60" cy="124" rx="12" ry="6" fill="#0369A1" />
      {/* Head */}
      <circle cx="50" cy="50" r="27" fill="#0891B2" />
      {/* Horns */}
      <polygon points="36,26 30,8 42,22" fill="#0369A1" />
      <polygon points="64,26 70,8 58,22" fill="#0369A1" />
      {/* Frill */}
      <polygon points="22,42 12,32 24,52" fill="#0369A1" opacity="0.7" />
      <polygon points="78,42 88,32 76,52" fill="#0369A1" opacity="0.7" />
      {/* Eyes */}
      <Eyes mood={mood} lx={37} ly={46} rx={63} ry={46} />
      {/* Nostrils */}
      <circle cx="46" cy="63" r="2.5" fill="#075985" />
      <circle cx="54" cy="63" r="2.5" fill="#075985" />
      {/* Mouth */}
      {mt === "smile" && <path d="M40,68 Q50,75 60,68" stroke="#075985" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {mt === "frown" && <path d="M40,70 Q50,64 60,70" stroke="#075985" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {mt === "open"  && <ellipse cx="50" cy="70" rx="6" ry="5" fill="#075985" opacity="0.5" />}
      {mt === "tiny-smile" && <path d="M44,68 Q50,71 56,68" stroke="#075985" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {(mood === "happy" || mood === "celebrate" || mood === "excited") && <><text x="8" y="24" fontSize="14">🔥</text><text x="68" y="20" fontSize="12">✨</text></>}
      {mood === "love"   && <><text x="8" y="24" fontSize="14">💖</text><text x="68" y="20" fontSize="12">💕</text></>}
      {mood === "angry"  && <text x="8" y="24" fontSize="14">💢</text>}
      {mood === "sleepy" && <text x="62" y="18" fontSize="12">💤</text>}
      {mood === "cool"   && <text x="8" y="24" fontSize="13">🕶️</text>}
    </svg>
  );
}

/* ── 🐰 RABBIT ───────────────────────────────────────────────────────────── */
function RabbitSVG({ mood }: { mood: CompanionMood }) {
  const armsUp = mood === "celebrate" || mood === "excited" || mood === "love";
  const mt = mouthType(mood);
  return (
    <svg width="100" height="140" viewBox="0 0 100 140">
      <ellipse cx="50" cy="137" rx="26" ry="5" fill="#000" opacity="0.1" />
      {/* Body */}
      <ellipse cx="50" cy="100" rx="30" ry="34" fill="#F9A8D4" />
      <ellipse cx="50" cy="106" rx="20" ry="24" fill="#FDF4FF" />
      {/* Fluffy tail */}
      <circle cx="76" cy="122" r="10" fill="#FDF4FF" />
      {/* Paws */}
      {armsUp ? (
        <>
          <ellipse cx="18" cy="74" rx="12" ry="8" fill="#EC4899" transform="rotate(-55 18 74)" />
          <ellipse cx="82" cy="74" rx="12" ry="8" fill="#EC4899" transform="rotate(55 82 74)" />
        </>
      ) : (
        <>
          <ellipse cx="22" cy="98" rx="12" ry="8" fill="#EC4899" transform="rotate(-15 22 98)" />
          <ellipse cx="78" cy="98" rx="12" ry="8" fill="#EC4899" transform="rotate(15 78 98)" />
        </>
      )}
      <ellipse cx="40" cy="132" rx="14" ry="7" fill="#EC4899" />
      <ellipse cx="60" cy="132" rx="14" ry="7" fill="#EC4899" />
      {/* Head */}
      <circle cx="50" cy="56" r="28" fill="#F9A8D4" />
      {/* Long ears */}
      <ellipse cx="34" cy="20" rx="9" ry="28" fill="#F9A8D4" />
      <ellipse cx="66" cy="20" rx="9" ry="28" fill="#F9A8D4" />
      <ellipse cx="34" cy="20" rx="5" ry="23" fill="#FBCFE8" />
      <ellipse cx="66" cy="20" rx="5" ry="23" fill="#FBCFE8" />
      {/* Eyes */}
      <Eyes mood={mood} lx={38} ly={52} rx={62} ry={52} />
      {/* Nose */}
      <ellipse cx="50" cy="66" rx="4" ry="3" fill="#EC4899" />
      {/* Mouth */}
      {mt === "smile" && <path d="M43,70 Q47,75 50,70 Q53,75 57,70" stroke="#BE185D" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {mt === "frown" && <path d="M43,73 Q50,67 57,73" stroke="#BE185D" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {mt === "open"  && <ellipse cx="50" cy="71" rx="5" ry="4" fill="#BE185D" opacity="0.5" />}
      {mt === "tiny-smile" && <path d="M46,70 Q50,72 54,70" stroke="#BE185D" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {/* Whiskers */}
      <line x1="16" y1="63" x2="40" y2="65" stroke="#BE185D" strokeWidth="1.5" opacity="0.3" />
      <line x1="16" y1="69" x2="40" y2="68" stroke="#BE185D" strokeWidth="1.5" opacity="0.3" />
      <line x1="84" y1="63" x2="60" y2="65" stroke="#BE185D" strokeWidth="1.5" opacity="0.3" />
      <line x1="84" y1="69" x2="60" y2="68" stroke="#BE185D" strokeWidth="1.5" opacity="0.3" />
      {(mood === "happy" || mood === "celebrate" || mood === "excited") && <><text x="8" y="18" fontSize="14">🌸</text><text x="68" y="16" fontSize="12">✨</text></>}
      {mood === "love"   && <><text x="8" y="18" fontSize="14">💖</text><text x="68" y="16" fontSize="12">💕</text></>}
      {mood === "angry"  && <text x="8" y="18" fontSize="14">💢</text>}
      {mood === "sleepy" && <text x="62" y="16" fontSize="12">💤</text>}
      {mood === "cool"   && <text x="8" y="18" fontSize="13">🕶️</text>}
    </svg>
  );
}

/* ── 🦝 RACCOON ──────────────────────────────────────────────────────────── */
function RaccoonSVG({ mood }: { mood: CompanionMood }) {
  const armsUp = mood === "celebrate" || mood === "excited" || mood === "love";
  const mt = mouthType(mood);
  return (
    <svg width="100" height="130" viewBox="0 0 100 130">
      <ellipse cx="50" cy="127" rx="26" ry="5" fill="#000" opacity="0.1" />
      {/* Striped tail */}
      <path d="M70 122 Q88 110 90 92 Q92 78 82 82 Q84 92 78 104 Q72 116 70 122Z" fill="#6B7280" />
      <path d="M80 120 Q92 110 92 98 Q94 86 86 88 Q87 96 84 106 Q80 114 80 120Z" fill="#374151" />
      {/* Body */}
      <ellipse cx="50" cy="94" rx="28" ry="32" fill="#9CA3AF" />
      <ellipse cx="50" cy="100" rx="18" ry="22" fill="#F3F4F6" />
      {/* Paws */}
      {armsUp ? (
        <>
          <ellipse cx="18" cy="72" rx="12" ry="8" fill="#6B7280" transform="rotate(-55 18 72)" />
          <ellipse cx="82" cy="72" rx="12" ry="8" fill="#6B7280" transform="rotate(55 82 72)" />
        </>
      ) : (
        <>
          <ellipse cx="22" cy="92" rx="12" ry="8" fill="#6B7280" transform="rotate(-15 22 92)" />
          <ellipse cx="78" cy="92" rx="12" ry="8" fill="#6B7280" transform="rotate(15 78 92)" />
        </>
      )}
      <ellipse cx="40" cy="124" rx="13" ry="6" fill="#6B7280" />
      <ellipse cx="60" cy="124" rx="13" ry="6" fill="#6B7280" />
      {/* Head */}
      <circle cx="50" cy="50" r="28" fill="#9CA3AF" />
      {/* Ears */}
      <circle cx="28" cy="26" r="12" fill="#6B7280" />
      <circle cx="72" cy="26" r="12" fill="#6B7280" />
      <circle cx="28" cy="26" r="7" fill="#F3F4F6" />
      <circle cx="72" cy="26" r="7" fill="#F3F4F6" />
      {/* Face white area */}
      <ellipse cx="50" cy="56" rx="20" ry="16" fill="#F3F4F6" />
      {/* Black mask */}
      <ellipse cx="36" cy="47" rx="13" ry="10" fill="#374151" />
      <ellipse cx="64" cy="47" rx="13" ry="10" fill="#374151" />
      {/* Eyes on mask */}
      <Eyes mood={mood} lx={36} ly={47} rx={64} ry={47} r={9} />
      {/* Nose */}
      <ellipse cx="50" cy="63" rx="4" ry="3" fill="#374151" />
      {/* Stripes */}
      <path d="M38,32 Q50,28 62,32" stroke="#6B7280" strokeWidth="2" fill="none" opacity="0.5" />
      {/* Mouth */}
      {mt === "smile" && <path d="M43,67 Q50,73 57,67" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {mt === "frown" && <path d="M43,70 Q50,64 57,70" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {mt === "open"  && <ellipse cx="50" cy="69" rx="5" ry="4" fill="#374151" opacity="0.5" />}
      {mt === "tiny-smile" && <path d="M46,67 Q50,69 54,67" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {(mood === "happy" || mood === "celebrate" || mood === "excited") && <><text x="10" y="24" fontSize="14">⭐</text><text x="68" y="20" fontSize="12">✨</text></>}
      {mood === "love"   && <><text x="10" y="24" fontSize="14">💖</text><text x="68" y="20" fontSize="12">💕</text></>}
      {mood === "angry"  && <text x="10" y="24" fontSize="14">💢</text>}
      {mood === "sleepy" && <text x="62" y="18" fontSize="12">💤</text>}
      {mood === "cool"   && <text x="10" y="24" fontSize="13">🕶️</text>}
    </svg>
  );
}

/* ── 🐸 FROG ─────────────────────────────────────────────────────────────── */
function FrogSVG({ mood }: { mood: CompanionMood }) {
  const armsUp = mood === "celebrate" || mood === "excited" || mood === "love";
  const mt = mouthType(mood);
  return (
    <svg width="100" height="120" viewBox="0 0 100 120">
      <ellipse cx="50" cy="117" rx="28" ry="5" fill="#000" opacity="0.1" />
      {/* Body */}
      <ellipse cx="50" cy="88" rx="34" ry="30" fill="#22C55E" />
      <ellipse cx="50" cy="94" rx="24" ry="22" fill="#DCFCE7" />
      {/* Legs */}
      <ellipse cx="22" cy="110" rx="14" ry="8" fill="#16A34A" transform="rotate(-20 22 110)" />
      <ellipse cx="78" cy="110" rx="14" ry="8" fill="#16A34A" transform="rotate(20 78 110)" />
      <ellipse cx="16" cy="116" rx="12" ry="6" fill="#15803D" />
      <ellipse cx="84" cy="116" rx="12" ry="6" fill="#15803D" />
      {/* Arms */}
      {armsUp ? (
        <>
          <ellipse cx="16" cy="70" rx="13" ry="8" fill="#16A34A" transform="rotate(-55 16 70)" />
          <ellipse cx="84" cy="70" rx="13" ry="8" fill="#16A34A" transform="rotate(55 84 70)" />
        </>
      ) : (
        <>
          <ellipse cx="18" cy="86" rx="13" ry="8" fill="#16A34A" transform="rotate(-15 18 86)" />
          <ellipse cx="82" cy="86" rx="13" ry="8" fill="#16A34A" transform="rotate(15 82 86)" />
        </>
      )}
      {/* Head */}
      <ellipse cx="50" cy="58" rx="32" ry="28" fill="#22C55E" />
      {/* Eye bumps */}
      <circle cx="32" cy="40" r="14" fill="#22C55E" />
      <circle cx="68" cy="40" r="14" fill="#22C55E" />
      {/* Eyes */}
      <Eyes mood={mood} lx={32} ly={40} rx={68} ry={40} r={11} />
      {/* Nostrils */}
      <circle cx="46" cy="62" r="2.5" fill="#15803D" />
      <circle cx="54" cy="62" r="2.5" fill="#15803D" />
      {/* Mouth */}
      {mt === "smile" && <path d="M26,72 Q50,84 74,72" stroke="#15803D" strokeWidth="3" fill="none" strokeLinecap="round" />}
      {mt === "frown" && <path d="M28,74 Q50,65 72,74" stroke="#15803D" strokeWidth="3" fill="none" strokeLinecap="round" />}
      {mt === "open"  && <ellipse cx="50" cy="74" rx="10" ry="7" fill="#15803D" opacity="0.4" />}
      {mt === "tiny-smile" && <path d="M36,72 Q50,78 64,72" stroke="#15803D" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {(mood === "happy" || mood === "celebrate" || mood === "excited") && <><text x="6" y="22" fontSize="14">🍃</text><text x="68" y="18" fontSize="12">✨</text></>}
      {mood === "love"   && <><text x="6" y="22" fontSize="14">💖</text><text x="68" y="18" fontSize="12">💕</text></>}
      {mood === "angry"  && <text x="6" y="22" fontSize="14">💢</text>}
      {mood === "sleepy" && <text x="62" y="16" fontSize="12">💤</text>}
      {mood === "cool"   && <text x="6" y="22" fontSize="13">🕶️</text>}
    </svg>
  );
}

/* ── Main export ─────────────────────────────────────────────────────────── */
const ANIMALS: Record<CompanionAnimal, (props: { mood: CompanionMood }) => React.ReactElement> = {
  fox:     FoxSVG,
  cat:     CatSVG,
  dragon:  DragonSVG,
  rabbit:  RabbitSVG,
  raccoon: RaccoonSVG,
  frog:    FrogSVG,
};

interface Props {
  animal: CompanionAnimal;
  mood?: CompanionMood;
  className?: string;
}

export default function CompanionSVG({ animal, mood = "idle", className = "" }: Props) {
  const Animal = ANIMALS[animal] ?? ANIMALS.fox;
  return (
    <div className={`select-none ${className}`}>
      <Animal mood={mood} />
    </div>
  );
}
