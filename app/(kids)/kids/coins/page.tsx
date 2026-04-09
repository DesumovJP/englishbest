"use client";

import { useState } from "react";
import Link from "next/link";
import { mockKidsUser } from "@/mocks/user";

const TRANSACTIONS = [
  { id: "1", type: "earn",  emoji: "⭐", label: "Урок завершено",          amount: +30,  date: "Сьогодні, 10:20"   },
  { id: "2", type: "earn",  emoji: "🔥", label: "Стрік 7 днів",            amount: +50,  date: "Вчора, 20:00"       },
  { id: "3", type: "spend", emoji: "🛒", label: "Куплено: Акваріум",        amount: -150, date: "Вчора, 15:43"      },
  { id: "4", type: "earn",  emoji: "🏆", label: "Досягнення: Перший урок",  amount: +100, date: "2 дні тому"         },
  { id: "5", type: "gift",  emoji: "🎁", label: "Подарунок від Оксани",     amount: +80,  date: "3 дні тому"         },
  { id: "6", type: "spend", emoji: "🎩", label: "Куплено: Циліндр",         amount: -70,  date: "5 днів тому"        },
];

const GIFT_AMOUNTS = [20, 50, 100, 200];

export default function CoinsPage() {
  const user = mockKidsUser;
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [foundName, setFoundName] = useState<string | null>(null);
  const [giftAmount, setGiftAmount] = useState<number | null>(null);
  const [step, setStep] = useState<"form" | "confirm" | "done">("form");

  function handleSearch() {
    // Mock: будь-який 6-символьний ID → знаходить "Дмитро К."
    if (recipientId.length === 6) {
      setFoundName("Дмитро К.");
    } else {
      setFoundName(null);
    }
  }

  function handleConfirm() {
    setStep("done");
  }

  function resetGift() {
    setShowGiftForm(false);
    setRecipientId("");
    setFoundName(null);
    setGiftAmount(null);
    setStep("form");
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">

      {/* ── Хедер ── */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <Link href="/kids/dashboard" className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span className="text-sm font-semibold">Назад</span>
        </Link>
        <h1 className="font-black text-ink text-base">Монетки 🪙</h1>
        <div className="w-16" />
      </header>

      {/* ── Баланс ── */}
      <div className="px-5 py-8 flex flex-col items-center gap-2 bg-gradient-to-b from-accent/8 to-surface border-b border-border">
        <span className="text-6xl animate-bounce-in">🪙</span>
        <p className="text-5xl font-black text-ink">{user.coins}</p>
        <p className="text-ink-muted text-sm">монетків на балансі</p>
        <button
          onClick={() => setShowGiftForm(true)}
          className="mt-3 flex items-center gap-2 bg-primary text-white font-black text-sm px-6 py-3 rounded-2xl hover:bg-primary-dark transition-colors"
        >
          🎁 Подарувати монетки
        </button>
      </div>

      {/* ── Історія транзакцій ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="text-xs font-black text-ink-muted uppercase tracking-widest mb-3">
          Історія
        </p>
        <div className="flex flex-col gap-2">
          {TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <span className="text-2xl w-8 text-center flex-shrink-0">{tx.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{tx.label}</p>
                <p className="text-xs text-ink-muted">{tx.date}</p>
              </div>
              <span className={[
                "font-black text-sm flex-shrink-0",
                tx.amount > 0 ? "text-primary" : "text-danger",
              ].join(" ")}>
                {tx.amount > 0 ? "+" : ""}{tx.amount} 🪙
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Gift modal ── */}
      {showGiftForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-sm p-6 animate-slide-up">

            {step === "done" ? (
              <div className="text-center py-4">
                <div className="text-6xl mb-3">🎉</div>
                <h2 className="text-xl font-black text-ink mb-2">Надіслано!</h2>
                <p className="text-ink-muted text-sm mb-6">
                  {giftAmount} 🪙 відправлено до {foundName}
                </p>
                <button onClick={resetGift} className="w-full py-3 rounded-xl bg-primary text-white font-black">
                  Закрити
                </button>
              </div>
            ) : step === "confirm" ? (
              <>
                <h2 className="text-lg font-black text-ink mb-4">Підтвердження</h2>
                <div className="bg-surface-muted rounded-xl p-4 mb-6 text-sm text-ink space-y-2">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Кому:</span>
                    <span className="font-bold">{foundName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Сума:</span>
                    <span className="font-bold">{giftAmount} 🪙</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("form")} className="flex-1 py-3 rounded-xl border-2 border-border text-ink font-bold text-sm">
                    Назад
                  </button>
                  <button onClick={handleConfirm} className="flex-1 py-3 rounded-xl bg-primary text-white font-black text-sm">
                    Надіслати →
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black text-ink">Подарувати монетки 🎁</h2>
                  <button onClick={resetGift} className="text-ink-muted hover:text-ink">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* ID пошук */}
                <label className="text-xs font-black text-ink-muted uppercase tracking-widest mb-2 block">
                  ID друга (6 символів)
                </label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    maxLength={6}
                    value={recipientId}
                    onChange={(e) => { setRecipientId(e.target.value); setFoundName(null); }}
                    placeholder="ABC123"
                    className="flex-1 h-11 px-4 rounded-xl border border-border text-sm text-ink bg-surface-muted focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 h-11 rounded-xl bg-ink text-white text-sm font-bold hover:bg-ink/80 transition-colors"
                  >
                    Знайти
                  </button>
                </div>
                {foundName && (
                  <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-4 py-2.5 mb-4">
                    <span className="text-xl">👤</span>
                    <span className="font-bold text-ink text-sm">{foundName}</span>
                    <span className="ml-auto text-primary text-xs font-bold">✓ знайдено</span>
                  </div>
                )}

                {/* Сума */}
                <label className="text-xs font-black text-ink-muted uppercase tracking-widest mb-2 block">
                  Кількість монетків
                </label>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {GIFT_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setGiftAmount(amt)}
                      className={[
                        "py-2.5 rounded-xl text-sm font-black border-2 transition-all",
                        giftAmount === amt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-ink hover:border-primary/40",
                      ].join(" ")}
                    >
                      {amt}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => foundName && giftAmount && setStep("confirm")}
                  disabled={!foundName || !giftAmount}
                  className="w-full py-3 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Далі →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
