import type { WorkspaceUser } from "@/types/workspace";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PALETTE = ["#7A9EC9", "#C98A6B", "#B08D3E", "#8E7BA6", "#7A9E6E", "#C97B6B", "#6B9EC9", "#B08D6B"];

export function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const s = Math.max(0, Math.floor(diff / 1000));
  if (s < 60) return `${Math.max(1, s)}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function displayName(u: WorkspaceUser | null | undefined): string {
  if (!u) return "—";
  return u.name || u.email || "User";
}

export function initialsOfUser(u: WorkspaceUser | null | undefined): string {
  return initials(displayName(u));
}

export function colorOfUser(u: WorkspaceUser | null | undefined): string {
  return colorFor(displayName(u));
}

export function escapeMentions(text: string): string {
  return text.replace(/@([a-zA-Z0-9.\-]+)/g, '<span class="ws-mention">@$1</span>');
}

export const LINE_ITEM_LABEL: Record<string, string> = {
  match_fee: "Match fee",
  initiation: "Initiation release",
  completion: "Completion release",
};

export const LINE_ITEM_DEFAULT_AMOUNT: Record<string, number> = {
  match_fee: 100,
  initiation: 280,
  completion: 420,
};
