import type { OutageData, OutageGroup } from "@/app/types/outage";

type GroupChange = {
  group: string;
  before?: OutageGroup;
  after?: OutageGroup;
};

function outagesKey(group: OutageGroup | undefined) {
  if (!group) return "";
  return group.outages.map((o) => `${o.start}-${o.end}`).join("|");
}

export function diffOutageData(
  prev: OutageData | null,
  next: OutageData,
): { changed: GroupChange[] } {
  if (!prev) {
    return {
      changed: next.groups.map(
        (group): GroupChange => ({ group: group.group, after: group }),
      ),
    };
  }

  const prevMap = new Map(prev.groups.map((g) => [g.group, g]));
  const nextMap = new Map(next.groups.map((g) => [g.group, g]));
  const changes: GroupChange[] = [];

  const allGroups = new Set<string>([...prevMap.keys(), ...nextMap.keys()]);
  for (const groupId of allGroups) {
    const before = prevMap.get(groupId);
    const after = nextMap.get(groupId);
    if (!before || !after) {
      changes.push({ group: groupId, before, after });
      continue;
    }
    if (outagesKey(before) !== outagesKey(after)) {
      changes.push({ group: groupId, before, after });
    }
  }

  return { changed: changes };
}
