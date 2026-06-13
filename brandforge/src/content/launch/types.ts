export type PlatformId =
  | "discord"
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
  kind?: "kickoff" | "new-thread" | "bump" | "story" | "comment" | "reply";
};

export type CampaignDay = {
  key: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  label: string;
  date: string;
  /** 1-based day index within the campaign week */
  dayNumber?: number;
  posts: CampaignPost[];
};

export type CampaignStart = {
  date: string;
  dayLabel: string;
  time: string;
  timezone: string;
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
  campaignStart: CampaignStart;
  theme: string;
  hook: string;
  keyMessages: readonly string[];
  avoid: readonly string[];
  timezonePrimary: string;
  timezoneSecondary: string;
  postingGuide: readonly TimeSlotGuide[];
  days: readonly CampaignDay[];
};
