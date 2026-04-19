"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useBootstrap } from "@/hooks/useBootstrap";
import { ChatStream, type StreamMessage } from "../[id]/_components/ChatStream";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { 
  MessageSquare, 
  ChevronRight, 
  Hash, 
  Image as ImageIcon, 
  ChevronDown, 
  Search,
  Mic,
  Share
} from "lucide-react";

const CHAT_PAGE_SIZE = 50;

interface ActiveChat {
  id: string;
  title?: string;
  type?: string;
  messages: StreamMessage[];
  messageWindow?: {
    hasMoreOlder?: boolean;
    oldestId?: string | null;
    newestId?: string | null;
  };
  dealKind?: string | null;
  dealListingOwnerId?: string | null;
  transport?: string;
}

interface HumanChat {
  id: string;
  t?: string;
  s?: string;
  type?: string;
  status?: string;
  lastMessageAt?: string;
  hasUnread?: boolean;
  peerAvatarUrl?: string | null;
}

function chatHistoryUrl(threadId: string, opts?: { before?: string | null; limit?: number }) {
  const params = new URLSearchParams();
  if (opts?.before) params.set("before", opts.before);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  return `/api/chat/${encodeURIComponent(threadId)}/messages${qs ? `?${qs}` : ""}`;
}

function initials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ChatHubClient() {
  const router = useRouter();
  const { session, accessToken } = useAuth();
  const { data: bootData, err: bootErr, loading: bootLoading, reload: reloadBoot } = useBootstrap();
  const userId = session?.user?.id ?? null;
  
  // Active conversation state
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatErr, setChatErr] = useState<string | null>(null);
  
  // Composer state
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load active chat messages
  const loadChat = useCallback(async (chatId: string) => {
    if (!session) return;
    setLoadingChat(true);
    setChatErr(null);
    try {
      const supabase = getSupabaseBrowser();
      let t: string | null = accessToken;
      if (!t && supabase) {
        const { data } = await supabase.auth.getSession();
        t = data.session?.access_token ?? null;
      }
      const path = chatHistoryUrl(chatId, { limit: CHAT_PAGE_SIZE });
      const data = await apiGetJson<{ activeChat: ActiveChat }>(path, t);
      setActiveChat(data.activeChat);
      setActiveChatId(chatId);
    } catch (e) {
      setChatErr(e instanceof Error ? e.message : "Failed to load conversation");
    } finally {
      setLoadingChat(false);
    }
  }, [session, accessToken]);

  // Handle send message
  const onSend = useCallback(async () => {
    if (!text.trim() || !activeChatId || sending || !session) return;
    setSending(true);
    setChatErr(null);
    try {
      const supabase = getSupabaseBrowser();
      let t: string | null = accessToken;
      if (!t && supabase) {
        const { data } = await supabase.auth.getSession();
        t = data.session?.access_token ?? null;
      }
      
      await apiMutateJson(
        `/api/chat/${encodeURIComponent(activeChatId)}/messages`,
        "POST",
        { content: text.trim() },
        t
      );
      setText("");
      // Reload chat to show new message
      await loadChat(activeChatId);
    } catch (e) {
      setChatErr(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }, [text, activeChatId, sending, session, accessToken, loadChat]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && activeChat?.messages) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  if (!session) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] bg-surface flex items-center justify-center text-center">
        <div>
          <MessageSquare size={48} className="mx-auto mb-4 text-on-surface-variant" />
          <p className="text-on-surface-variant mb-4">Sign in to open Chat</p>
          <Link href={`/login?next=${encodeURIComponent("/chat")}`} className="px-6 py-2.5 bg-inverse-surface text-on-inverse-surface rounded-lg font-semibold inline-flex">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const viewerUsername = (bootData?.profile as { username?: string })?.username;
  const viewerAvatarUrl = (bootData?.profile as { avatar_url?: string })?.avatar_url;
  
  // Get conversations list
  const threads = useMemo(() => {
    const list = (bootData?.humanChats || []) as HumanChat[];
    return list.sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [bootData?.humanChats]);
  
  const activeThread = threads.find(t => t.id === activeChatId);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Filter threads by search
  const filteredThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(t => 
      (t.t || "").toLowerCase().includes(q) || 
      (t.s || "").toLowerCase().includes(q)
    );
  }, [threads, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Select conversation - loads chat inline
  const handleSelectConversation = useCallback((id: string) => {
    setActiveChatId(id);
    void loadChat(id);
  }, [loadChat]);
  
  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!activeChatId && threads.length > 0 && !bootLoading) {
      void handleSelectConversation(threads[0].id);
    }
  }, [activeChatId, threads, bootLoading, handleSelectConversation]);

  return (
    <div className="h-[calc(100dvh-4rem)] w-full overflow-hidden bg-surface flex flex-col">
      {/* TOP BAR: Conversation Selector + Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Conversation Selector Dropdown */}
          <div className="relative flex-1 max-w-md" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center gap-3 px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl transition text-left"
            >
              {activeThread?.peerAvatarUrl ? (
                <img 
                  src={activeThread.peerAvatarUrl} 
                  alt="" 
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : activeThread ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-on-surface-variant/30 to-on-surface-variant/50 text-[11px] font-semibold text-on-inverse-surface">
                  {initials(activeThread.t || "")}
                </div>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                  <MessageSquare size={14} className="text-on-surface-variant" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface truncate text-sm">
                  {activeThread?.t || "Select conversation"}
                </p>
                <p className="text-xs text-on-surface-variant truncate">
                  {activeThread ? formatRelative(activeThread.lastMessageAt) : "Choose a chat to start"}
                </p>
              </div>
              <ChevronDown size={16} className="text-on-surface-variant shrink-0" />
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline-variant rounded-xl shadow-lg z-50 max-h-[400px] flex flex-col">
                {/* Search in dropdown */}
                <div className="p-2 border-b border-outline-variant">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={14} aria-hidden/>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full bg-surface-container border-0 rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-outline-variant"
                      autoFocus
                    />
                  </div>
                </div>
                
                {/* Thread List */}
                <div className="flex-1 overflow-y-auto py-1">
                  {bootLoading ? (
                    <div className="p-4 text-center text-sm text-on-surface-variant">
                      <div className="w-5 h-5 border-2 border-on-surface-variant/30 border-t-on-surface rounded-full animate-spin mx-auto mb-2" />
                      Loading...
                    </div>
                  ) : filteredThreads.length === 0 ? (
                    <div className="p-4 text-center text-sm text-on-surface-variant">
                      No conversations found
                    </div>
                  ) : (
                    filteredThreads.map((t) => {
                      const isActive = t.id === activeChatId;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            void handleSelectConversation(t.id);
                            setShowDropdown(false);
                            setSearchQuery("");
                          }}
                          className={`w-full flex items-start gap-3 px-3 py-2.5 transition text-left hover:bg-surface-container-high ${
                            isActive ? "bg-surface-container" : ""
                          }`}
                        >
                          {t.peerAvatarUrl ? (
                            <img src={t.peerAvatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-on-surface-variant/30 to-on-surface-variant/50 text-[11px] font-semibold text-on-inverse-surface">
                              {initials(t.t || "")}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`truncate text-[13px] ${isActive ? "font-semibold text-on-surface" : "text-on-surface-variant"}`}>
                                {t.t || "Conversation"}
                              </p>
                              <span className="shrink-0 text-[10px] text-on-surface-variant tabular-nums">
                                {formatRelative(t.lastMessageAt)}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[12px] text-on-surface-variant">
                              {t.s || "No messages yet"}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface relative">
        {activeChatId && activeChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface">
              {/* Conversation Selector Dropdown */}
              <button
                onClick={() => setShowDropdown(true)}
                className="flex items-center gap-2 text-sm font-medium text-on-surface hover:text-on-surface-variant transition"
              >
                <span>{activeThread?.t || activeChat.title || "Conversation"}</span>
                <ChevronDown size={16} className="text-on-surface-variant" />
              </button>

              {/* Share Button */}
              <button
                className="px-3 py-1.5 text-xs font-medium border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container transition"
              >
                Share
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto pb-36">
              {loadingChat ? (
                <div className="flex h-full items-center justify-center">
                  <div className="relative h-8 w-8 animate-spin rounded-full border-2 border-on-surface-variant/30 border-t-on-surface" />
                </div>
              ) : chatErr ? (
                <div className="flex h-full items-center justify-center px-6">
                  <p className="text-rose-400 text-sm">{chatErr}</p>
                </div>
              ) : (
                <ChatStream
                  messages={activeChat.messages}
                  currentUserId={userId}
                  accessToken={accessToken}
                  threadId={activeChatId}
                  transport={activeChat.transport}
                  onRefresh={() => void loadChat(activeChatId)}
                  scrollContainerRef={scrollRef}
                  hasMoreOlder={activeChat.messageWindow?.hasMoreOlder ?? false}
                  loadingOlder={false}
                  onLoadOlder={() => {}}
                  viewerRoleBadge="GLADIATOR"
                  viewerAvatarUrl={viewerAvatarUrl ?? null}
                  viewerUsername={viewerUsername ?? null}
                  dealKind={activeChat.dealKind ?? null}
                  dealListingOwnerId={activeChat.dealListingOwnerId ?? null}
                  canAdminDelete={false}
                  onAdminDeleteMessage={() => {}}
                />
              )}
            </div>

            {/* Sticky Composer - flush to bottom */}
            <div className="fixed bottom-0 left-0 lg:left-[240px] right-0 bg-surface border-t border-outline-variant p-3 z-50">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2 p-3 bg-surface-container border border-outline-variant rounded-2xl shadow-sm">
                  <textarea
                    ref={composerRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (text.trim() && !sending) void onSend();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-transparent resize-none outline-none text-sm py-1 max-h-32 placeholder:text-on-surface-variant"
                  />
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-on-surface-variant hover:text-on-surface transition">
                      <ImageIcon size={18} />
                    </button>
                    <button className="p-2 text-on-surface-variant hover:text-on-surface transition" title="Voice input">
                      <Mic size={18} />
                    </button>
                    <button
                      onClick={() => void onSend()}
                      disabled={!text.trim() || sending}
                      className="p-2 bg-inverse-surface text-on-inverse-surface rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : bootLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative h-10 w-10 animate-spin rounded-full border-2 border-on-surface-variant/30 border-t-on-surface" />
            <p className="mt-4 text-sm text-on-surface-variant">Loading conversations...</p>
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-surface-container to-surface-container-high flex items-center justify-center">
              <MessageSquare size={32} className="text-on-surface-variant" />
            </div>
            <h2 className="text-xl font-semibold text-on-surface mb-2">
              No conversations yet
            </h2>
            <p className="text-on-surface-variant text-sm max-w-md">
              Messages will appear here after you receive a bid or proposal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
