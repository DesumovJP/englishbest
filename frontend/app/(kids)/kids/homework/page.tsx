"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KidsPageShell } from "@/components/ui/shells";
import { KidsPageHeader, KidsCard } from "@/components/kids/ui";
import { fetchSubmissions, type Submission, type SubmissionStatus } from "@/lib/homework";

const STATUS_PILL: Record<SubmissionStatus, { label: string; cls: string }> = {
  notStarted: { label: "Нове",      cls: "bg-primary/15    text-primary-dark" },
  inProgress: { label: "В роботі",  cls: "bg-accent/20     text-accent-dark"  },
  submitted:  { label: "Здано",     cls: "bg-secondary/20  text-secondary-dark" },
  reviewed:   { label: "Готово",    cls: "bg-primary/20    text-primary-dark" },
  returned:   { label: "На доробку",cls: "bg-danger/15     text-danger"       },
  overdue:    { label: "Прострочено",cls:"bg-ink-faint/20  text-ink-muted"    },
};

const TAB_ORDER: Array<{ key: "active" | "done" | "all"; label: string }> = [
  { key: "active", label: "Треба зробити" },
  { key: "done",   label: "Готово"        },
  { key: "all",    label: "Усі"           },
];

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

export default function KidsHomeworkListPage() {
  const [subs,    setSubs]   = useState<Submission[]>([]);
  const [status,  setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [tab,     setTab]    = useState<"active" | "done" | "all">("active");

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

  return (
    <KidsPageShell
      header={<KidsPageHeader title="Домашка 📝" backHref="/kids/dashboard" />}
    >
      <div className="max-w-screen-sm mx-auto flex flex-col gap-4 py-4">
        {/* Tabs */}
        <div className="flex gap-2 bg-surface-muted p-1 rounded-2xl">
          {TAB_ORDER.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={[
                "flex-1 py-2 rounded-xl text-[13px] font-black transition-colors",
                tab === t.key ? "bg-surface text-ink shadow-card-sm" : "text-ink-muted",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {status === "loading" && (
          <div className="flex justify-center py-16 text-ink-muted text-sm">Завантаження…</div>
        )}

        {status === "error" && (
          <KidsCard variant="default" className="p-6 text-center">
            <p className="font-black text-ink text-base">Не вдалося завантажити</p>
            <p className="text-ink-muted text-[13px] mt-1">Спробуй пізніше</p>
          </KidsCard>
        )}

        {status === "ready" && visible.length === 0 && (
          <KidsCard variant="hero" className="p-8 text-center">
            <span className="text-5xl" aria-hidden>🎉</span>
            <p className="font-black text-ink text-lg mt-3">
              {tab === "active" ? "Домашки немає" : "Поки порожньо"}
            </p>
            <p className="text-ink-muted text-[13px] mt-1">
              {tab === "active" ? "Відпочинь або вчися далі" : "Завдання з’являться тут"}
            </p>
          </KidsCard>
        )}

        {status === "ready" && visible.length > 0 && (
          <ul className="flex flex-col gap-3">
            {visible.map((s) => {
              const hw   = s.homework;
              const pill = STATUS_PILL[s.status];
              return (
                <li key={s.documentId}>
                  <Link
                    href={`/kids/homework/${s.documentId}`}
                    className="block active:scale-[0.99] transition-transform"
                  >
                    <KidsCard variant="default" className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-[28px] leading-none" aria-hidden>📄</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-ink text-[15px] truncate">
                            {hw?.title ?? "Без назви"}
                          </p>
                          {hw?.description && (
                            <p className="text-ink-muted text-[12px] mt-0.5 line-clamp-2">
                              {hw.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${pill.cls}`}>
                              {pill.label}
                            </span>
                            <span className="text-[11px] font-bold text-ink-faint">
                              {formatDue(hw?.dueAt ?? null)}
                            </span>
                            {s.score !== null && (
                              <span className="text-[11px] font-black text-primary-dark">
                                {s.score} балів
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </KidsCard>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </KidsPageShell>
  );
}
