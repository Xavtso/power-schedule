import { NextResponse } from "next/server";
import { fetchOutageData } from "@/script/outage";
import { getLatestOutageSnapshot } from "@/app/lib/outageDataStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let data = await getLatestOutageSnapshot();
    if (!data) {
      data = await fetchOutageData();
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch outage data.",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
