import type { OutageData } from "@/app/types/outage";
import { getLastSnapshot, setLastSnapshot } from "@/app/lib/outageStore";
import { diffOutageData } from "@/app/utils/outageDiff";
import { getSubscribersForGroup } from "@/app/notifications/subscriptions";
import { notifySubscribers } from "@/app/notifications/notify";
import { fetchOutageData } from "@/script/outage";

export type WorkerResult = {
  checkedAt: string;
  changedGroups: string[];
};

export async function runOutageWorkerWithData(next: OutageData): Promise<WorkerResult> {
  const prev = getLastSnapshot();
  const { changed } = diffOutageData(prev, next);

  for (const change of changed) {
    const subscribers = await getSubscribersForGroup(change.group);
    if (subscribers.length === 0) continue;
    await notifySubscribers({
      groupId: change.group,
      recipients: subscribers.map((s) => s.email),
      before: change.before,
      after: change.after,
    });
  }

  setLastSnapshot(next);

  return {
    checkedAt: new Date().toISOString(),
    changedGroups: changed.map((c) => c.group),
  };
}

export async function runOutageWorker(): Promise<WorkerResult> {
  const next = (await fetchOutageData()) as OutageData;
  return runOutageWorkerWithData(next);
}
