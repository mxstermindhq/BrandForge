"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { Avatar } from "./_components/avatar";
import { Sidebar, type TicketListItem } from "./_components/sidebar";
import { ChatView } from "./_components/chat";
import { WorkspaceView } from "./_components/workspace";
import { NewTicketModal } from "./_components/new-ticket";
import { displayName } from "./_lib/format";
import { CAP_MESSAGE, parseMentionModel } from "@/lib/ai/mention";
import { SPECIALTY_LABEL } from "@/types/workspace";
import type {
  EscrowLine,
  Message,
  Milestone,
  OperatorProfile,
  Task,
  Ticket,
  TicketStatus,
  WorkspaceUser,
} from "@/types/workspace";
import {
  addDefaultLedger,
  addMilestone,
  addTask,
  assignOperator,
  createTicket,
  deleteMilestone,
  fetchAllUsers,
  fetchEscrow,
  fetchMe,
  fetchMessages,
  fetchMilestones,
  fetchOperators,
  fetchRecentMessages,
  fetchTasks,
  fetchTickets,
  moveTask,
  sendMessage,
  updateEscrowStatus,
  updateMilestoneStatus,
  updateTicketStatus,
} from "./_lib/data";

export default function ChatPage() {
  const router = useRouter();
  const [me, setMe] = useState<WorkspaceUser | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [recent, setRecent] = useState<Map<string, string>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState<"chat" | "workspace">("chat");
  const [unread, setUnread] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [operators, setOperators] = useState<
    (OperatorProfile & { user: WorkspaceUser | null })[]
  >([]);
  const [allUsers, setAllUsers] = useState<WorkspaceUser[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [escrow, setEscrow] = useState<EscrowLine[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [capNotice, setCapNotice] = useState<string | null>(null);

  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const refreshTickets = useCallback(async () => {
    const [ts, rec] = await Promise.all([fetchTickets(), fetchRecentMessages()]);
    setTickets(ts);
    const map = new Map<string, string>();
    for (const m of rec) {
      if (!map.has(m.ticket_id)) map.set(m.ticket_id, m.content);
    }
    setRecent(map);
  }, []);

  const refreshActive = useCallback(async (ticketId: string) => {
    const [ms, es, ts, mls] = await Promise.all([
      fetchMessages(ticketId),
      fetchEscrow(ticketId),
      fetchTasks(ticketId),
      fetchMilestones(ticketId),
    ]);
    setMessages(ms);
    setEscrow(es);
    setTasks(ts);
    setMilestones(mls);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/signin");
        return;
      }
      const user = await fetchMe();
      if (!user) return;
      if (cancelled) return;
      setMe(user);
      await refreshTickets();
      if (user.role === "founder") {
        const [ops, users] = await Promise.all([fetchOperators(), fetchAllUsers()]);
        if (!cancelled) {
          setOperators(ops);
          setAllUsers(users);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, refreshTickets]);

  useEffect(() => {
    if (tickets.length === 0) return;
    setActiveId((cur) => cur ?? tickets[0].id);
  }, [tickets]);

  useEffect(() => {
    if (activeId) refreshActive(activeId);
  }, [activeId, refreshActive]);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const channel = supabase
      .channel("ws-tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => refreshTickets(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as { ticket_id: string; sender_id: string | null };
          if (row.ticket_id === activeIdRef.current) {
            refreshActive(row.ticket_id);
          } else {
            setUnread((prev) => new Set(prev).add(row.ticket_id));
            refreshTickets();
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshTickets, refreshActive]);

  const activeTicket = useMemo(
    () => tickets.find((t) => t.id === activeId) ?? null,
    [tickets, activeId],
  );

  const listItems = useMemo<TicketListItem[]>(() => {
    const q = search.trim().toLowerCase();
    return tickets
      .filter((t) => {
        if (!q) return true;
        const counterpart = t.operator ?? t.client;
        return (
          t.project_name.toLowerCase().includes(q) ||
          displayName(counterpart).toLowerCase().includes(q)
        );
      })
      .map((t) => {
        const counterpart = t.operator ?? t.client;
        const profile = t.operator_id
          ? operators.find((o) => o.user_id === t.operator_id)
          : undefined;
        const label = t.operator
          ? profile
            ? SPECIALTY_LABEL[profile.specialty]
            : "Operator"
          : t.status;
        return {
          ticket: t,
          preview: recent.get(t.id) ?? "",
          counterpartName: displayName(counterpart),
          roleLabel: label,
          unread: unread.has(t.id),
          lastActivity: t.updated_at,
        };
      });
  }, [tickets, recent, unread, search, operators]);

  if (!me) {
    return <div className="ws-empty" style={{ height: "100vh" }}>Loading workspace…</div>;
  }

  async function handleSend(content: string) {
    if (!activeTicket || !me) return;
    const sent = await sendMessage(activeTicket.id, me.role, content);
    if (!sent) return;
    if (!parseMentionModel(content)) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const res = await fetch("/api/ai/mention", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message_id: sent.id }),
      });
      const j = await res.json().catch(() => null);
      if (j?.blocked) {
        setCapNotice(j.message ?? CAP_MESSAGE);
      } else if (res.ok) {
        setCapNotice(null);
      }
    } catch {
      setCapNotice("AI mention failed — try again in a moment.");
    }
  }

  async function handleMoveTask(taskId: string, column: Task["column"], position: number) {
    await moveTask(taskId, column, position);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, column, position } : t)),
    );
  }

  async function handleAddTask(column: Task["column"], title: string) {
    if (!activeTicket) return;
    await addTask(activeTicket.id, title, column, tasks.filter((t) => t.column === column).length);
    refreshActive(activeTicket.id);
  }

  async function handleEscrowStatus(id: string, status: EscrowLine["status"]) {
    await updateEscrowStatus(id, status);
    setEscrow((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function handleAddLedger() {
    if (!activeTicket) return;
    await addDefaultLedger(activeTicket.id);
    refreshActive(activeTicket.id);
  }

  async function handleAddMilestone(label: string) {
    if (!activeTicket) return;
    await addMilestone(activeTicket.id, label, milestones.length);
    refreshActive(activeTicket.id);
  }

  async function handleCycleMilestone(id: string, status: Milestone["status"]) {
    await updateMilestoneStatus(id, status);
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  async function handleDeleteMilestone(id: string) {
    await deleteMilestone(id);
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleAssign(operatorId: string | null) {
    if (!activeTicket) return;
    await assignOperator(activeTicket.id, operatorId);
    await refreshTickets();
  }

  async function handleFounderStatus(status: TicketStatus) {
    if (!activeTicket) return;
    await updateTicketStatus(activeTicket.id, status);
    await refreshTickets();
  }

  async function handleCreate(clientId: string, projectName: string, note: string) {
    const ticket = await createTicket(clientId, projectName, note);
    if (ticket) {
      await refreshTickets();
      setActiveId(ticket.id);
      setUnread((prev) => {
        const next = new Set(prev);
        next.delete(ticket.id);
        return next;
      });
    }
  }

  const counterpart = activeTicket ? (activeTicket.operator ?? activeTicket.client) : null;
  const profile = activeTicket?.operator_id
    ? operators.find((o) => o.user_id === activeTicket.operator_id)
    : undefined;

  return (
    <div className="ws-app">
      <Sidebar
        tickets={listItems}
        activeId={activeId}
        operatorProfiles={operators.map((o) => ({ ...o }))}
        onSelect={(id) => {
          setActiveId(id);
          setTab("chat");
          setUnread((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }}
        onNewTicket={() => setNewTicketOpen(true)}
        canCreate={me.role === "client" || me.role === "founder"}
        search={search}
        onSearch={setSearch}
      />

      <div className="ws-main">
        <div className="ws-top-bar">
          <div className="ws-top-contact">
            {activeTicket ? (
              <>
                <Avatar user={counterpart} />
                <div className="ws-top-contact-meta">
                  <div className="name">
                    {displayName(counterpart)}
                    {activeTicket.status === "intake" && me.role !== "client" ? " (intake)" : ""}
                  </div>
                  <div className="sub">
                    {counterpart
                      ? profile
                        ? `${SPECIALTY_LABEL[profile.specialty]} · ${activeTicket.project_name}`
                        : `${activeTicket.project_name}`
                      : `Unassigned · ${activeTicket.project_name}`}
                  </div>
                </div>
              </>
            ) : (
              <div className="ws-top-contact-meta">
                <div className="name">No ticket selected</div>
                <div className="sub">Pick a conversation to begin</div>
              </div>
            )}
          </div>
          <div className="ws-top-actions">
            <div className="ws-role-badge">{me.role}</div>
            <button
              className="ws-signout-btn"
              onClick={async () => {
                await getSupabaseBrowser()?.auth.signOut();
                router.replace("/signin");
              }}
            >
              Sign out
            </button>
            <div className="ws-tabs">
              <button
                className={`ws-tab-btn${tab === "chat" ? " active" : ""}`}
                onClick={() => setTab("chat")}
              >
                Chat
              </button>
              <button
                className={`ws-tab-btn${tab === "workspace" ? " active" : ""}`}
                onClick={() => setTab("workspace")}
              >
                Workspace
              </button>
            </div>
          </div>
        </div>

        {activeTicket ? (
          tab === "chat" ? (
            <ChatView
              ticket={activeTicket}
              me={me}
              messages={messages}
              operatorProfiles={operators.map((o) => ({ ...o }))}
              operators={operators
                .map((o) => ({ id: o.user_id, name: o.user?.name ?? "Operator" }))
                .sort((a, b) => a.name.localeCompare(b.name))}
              canEdit
              onSend={handleSend}
              founderStatus={activeTicket.status}
              onFounderStatus={handleFounderStatus}
              onAssign={handleAssign}
              capNotice={capNotice}
            />
          ) : (
            <WorkspaceView
              tasks={tasks}
              escrow={escrow}
              milestones={milestones}
              me={me}
              onMoveTask={handleMoveTask}
              onAddTask={handleAddTask}
              onEscrowStatus={handleEscrowStatus}
              onAddLedger={handleAddLedger}
              onAddMilestone={handleAddMilestone}
              onCycleMilestone={handleCycleMilestone}
              onDeleteMilestone={handleDeleteMilestone}
            />
          )
        ) : (
          <div className="ws-empty" style={{ flex: 1 }}>
            {tickets.length === 0
              ? me.role === "client"
                ? "No tickets yet — start one with + New ticket."
                : "No open tickets."
              : "Select a conversation."}
          </div>
        )}
      </div>

      {newTicketOpen && (
        <NewTicketModal
          me={me}
          users={allUsers}
          onClose={() => setNewTicketOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
