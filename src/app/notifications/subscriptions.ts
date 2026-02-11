import { getDb } from "@/app/lib/mongodb";

export type Subscriber = {
  email: string;
  groups: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

const COLLECTION = "subscriptions";

export async function getSubscribersForGroup(groupId: string): Promise<Subscriber[]> {
  const db = await getDb();
  const docs = await db
    .collection<Subscriber>(COLLECTION)
    .find({ groups: groupId })
    .toArray();
  return docs;
}

export async function getExistingSubscriptions(email: string, groups: string[]) {
  const db = await getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const doc = await db
    .collection<Subscriber>(COLLECTION)
    .findOne({ email: normalizedEmail });
  if (!doc) return [];
  return doc.groups.filter((groupId) => groups.includes(groupId));
}

export async function createSubscriptions(email: string, groups: string[]) {
  const db = await getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedGroups = Array.from(new Set(groups)).sort();
  const now = new Date();
  const existing = await getExistingSubscriptions(normalizedEmail, normalizedGroups);
  const toAdd = normalizedGroups.filter((groupId) => !existing.includes(groupId));

  if (toAdd.length > 0) {
    await db.collection<Subscriber>(COLLECTION).updateOne(
      { email: normalizedEmail },
      {
        $addToSet: { groups: { $each: toAdd } },
        $set: { updatedAt: now },
        $setOnInsert: { createdAt: now, email: normalizedEmail },
      },
      { upsert: true },
    );
  }

  return {
    added: toAdd,
    already: existing,
  };
}

export async function removeSubscriptions(email: string, groups: string[]) {
  const db = await getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedGroups = Array.from(new Set(groups)).sort();
  const result = await db.collection<Subscriber>(COLLECTION).updateOne(
    { email: normalizedEmail },
    { $pull: { groups: { $in: normalizedGroups } } },
  );
  return { removedCount: result.modifiedCount ?? 0 };
}
