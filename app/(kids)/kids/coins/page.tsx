"use client";

import { useState } from "react";
import Link from "next/link";
import { useKidsState } from "@/lib/use-kids-store";

const TRANSACTIONS = [
  { id: "1", emoji: "⭐", labelEn: "Lesson completed",   amount: +30,  date: "Today, 10:20"    },
  { id: "2", emoji: "🔥", labelEn: "7-day streak!",      amount: +50,  date: "Yesterday, 20:00" },
  { id: "3", emoji: "🛒", labelEn: "Bought: Aquarium",   amount: -150, date: "Yesterday, 15:43" },
  { id: "4", emoji: "🏆", labelEn: "Achievement: First", amount: +100, date: "2 days ago"        },
  { id: "5", emoji: "🎁", labelEn: "Gift from Oksana",   amount: +80,  date: "3 days ago"        },
  { id: "6", emoji: "🎩", labelEn: "Bought: Top Hat",    amount: -70,  date: "5 days ago"        },
];

const HOW_TO_EARN = [
  { emoji: "📚", en: "Complete a lesson",  coins: "+10" },
  { emoji: "🔥", en: "Daily streak bonus", coins: "+5"  },
  { emoji: "🎯", en: "Daily challenge",    coins: "+20" },
  { emoji: "🏆", en: "Unlock achievement", coins: "varies" },
];

const GIFT_AMOUNTS = [20, 50, 100, 200];

