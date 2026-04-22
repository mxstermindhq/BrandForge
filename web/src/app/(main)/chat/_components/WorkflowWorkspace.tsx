"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, MessageSquare, Send, UserPlus } from "lucide-react";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { useBootstrap } from "@/hooks/useBootstrap";
import { getSortedHumanThreads } from "@/lib/human-chat-threads";
import { safeImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import { useAuth } from "@/providers/AuthProvider";

type ThreadRow = {
  id?: string;
  t?: string;
  s?: string;
  lastMessageAt?: string | null;
  hasUnread?: boolean;
  peerAvatarUrl?: string | null;
  metadata?: Record<string, unknown> | null;
};

type MessageRow = {
  id: string;
  role: "user" | "peer" | "system" | "ai";
  text: string;
  createdAt: string;
  senderId?: string | null;
};

type ProfileRow = {
  id?: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  headline?: string | null;
};

const EMPTY_MESSAGES: MessageRow[] = [];

function relativeTime(value?: string | null) {
  if (!value) return "now";
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function displayName(profile: ProfileRow) {
  return profile.full_name || profile.username || "BrandForge user";
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function mapApiMessage(row: Record<string, unknown>): MessageRow {
  const id = String(row.id || crypto.randomUUID());
  const roleRaw = String(row.role || row.senderType || "");
  const role: MessageRow["role"] =
    roleRaw === "user" || roleRaw === "peer" || roleRaw === "system" || roleRaw === "ai" ?
      roleRaw
    : String(row.senderId || row.sender_id || "") ? "peer"
    : "system";
  const text =
    String(
      row.text ||
        row.content ||
        row.body ||
        (role === "system" ? "System message" : ""),
    ).trim() || (role === "system" ? "System message" : "Message");
  const createdAt = String(row.createdAt || row.created_at || new Date().toISOString());
  const senderId = row.senderId || row.sender_id;
  return { id, role, text, createdAt, senderId: senderId ? String(senderId) : null };
}

export function WorkflowWorkspace({ threadId }: { threadId?: string }) {
  const { accessToken, session } = useAuth();
  const { data: bootstrap } = useBootstrap();
  const [activeId, setActiveId] = useState<string>("");
  const [messages, setMessages] = useState<MessageRow[]>(EMPTY_MESSAGES);
  const [composerText, setComposerText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedInviteIds, setSelectedInviteIds] = useState<string[]>([]);
  const [inviteState, setInviteState] = useState("");
  const streamRef = useRef<HTMLDivElement | null>(null);

  const threads = useMemo(() => {
    return getSortedHumanThreads(bootstrap?.humanChats) as ThreadRow[];
  }, [bootstrap?.humanChats]);

  const resolvedThreadId = threadId || activeId || threads[0]?.id || "";

  useEffect(() => {
    if (threadId) {
      setActiveId(threadId);
      return;
    }
    if (!activeId && threads[0]?.id) {
      setActiveId(String(threads[0].id));
    }
  }, [threadId, activeId, threads]);

  const activeThread = useMemo(
    () => threads.find((thread) => String(thread.id) === String(resolvedThreadId)) || null,
    [resolvedThreadId, threads],
  );

  const candidateProfiles = useMemo(() => {
    const raw = (Array.isArray(bootstrap?.profiles) ? bootstrap?.profiles : []) as ProfileRow[];
    return raw.filter((profile) => String(profile.id || "") !== String(session?.user?.id || ""));
  }, [bootstrap?.profiles, session?.user?.id]);

  useEffect(() => {
    if (!resolvedThreadId || !accessToken) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingMessages(true);
      setErrorText("");
      try {
        const data = await apiGetJson<{
          activeChat?: { messages?: Array<Record<string, unknown>> };
          messages?: Array<Record<string, unknown>>;
        }>(
          `/api/chat/${encodeURIComponent(resolvedThreadId)}/messages?limit=80`,
          accessToken,
        );
        if (cancelled) return;
        const raw = Array.isArray(data.activeChat?.messages) ? data.activeChat?.messages : data.messages;
        setMessages(Array.isArray(raw) ? raw.map(mapApiMessage) : []);
      } catch (error) {
        if (cancelled) return;
        setMessages([]);
        setErrorText(error instanceof Error ? error.message : "Failed to load chat");
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolvedThreadId, accessToken]);

  useEffect(() => {
    if (!streamRef.current) return;
    streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [messages.length, resolvedThreadId]);

  const invitedPeople = useMemo(
    () =>
      candidateProfiles.filter((profile) => selectedInviteIds.includes(String(profile.id || ""))),
    [candidateProfiles, selectedInviteIds],
  );

  const inviteSummary =
    invitedPeople.length > 0 ?
      `${invitedPeople.length} invited`
    : "Invite users";

  const toggleInvite = (profileId: string) => {
    setSelectedInviteIds((current) =>
      current.includes(profileId) ? current.filter((id) => id !== profileId) : [...current, profileId],
    );
  };

  const submitInvite = async () => {
    if (!resolvedThreadId || !accessToken || selectedInviteIds.length === 0) return;
    setInviteState("Sending invites...");
    const outcomes = await Promise.allSettled(
      selectedInviteIds.map((inviteeUserId) =>
        apiMutateJson(
          `/api/chat/${encodeURIComponent(resolvedThreadId)}/invite`,
          "POST",
          { inviteeUserId, history: "since_join" },
          accessToken,
        ),
      ),
    );
    const ok = outcomes.filter((entry) => entry.status === "fulfilled").length;
    const failed = outcomes.length - ok;
    setInviteState(
      failed > 0 ? `${ok} invite${ok === 1 ? "" : "s"} sent, ${failed} failed.` : `${ok} invite${ok === 1 ? "" : "s"} sent.`,
    );
  };

  const sendMessage = async () => {
    const text = composerText.trim();
    if (!text || !resolvedThreadId || !accessToken || sending) return;
    setComposerText("");
    setSending(true);
    setErrorText("");
    const optimistic: MessageRow = {
      id: `tmp-${Date.now()}`,
      role: "user",
      text,
      createdAt: new Date().toISOString(),
      senderId: session?.user?.id || null,
    };
    setMessages((current) => [...current, optimistic]);
    try {
      await apiMutateJson(
        "/api/chat/messages",
        "POST",
        { conversationId: resolvedThreadId, text },
        accessToken,
      );
      const refreshed = await apiGetJson<{
        activeChat?: { messages?: Array<Record<string, unknown>> };
      }>(`/api/chat/${encodeURIComponent(resolvedThreadId)}/messages?limit=80`, accessToken);
      const raw = refreshed.activeChat?.messages || [];
      setMessages(Array.isArray(raw) ? raw.map(mapApiMessage) : []);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Failed to send message");
      setMessages((current) => current.filter((row) => row.id !== optimistic.id));
      setComposerText(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-full bg-[#0b0f17] text-white">
      <aside className="hidden w-[320px] shrink-0 border-r border-white/10 bg-[#0f1421]/90 lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Deal rooms</p>
          <p className="mt-2 text-xs text-white/50">Chats start when someone places a bid or offer.</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {threads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/50">
              No active chats yet. Place a bid or send an offer to open a thread.
            </div>
          ) : (
            threads.map((thread) => {
              const id = String(thread.id || "");
              const active = id === String(resolvedThreadId);
              const avatar = safeImageSrc(thread.peerAvatarUrl || null);
              return (
                <Link
                  key={id}
                  href={`/chat/${id}`}
                  className={cn(
                    "mb-1.5 flex items-center gap-3 rounded-xl border px-3 py-3 transition",
                    active ?
                      "border-violet-400/40 bg-violet-500/[0.16]"
                    : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]",
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.08] text-xs font-semibold text-white">
                    {avatar ? (
                      <Image src={avatar} alt="" width={40} height={40} className="h-10 w-10 object-cover" unoptimized />
                    ) : (
                      initials(thread.t || "Chat")
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-sm", active ? "text-white" : "text-white/86")}>{thread.t || "Deal room"}</p>
                    <p className="mt-0.5 truncate text-xs text-white/46">{thread.s || "Open thread"}</p>
                  </div>
                  <span className="text-[11px] text-white/36">{relativeTime(thread.lastMessageAt)}</span>
                </Link>
              );
            })
          )}
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col">
        <header className="border-b border-white/10 bg-[#101726]/90 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-violet-200/70">Main chat</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {activeThread?.t || "Your conversations"}
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Same chatbox UI as your deal rooms, with member invites directly from the thread.
              </p>
            </div>
            <button
              type="button"
              disabled={!resolvedThreadId}
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2 text-sm text-white/80 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              {inviteSummary}
            </button>
          </div>
        </header>

        {!resolvedThreadId ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-center">
              <MessageSquare className="mx-auto h-9 w-9 text-violet-200/80" />
              <h2 className="mt-4 text-xl font-semibold text-white">No active chat yet</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Chats between users start automatically after placing a bid or an offer.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/bid/service"
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white/85"
                >
                  Place service bid
                </Link>
                <Link
                  href="/bid/request"
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white/85"
                >
                  Bid on request
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div ref={streamRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
              {loadingMessages ? (
                <p className="text-sm text-white/50">Loading messages...</p>
              ) : messages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-white/50">
                  No messages yet. This thread is ready for your first reply.
                </div>
              ) : (
                messages.map((message) => {
                  const mine = message.role === "user" || String(message.senderId || "") === String(session?.user?.id || "");
                  return (
                    <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm",
                          message.role === "system" ?
                            "border border-white/10 bg-white/[0.04] text-white/70"
                          : mine ?
                            "bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
                          : "border border-white/10 bg-[#131b2d] text-white/86",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.text}</p>
                        <p className="mt-1 text-[11px] text-white/55">{relativeTime(message.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-white/10 bg-[#0f1523] px-4 py-3 sm:px-6">
              {errorText ? <p className="mb-2 text-xs text-rose-300">{errorText}</p> : null}
              <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                <textarea
                  value={composerText}
                  onChange={(event) => setComposerText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Reply in this deal room..."
                  className="max-h-48 min-h-[52px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
                />
                <button
                  type="button"
                  disabled={!composerText.trim() || sending}
                  onClick={() => void sendMessage()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {inviteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[30px] border border-white/10 bg-[#10141f] p-5 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/34">Invite people</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                  Add users to this chat
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  Invite other users into this thread. New invitees join from now by default so existing negotiation history stays private unless you choose otherwise in the API payload.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/66 transition hover:bg-white/[0.08]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {candidateProfiles.length > 0 ? (
                candidateProfiles.slice(0, 10).map((profile) => {
                  const profileId = String(profile.id || "");
                  const checked = selectedInviteIds.includes(profileId);
                  const name = displayName(profile);
                  const avatar = safeImageSrc(profile.avatar_url);
                  return (
                    <button
                      key={profileId || name}
                      type="button"
                      onClick={() => toggleInvite(profileId)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[22px] border px-4 py-3 text-left transition",
                        checked ?
                          "border-violet-400/26 bg-violet-500/[0.12]"
                        : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]",
                      )}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.06] text-sm font-semibold text-white">
                        {avatar ? (
                          <Image
                            src={avatar}
                            alt=""
                            width={48}
                            height={48}
                            className="h-12 w-12 object-cover"
                            unoptimized
                          />
                        ) : (
                          initials(name)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{name}</p>
                        <p className="mt-1 truncate text-xs text-white/42">
                          {profile.headline || profile.username || "Marketplace user"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border",
                          checked ? "border-violet-300 bg-violet-400 text-[#0d1020]" : "border-white/14 text-transparent",
                        )}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-white/46">
                  No additional users are available from bootstrap yet.
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
              <p className="text-sm text-white/48">{inviteState || (
                selectedInviteIds.length > 0 ?
                  `${selectedInviteIds.length} user${selectedInviteIds.length === 1 ? "" : "s"} selected`
                : "Select users to invite"
              )}</p>
              <button
                type="button"
                disabled={!resolvedThreadId || selectedInviteIds.length === 0}
                onClick={() => void submitInvite()}
                className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_14px_36px_rgba(108,76,255,0.36)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send invites
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
