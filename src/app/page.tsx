"use client";

import { OutageGrid } from "@/app/components/OutageGrid";
import { GroupModal } from "@/app/components/modals/GroupModal";
import { ImageModal } from "@/app/components/modals/ImageModal";
import { SummaryModal } from "@/app/components/modals/SummaryModal";
import { SubscribeModal } from "@/app/components/modals/SubscribeModal";
import { useOutageData } from "@/app/hooks/useOutageData";
import { ui } from "@/app/ui/styles";
import { prettifyDate } from "./utils/outage";
import { useState } from "react";

export default function Home() {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const {
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
  } = useOutageData();

  return (
    <div className={ui.classes.page}>
      <main className={ui.classes.main}>
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Графік погодинних відключень
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <span>
              Дата:{" "}
              <span className="font-medium text-zinc-900">
                {/* @ts-ignore */}
                {prettifyDate(new Date(data?.scheduleDate)) ?? "—"}
              </span>
            </span>
            <span className="text-zinc-300">•</span>
            <span>
              Інформація станом на:{" "}
              <span className="font-medium text-zinc-900">
                {data?.infoAsOf ?? "—"}
              </span>
            </span>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!data && !error ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            Завантаження даних…
          </div>
        ) : null}

        {data ? (
          <OutageGrid
            data={data}
            hours={hours}
            visibleGroups={visibleGroups}
            groupTotals={groupTotals}
            onOpenSummary={() => setSummaryOpen(true)}
            onOpenImage={() => setImageOpen(true)}
            onOpenSubscribe={() => setSubscribeOpen(true)}
            onOpenGroup={(group) => setModalGroup(group)}
            selectedGroups={selectedGroups}
            setSelectedGroups={setSelectedGroups}
            allSelected={allSelected}
            showNow={showNow}
            nowOffset={nowOffset}
            nowLabel={nowLabel}
            scrollRef={scrollRef}
            bodyRef={bodyRef}
          />
        ) : null}
      </main>
      {subscribeOpen && data ? (
        <SubscribeModal
          groups={data.groups}
          selectedGroups={selectedGroups}
          onClose={() => setSubscribeOpen(false)}
          onSaved={() => setSubscribeOpen(false)}
        />
      ) : null}
      {summaryOpen ? (
        <SummaryModal
          groupTotals={groupTotals}
          leastLightGroup={leastLightGroup}
          onClose={() => setSummaryOpen(false)}
          onSelectGroup={(group) => setModalGroup(group)}
        />
      ) : null}
      {imageOpen && data?.source.imageUrl ? (
        <ImageModal
          imageUrl={data.source.imageUrl}
          onClose={() => setImageOpen(false)}
        />
      ) : null}
      {modalGroup ? (
        <GroupModal
          group={modalGroup}
          leastLightGroup={leastLightGroup}
          onClose={() => setModalGroup(null)}
        />
      ) : null}
    </div>
  );
}
