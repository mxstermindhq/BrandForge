import type { PlatformId, PlatformMeta } from "@/content/launch/types";

export const PLATFORMS: Record<PlatformId, PlatformMeta> = {
  hackforums: {
    id: "hackforums",
    label: "HackForums",
    url: "https://hackforums.net",
    color: "#f59e0b",
  },
  voided: {
    id: "voided",
    label: "Voided",
    url: "https://voided.to",
    color: "#a855f7",
  },
  patched: {
    id: "patched",
    label: "Patched",
    url: "https://patched.to",
    color: "#22c55e",
  },
  builtbybit: {
    id: "builtbybit",
    label: "BuiltByBit",
    url: "https://builtbybit.com",
    color: "#3b82f6",
  },
  nulledbb: {
    id: "nulledbb",
    label: "NulledBB",
    url: "https://nulledbb.com",
    color: "#ef4444",
  },
  reddit: {
    id: "reddit",
    label: "Reddit",
    url: "https://reddit.com",
    color: "#ff4500",
  },
  x: {
    id: "x",
    label: "X",
    url: "https://x.com",
    color: "#e2e0ea",
  },
  threads: {
    id: "threads",
    label: "Threads / IG",
    url: "https://threads.net",
    color: "#ec4899",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    url: "https://linkedin.com",
    color: "#0a66c2",
  },
};
