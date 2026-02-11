import { useEffect, useMemo, useRef, useState } from "react";
import type { GroupTotals, OutageData } from "@/app/types/outage";
import { computeGroupTotals, findLeastLightGroup, formatLocalDateIso, formatSlotLabel } from "@/app/utils/outage";

export function useOutageData() {
  const [data, setData] = useState<OutageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [nowOffset, setNowOffset] = useState<number | null>(null);
  const [nowLabel, setNowLabel] = useState<string | null>(null);
  const [modalGroup, setModalGroup] = useState<GroupTotals | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLTableSectionElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/outage", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "API request failed.");
        }
        return res.json();
      })
      .then((payload: OutageData) => {
        if (!cancelled) {
          setData(payload);
          setSelectedGroups(payload.groups.map((group) => group.group));
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const visibleGroups = useMemo(() => {
    if (!data) return [];
    return data.groups.filter((group) => selectedGroups.includes(group.group));
  }, [data, selectedGroups]);
  const allSelected = data ? selectedGroups.length === data.groups.length : false;
  const todayIso = useMemo(() => formatLocalDateIso(new Date()), []);
  const showNow = data?.scheduleDate === todayIso;
  const groupTotals = useMemo(
    () => (data ? computeGroupTotals(data.groups) : []),
    [data],
  );
  const leastLightGroup = useMemo(
    () => findLeastLightGroup(groupTotals),
    [groupTotals],
  );

  useEffect(() => {
    if (!data || !showNow) return;
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    setNowLabel(formatSlotLabel(minutes));

    const updateOffset = () => {
      if (!bodyRef.current || !scrollRef.current) return;
      const firstRow = bodyRef.current.querySelector("tr");
      const rowHeight = firstRow?.getBoundingClientRect().height;
      if (!rowHeight) return;
      const bodyRect = bodyRef.current.getBoundingClientRect();
      const containerRect = scrollRef.current.getBoundingClientRect();
      const topOffset = bodyRect.top - containerRect.top;
      const offset = topOffset + (minutes / 60) * rowHeight;
      setNowOffset(offset);
    };

    updateOffset();

    const row = bodyRef.current?.querySelector<HTMLTableRowElement>(
      `tr[data-hour="${now.getHours()}"]`,
    );
    if (row && scrollRef.current) {
      const container = scrollRef.current;
      const rowTop = row.offsetTop;
      const target =
        rowTop - container.clientHeight / 2 + row.getBoundingClientRect().height / 2;
      container.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }

    const onResize = () => updateOffset();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [data, showNow, visibleGroups.length]);

  useEffect(() => {
    if (!modalGroup && !summaryOpen && !imageOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalGroup(null);
        setSummaryOpen(false);
        setImageOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalGroup, summaryOpen, imageOpen]);

  return {
    data,
    error,
    hours,
    visibleGroups,
    allSelected,
    selectedGroups,
    setSelectedGroups,
    showNow,
    nowOffset,
    nowLabel,
    scrollRef,
    bodyRef,
    modalGroup,
    setModalGroup,
    summaryOpen,
    setSummaryOpen,
    imageOpen,
    setImageOpen,
    groupTotals,
    leastLightGroup,
  };
}
