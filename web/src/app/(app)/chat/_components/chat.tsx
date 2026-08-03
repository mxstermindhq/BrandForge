"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "./avatar";
import { displayName, escapeMentions, relativeTime } from "../_lib/format";
import { SPECIALTY_LABEL } from "@/types/workspace";
import type { Message, OperatorProfile, Ticket, TicketStatus, WorkspaceUser } from "@/types/workspace";

const MENTION_OPTIONS = [
  { id: "sonnet-5", desc: "Balanced — general review, drafting, quick answers" },
  { id: "opus-4.8", desc: "Deepest reasoning — complex architecture, tricky bugs" },
  { id: "haiku-4.5", desc: "Fast — quick checks, simple lookups" },
];

function senderLabel(m: Message, ticket: Ticket, profiles: OperatorProfile[]): string {
  if (m.sender_type === "ai") {
    const model = m.mentioned_model ? `${m.mentioned_model[0].toUpperCase()}${m.mentioned_model.slice(1)}` : "";
    return `AI · ${model}`.trim();
  }
  if (m.sender_type === "founder") return "BrandForge";
  const name = m.sender?.name || (m.sender_type === "client" ? "Client" : "Operator");
  if (m.sender_type === "operator") {
    const profile = profiles.find((p) => p.user_id === m.sender_id);
    return profile ? `${name} · ${SPECIALTY_LABEL[profile.specialty]}` : name;
  }
  return name;
}

export function ChatView({
  ticket,
  me,
  messages,
  operatorProfiles,
  operators,
  canEdit,
  onSend,
  founderStatus,
  onFounderStatus,
  onAssign,
  capNotice,
}: {
  ticket: Ticket;
  me: WorkspaceUser;
  messages: Message[];
  operatorProfiles: OperatorProfile[];
  operators: { id: string; name: string }[];
  canEdit: boolean;
  onSend: (content: string) => Promise<void>;
  founderStatus: TicketStatus;
  onFounderStatus: (s: TicketStatus) => void;
  onAssign: (operatorId: string | null) => void;
  capNotice: string | null;
}) {
  const [input, setInput] = useState("");
  const [popover, setPopover] = useState(false);
  const [sending, setSending] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [messages.length, ticket.id]);

  const counterpart = ticket.operator ?? ticket.client;
  const isFounder = me.role === "founder";
  const sub = counterpart
    ? `${displayName(counterpart)} · ${ticket.project_name}`
    : `Unassigned · ${ticket.project_name}`;

  function onInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    setPopover(e.target.value.endsWith("@"));
  }

  function pickMention(id: string) {
    setInput((v) => v.replace(/@$/, "") + `@${id} `);
    setPopover(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await onSend(text);
      setInput("");
      setPopover(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="ws-view active" id="view-chat">
      <div className="ws-chat-view" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {isFounder && (
          <div className="ws-assign-row">
            <select
              value={founderStatus}
              onChange={(e) => onFounderStatus(e.target.value as TicketStatus)}
            >
              {(["intake", "quoted", "accepted", "active", "completed", "cancelled"] as TicketStatus[]).map(
                (s) => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ),
              )}
            </select>
            <select
              value={ticket.operator_id ?? ""}
              onChange={(e) => onAssign(e.target.value || null)}
            >
              <option value="">Assign operator…</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="ws-messages" ref={boxRef}>
          {messages.length === 0 && (
            <div className="ws-empty">
              This is the start of the thread. Messages stay here — human replies, AI answers, everything in one contract record.
            </div>
          )}
          {messages.map((m) => {
            const mine = m.sender_id === me.id;
            const ai = m.sender_type === "ai";
            const cls = ai ? "ws-msg ai" : mine ? "ws-msg you" : "ws-msg them";
            return (
              <div key={m.id} className={cls}>
                <div className="ws-msg-label">
                  {senderLabel(m, ticket, operatorProfiles)}
                  {m.created_at ? ` · ${relativeTime(m.created_at)}` : ""}
                </div>
                <div dangerouslySetInnerHTML={{ __html: escapeMentions(m.content) }} />
              </div>
            );
          })}
        </div>
        <div className="ws-composer">
          <div className={`ws-mention-popover${popover ? " show" : ""}`}>
            <div className="hdr">Ask an AI in this thread</div>
            {MENTION_OPTIONS.map((m) => (
              <div key={m.id} className="ws-mention-option" onClick={() => pickMention(m.id)}>
                <span className="m-name">@{m.id}</span>
                <span className="m-desc">{m.desc}</span>
              </div>
            ))}
          </div>
          <div className="ws-composer-row">
            <textarea
              id="ws-msg-input"
              placeholder="Message... type @ to bring an AI into this thread"
              value={input}
              onChange={onInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button className="ws-send-btn" onClick={send} disabled={!canEdit || sending}>
              Send
            </button>
          </div>
          {capNotice && <div className="ws-ai-cap-warn">{capNotice}</div>}
          <div className="ws-composer-hint">
            Everything here — human replies, AI answers, files — stays in one contract thread.
          </div>
        </div>
      </div>
    </div>
  );
}
