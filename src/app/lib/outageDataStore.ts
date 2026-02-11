import type { OutageData } from "@/app/types/outage";
import { getDb } from "@/app/lib/mongodb";

type StoredOutage = {
  _id?: string;
  data: OutageData;
  createdAt: Date;
};

const COLLECTION = "outage_snapshots";

export async function getLatestOutageSnapshot(): Promise<OutageData | null> {
  const db = await getDb();
  const doc = await db
    .collection<StoredOutage>(COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .limit(1)
    .next();
  return doc?.data ?? null;
}

export async function saveOutageSnapshot(data: OutageData) {
  const db = await getDb();
  await db.collection<StoredOutage>(COLLECTION).insertOne({
    data,
    createdAt: new Date(),
  });
}
