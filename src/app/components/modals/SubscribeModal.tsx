"use client";

import { useState } from "react";
import type { OutageGroup } from "@/app/types/outage";
import { ui } from "@/app/ui/styles";
import { Mail } from "lucide-react";

type SubscribeModalProps = {
  groups: OutageGroup[];
  selectedGroups: string[];
  onClose: () => void;
  onSaved: () => void;
};

export function SubscribeModal({
  groups,
  selectedGroups,
  onClose,
  onSaved,
}: SubscribeModalProps) {
  const [email, setEmail] = useState("");
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [action, setAction] = useState<"subscribe" | "unsubscribe" | null>(null);

  const allSelected = groupIds.length === groups.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-auto rounded-2xl bg-white p-4 shadow-xl sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Підписка</p>
            <h3 className="text-2xl font-semibold text-zinc-900">
              Оберіть групи та введіть email
            </h3>
          </div>
          <button type="button" className="text-zinc-400 hover:text-zinc-700" onClick={onClose}>
            Закрити
          </button>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
              allSelected
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
            }`}
            onClick={() => {
              setGroupIds(allSelected ? [] : groups.map((group) => group.group));
            }}
          >
            <p className="font-semibold tracking-[0.2em]">
              {allSelected ? "Прибрати всі" : "Обрати всі"}
            </p>
          </button>
          <div className="mt-3 flex flex-wrap gap-2">
            {groups.map((group) => {
              const active = groupIds.includes(group.group);
              return (
                <button
                  key={group.group}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                  }`}
                  onClick={() => {
                    setGroupIds((prev) =>
                      prev.includes(group.group)
                        ? prev.filter((item) => item !== group.group)
                        : [...prev, group.group],
                    );
                  }}
                >
                  <p className="font-semibold tracking-[0.2em]">
                    {group.group}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
          />
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-500">
          <Mail className="h-4 w-4" />
          Отримуватимеш сповіщення на пошту.
        </div>

        {error ? (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        ) : null}

        {success && action === "subscribe" ? (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            Підписку збережено.
          </div>
        ) : null}
        {success && action === "unsubscribe" ? (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Відписку виконано.
          </div>
        ) : null}
        {info ? (
          <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
            {info}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-full border border-rose-600 bg-rose-600 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white hover:border-rose-700 hover:bg-rose-700"
            onClick={async () => {
              setSubmitting(true);
              setError(null);
              setSuccess(false);
              setInfo(null);
              setAction("unsubscribe");
              try {
                const res = await fetch("/api/subscriptions", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, groups: groupIds }),
                });
                const payload = await res.json();
                if (!res.ok) {
                  throw new Error(payload?.error || "Failed to unsubscribe.");
                }
                setInfo(`Відписано: ${payload?.removedCount ?? 0}`);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
          >
            Відписатися
          </button>
          <button
            type="button"
            className="rounded-full border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white hover:border-emerald-700 hover:bg-emerald-700"
            onClick={async () => {
              setSubmitting(true);
              setError(null);
              setSuccess(false);
              setInfo(null);
              setAction("subscribe");
              try {
                const res = await fetch("/api/subscriptions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, groups: groupIds }),
                });
                const payload = await res.json();
                if (!res.ok) {
                  throw new Error(payload?.error || "Failed to subscribe.");
                }
                if (payload?.already?.length) {
                  setInfo(`Вже підписано: ${payload.already.join(", ")}`);
                }
                setSuccess(true);
                onSaved();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
          >
            Підписатися
          </button>
        </div>
      </div>
    </div>
  );
}
