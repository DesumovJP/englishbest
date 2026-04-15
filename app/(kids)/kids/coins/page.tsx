"use client";

import { useState } from "react";
import Link from "next/link";
import { useKidsState } from "@/lib/use-kids-store";

const TRANSACTIONS = [
  { id: "1", emoji: "⭐", labelEn: "Lesson completed",   amount: +30,  date: "Today, 10:20"     },
  { id: "2", emoji: "🔥", labelEn: "7-day streak!",      amount: +50,  date: "Yesterday, 20:00" },
  { id: "3", emoji: "🛒", labelEn: "Bought: Aquarium",   amount: -150, date: "Yesterday, 15:43" },
  { id: "4", emoji: "🏆", labelEn: "Achievement: First", amount: +100, date: "2 days ago"       },
  { id: "5", emoji: "🎁", labelEn: "Gift from Oksana",   amount: +80,  date: "3 days ago"       },
  { id: "6", emoji: "🎩", labelEn: "Bought: Top Hat",    amount: -70,  date: "5 days ago"       },
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
    <div className="flex flex-col h-dvh bg-gray-50 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b-2 border-gray-100 pt-[max(12px,env(safe-area-inset-top))]">
        <Link href="/kids/dashboard"
          className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg bg-gray-100 text-gray-700 active:scale-90 transition-transform">
          ←
        </Link>
        <span className="font-black flex items-center gap-2 text-[17px] text-gray-900">
          Coins <img src="/coin.png" alt="coin" width={20} height={20} className="object-contain" />
        </span>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 flex flex-col gap-4">
        {/* Balance hero */}
        <div className="rounded-3xl p-5 flex flex-col items-center gap-3 bg-amber-500 shadow-[0_5px_0_#D97706]">
          <img src="/coin.png" alt="coin" width={72} height={72} className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" />
          <p className="font-black text-white text-[44px] leading-none">{coins}</p>
          <p className="font-bold text-white/70 text-[13px]">coins on balance</p>

          <div className="flex gap-3 w-full">
            <div className="flex-1 rounded-2xl py-2 text-center bg-white/20">
              <p className="font-black text-white text-base">+{totalEarned}</p>
              <p className="font-bold text-white/60 text-[10px]">earned</p>
            </div>
            <div className="flex-1 rounded-2xl py-2 text-center bg-white/20">
              <p className="font-black text-white text-base">-{totalSpent}</p>
              <p className="font-bold text-white/60 text-[10px]">spent</p>
            </div>
          </div>

          <button onClick={() => setShowGiftForm(true)}
            className="w-full rounded-2xl font-black py-3 bg-white/90 text-amber-800 text-sm active:translate-y-0.5 transition-transform">
            🎁 Gift Coins
          </button>
        </div>

        {/* How to earn */}
        <div className="rounded-2xl overflow-hidden bg-white border-2 border-gray-100 shadow-[0_3px_0_#E5E7EB]">
          <div className="px-4 py-3 border-b-2 border-gray-100">
            <p className="font-black text-[13px] text-gray-900">How to earn coins 💡</p>
          </div>
          {HOW_TO_EARN.map((item, i) => (
            <div key={item.en}
              className={["flex items-center gap-3 px-4 py-3", i < HOW_TO_EARN.length - 1 && "border-b-2 border-gray-100"].filter(Boolean).join(" ")}>
              <span className="text-xl">{item.emoji}</span>
              <p className="flex-1 font-bold text-[13px] text-gray-700">{item.en}</p>
              <span className="font-black flex items-center gap-1 text-[13px] text-amber-500">
                {item.coins} <img src="/coin.png" alt="coin" width={14} height={14} className="object-contain" />
              </span>
            </div>
          ))}
        </div>

        {/* Transaction history */}
        <div className="rounded-2xl overflow-hidden bg-white border-2 border-gray-100 shadow-[0_3px_0_#E5E7EB]">
          <div className="px-4 py-3 border-b-2 border-gray-100">
            <p className="font-black text-[13px] text-gray-900">History</p>
          </div>
          {TRANSACTIONS.map((tx, i) => (
            <div key={tx.id}
              className={["flex items-center gap-3 px-4 py-3", i < TRANSACTIONS.length - 1 && "border-b-2 border-gray-100"].filter(Boolean).join(" ")}>
              <div className={[
                "w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0",
                tx.amount > 0 ? "bg-green-50" : "bg-rose-50",
              ].join(" ")}>
                {tx.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black truncate text-[13px] text-gray-900">{tx.labelEn}</p>
                <p className="font-bold text-[10px] text-gray-400">{tx.date}</p>
              </div>
              <span className={["font-black flex-shrink-0 text-sm", tx.amount > 0 ? "text-green-600" : "text-red-600"].join(" ")}>
                {tx.amount > 0 ? "+" : ""}{tx.amount}
                <img src="/coin.png" alt="coin" width={14} height={14} className="object-contain inline align-middle ml-0.5" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gift modal */}
      {showGiftForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={resetGift} />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <p className="font-black text-lg text-gray-900">
                {step === "done" ? "Sent! 🎉" : "Gift Coins 🎁"}
              </p>
              {step !== "done" && (
                <button onClick={resetGift}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-black bg-gray-100 text-gray-500">
                  ✕
                </button>
              )}
            </div>

            <div className="px-5 pb-8">
              {step === "done" ? (
                <div className="text-center py-4 flex flex-col gap-4 items-center">
                  <span className="text-[60px]">🎉</span>
                  <p className="font-bold text-sm text-gray-400">
                    {giftAmount} <img src="/coin.png" alt="coin" width={14} height={14} className="object-contain inline align-middle" /> sent to {foundName}
                  </p>
                  <button onClick={resetGift}
                    className="w-full rounded-2xl font-black text-white py-3 bg-green-500 shadow-[0_4px_0_#16A34A] text-[15px] active:translate-y-0.5 transition-transform">
                    Close ✓
                  </button>
                </div>

              ) : step === "confirm" ? (
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl p-4 bg-gray-50 border-2 border-gray-100">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-sm text-gray-400">To:</span>
                      <span className="font-black text-sm text-gray-900">{foundName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-sm text-gray-400">Amount:</span>
                      <span className="font-black text-sm flex items-center gap-1 text-amber-500">
                        {giftAmount} <img src="/coin.png" alt="coin" width={14} height={14} className="object-contain" />
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep("form")}
                      className="flex-1 rounded-2xl font-black py-3 bg-slate-100 text-slate-500 border-2 border-slate-200 text-sm">
                      ← Back
                    </button>
                    <button onClick={() => setStep("done")}
                      className="flex-1 rounded-2xl font-black text-white py-3 bg-green-500 shadow-[0_4px_0_#16A34A] text-sm active:translate-y-0.5 transition-transform">
                      Send →
                    </button>
                  </div>
                </div>

              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="font-black mb-2 text-[11px] text-gray-400 uppercase">Friend&apos;s ID</p>
                    <div className="flex gap-2">
                      <input type="text" maxLength={6} value={recipientId}
                        onChange={e => { setRecipientId(e.target.value.toUpperCase()); setFoundName(null); }}
                        placeholder="ABC123"
                        className="flex-1 h-12 rounded-2xl px-4 font-bold focus:outline-none text-[15px] border-2 border-gray-200 bg-gray-50 text-gray-900"
                      />
                      <button
                        onClick={() => setFoundName(recipientId.length === 6 ? "Dmitro K." : null)}
                        disabled={recipientId.length !== 6}
                        className="rounded-2xl font-black text-white px-4 bg-blue-500 shadow-[0_3px_0_#2563EB] text-sm disabled:opacity-40 active:scale-95 transition-transform">
                        Find
                      </button>
                    </div>
                    {foundName && <p className="mt-1.5 font-bold text-sm text-green-500">✓ {foundName}</p>}
                  </div>

                  <div>
                    <p className="font-black mb-2 text-[11px] text-gray-400 uppercase">Amount</p>
                    <div className="grid grid-cols-4 gap-2">
                      {GIFT_AMOUNTS.map(amt => {
                        const active = giftAmount === amt;
                        return (
                          <button key={amt} onClick={() => setGiftAmount(amt)}
                            className={[
                              "py-3 rounded-2xl font-black text-[15px] border-2 transition-all active:scale-95",
                              active
                                ? "bg-amber-500 border-amber-600 text-white shadow-[0_3px_0_#D97706]"
                                : "bg-gray-50 border-gray-200 text-gray-500",
                            ].join(" ")}>
                            {amt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => foundName && giftAmount && setStep("confirm")}
                    disabled={!foundName || !giftAmount}
                    className="w-full rounded-2xl font-black text-white py-3 bg-amber-500 shadow-[0_4px_0_#D97706] text-[15px] active:translate-y-0.5 transition-transform disabled:opacity-40">
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
