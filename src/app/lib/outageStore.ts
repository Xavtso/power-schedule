import type { OutageData } from "@/app/types/outage";

let lastSnapshot: OutageData | null = null;

export function getLastSnapshot() {
  return lastSnapshot;
}

export function setLastSnapshot(data: OutageData) {
  lastSnapshot = data;
}
