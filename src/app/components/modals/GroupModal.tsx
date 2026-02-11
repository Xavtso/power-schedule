"use client";

import type { GroupTotals } from "@/app/types/outage";
import { Power } from "lucide-react";

type GroupModalProps = {
  group: GroupTotals;
  leastLightGroup: GroupTotals | null;
  onClose: () => void;
};

export function GroupModal({ group, leastLightGroup, onClose }: GroupModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm max-h-[85vh] overflow-auto rounded-2xl bg-white p-4 shadow-xl sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Група</p>
            <h3 className="text-2xl font-semibold text-zinc-900">{group.group}</h3>
          </div>
          <button type="button" className="text-zinc-400 hover:text-zinc-700" onClick={onClose}>
            Закрити
          </button>
        </div>
        <div className="mt-4 space-y-2 text-sm text-zinc-700">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Power className="h-4 w-4 text-rose-500" />
              Без світла
            </span>
            <span className="font-semibold">{group.without.toFixed(1)} год</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Power className="h-4 w-4 text-emerald-600" />
              Зі світлом
            </span>
            <span className="font-semibold">{group.withPower.toFixed(1)} год</span>
          </div>
        </div>
        {leastLightGroup ? (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
            Найменше світла сьогодні:{" "}
            <span className="font-semibold text-zinc-900">{leastLightGroup.group}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
