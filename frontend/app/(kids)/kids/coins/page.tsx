"use client";

import { KidsPageShell } from "@/components/ui/shells";
import { KidsPageHeader } from "@/components/kids/ui";
import { useKidsState } from "@/lib/use-kids-store";

const HOW_TO_EARN = [
  { emoji: "📚", label: "Завершити урок",           coins: "+10"    },
  { emoji: "🔥", label: "Щоденний streak",          coins: "+5"     },
  { emoji: "🎯", label: "Щоденний челендж",         coins: "+20"    },
  { emoji: "🏆", label: "Розблокувати досягнення",  coins: "різне"  },
];

export default function CoinsPage() {
  const { state } = useKidsState();
  const coins = state.coins ?? 0;

  return (
    <KidsPageShell
      header={<KidsPageHeader title="Монетки" backHref="/kids/dashboard" />}
    >
      <div className="flex flex-col gap-4 py-4 max-w-screen-sm mx-auto">
        {/* Balance hero */}
        <div className="rounded-3xl p-5 flex flex-col items-center gap-3 bg-accent shadow-press-accent">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/coin.png" alt="" aria-hidden width={72} height={72} className="object-contain drop-shadow-md" />
          <p className="font-black text-white text-[44px] leading-none tabular-nums">{coins}</p>
          <p className="font-bold text-white/80 text-[13px]">монет на балансі</p>
        </div>

        {/* How to earn */}
        <div className="rounded-2xl overflow-hidden bg-surface-raised border-2 border-border shadow-card">
          <div className="px-4 py-3 border-b-2 border-border">
            <p className="font-black text-[13px] text-ink">Як заробити монетки 💡</p>
          </div>
          {HOW_TO_EARN.map((item, i) => (
            <div
              key={item.label}
              className={[
                "flex items-center gap-3 px-4 py-3",
                i < HOW_TO_EARN.length - 1 && "border-b-2 border-border",
              ].filter(Boolean).join(" ")}
            >
              <span className="text-xl" aria-hidden>{item.emoji}</span>
              <p className="flex-1 font-bold text-[13px] text-ink-muted">{item.label}</p>
              <span className="font-black flex items-center gap-1 text-[13px] text-coin">
                {item.coins}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/coin.png" alt="" aria-hidden width={14} height={14} className="object-contain" />
              </span>
            </div>
          ))}
        </div>

      </div>
    </KidsPageShell>
  );
}
