"use client";

import { Avatar } from "./avatar";
import { colorFor, displayName, initials, relativeTime } from "../_lib/format";
import { SPECIALTY_LABEL, TICKET_STATUS_LABEL } from "@/types/workspace";
import type { OperatorProfile, Ticket } from "@/types/workspace";

export interface TicketListItem {
  ticket: Ticket;
  preview: string;
  counterpartName: string;
  roleLabel: string;
  unread: boolean;
  lastActivity: string;
}

function ticketRoleLabel(ticket: Ticket, profile: OperatorProfile | undefined): string {
  if (ticket.operator && (ticket.status === "intake" || ticket.status === "quoted")) {
    return TICKET_STATUS_LABEL[ticket.status];
  }
  if (ticket.operator) {
    return profile ? SPECIALTY_LABEL[profile.specialty] : "Operator";
  }
  return TICKET_STATUS_LABEL[ticket.status];
}

function counterpart(ticket: Ticket) {
  return ticket.operator ?? ticket.client;
}

export function Sidebar({
  tickets,
  activeId,
  operatorProfiles,
  onSelect,
  onNewTicket,
  canCreate,
  search,
  onSearch,
}: {
  tickets: TicketListItem[];
  activeId: string | null;
  operatorProfiles: OperatorProfile[];
  onSelect: (id: string) => void;
  onNewTicket: () => void;
  canCreate: boolean;
  search: string;
  onSearch: (s: string) => void;
}) {
  return (
    <div className="ws-sidebar">
      <div className="ws-sidebar-header">
        <div className="ws-wordmark">
          BRAND<span>FORGE</span>
        </div>
        <div className="ws-wordmark-sub">workspace</div>
      </div>
      {canCreate && (
        <button className="ws-new-ticket-btn" onClick={onNewTicket}>
          + New ticket
        </button>
      )}
      <div className="ws-search-box">
        <input
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="ws-list-label">Active</div>
      <div className="ws-convo-list">
        {tickets.length === 0 && (
          <div className="ws-empty">
            No conversations yet.
            {canCreate && " Start a ticket and the forge matches you with an operator."}
          </div>
        )}
        {tickets.map((item) => {
          const c = counterpart(item.ticket);
          return (
            <div
              key={item.ticket.id}
              className={`ws-convo-item${activeId === item.ticket.id ? " active" : ""}`}
              onClick={() => onSelect(item.ticket.id)}
            >
              <Avatar user={c} />
              <div className="ws-convo-meta">
                <div className="ws-convo-top">
                  <span className="ws-convo-name">{displayName(c)}</span>
                  <span className="ws-convo-time">{relativeTime(item.lastActivity)}</span>
                </div>
                <div className="ws-convo-role">{item.roleLabel}</div>
                <div className="ws-convo-preview">
                  {item.ticket.project_name}
                  {item.preview ? ` — ${item.preview}` : ""}
                </div>
              </div>
              {item.unread && <div className="ws-unread-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
