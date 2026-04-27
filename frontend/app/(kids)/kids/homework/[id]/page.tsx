"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KidsButton } from "@/components/kids/ui";
import { pointsForScore, starsForPoints } from "@/lib/grade";
import {
  fetchSubmission,
  updateMySubmission,
  type Submission,
  type SubmissionStatus,
} from "@/lib/homework";

const PAGE_BOTTOM_PAD = "pb-[calc(env(safe-area-inset-bottom,0px)+96px)]";

function isReadonly(s: SubmissionStatus): boolean {
  return s === "submitted" || s === "reviewed";
}

function statusLabel(s: SubmissionStatus): string {
  switch (s) {
    case "notStarted": return "Нове завдання";
    case "inProgress": return "В роботі";
    case "submitted":  return "Відправлено";
    case "reviewed":   return "Перевірено";
    case "returned":   return "На доробку";
    case "overdue":    return "Прострочено";
  }
}

function dueLabel(iso: string | null): string {
  if (!iso) return "без дедлайну";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `до ${d.toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}`;
}

function Header({ onBack, title }: { onBack: () => void; title?: string }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-surface-raised/95 backdrop-blur-md pt-[max(8px,env(safe-area-inset-top))]">
      <div className="w-full flex items-center gap-3 px-4 md:px-6 py-3">
        <button
          onClick={onBack}
          aria-label="Назад"
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0 bg-surface-muted text-ink active:scale-90 transition-transform hover:bg-surface-hover"
        >
          ←
        </button>
        <p className="font-black text-[14.5px] text-ink shrink-0">Домашка</p>
        {title && (
          <>
            <span className="text-sm text-ink-faint" aria-hidden>›</span>
            <p className="font-medium truncate text-sm text-ink-muted">{title}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function KidsHomeworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [sub,    setSub]    = useState<Submission | null>(null);
  const [load,   setLoad]   = useState<"loading" | "error" | "ready">("loading");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState<"idle" | "draft" | "submit">("idle");
  const [err,    setErr]    = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchSubmission(id)
      .then((s) => {
        if (!alive) return;
        if (!s) { setLoad("error"); return; }
        setSub(s);
        const existing = s.answers && typeof s.answers === "object" ? (s.answers as Record<string, unknown>).text : "";
        setAnswer(typeof existing === "string" ? existing : "");
        setLoad("ready");
      })
      .catch(() => alive && setLoad("error"));
    return () => { alive = false; };
  }, [id]);

  const readonly = useMemo(() => (sub ? isReadonly(sub.status) : true), [sub]);

  async function persist(nextStatus: "inProgress" | "submitted") {
    if (!sub) return;
    setSaving(nextStatus === "submitted" ? "submit" : "draft");
    setErr(null);
    try {
      const updated = await updateMySubmission(sub.documentId, {
        answers: { text: answer },
        status: nextStatus,
      });
      setSub(updated);
      if (nextStatus === "submitted") {
        router.push("/kids/homework");
      }
    } catch (e) {
      setErr((e as Error).message || "Не вдалося зберегти");
    } finally {
      setSaving("idle");
    }
  }

  return (
    <div className={`flex flex-col min-h-[100dvh] bg-surface-raised ${PAGE_BOTTOM_PAD}`}>
      <Header
        onBack={() => router.push("/kids/homework")}
        title={sub?.homework?.title}
      />

      {load === "loading" && (
        <div className="flex justify-center py-16 text-ink-muted text-sm">Завантаження…</div>
      )}

      {load === "error" && (
        <div className="px-4 md:px-6 py-10">
          <div className="max-w-screen-sm mx-auto w-full text-center">
            <p className="font-black text-ink text-base">Завдання не знайдено</p>
            <KidsButton variant="ghost" size="sm" href="/kids/homework" className="mt-4">
              На список
            </KidsButton>
          </div>
        </div>
      )}

      {load === "ready" && sub && (
        <>
          {/* HERO — chips · title · description (mirrors vocab/library) */}
          <section className="px-4 md:px-6 py-5">
            <div className="max-w-screen-sm mx-auto w-full flex flex-col gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="ios-chip">{statusLabel(sub.status)}</span>
                <span className="ios-chip">{dueLabel(sub.homework?.dueAt ?? null)}</span>
                {sub.score !== null && (
                  <span className="ios-chip text-success-dark">{sub.score} балів</span>
                )}
              </div>
              <h1 className="font-black text-[20px] md:text-[24px] leading-tight tracking-tight text-ink">
                {sub.homework?.title ?? "Без назви"}
              </h1>
              {sub.homework?.description && (
                <p className="font-medium leading-relaxed text-[14px] md:text-[15px] text-ink-muted whitespace-pre-wrap">
                  {sub.homework.description}
                </p>
              )}
            </div>
          </section>

          {(sub.teacherFeedback || sub.score !== null) && (
            <>
              <div className="ios-divider" />
              <section className="px-4 md:px-6 py-5">
                <div className="max-w-screen-sm mx-auto w-full">
                  <p className="font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted mb-2">
                    Від вчителя
                  </p>
                  <div className="rounded-2xl bg-surface-muted/60 border border-border p-4 flex flex-col gap-2">
                    {sub.score !== null && (() => {
                      const points = pointsForScore(sub.score);
                      const stars = starsForPoints(points);
                      return (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] font-black uppercase text-ink-faint tracking-wider">
                            Оцінка
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="text-[15px]" aria-hidden>
                              {'⭐'.repeat(stars)}
                            </span>
                            <span className="font-black text-primary-dark text-[14px] tabular-nums">
                              {points}/12
                            </span>
                          </span>
                        </div>
                      );
                    })()}
                    {sub.teacherFeedback && (
                      <p className="text-ink text-[14px] leading-relaxed whitespace-pre-wrap">
                        {sub.teacherFeedback}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          <div className="ios-divider" />

          {/* Answer editor — centred card stack */}
          <section className="px-4 md:px-6 py-5">
            <div className="max-w-screen-sm mx-auto w-full">
              <label className="font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted block mb-2">
                Твоя відповідь
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                readOnly={readonly}
                rows={8}
                placeholder="Напиши відповідь тут…"
                className={[
                  "w-full rounded-2xl p-3.5 text-[14px] leading-relaxed outline-none transition-colors",
                  "bg-surface border-2 border-border",
                  "focus:border-primary focus:bg-surface-raised",
                  readonly && "opacity-80 cursor-not-allowed bg-surface-muted",
                ].filter(Boolean).join(" ")}
              />

              {err && (
                <p className="text-danger text-[12px] font-bold mt-2">{err}</p>
              )}

              {!readonly && (
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <KidsButton
                    variant="ghost"
                    size="md"
                    fullWidth
                    onClick={() => persist("inProgress")}
                    disabled={saving !== "idle" || answer.trim().length === 0}
                  >
                    {saving === "draft" ? "Зберігаю…" : "Зберегти чернетку"}
                  </KidsButton>
                  <KidsButton
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => persist("submitted")}
                    disabled={saving !== "idle" || answer.trim().length === 0}
                  >
                    {saving === "submit" ? "Відправляю…" : "Здати ✈️"}
                  </KidsButton>
                </div>
              )}

              {readonly && (
                <p className="text-ink-muted text-[12px] font-bold text-center mt-3">
                  {sub.status === "reviewed"
                    ? "Роботу перевірено — зміни вже не можна"
                    : "Роботу надіслано вчителю"}
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
