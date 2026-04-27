/**
 * Kids homework — listing page.
 *
 * Layout matches /kids/school (Library / Words tabs):
 *   - top tab strip filters (Треба зробити / Готово / Усі)
 *   - full-bleed scroll area with hairline-separated ios-list rows
 *   - each row: status dot · title · description · status chip + due + score
 *   - no top navbar; navigation lives in the bottom KidsFooter
 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchSubmissions, type Submission, type SubmissionStatus } from "@/lib/homework";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

type TabKey = "active" | "done" | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "active", label: "Треба зробити" },
  { key: "done",   label: "Готово"        },
  { key: "all",    label: "Усі"           },
];

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  notStarted: "Нове",
  inProgress: "В роботі",
  submitted:  "Здано",
  reviewed:   "Готово",
  returned:   "На доробку",
  overdue:    "Прострочено",
};

function isActive(s: SubmissionStatus) {
  return s === "notStarted" || s === "inProgress" || s === "returned" || s === "overdue";
}
function isDone(s: SubmissionStatus) {
  return s === "submitted" || s === "reviewed";
}

function formatDue(iso: string | null): string {
  if (!iso) return "без дедлайну";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now  = new Date();
  const diff = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return `${-diff} дн. тому`;
  if (diff === 0) return "сьогодні";
  if (diff === 1) return "завтра";
  if (diff < 7)  return `через ${diff} дн.`;
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

/** Status dot — colour signals state, glyph signals stage. */
function dotFor(status: SubmissionStatus): { cls: string; glyph: string } {
  switch (status) {
    case "reviewed":
      return { cls: "bg-success text-white",       glyph: "✓" };
    case "submitted":
      return { cls: "bg-secondary text-white",     glyph: "↑" };
    case "inProgress":
      return { cls: "bg-primary text-white",       glyph: "•" };
    case "returned":
    case "overdue":
      return { cls: "bg-danger text-white",        glyph: "!" };
    case "notStarted":
    default:
      return { cls: "bg-surface-muted text-ink-faint", glyph: "•" };
  }
}

export default function KidsHomeworkListPage() {
  const [subs,    setSubs]   = useState<Submission[]>([]);
  const [status,  setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [tab,     setTab]    = useState<TabKey>("active");

  useEffect(() => {
    let alive = true;
    fetchSubmissions()
      .then((rows) => alive && (setSubs(rows), setStatus("ready")))
      .catch(() => alive && setStatus("error"));
    return () => { alive = false; };
  }, []);

  const visible = subs.filter((s) => {
    if (tab === "active") return isActive(s.status);
    if (tab === "done")   return isDone(s.status);
    return true;
  });

  const counts = {
    active: subs.filter((s) => isActive(s.status)).length,
    done:   subs.filter((s) => isDone(s.status)).length,
    all:    subs.length,
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-surface-raised overflow-hidden">
      {/* Top tab strip — same pattern as /kids/school */}
      <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4 px-3 sm:px-5 border-b border-border pt-[env(safe-area-inset-top,8px)]">
        <div className="flex flex-shrink-0">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                aria-pressed={active}
                className={[
                  "py-3 px-1 mr-4 sm:mr-6 font-black transition-colors text-[13.5px] sm:text-sm border-b-2 -mb-px",
                  active ? "text-ink border-primary" : "text-ink-faint border-transparent hover:text-ink-muted",
                ].join(" ")}
              >
                {t.label}
                <span className="ml-1.5 font-bold text-[11px] text-ink-faint tabular-nums">
                  {counts[t.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+72px)]">
        {status === "loading" ? (
          <div className="py-10 px-4">
            <LoadingState shape="list" rows={5} />
          </div>
        ) : status === "error" ? (
          <div className="py-10 px-4">
            <EmptyState
              title="Не вдалося завантажити"
              description="Перевір зʼєднання та спробуй ще раз."
            />
          </div>
        ) : visible.length === 0 ? (
          <div className="py-10 px-4">
            <EmptyState
              title={tab === "active" ? "Домашки немає" : "Поки порожньо"}
              description={
                tab === "active"
                  ? "Відпочинь або повчися далі — нічого терміново робити."
                  : "Завдання зʼявляться тут, коли вчитель надішле."
              }
              icon={<span aria-hidden>🎉</span>}
            />
          </div>
        ) : (
          <ul>
            {visible.map((s, idx) => {
              const hw   = s.homework;
              const dot  = dotFor(s.status);
              return (
                <li
                  key={s.documentId}
                  className={idx > 0 ? "border-t border-border" : ""}
                >
                  <Link
                    href={`/kids/homework/${s.documentId}`}
                    className="flex items-start gap-3 px-4 md:px-6 py-4 transition-colors hover:bg-surface-hover"
                  >
                    <span
                      aria-hidden
                      className={[
                        "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black text-[11.5px] mt-0.5",
                        dot.cls,
                      ].join(" ")}
                    >
                      {dot.glyph}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[14px] md:text-[15px] text-ink leading-snug truncate">
                        {hw?.title ?? "Без назви"}
                      </p>
                      {hw?.description && (
                        <p className="font-medium text-[12.5px] md:text-[13px] text-ink-muted mt-0.5 line-clamp-2 leading-snug">
                          {hw.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="ios-chip">{STATUS_LABEL[s.status]}</span>
                        <span className="font-bold text-[11.5px] text-ink-faint tabular-nums">
                          {formatDue(hw?.dueAt ?? null)}
                        </span>
                        {s.score !== null && (
                          <span className="font-black text-[11.5px] text-success-dark tabular-nums">
                            {s.score} балів
                          </span>
                        )}
                      </div>
                    </div>
                    <span aria-hidden className="text-ink-faint font-black text-base flex-shrink-0 mt-1">
                      ›
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
