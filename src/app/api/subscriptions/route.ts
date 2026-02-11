import { NextResponse } from "next/server";
import {
  createSubscriptions,
  removeSubscriptions,
} from "@/app/notifications/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  email?: string;
  groups?: string[];
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const email = body.email?.trim();
    const groups = body.groups?.filter(Boolean) ?? [];

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    if (groups.length === 0) {
      return NextResponse.json({ error: "No groups selected." }, { status: 400 });
    }

    const result = await createSubscriptions(email, groups);
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error) {
    console.error("[subscriptions][POST]", error);
    return NextResponse.json(
      {
        error: "Failed to create subscription.",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const email = body.email?.trim();
    const groups = body.groups?.filter(Boolean) ?? [];

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    if (groups.length === 0) {
      return NextResponse.json({ error: "No groups selected." }, { status: 400 });
    }

    const result = await removeSubscriptions(email, groups);
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error) {
    console.error("[subscriptions][DELETE]", error);
    return NextResponse.json(
      {
        error: "Failed to remove subscription.",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
