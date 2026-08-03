"use client";

import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type {
  EscrowLine,
  Message,
  Milestone,
  OperatorProfile,
  Task,
  Ticket,
  WorkspaceUser,
} from "@/types/workspace";

export const TICKET_SELECT =
  "*,client:users!tickets_client_id_fkey(id,name,role,avatar_url,email),operator:users!tickets_operator_id_fkey(id,name,role,avatar_url,email)";

export async function fetchMe(): Promise<WorkspaceUser | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return null;
  const { data } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
  return (data as WorkspaceUser) ?? null;
}

export async function fetchTickets(): Promise<Ticket[]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return [];
  const { data } = await supabase
    .from("tickets")
    .select(TICKET_SELECT)
    .order("updated_at", { ascending: false });
  return (data as Ticket[]) ?? [];
}

export async function fetchRecentMessages(): Promise<
  { ticket_id: string; content: string; created_at: string }[]
> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return [];
  const { data } = await supabase
    .from("messages")
    .select("ticket_id,content,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data as { ticket_id: string; content: string; created_at: string }[]) ?? [];
}

export async function fetchMessages(ticketId: string): Promise<Message[]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return [];
  const { data } = await supabase
    .from("messages")
    .select("*,sender:users!messages_sender_id_fkey(id,name,role,avatar_url)")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  return (data as Message[]) ?? [];
}

export async function fetchEscrow(ticketId: string): Promise<EscrowLine[]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return [];
  const { data } = await supabase
    .from("escrow_ledger")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("line_item");
  return (data as EscrowLine[]) ?? [];
}

export async function fetchTasks(ticketId: string): Promise<Task[]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return [];
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("position", { ascending: true });
  return (data as Task[]) ?? [];
}

export async function fetchMilestones(ticketId: string): Promise<Milestone[]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return [];
  const { data } = await supabase
    .from("roadmap_milestones")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("position", { ascending: true });
  return (data as Milestone[]) ?? [];
}

export async function fetchOperators(): Promise<
  (OperatorProfile & { user: WorkspaceUser | null })[]
> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return [];
  const { data } = await supabase
    .from("operator_profiles")
    .select("*,user:users!operator_profiles_user_id_fkey(id,name,role,avatar_url,email)");
  return (data as (OperatorProfile & { user: WorkspaceUser | null })[]) ?? [];
}

export async function fetchAllUsers(): Promise<WorkspaceUser[]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return [];
  const { data } = await supabase.from("users").select("id,name,role,avatar_url,email");
  return (data as WorkspaceUser[]) ?? [];
}

export async function sendMessage(
  ticketId: string,
  senderType: "client" | "operator" | "founder",
  content: string,
): Promise<Message | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data } = await supabase
    .from("messages")
    .insert({ ticket_id: ticketId, sender_type: senderType, content })
    .select("*,sender:users!messages_sender_id_fkey(id,name,role,avatar_url)")
    .single();
  return (data as Message) ?? null;
}

export async function moveTask(taskId: string, column: Task["column"], position: number) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  await supabase.from("tasks").update({ column, position }).eq("id", taskId);
}

export async function addTask(ticketId: string, title: string, column: Task["column"], position: number) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  await supabase.from("tasks").insert({ ticket_id: ticketId, title, column, position });
}

export async function updateEscrowStatus(lineId: string, status: EscrowLine["status"]) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  await supabase.from("escrow_ledger").update({ status }).eq("id", lineId);
}

export async function addDefaultLedger(ticketId: string) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const existing = await fetchEscrow(ticketId);
  const have = new Set(existing.map((l) => l.line_item));
  for (const item of ["match_fee", "initiation", "completion"] as const) {
    if (!have.has(item)) {
      await supabase
        .from("escrow_ledger")
        .insert({ ticket_id: ticketId, line_item: item, amount: 0, status: "pending" });
    }
  }
}

export async function addMilestone(ticketId: string, label: string, position: number) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  await supabase.from("roadmap_milestones").insert({
    ticket_id: ticketId,
    label,
    status: "upcoming",
    position,
  });
}

export async function updateMilestoneStatus(id: string, status: Milestone["status"]) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  await supabase.from("roadmap_milestones").update({ status }).eq("id", id);
}

export async function deleteMilestone(id: string) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  await supabase.from("roadmap_milestones").delete().eq("id", id);
}

export async function assignOperator(ticketId: string, operatorId: string | null) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  await supabase.from("tickets").update({ operator_id: operatorId }).eq("id", ticketId);
}

export async function updateTicketStatus(ticketId: string, status: Ticket["status"]) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  await supabase.from("tickets").update({ status }).eq("id", ticketId);
}

export async function createTicket(
  clientId: string,
  projectName: string,
  note: string,
): Promise<Ticket | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data: ticketData, error } = await supabase
    .from("tickets")
    .insert({ client_id: clientId, project_name: projectName, status: "intake" })
    .select(TICKET_SELECT)
    .single();
  if (error || !ticketData) return null;
  if (note.trim()) {
    await supabase
      .from("messages")
      .insert({ ticket_id: ticketData.id, sender_type: "client", content: note.trim() });
  }
  return ticketData as Ticket;
}
