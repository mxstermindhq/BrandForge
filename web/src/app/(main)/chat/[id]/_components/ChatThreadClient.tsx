"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGetJson, apiMutateJson, apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useBootstrap } from "@/hooks/useBootstrap";
import { ChatStream, type StreamMessage } from "./ChatStream";
import { ChatRail } from "./ChatRail";
import { ChatPinnedBar, type ChatPin } from "./ChatPinnedBar";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import {
  Image, Mic, ChevronRight
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

const CHAT_PAGE_SIZE = 50;

function chatHistoryUrl(threadId: string, opts?: { before?: string | null; limit?: number }) {
  const params = new URLSearchParams();
  if (opts?.before) params.set("before", opts.before);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  return `/api/chat/${encodeURIComponent(threadId)}/messages${qs ? `?${qs}` : ""}`;
}

function mergeMessageTail(existing: StreamMessage[], incoming: StreamMessage[], max: number): StreamMessage[] {
  const ids = new Set(existing.map((m) => String(m.id)));
  const newOnes = incoming.filter((m) => !ids.has(String(m.id)));
  const merged = [...existing, ...newOnes];
  if (merged.length > max) return merged.slice(merged.length - max);
  return merged;
}

type StickyProject = { id?: string; title?: string; status?: string };

type MessageWindow = {
  hasMoreOlder?: boolean;
  oldestId?: string | null;
  newestId?: string | null;
  limit?: number;
};

type ActiveChat = {
  id?: string;
  title?: string;
  type?: string;
  contextType?: string | null;
  contextId?: string | null;
  transport?: string | null;
  metadata?: Record<string, unknown> | null;
  projectId?: string | null;
  stickyProject?: StickyProject | null;
  messages?: StreamMessage[];
  messageWindow?: MessageWindow;
  membership?: { historyVisibleFrom?: string | null };
  pins?: ChatPin[];
  dealKind?: string | null;
  dealListingOwnerId?: string | null;
};

type BootProfile = {
  username?: string | null;
  n?: string | null;
  /** Mapped profile (explore cards); bootstrap `profile` may omit this. */
  avatarUrl?: string | null;
  role?: string | null;
  /** Raw Supabase `profiles` row keys from `/api/bootstrap`. */
  full_name?: string | null;
  avatar_url?: string | null;
};

function bootViewerFields(profile: unknown): {
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
} {
  if (!profile || typeof profile !== "object") return { username: null, displayName: null, avatarUrl: null };
  const o = profile as Record<string, unknown>;
  const username = String(o.username || "").trim() || null;
  const avatarRaw = o.avatar_url ?? o.avatarUrl;
  const avatarUrl = typeof avatarRaw === "string" && avatarRaw.trim() ? avatarRaw.trim() : null;
  const nameRaw = o.n ?? o.full_name;
  const legacyDisplay = typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim() : null;
  const displayName = username ? username : legacyDisplay;
  return { username, displayName, avatarUrl };
}

function resolveViewerDealBadge(
  profileRole: string | null | undefined,
  dealKind: string | null | undefined,
  dealListingOwnerId: string | null | undefined,
  userId: string | null,
): string {
  const r = String(profileRole || "member").toLowerCase();
  if (r === "admin" || r === "moderator") return "ARCHITECT";
  if (r === "enterprise" || r === "affiliate") return "GLADIATOR";
  if (!userId || !dealKind || !dealListingOwnerId) return "GLADIATOR";
  if (dealKind === "service") {
    return userId === dealListingOwnerId ? "SPECIALIST" : "CLIENT";
  }
  if (dealKind === "request") {
    return userId === dealListingOwnerId ? "CLIENT" : "SPECIALIST";
  }
  return "GLADIATOR";
}

function listingHref(contextType: string | null | undefined, contextId: string | null | undefined): string | null {
  if (!contextId) return null;
  if (contextType === "service_package") return `/services/${contextId}`;
  if (contextType === "request") return `/requests/${contextId}`;
  return null;
}

function listingLinkLabel(contextType: string | null | undefined): string {
  if (contextType === "service_package") return "Related service";
  if (contextType === "request") return "Related request";
  return "Related listing";
}

export function ChatThreadClient({ id }: { id: string }) {
  const { session, accessToken } = useAuth();
  const { data: bootData } = useBootstrap();
  const userId = session?.user?.id ?? null;
  const [chat, setChat] = useState<ActiveChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(true);
  const { theme, setTheme } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const hasLoadedOlderRef = useRef(false);
  const prevNewestIdRef = useRef<string | null>(null);

  const scrollStreamToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
  }, []);

  useEffect(() => {
    hasLoadedOlderRef.current = false;
    prevNewestIdRef.current = null;
  }, [id]);

  const load = useCallback(
    async (opts?: { before?: string | null }) => {
      if (!session) return;
      const supabase = getSupabaseBrowser();
      let t: string | null = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        t = data.session?.access_token ?? null;
      }
      const path =
        opts?.before != null && opts.before !== "" ?
          chatHistoryUrl(id, { before: opts.before, limit: CHAT_PAGE_SIZE })
        : chatHistoryUrl(id, { limit: CHAT_PAGE_SIZE });
      const data = await apiGetJson<{ activeChat: ActiveChat }>(path, t);
      const ac = data.activeChat;
      if (!ac) {
        setChat(null);
        return;
      }

      if (opts?.before) {
        const el = scrollRef.current;
        const prevH = el?.scrollHeight ?? 0;
        setChat((c) => {
          if (!c) return ac;
          const ids = new Set((c.messages || []).map((m) => String(m.id)));
          const older = (ac.messages || []).filter((m) => !ids.has(String(m.id)));
          hasLoadedOlderRef.current = true;
          const next = [...older, ...(c.messages || [])];
          return {
            ...c,
            messages: next,
            pins: ac.pins ?? c.pins,
            messageWindow: {
              ...c.messageWindow,
              hasMoreOlder: ac.messageWindow?.hasMoreOlder ?? false,
              oldestId: next[0]?.id ?? c.messageWindow?.oldestId,
              newestId: c.messageWindow?.newestId ?? ac.messageWindow?.newestId,
              limit: ac.messageWindow?.limit,
            },
          };
        });
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop += scrollRef.current.scrollHeight - prevH;
          }
        });
        return;
      }

      if (hasLoadedOlderRef.current) {
        setChat((c) => {
          if (!c) return ac;
          const merged = mergeMessageTail(c.messages || [], ac.messages || [], CHAT_PAGE_SIZE);
          return {
            ...ac,
            messages: merged,
            messageWindow: {
              ...ac.messageWindow,
              hasMoreOlder: c.messageWindow?.hasMoreOlder ?? ac.messageWindow?.hasMoreOlder,
              oldestId: merged[0]?.id,
            },
          };
        });
      } else {
        setChat(ac);
      }
    },
    [id, session],
  );

  /** After deal actions (accept / counter), reload messages then scroll so new embeds are visible. */
  const refreshThread = useCallback(async () => {
    await load();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollStreamToBottom());
    });
  }, [load, scrollStreamToBottom]);

  useEffect(() => {
    if (loading || !chat) return;
    const timer = window.setTimeout(() => {
      composerRef.current?.focus();
      scrollStreamToBottom();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loading, chat?.id, id, scrollStreamToBottom]);

  const jumpToPinnedMessage = useCallback((messageId: string) => {
    const el = document.querySelector(`[data-chat-message-id="${CSS.escape(messageId)}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        await load();
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load, session]);

  useEffect(() => {
    if (!session || !id) return;
    if (chat?.transport === "unified") return;
    const tick = setInterval(() => {
      void load().catch(() => null);
    }, 10_000);
    return () => clearInterval(tick);
  }, [id, load, session, chat?.transport]);

  useEffect(() => {
    if (!session?.access_token || chat?.transport !== "unified" || !id) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const channel = supabase
      .channel(`unified_messages:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "unified_messages", filter: `chat_id=eq.${id}` },
        () => void load().catch(() => null),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session?.access_token, chat?.transport, id, load]);

  const msgs = useMemo(() => chat?.messages ?? [], [chat?.messages]);
  const dealPhaseInfo = useMemo(() => {
    const phases = [
      { key: "open", label: "Deal room open" },
      { key: "negotiate", label: "Bid / proposal review" },
      { key: "contract", label: "Contract & escrow" },
      { key: "done", label: "Delivery & review" },
      { key: "retention", label: "Retention & bonuses" },
    ];
    const midAt = (i: number) => {
      const id = msgs[i]?.id;
      return id != null ? String(id) : null;
    };
    const firstDealPhaseId = (phase: string): string | null => {
      for (let i = 0; i < msgs.length; i++) {
        const m = msgs[i];
        if (
          m.contentType === "embed" &&
          m.embed &&
          String(m.embed.type) === "deal_phase" &&
          String(m.embed.phase) === phase
        ) {
          return midAt(i);
        }
      }
      return null;
    };
    const lastEmbedTypes = (types: string[]): string | null => {
      for (let i = msgs.length - 1; i >= 0; i--) {
        const m = msgs[i];
        if (m.contentType === "embed" && m.embed && types.includes(String(m.embed.type))) return midAt(i);
      }
      return null;
    };
    const firstEmbedTypes = (types: string[]): string | null => {
      for (let i = 0; i < msgs.length; i++) {
        const m = msgs[i];
        if (m.contentType === "embed" && m.embed && types.includes(String(m.embed.type))) return midAt(i);
      }
      return null;
    };
    const lastDoneAnchor = (): string | null => {
      for (let i = msgs.length - 1; i >= 0; i--) {
        const m = msgs[i];
        if (m.contentType !== "embed" || !m.embed) continue;
        const t = String(m.embed.type);
        if (t === "contract_card") return midAt(i);
        if (t === "deal_phase" && String(m.embed.phase) === "deal_win") return midAt(i);
      }
      return null;
    };

    const hasBid = msgs.some(
      (m) =>
        m.contentType === "embed" &&
        m.embed &&
        (String(m.embed.type) === "bid_proposal" ||
          String(m.embed.type) === "service_bid" ||
          String(m.embed.type) === "deal_counter_offer"),
    );
    const hasPhaseEmbed = (phase: string) =>
      msgs.some(
        (m) =>
          m.contentType === "embed" &&
          m.embed &&
          String(m.embed.type) === "deal_phase" &&
          String(m.embed.phase) === phase,
      );
    const hasNegotiationPhase = msgs.some(
      (m) =>
        m.contentType === "embed" &&
        m.embed &&
        String(m.embed.type) === "deal_phase" &&
        ["proposal_review", "service_negotiation", "negotiation"].includes(String(m.embed.phase)),
    );
    const hasDealWin = hasPhaseEmbed("deal_win");
    const hasRetentionPhase = hasPhaseEmbed("retention");
    const hasContract = msgs.some(
      (m) => m.contentType === "embed" && m.embed && String(m.embed.type) === "contract_card",
    );
    const st = String(chat?.stickyProject?.status || "").toLowerCase();
    let idx = 0;
    if (hasBid || hasNegotiationPhase || hasDealWin) idx = 1;
    if (hasContract) idx = 2;
    if (st === "completed" || st === "cancelled") idx = 3;
    if (hasRetentionPhase) idx = 4;

    const openA = firstDealPhaseId("deal_opened") ?? (msgs[0]?.id != null ? String(msgs[0].id) : null);
    const negA =
      lastEmbedTypes(["bid_proposal", "service_bid", "deal_counter_offer"]) ??
      firstDealPhaseId("proposal_review") ??
      firstDealPhaseId("service_negotiation") ??
      openA;
    const conA = firstEmbedTypes(["contract_card"]) ?? negA;
    const doneA = lastDoneAnchor() ?? conA;
    const retentionA = firstDealPhaseId("retention") ?? doneA;
    const anchors: Record<string, string | null> = {
      open: openA,
      negotiate: negA,
      contract: conA,
      done: doneA,
      retention: retentionA,
    };

    return { phases, idx, anchors };
  }, [msgs, chat?.stickyProject?.status]);

  const [jumpToMessageId, setJumpToMessageId] = useState<string | null>(null);

  const onDealPhaseNavigate = useCallback(
    (phaseKey: string) => {
      const mid = dealPhaseInfo.anchors[phaseKey];
      if (mid) setJumpToMessageId(mid);
    },
    [dealPhaseInfo.anchors],
  );

  const viewerRoleBadge = useMemo(
    () =>
      resolveViewerDealBadge(
        (bootData?.profile as BootProfile | undefined)?.role,
        chat?.dealKind ?? null,
        chat?.dealListingOwnerId ?? null,
        userId,
      ),
    [bootData?.profile, chat?.dealKind, chat?.dealListingOwnerId, userId],
  );
  const { username: viewerUsername, avatarUrl: viewerAvatarUrl } = useMemo(
    () => bootViewerFields(bootData?.profile),
    [bootData?.profile],
  );
  const isPlatformAdmin = Boolean(bootData?.isPlatformAdmin);

  const handleAdminDeleteMessage = useCallback(
    async (messageId: string) => {
      if (!accessToken || !isPlatformAdmin || !messageId) return;
      if (!window.confirm("Delete this message permanently?")) return;
      try {
        const { ok, data } = await apiFetch<{ error?: string }>(
          `/api/chat/${encodeURIComponent(id)}/messages/${encodeURIComponent(messageId)}`,
          { method: "DELETE", accessToken },
        );
        if (!ok) throw new Error((data as { error?: string })?.error || "Delete failed");
        await load();
      } catch (e) {
        setSendErr(e instanceof Error ? e.message : "Delete failed");
      }
    },
    [accessToken, isPlatformAdmin, id, load],
  );

  const originalHref = listingHref(chat?.contextType, chat?.contextId);
  const sticky = chat?.stickyProject;
  const hasMoreOlder = Boolean(chat?.messageWindow?.hasMoreOlder);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || msgs.length === 0) return;
    const newest = String(msgs[msgs.length - 1]?.id ?? "");
    const prev = prevNewestIdRef.current;
    if (prev === null) {
      prevNewestIdRef.current = newest;
      el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
      return;
    }
    if (newest !== prev) {
      prevNewestIdRef.current = newest;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [msgs]);

  const loadOlder = useCallback(async () => {
    const oldest = chat?.messages?.[0]?.id;
    if (!oldest || loadingOlder || !hasMoreOlder) return;
    setLoadingOlder(true);
    try {
      await load({ before: String(oldest) });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load older messages");
    } finally {
      setLoadingOlder(false);
    }
  }, [chat?.messages, load, hasMoreOlder, loadingOlder]);

  useEffect(() => {
    const onJump = (ev: Event) => {
      const detail = (ev as CustomEvent<{ type?: string }>).detail;
      if (!detail?.type) return;
      const target = document.querySelector(`[data-embed-type="${detail.type}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    document.addEventListener("mx-chat-scrollto", onJump);
    return () => document.removeEventListener("mx-chat-scrollto", onJump);
  }, []);

  useEffect(() => {
    const onCounter = () => {
      setText((prev) => (prev.trim() ? prev : "Counter-offer: "));
      requestAnimationFrame(() => composerRef.current?.focus());
    };
    document.addEventListener("mx-chat-counter", onCounter);
    return () => document.removeEventListener("mx-chat-counter", onCounter);
  }, []);

  async function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("Could not read file"));
      r.readAsDataURL(file);
    });
  }

  async function onPickFiles(files: FileList | null) {
    if (!files?.length || !accessToken || !chat) return;
    setUploadBusy(true);
    setSendErr(null);
    try {
      const list = Array.from(files);
      for (const file of list) {
        const dataUrl = await readFileAsDataUrl(file);
        if (chat.transport === "unified") {
          await apiMutateJson(`/api/chat/${encodeURIComponent(id)}/files`, "POST", { dataUrl, fileName: file.name }, accessToken);
        } else {
          await apiMutateJson(
            "/api/chat/files",
            "POST",
            { conversationId: id, dataUrl, fileName: file.name },
            accessToken,
          );
        }
      }
      await load();
    } catch (e) {
      setSendErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadBusy(false);
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !session || sending) return;
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const vf = bootViewerFields(bootData?.profile);
    const optimistic: StreamMessage = {
      id: tempId,
      role: "user",
      text: body,
      createdAt: new Date().toISOString(),
      senderId: userId || undefined,
      senderUsername: vf.username || undefined,
      senderName: (vf.username || vf.displayName || "").trim() || undefined,
      senderAvatarUrl: vf.avatarUrl || undefined,
      roleBadge: viewerRoleBadge,
    };
    setChat((c) => (c ? { ...c, messages: [...(c.messages || []), optimistic] } : c));
    setText("");
    setSendErr(null);
    setSending(true);
    requestAnimationFrame(() => {
      scrollStreamToBottom();
      composerRef.current?.focus();
    });
    try {
      const supabase = getSupabaseBrowser();
      let t: string | null = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        t = data.session?.access_token ?? null;
      }
      const out = await apiMutateJson<{ activeChat: ActiveChat }>(
        "/api/chat/messages",
        "POST",
        { conversationId: id, text: body },
        t,
      );
      const ac = out.activeChat;
      if (!ac) throw new Error("No chat payload");
      if (hasLoadedOlderRef.current) {
        setChat((c) => {
          if (!c) return ac;
          const merged = mergeMessageTail(c.messages || [], ac.messages || [], CHAT_PAGE_SIZE);
          return {
            ...ac,
            messages: merged,
            messageWindow: {
              ...ac.messageWindow,
              hasMoreOlder: c.messageWindow?.hasMoreOlder ?? ac.messageWindow?.hasMoreOlder,
              oldestId: merged[0]?.id,
            },
          };
        });
      } else {
        setChat(ac);
      }
    } catch (e) {
      setChat((c) => (c ? { ...c, messages: (c.messages || []).filter((m) => m.id !== tempId) } : c));
      setSendErr(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
      requestAnimationFrame(() => {
        scrollStreamToBottom();
        composerRef.current?.focus();
      });
    }
  }

  if (!session) {
    return (
      <div className="bg-surface min-h-screen mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-on-surface-variant text-sm">Sign in to open this deal room.</p>
        <Link
          href={`/login?next=${encodeURIComponent(`/chat/${id}`)}`}
          className="bg-amber-500 text-black font-semibold mt-6 inline-flex min-h-[48px] items-center rounded-xl px-6 text-sm font-bold hover:bg-amber-400 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant text-sm font-medium">Loading deal room...</p>
          <p className="text-on-surface-variant/60 text-xs mt-1">Fetching messages</p>
        </div>
      </div>
    );
  }

  if (err || !chat) {
    return (
      <div className="bg-surface min-h-screen text-on-surface-variant mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-rose-400 text-sm" role="alert">
          {err || "Deal room not found."}
        </p>
        <Link href="/chat" className="text-amber-500 mt-6 inline-block text-sm font-bold hover:underline">
          ← Back to Chat
        </Link>
      </div>
    );
  }
  
  const handleSuggestedAction = (action: string) => {
    setText(action);
    composerRef.current?.focus();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface">
      {/* MAIN CONTENT AREA - No sidebar */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        {/* Top bar */}
        <div className="relative flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface">
          {/* Conversation Title */}
          <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
            <span>{chat.title || "Conversation"}</span>
          </div>

          {/* Share Button */}
          <button
            className="px-3 py-1.5 text-xs font-medium border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container transition"
          >
            Share
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {/* Messages - scrollable area */}
          <div className="flex-1 overflow-y-auto pb-32">
            <ChatStream
              messages={msgs}
              currentUserId={userId}
              accessToken={accessToken}
              threadId={id}
              transport={chat.transport}
              onRefresh={() => void refreshThread()}
              scrollContainerRef={scrollRef}
              hasMoreOlder={hasMoreOlder}
              loadingOlder={loadingOlder}
              onLoadOlder={() => void loadOlder()}
              viewerRoleBadge={viewerRoleBadge}
              viewerAvatarUrl={viewerAvatarUrl}
              viewerUsername={viewerUsername}
              dealKind={chat.dealKind ?? null}
              dealListingOwnerId={chat.dealListingOwnerId ?? null}
              canAdminDelete={isPlatformAdmin}
              onAdminDeleteMessage={handleAdminDeleteMessage}
              jumpToMessageId={jumpToMessageId}
              onJumpToMessageConsumed={() => setJumpToMessageId(null)}
              onSuggestedAction={handleSuggestedAction}
            />
          </div>

          {/* Sticky Composer at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface via-surface to-transparent pb-2 pt-8 px-4 z-50">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-2 p-3 bg-surface-container border border-outline-variant rounded-2xl shadow-sm">
                <textarea
                  ref={composerRef}
                  value={text}
                  onChange={(e) => {
                    setSendErr(null);
                    setText(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (text.trim() && !sending) onSend(e as React.KeyboardEvent<HTMLTextAreaElement>);
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 bg-transparent resize-none outline-none text-sm py-1 max-h-32 placeholder:text-on-surface-variant"
                />
                <div className="flex items-center gap-1">
                  <button className="p-2 text-on-surface-variant hover:text-on-surface transition">
                    <Image size={18} />
                  </button>
                  <button className="p-2 text-on-surface-variant hover:text-on-surface transition" title="Voice input">
                    <Mic size={18} />
                  </button>
                  <button
                    onClick={onSend}
                    disabled={!text.trim() || sending}
                    className="p-2 bg-inverse-surface text-on-inverse-surface rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - Deal Context */}
      <ChatRail
        chatTitle={chat.title || undefined}
        stickyProjectTitle={sticky?.title}
        stickyProjectStatus={sticky?.status}
        contextListingHref={originalHref}
        contextListingLabel={listingLinkLabel(chat.contextType)}
        collapsed={railCollapsed}
        onToggleCollapse={() => setRailCollapsed((c) => !c)}
        dealPhases={dealPhaseInfo.phases}
        dealPhaseIndex={dealPhaseInfo.idx}
        phaseAnchors={dealPhaseInfo.anchors}
        onPhaseNavigate={onDealPhaseNavigate}
      />
    </div>
  );
}
