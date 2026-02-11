import { NextResponse } from "next/server";
import { runOutageWorker, runOutageWorkerWithData } from "@/app/worker/outageWorker";
import { setLastSnapshot } from "@/app/lib/outageStore";
import type { OutageData } from "@/app/types/outage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mockData(variant: "before" | "after"): OutageData {
  const base = {
    scheduleDate: "2026-02-11",
    infoAsOf: "09:47 11.02.2026",
    source: { url: "https://poweron.loe.lviv.ua/", imageUrl: undefined },
    rawLines: [],
  };

  if (variant === "before") {
    return {
      ...base,
      groups: [
        {
          group: "4.2",
          outages: [
            { start: "01:00", end: "06:00" },
            { start: "09:30", end: "16:30" },
            { start: "20:00", end: "23:00" },
          ],
          raw: "Група 4.2. Електроенергії немає з 01:00 до 06:00, з 09:30 до 16:30, з 20:00 до 23:00.",
        },
        {
          group: "1.1",
          outages: [{ start: "02:30", end: "06:30" }],
          raw: "Група 1.1. Електроенергії немає з 02:30 до 06:30.",
        },
      ],
    };
  }

  return {
    ...base,
    groups: [
      {
        group: "4.2",
        outages: [
          { start: "02:00", end: "07:00" },
          { start: "10:00", end: "17:00" },
          { start: "21:00", end: "23:30" },
        ],
        raw: "Група 4.2. Електроенергії немає з 02:00 до 07:00, з 10:00 до 17:00, з 21:00 до 23:30.",
      },
      {
        group: "1.1",
        outages: [{ start: "02:30", end: "06:30" }],
        raw: "Група 1.1. Електроенергії немає з 02:30 до 06:30.",
      },
    ],
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mock = searchParams.get("mock");
  if (mock === "before") {
    const data = mockData("before");
    setLastSnapshot(data);
    return NextResponse.json({ mode: "mock-before", ready: true }, { status: 200 });
  }
  if (mock === "after") {
    const data = mockData("after");
    const result = await runOutageWorkerWithData(data);
    return NextResponse.json({ mode: "mock-after", ...result }, { status: 200 });
  }

  try {
    const result = await runOutageWorker();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Worker failed.",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
