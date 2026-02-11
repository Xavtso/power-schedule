"use client";

import type { GroupTotals } from "@/app/types/outage";

type SummaryModalProps = {
  groupTotals: GroupTotals[];
  leastLightGroup: GroupTotals | null;
  onClose: () => void;
  onSelectGroup: (group: GroupTotals) => void;
};

export function SummaryModal({
  groupTotals,
  leastLightGroup,
  onClose,
  onSelectGroup,
}: SummaryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-auto rounded-2xl bg-white p-4 shadow-xl sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Summary</p>
            <h3 className="text-2xl font-semibold text-zinc-900">Годин за добу</h3>
          </div>
          <button type="button" className="text-zinc-400 hover:text-zinc-700" onClick={onClose}>
            Закрити
          </button>
        </div>
        {leastLightGroup ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-rose-700">
            Найменше світла: {leastLightGroup.group}
          </div>
        ) : null}
        <div className="mt-4 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
          {groupTotals.map((item) => (
            <button
              key={item.group}
              type="button"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left hover:border-zinc-300"
              onClick={() => onSelectGroup(item)}
            >
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Група {item.group}
              </div>
              <div className="mt-1 font-semibold text-zinc-900">
                Без {item.without.toFixed(1)} год
              </div>
              <div className="text-zinc-600">Зі світлом {item.withPower.toFixed(1)} год</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
