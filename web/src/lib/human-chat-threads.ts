export type HumanChatThreadRow = {
  id?: string;
  t?: string;
  s?: string;
  d?: string;
  type?: string;
  isUnified?: boolean;
  lastMessageAt?: string | null;
  hasUnread?: boolean;
  dealPhase?: string;
  peerAvatarUrl?: string | null;
  peerUsername?: string | null;
};

export function getSortedHumanThreads(raw: unknown): HumanChatThreadRow[] {
  const rows = (Array.isArray(raw) ? raw : []) as HumanChatThreadRow[];
  const convOnly = rows.filter((c) => c.type === "human" && c.id);
  return [...convOnly].sort((a, b) => {
    const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return String(b.id).localeCompare(String(a.id));
  });
}

export function unreadHumanChatCount(threads: HumanChatThreadRow[]): number {
  return threads.filter((c) => Boolean(c.hasUnread)).length;
}
