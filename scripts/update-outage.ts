import { fetchOutageData } from "../src/script/outage";
import { diffOutageData } from "../src/app/utils/outageDiff";
import { getLatestOutageSnapshot, saveOutageSnapshot } from "../src/app/lib/outageDataStore";
import { getSubscribersForGroup } from "../src/app/notifications/subscriptions";
import { notifySubscribers } from "../src/app/notifications/notify";

async function main() {
  const next = await fetchOutageData();
  const prev = await getLatestOutageSnapshot();
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

  await saveOutageSnapshot(next);

  console.log(
    `[update-outage] saved snapshot, changed groups: ${changed
      .map((c) => c.group)
      .join(", ") || "none"}`,
  );
}

main().catch((error) => {
  console.error("[update-outage] failed", error);
  process.exit(1);
});
