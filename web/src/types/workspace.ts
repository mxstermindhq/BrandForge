export type UserRole = "client" | "operator" | "founder";

export interface WorkspaceUser {
  id: string;
  role: UserRole;
  name: string;
  avatar_url: string | null;
  email?: string | null;
}

export interface OperatorProfile {
  user_id: string;
  specialty: "designer" | "developer" | "marketer" | "reverse_engineer";
  bio: string | null;
  verified: boolean;
}

export type TicketStatus =
  | "intake"
  | "quoted"
  | "accepted"
  | "active"
  | "completed"
  | "cancelled";

export interface Ticket {
  id: string;
  client_id: string;
  operator_id: string | null;
  status: TicketStatus;
  project_name: string;
  created_at: string;
  updated_at: string;
  client?: WorkspaceUser | null;
  operator?: WorkspaceUser | null;
}

export type SenderType = "client" | "operator" | "ai" | "founder";

export interface Message {
  id: string;
  ticket_id: string;
  sender_type: SenderType;
  sender_id: string | null;
  content: string;
  mentioned_model: string | null;
  created_at: string;
  sender?: WorkspaceUser | null;
}

export type EscrowLineItem = "match_fee" | "initiation" | "completion";
export type EscrowStatus = "pending" | "paid" | "released";

export interface EscrowLine {
  id: string;
  ticket_id: string;
  line_item: EscrowLineItem;
  amount: number;
  status: EscrowStatus;
  updated_at: string;
  updated_by: string | null;
}

export type TaskColumn = "backlog" | "in_progress" | "review" | "done";

export interface Task {
  id: string;
  ticket_id: string;
  title: string;
  tag: string | null;
  column: TaskColumn;
  position: number;
  assignee_id: string | null;
}

export type MilestoneStatus = "done" | "current" | "upcoming";

export interface Milestone {
  id: string;
  ticket_id: string;
  label: string;
  date: string | null;
  status: MilestoneStatus;
  position: number;
}

export const SPECIALTY_LABEL: Record<OperatorProfile["specialty"], string> = {
  designer: "Designer",
  developer: "Developer",
  marketer: "Marketer",
  reverse_engineer: "Reverse Engineer",
};

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  intake: "Intake",
  quoted: "Quoted",
  accepted: "Accepted",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};
