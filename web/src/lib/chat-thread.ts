/** Must match server `CHAT_MESSAGE_PAGE_DEFAULT` / client request default. */
export const CHAT_PAGE_SIZE = 50;

export type ChatMessageWindow = {
  hasMoreOlder?: boolean;
  oldestId?: string | null;
  newestId?: string | null;
  limit?: number;
};

export function chatHistoryUrl(conversationId: string, opts?: { before?: string | null; limit?: number }) {
  const p = new URLSearchParams();
  if (opts?.before) p.set("before", opts.before);
  const lim = opts?.limit ?? CHAT_PAGE_SIZE;
  p.set("limit", String(lim));
  const q = p.toString();
  return `/api/chat/${encodeURIComponent(conversationId)}?${q}`;
}

/** Replace authoritative server tail after a send/poll when the client has prepended older pages. */
export function mergeMessageTail<T extends { id?: string }>(
  prevMessages: T[],
  serverWindow: T[],
  pageSize: number,
): T[] {
  const cleaned = prevMessages.filter((m) => !String(m.id ?? "").startsWith("tmp-"));
  const head = cleaned.slice(0, Math.max(0, cleaned.length - pageSize));
  return [...head, ...serverWindow];
}