export default function CoinsPage() {
  const { state } = useKidsState();
  const coins = state.coins ?? 0;

  const [showGiftForm, setShowGiftForm] = useState(false);
  const [recipientId,  setRecipientId]  = useState("");
  const [foundName,    setFoundName]    = useState<string | null>(null);
  const [giftAmount,   setGiftAmount]   = useState<number | null>(null);
  const [step, setStep] = useState<"form" | "confirm" | "done">("form");

  function resetGift() {
    setShowGiftForm(false); setRecipientId(""); setFoundName(null);
    setGiftAmount(null); setStep("form");
  }

  const totalEarned = TRANSACTIONS.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalSpent  = Math.abs(TRANSACTIONS.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

  return (
    <div className="flex flex-col h-[100dvh] bg-[#F9FAFB] overflow-hidden">

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white"
        style={{ borderBottom: "2px solid #F3F4F6", paddingTop: "env(safe-area-inset-top, 12px)" }}>
        <Link href="/kids/dashboard"
          className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg active:scale-90 transition-transform"
          style={{ background: "#F3F4F6", color: "#374151" }}>←</Link>
        <span className="font-black flex items-center gap-2" style={{ fontSize: 17, color: "#1A1A2E" }}>Coins <img src="/coin.png" alt="coin" style={{ width: 20, height: 20, objectFit: "contain" }} /></span>
        <div style={{ width: 40 }} />
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 flex flex-col gap-4">

        {/* Balance hero */}
        <div className="rounded-3xl p-5 flex flex-col items-center gap-3"
          style={{ background: "#F59E0B", boxShadow: "0 5px 0 #D97706" }}>
          <img src="/coin.png" alt="coin" style={{ width: 72, height: 72, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }} />
          <p className="font-black text-white" style={{ fontSize: 44, lineHeight: 1 }}>{coins}</p>
          <p className="font-bold text-white/70" style={{ fontSize: 13 }}>coins on balance</p>

          <div className="flex gap-3 w-full">
            <div className="flex-1 rounded-2xl py-2 text-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <p className="font-black text-white" style={{ fontSize: 16 }}>+{totalEarned}</p>
              <p className="font-bold text-white/60" style={{ fontSize: 10 }}>earned</p>
            </div>
            <div className="flex-1 rounded-2xl py-2 text-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <p className="font-black text-white" style={{ fontSize: 16 }}>-{totalSpent}</p>
              <p className="font-bold text-white/60" style={{ fontSize: 10 }}>spent</p>
            </div>
          </div>

          <button onClick={() => setShowGiftForm(true)}
            className="w-full rounded-2xl font-black py-3 active:translate-y-0.5 transition-transform"
            style={{ background: "rgba(255,255,255,0.92)", color: "#92400E", fontSize: 14 }}>
            🎁 Gift Coins
          </button>
        </div>

        {/* How to earn */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "2px solid #F3F4F6", boxShadow: "0 3px 0 #E5E7EB" }}>
          <div className="px-4 py-3 border-b-2" style={{ borderColor: "#F3F4F6" }}>
            <p className="font-black" style={{ fontSize: 13, color: "#1A1A2E" }}>How to earn coins 💡</p>
          </div>
          {HOW_TO_EARN.map((item, i) => (
            <div key={item.en} className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < HOW_TO_EARN.length - 1 ? "2px solid #F3F4F6" : "none" }}>
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <p className="flex-1 font-bold" style={{ fontSize: 13, color: "#374151" }}>{item.en}</p>
              <span className="font-black flex items-center gap-1" style={{ fontSize: 13, color: "#F59E0B" }}>{item.coins} <img src="/coin.png" alt="coin" style={{ width: 14, height: 14, objectFit: "contain" }} /></span>
            </div>
          ))}
        </div>

        {/* Transaction history */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "2px solid #F3F4F6", boxShadow: "0 3px 0 #E5E7EB" }}>
          <div className="px-4 py-3 border-b-2" style={{ borderColor: "#F3F4F6" }}>
            <p className="font-black" style={{ fontSize: 13, color: "#1A1A2E" }}>History</p>
          </div>
          {TRANSACTIONS.map((tx, i) => (
            <div key={tx.id} className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < TRANSACTIONS.length - 1 ? "2px solid #F3F4F6" : "none" }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: tx.amount > 0 ? "#F0FDF4" : "#FFF1F2" }}>
                {tx.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black truncate" style={{ fontSize: 13, color: "#1A1A2E" }}>{tx.labelEn}</p>
                <p className="font-bold" style={{ fontSize: 10, color: "#9CA3AF" }}>{tx.date}</p>
              </div>
              <span className="font-black flex-shrink-0"
                style={{ fontSize: 14, color: tx.amount > 0 ? "#16A34A" : "#DC2626" }}>
                {tx.amount > 0 ? "+" : ""}{tx.amount}<img src="/coin.png" alt="coin" style={{ width: 14, height: 14, objectFit: "contain", display: "inline", verticalAlign: "middle", marginLeft: 2 }} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── GIFT MODAL ───────────────────────────────────────────── */}
      {showGiftForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={resetGift} />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white"
            style={{ boxShadow: "0 -8px 32px rgba(0,0,0,0.15)" }}>

            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <p className="font-black" style={{ fontSize: 18, color: "#1A1A2E" }}>
                {step === "done" ? "Sent! 🎉" : "Gift Coins 🎁"}
              </p>
              {step !== "done" && (
                <button onClick={resetGift}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-black"
                  style={{ background: "#F3F4F6", color: "#6B7280" }}>✕</button>
              )}
            </div>

            <div className="px-5 pb-8">
              {step === "done" ? (
                <div className="text-center py-4 flex flex-col gap-4 items-center">
                  <span style={{ fontSize: 60 }}>🎉</span>
                  <p className="font-bold" style={{ fontSize: 14, color: "#9CA3AF" }}>
                    {giftAmount} <img src="/coin.png" alt="coin" style={{ width: 14, height: 14, objectFit: "contain", display: "inline", verticalAlign: "middle" }} /> sent to {foundName}
                  </p>
                  <button onClick={resetGift}
                    className="w-full rounded-2xl font-black text-white py-3 active:translate-y-0.5 transition-transform"
                    style={{ background: "#22C55E", boxShadow: "0 4px 0 #16A34A", fontSize: 15 }}>
                    Close ✓
                  </button>
                </div>

              ) : step === "confirm" ? (
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl p-4" style={{ background: "#F9FAFB", border: "2px solid #F3F4F6" }}>
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-sm" style={{ color: "#9CA3AF" }}>To:</span>
                      <span className="font-black text-sm" style={{ color: "#1A1A2E" }}>{foundName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-sm" style={{ color: "#9CA3AF" }}>Amount:</span>
                      <span className="font-black text-sm flex items-center gap-1" style={{ color: "#F59E0B" }}>{giftAmount} <img src="/coin.png" alt="coin" style={{ width: 14, height: 14, objectFit: "contain" }} /></span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep("form")}
                      className="flex-1 rounded-2xl font-black py-3"
                      style={{ background: "#F1F5F9", color: "#64748B", border: "2px solid #E2E8F0", fontSize: 14 }}>
                      ← Back
                    </button>
                    <button onClick={() => setStep("done")}
                      className="flex-1 rounded-2xl font-black text-white py-3 active:translate-y-0.5 transition-transform"
                      style={{ background: "#22C55E", boxShadow: "0 4px 0 #16A34A", fontSize: 14 }}>
                      Send →
                    </button>
                  </div>
                </div>

              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="font-black mb-2" style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>
                      Friend's ID
                    </p>
                    <div className="flex gap-2">
                      <input type="text" maxLength={6} value={recipientId}
                        onChange={e => { setRecipientId(e.target.value.toUpperCase()); setFoundName(null); }}
                        placeholder="ABC123"
                        className="flex-1 rounded-2xl px-4 font-bold focus:outline-none"
                        style={{ height: 48, fontSize: 15, border: "2px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A2E" }}
                      />
                      <button
                        onClick={() => setFoundName(recipientId.length === 6 ? "Dmitro K." : null)}
                        disabled={recipientId.length !== 6}
                        className="rounded-2xl font-black text-white px-4 disabled:opacity-40 active:scale-95 transition-transform"
                        style={{ background: "#4F9CF9", boxShadow: "0 3px 0 #2563EB", fontSize: 14 }}>
                        Find
                      </button>
                    </div>
                    {foundName && <p className="mt-1.5 font-bold text-sm" style={{ color: "#22C55E" }}>✓ {foundName}</p>}
                  </div>

                  <div>
                    <p className="font-black mb-2" style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>Amount</p>
                    <div className="grid grid-cols-4 gap-2">
                      {GIFT_AMOUNTS.map(amt => (
                        <button key={amt} onClick={() => setGiftAmount(amt)}
                          className="py-3 rounded-2xl font-black transition-all active:scale-95"
                          style={{
                            background: giftAmount === amt ? "#F59E0B" : "#F9FAFB",
                            border: `2px solid ${giftAmount === amt ? "#D97706" : "#E5E7EB"}`,
                            boxShadow: giftAmount === amt ? "0 3px 0 #D97706" : "none",
                            color: giftAmount === amt ? "white" : "#6B7280",
                            fontSize: 15,
                          }}>{amt}</button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => foundName && giftAmount && setStep("confirm")}
                    disabled={!foundName || !giftAmount}
                    className="w-full rounded-2xl font-black text-white py-3 active:translate-y-0.5 transition-transform disabled:opacity-40"
                    style={{ background: "#F59E0B", boxShadow: "0 4px 0 #D97706", fontSize: 15 }}>
                    Continue →
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
