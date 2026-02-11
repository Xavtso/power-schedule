import type { GroupTotals, OutageInterval } from "@/app/types/outage";
import { ui } from "@/app/ui/styles";

type MinuteRange = { start: number; end: number };

export function toMinutes(value: string) {
  const [h, m] = value.split(":").map((v) => Number(v));
  return h * 60 + m;
}

export function toMinuteRanges(outages: OutageInterval[]): MinuteRange[] {
  return outages.map((o) => ({
    start: toMinutes(o.start),
    end: toMinutes(o.end === "24:00" ? "24:00" : o.end),
  }));
}

export function outageMinutesInHour(outages: OutageInterval[], hour: number) {
  const hourStart = hour * 60;
  const hourEnd = hourStart + 60;
  const ranges = toMinuteRanges(outages);
  let total = 0;
  for (const range of ranges) {
    const start = Math.max(range.start, hourStart);
    const end = Math.min(range.end, hourEnd);
    if (start < end) total += end - start;
  }
  return Math.min(60, total);
}

export function isOutageAtMinute(outages: OutageInterval[], minute: number) {
  const ranges = toMinuteRanges(outages);
  return ranges.some((range) => minute >= range.start && minute < range.end);
}

export function prettifyDate(date: Date) {
  if (!date) return "";
  const day = date.getDate();
  const month = date.toLocaleString("uk-UA", {
    month: "short",
    localeMatcher: "best fit",
  });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatSlotLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatLocalDateIso(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function totalOutageMinutes(outages: OutageInterval[]) {
  const ranges = toMinuteRanges(outages);
  let total = 0;
  for (const range of ranges) {
    total += Math.max(0, range.end - range.start);
  }
  return Math.min(24 * 60, total);
}

export function computeGroupTotals(
  outagesByGroup: { group: string; outages: OutageInterval[] }[],
) {
  return outagesByGroup.map((group) => {
    const outageMinutes = totalOutageMinutes(group.outages);
    const without = outageMinutes / 60;
    const withPower = 24 - without;
    return {
      group: group.group,
      without,
      withPower,
    } satisfies GroupTotals;
  });
}

export function findLeastLightGroup(groupTotals: GroupTotals[]) {
  if (groupTotals.length === 0) return null;
  return groupTotals.reduce((min, item) =>
    item.withPower < min.withPower ? item : min,
  );
}

export function cellFillStyle(outagePct: number, startsWithOutage: boolean) {
  if (outagePct === 0) return { backgroundColor: ui.colors.powerOn };
  if (outagePct === 100) return { backgroundColor: ui.colors.powerOff };
  return {
    backgroundImage: startsWithOutage
      ? `linear-gradient(to bottom, ${ui.colors.powerOff} 0% ${outagePct}%, ${ui.colors.powerOn} ${outagePct}% 100%)`
      : `linear-gradient(to bottom, ${ui.colors.powerOn} 0% ${100 - outagePct}%, ${ui.colors.powerOff} ${100 - outagePct}% 100%)`,
  };
}

export function cellStatusLabel(
  outagePct: number,
  firstHalfOutage: boolean,
  secondHalfOutage: boolean,
) {
  if (outagePct === 0) return "Світло є";
  if (outagePct === 100) return "Світла нема";
  if (!firstHalfOutage && secondHalfOutage) return "Світло є перші пів години";
  if (firstHalfOutage && !secondHalfOutage) return "Світло є другі пів години";
  if (!firstHalfOutage && !secondHalfOutage) return "Світло є";
  return "Світла нема";
}
