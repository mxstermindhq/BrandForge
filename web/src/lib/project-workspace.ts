export type ProjectPartyRole = "brief_poster" | "assignee" | "unknown";

/** Which side of the contract the signed-in user is on (not an account "role" — all accounts are members unless staff/paid). */
export function projectPartyRole(
  userId: string | null | undefined,
  clientId: string | null | undefined,
  ownerId: string | null | undefined,
): ProjectPartyRole {
  const u = userId != null ? String(userId) : "";
  if (!u) return "unknown";
  if (clientId != null && String(clientId) === u) return "brief_poster";
  if (ownerId != null && String(ownerId) === u) return "assignee";
  return "unknown";
}

export type StatusAction = { status: string; label: string; variant: "primary" | "secondary" | "danger" };

/** Mirrors `updateProjectStatus` allow-list in platform-repository (non-admin). */
export function allowedProjectStatusActions(
  prevRaw: string | undefined,
  party: ProjectPartyRole,
): StatusAction[] {
  const prev = String(prevRaw || "active").toLowerCase();
  const isBriefPoster = party === "brief_poster";
  const isAssignee = party === "assignee";
  const either = isBriefPoster || isAssignee;
  const out: StatusAction[] = [];

  const push = (status: string, label: string, variant: StatusAction["variant"] = "primary") => {
    if (!out.some((a) => a.status === status)) out.push({ status, label, variant });
  };

  if (either && prev === "disputed") {
    push("cancelled", "Cancel project", "danger");
  }
  if (isBriefPoster && !["completed", "cancelled", "disputed"].includes(prev)) {
    push("cancelled", "Cancel project", "danger");
  }

  if (isAssignee && prev === "active") {
    push("review", "Send for review");
  }

  if (isBriefPoster && prev === "review") {
    push("delivered", "Approve delivery (mark delivered)");
    push("active", "Send back — more work needed");
  }

  if (isBriefPoster && prev === "delivered") {
    push("completed", "Mark complete");
    push("review", "Reopen review");
  }

  if (either && !["completed", "cancelled", "disputed"].includes(prev)) {
    push("disputed", "Open dispute", "danger");
  }

  if (either && prev === "disputed") {
    push("active", "Resume project");
  }

  return out;
}

export type MilestoneRow = { id: string; title: string; column: string; order: number };

export const MILESTONE_COL_ORDER = ["todo", "progress", "review", "done"] as const;

function normalizeMilestoneColumn(raw: string): (typeof MILESTONE_COL_ORDER)[number] {
  const c = String(raw || "todo").toLowerCase();
  return (MILESTONE_COL_ORDER as readonly string[]).includes(c) ? (c as (typeof MILESTONE_COL_ORDER)[number]) : "todo";
}

/** Stable per-column ordering (0..n). */
export function renumberMilestoneOrders(milestones: MilestoneRow[]): MilestoneRow[] {
  const base = milestones.map((m) => ({
    ...m,
    id: String(m.id),
    title: String(m.title || "Milestone").trim() || "Milestone",
  }));
  const result: MilestoneRow[] = [];
  for (const col of MILESTONE_COL_ORDER) {
    const list = base
      .filter((m) => normalizeMilestoneColumn(m.column) === col)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    list.forEach((m, i) => result.push({ ...m, column: col, order: i }));
  }
  return result;
}

/** Rebuild milestone list after moving one item to a column, optionally before another id in that column. */
export function milestonesAfterMove(
  milestones: MilestoneRow[],
  movedId: string,
  toColumn: string,
  insertBeforeId: string | null,
): MilestoneRow[] {
  const col = normalizeMilestoneColumn(toColumn);
  const list = milestones.map((m) => ({
    ...m,
    id: String(m.id),
    column: normalizeMilestoneColumn(m.column),
  }));
  const moving = list.find((m) => m.id === movedId);
  if (!moving) return renumberMilestoneOrders(list);

  const without = list.filter((m) => m.id !== movedId);
  const sameCol = without.filter((m) => m.column === col).sort((a, b) => a.order - b.order);

  let mergedCol: MilestoneRow[];
  if (insertBeforeId && sameCol.some((m) => m.id === insertBeforeId)) {
    const idx = sameCol.findIndex((m) => m.id === insertBeforeId);
    mergedCol = [...sameCol.slice(0, idx), { ...moving, column: col }, ...sameCol.slice(idx)];
  } else {
    mergedCol = [...sameCol, { ...moving, column: col }];
  }

  const other = without.filter((m) => m.column !== col);
  return renumberMilestoneOrders([...other, ...mergedCol]);
}

export function appendMilestoneTodo(milestones: MilestoneRow[], title: string): MilestoneRow[] {
  const trimmed = title.trim().slice(0, 220);
  if (!trimmed) return renumberMilestoneOrders(milestones);
  const id =
    typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `m-${Date.now()}`;
  const next = [
    ...milestones.map((m) => ({ ...m, id: String(m.id), column: normalizeMilestoneColumn(m.column) })),
    { id, title: trimmed, column: "todo" as const, order: 999 },
  ];
  return renumberMilestoneOrders(next);
}
