"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useKidsState } from "@/lib/use-kids-store";

const TABS = [
  { href: "/kids/dashboard", icon: "🏠",  label: "Home"   },
  { href: "/kids/school",    icon: "📚",  label: "School" },
  { href: "/kids/shop",      icon: "🛍️", label: "Shop"   },
];

export default function KidsFooter() {
  const pathname  = usePathname();
  const { state } = useKidsState();
  const coins = state.coins ?? 0;

  function isActive(href: string) {
    if (href === "/kids/school") return pathname.startsWith("/kids/school") || pathname.startsWith("/kids/lessons");
    if (href === "/kids/shop")   return pathname === "/kids/shop";
    return pathname === href;
  }

  return (
    <nav
      aria-label="Навігація"
      className="fixed bottom-0 inset-x-0 z-50 bg-white/75 backdrop-blur-2xl backdrop-saturate-150 border-t border-black/[0.06]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="flex items-stretch max-w-lg mx-auto px-2 py-1.5">
        {TABS.map(tab => {
          const active = isActive(tab.href);
          const isShop = tab.href === "/kids/shop";
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 select-none active:scale-95 transition-transform"
              >
                {/* Icon capsule */}
                <span
                  className={[
                    "relative inline-flex items-center justify-center w-14 h-8 rounded-full transition-colors",
                    active ? "bg-primary/12" : "bg-transparent",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className="leading-none transition-transform"
                    style={{ fontSize: 22, transform: active ? "scale(1.05)" : "scale(1)", filter: active ? "none" : "grayscale(0.2) opacity(0.55)" }}
                  >
                    {tab.icon}
                  </span>
                  {isShop && coins > 0 && (
                    <span
                      className="absolute -top-1 -right-1 inline-flex items-center gap-0.5 h-[15px] min-w-[22px] px-1 rounded-full bg-accent ring-2 ring-white"
                      aria-label={`${coins} монет`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/coin.png" alt="" aria-hidden width={8} height={8} className="object-contain" />
                      <span className="font-black text-white leading-none" style={{ fontSize: 8.5 }}>
                        {coins > 999 ? "999+" : coins}
                      </span>
                    </span>
                  )}
                </span>

                <span
                  className={[
                    "text-[10px] font-bold leading-none tracking-tight transition-colors",
                    active ? "text-primary-dark" : "text-ink-muted",
                  ].join(" ")}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
