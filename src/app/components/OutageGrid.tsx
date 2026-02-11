"use client";

import type { GroupTotals, OutageData, OutageGroup } from "@/app/types/outage";
import { ui } from "@/app/ui/styles";
import {
  cellFillStyle,
  cellStatusLabel,
  formatSlotLabel,
  isOutageAtMinute,
  outageMinutesInHour,
} from "@/app/utils/outage";

type OutageGridProps = {
  data: OutageData;
  hours: number[];
  visibleGroups: OutageGroup[];
  groupTotals: GroupTotals[];
  onOpenSummary: () => void;
  onOpenImage: () => void;
  onOpenSubscribe: () => void;
  onOpenGroup: (group: GroupTotals) => void;
  selectedGroups: string[];
  setSelectedGroups: React.Dispatch<React.SetStateAction<string[]>>;
  allSelected: boolean;
  showNow: boolean;
  nowOffset: number | null;
  nowLabel: string | null;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  bodyRef: React.RefObject<HTMLTableSectionElement | null>;
};

export function OutageGrid({
  data,
  hours,
  visibleGroups,
  groupTotals,
  onOpenSummary,
  onOpenImage,
  onOpenSubscribe,
  onOpenGroup,
  selectedGroups,
  setSelectedGroups,
  allSelected,
  showNow,
  nowOffset,
  nowLabel,
  scrollRef,
  bodyRef,
}: OutageGridProps) {
  return (
    <section className={ui.classes.card}>
      <div className={ui.classes.cardHeader}>
        <h2 className="text-lg font-medium text-zinc-900">Сітка відключень</h2>
        <div className={ui.classes.headerActions}>
          <button
            type="button"
            className={ui.classes.pillButton}
            onClick={onOpenSummary}
          >
            Summary
          </button>
          <button
            type="button"
            className={ui.classes.pillButton}
            onClick={onOpenSubscribe}
          >
            Підписка
          </button>
          {data.source.imageUrl ? (
            <button
              type="button"
              className={ui.classes.pillButton}
              onClick={onOpenImage}
            >
              Зображення
            </button>
          ) : null}
          <a
            href={data.source.url}
            target="_blank"
            rel="noreferrer"
            className={ui.classes.pillButton}
          >
            Джерело
          </a>
        </div>
      </div>
      <div className={ui.classes.legendRow}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ background: ui.colors.powerOn }}
            />
            Є електроенергія
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ background: ui.colors.powerOff }}
            />
            Відключення
          </div>
        </div>
      </div>
      <div className={ui.classes.filtersRow}>
        <div className={ui.classes.filtersWrap}>
          <button
            type="button"
            className={`${ui.classes.groupToggle} ${
              allSelected
                ? ui.classes.groupToggleActive
                : ui.classes.groupToggleInactive
            }`}
            onClick={() => {
              setSelectedGroups(
                allSelected ? [] : data.groups.map((group) => group.group),
              );
            }}
          >
            <p
              className={
                allSelected
                  ? ui.classes.groupToggleLabelActive
                  : ui.classes.groupToggleLabelInactive
              }
            >
              {allSelected ? "Прибрати всі" : "Обрати всі"}
            </p>
          </button>
          <div className={ui.classes.groupToggleWrap}>
            {data.groups.map((group) => {
              const active = selectedGroups.includes(group.group);
              return (
                <button
                  key={group.group}
                  type="button"
                  className={`${ui.classes.groupToggle} ${
                    active
                      ? ui.classes.groupToggleActive
                      : ui.classes.groupToggleInactive
                  } text-white`}
                  onClick={() => {
                    setSelectedGroups((prev) =>
                      prev.includes(group.group)
                        ? prev.filter((item) => item !== group.group)
                        : [...prev, group.group],
                    );
                  }}
                >
                  <p
                    className={
                      active
                        ? ui.classes.groupToggleLabelActive
                        : ui.classes.groupToggleLabelInactive
                    }
                  >
                    {group.group}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div ref={scrollRef} className={ui.classes.gridWrapper}>
        {showNow && nowOffset !== null ? (
          <div className={ui.classes.nowLineWrap} style={{ top: nowOffset }}>
            <div className={ui.classes.nowLineRow}>
              <span className={ui.classes.nowDot} />
              <span className={ui.classes.nowLabel}>Зараз {nowLabel}</span>
              <div className={ui.classes.nowRule} />
            </div>
          </div>
        ) : null}
        <table className={ui.classes.table}>
          <thead className={ui.classes.thead}>
            <tr>
              <th className={`${ui.classes.headTimeCell} ${ui.sizes.timeColW}`}>
                Година
              </th>
              {visibleGroups.map((group) => (
                <th key={group.group} className={ui.classes.headCell}>
                  <button
                    type="button"
                    className="text-zinc-700 hover:text-zinc-900"
                    onClick={() => {
                      const item = groupTotals.find(
                        (t) => t.group === group.group,
                      );
                      if (item) onOpenGroup(item);
                    }}
                  >
                    {group.group}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={bodyRef}>
            {hours.map((hour) => {
              const label = formatSlotLabel(hour * 60);
              const labelEnd = formatSlotLabel(hour * 60 + 60);
              return (
                <tr key={hour} data-hour={hour}>
                  <td className={`${ui.classes.timeCell} ${ui.sizes.timeColW}`}>
                    {label}–{labelEnd}
                  </td>
                  {visibleGroups.map((group) => {
                    const outageMinutes = outageMinutesInHour(
                      group.outages,
                      hour,
                    );
                    const outagePct = Math.round((outageMinutes / 60) * 100);
                    const firstHalfOutage = isOutageAtMinute(
                      group.outages,
                      hour * 60,
                    );
                    const secondHalfOutage = isOutageAtMinute(
                      group.outages,
                      hour * 60 + 30,
                    );
                    const statusLabel = cellStatusLabel(
                      outagePct,
                      firstHalfOutage,
                      secondHalfOutage,
                    );
                    const style = cellFillStyle(outagePct, firstHalfOutage);
                    return (
                      <td
                        key={group.group}
                        className={`${ui.classes.cell} ${ui.sizes.cellH} ${ui.sizes.cellW}`}
                      >
                        <div
                          className={`${ui.classes.cellFill} ${ui.classes.cellHover} group`}
                          style={style}
                        >
                          {outagePct > 0 && outagePct < 100 ? (
                            <span
                              className="pointer-events-none absolute left-0 right-0 h-px bg-zinc-900/40"
                              style={{
                                top: firstHalfOutage
                                  ? `calc(${outagePct}% - 0.5px)`
                                  : `calc(${100 - outagePct}% - 0.5px)`,
                              }}
                            />
                          ) : null}
                          <div className={ui.classes.tooltip}>
                            <div className={ui.classes.tooltipTitle}>
                              {group.group} • {label}–{labelEnd}
                            </div>
                            <div className="mt-1 text-[10px] text-zinc-700">
                              {statusLabel}
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
