export type OutageInterval = { start: string; end: string };
export type OutageGroup = { group: string; outages: OutageInterval[]; raw: string };
export type OutageData = {
  scheduleDate: string;
  infoAsOf?: string;
  groups: OutageGroup[];
  source: { url: string; imageUrl?: string };
  rawLines: string[];
};

export type GroupTotals = {
  group: string;
  without: number;
  withPower: number;
};
