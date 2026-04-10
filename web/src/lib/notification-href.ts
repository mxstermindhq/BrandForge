/** In-app route for a notification row (null = mark-read only, no navigation). */
export function notificationTargetHref(n: {
  type?: string;
  related_id?: string | null;
  related_type?: string | null;
}): string | null {
  const type = String(n.type || "");
  const rt = String(n.related_type || "");
  if (type === "system" && rt === "profile_setup") {
    return "/settings?tab=account";
  }
  const id = n.related_id != null ? String(n.related_id).trim() : "";
  if (!id) return null;
  const enc = encodeURIComponent(id);

  if (type === "message" && (rt === "legacy_chat" || rt === "chat")) {
    return `/chat/${enc}`;
  }
  if ((type === "service_inquiry" || type === "request_inquiry") && rt === "chat") {
    return `/chat/${enc}`;
  }
  if ((type === "bid_submitted" || type === "bid_outcome") && rt === "request") {
    return `/requests/${enc}`;
  }
  if (type === "bid_outcome" && rt === "project") {
    return `/chat`;
  }
  if (type === "project_update" && rt === "project") {
    return `/chat`;
  }
  if (type === "reward" && rt === "project") {
    return `/chat`;
  }
  if (type === "leaderboard_shift") {
    return "/leaderboard";
  }
  if (type === "review_received") {
    return "/leaderboard";
  }
  if (type === "system" && rt === "project_review") {
    return `/chat`;
  }
  if (type === "profile_view") {
    return "/";
  }
  return null;
}
