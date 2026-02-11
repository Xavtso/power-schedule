export const ui = {
  colors: {
    powerOn: "#35c28c",
    powerOff: "#e65f7a",
    grid: "#e4e4e7",
    textMuted: "#71717a",
    tooltipBorder: "#e4e4e7",
    tooltipBg: "#ffffff",
    hoverRing: "rgba(24,24,27,0.35)",
  },
  sizes: {
    cellW: "w-7 sm:w-8",
    cellH: "h-9 sm:h-10",
    timeColW: "w-12 sm:w-16",
  },
  classes: {
    page: "min-h-screen bg-zinc-50 text-zinc-900",
    main: "mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10",
    card: "rounded-3xl border border-zinc-200 bg-white shadow-sm",
    cardHeader:
      "flex flex-col items-start justify-between gap-3 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:px-6",
    headerActions: "flex flex-wrap items-center gap-2 text-xs",
    pillButton:
      "rounded-full border border-zinc-200 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-zinc-600 hover:border-zinc-300 hover:text-zinc-900",
    legendRow:
      "flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-zinc-500",
    filtersRow: "border-y border-zinc-200 px-4 py-3",
    filtersWrap:
      "flex flex-wrap items-start justify-between gap-3 text-xs text-zinc-600",
    groupToggleWrap: "flex flex-wrap gap-2",
    groupToggle:
      "rounded-full border px-3 py-1 text-zinc-700 hover:border-zinc-300",
    groupToggleActive: "border-zinc-900 bg-zinc-900 text-white",
    groupToggleInactive: "border-zinc-200 bg-white text-zinc-900",
    groupToggleLabelActive: "font-semibold  tracking-[0.2em] text-white",
    groupToggleLabelInactive: "font-semibold  tracking-[0.2em] text-zinc-900",

    gridWrapper:
      "relative max-h-[60vh] overflow-auto border-t border-zinc-200 sm:max-h-[70vh]",
    table:
      "w-full min-w-[520px] border-collapse text-left text-[10px] sm:text-[11px]",
    thead: "bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-500",
    timeCell:
      "sticky left-0 z-10 border border-zinc-200 bg-white px-2 py-2 text-[11px] font-semibold text-zinc-700",
    headTimeCell:
      "sticky left-0 z-10 border border-zinc-200 bg-zinc-50 px-2 py-2 font-medium",
    headCell: "border border-zinc-200 px-2 py-2 font-medium",
    cell: "p-0 border border-zinc-200",
    cellFill: "relative h-full w-full",
    cellHover: "transition-shadow hover:shadow-[0_0_0_1px_rgba(24,24,27,0.35)]",
    tooltip:
      "pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-44 -translate-x-1/2 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-700 shadow-sm group-hover:block",
    tooltipTitle: "text-[10px] uppercase tracking-[0.2em] text-zinc-500",
    nowLineWrap: "pointer-events-none absolute left-0 right-0 z-20",
    nowLineRow: "flex items-center gap-3 px-2",
    nowDot: "inline-flex h-2 w-2 rounded-full bg-rose-500",
    nowLabel:
      "text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600",
    nowRule: "h-px flex-1 bg-rose-500",
  },
};
