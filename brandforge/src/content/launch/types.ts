export type PlatformId =
  | "hackforums"
  | "voided"
  | "patched"
  | "builtbybit"
  | "nulledbb"
  | "reddit"
  | "x"
  | "threads"
  | "linkedin";

export type PlatformMeta = {
  id: PlatformId;
  label: string;
  url: string;
  color: string;
};

export type CampaignPost = {
  id: string;
  platform: PlatformId;
  /** 24h time in US Eastern, e.g. "09:00" */
  timeEst: string;
  /** Optional thread/post title */
  title?: string;
  /** Full copy-paste body */
  body: string;
  /** Internal notes — tone, where to post, engagement tips */
  notes?: string;
  /** reply | new-thread | bump | story | comment */
  kind?: "new-thread" | "bump" | "story" | "comment" | "reply";
};

export type CampaignDay = {
  key: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  label: string;
  date: string;
  posts: CampaignPost[];
};

export type TimeSlotGuide = {
  platform: PlatformId;
  bestEst: string;
  bestUtc: string;
  why: string;
};

export type LaunchCampaign = {
  id: string;
  weekLabel: string;
  dateRange: string;
  theme: string;
  hook: string;
  keyMessages: readonly string[];
  avoid: readonly string[];
  timezonePrimary: string;
  timezoneSecondary: string;
  postingGuide: readonly TimeSlotGuide[];
  days: readonly CampaignDay[];
};
