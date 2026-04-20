"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  User,
  Send,
  Paperclip,
  Smile,
  Mic,
  Search,
  Plus,
  Pin,
  MoreHorizontal,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Share2,
  ChevronDown,
  PanelRight,
  X,
  Download,
  FileText,
  Code2,
  Image as ImageIcon,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Calendar,
  Tag,
  ExternalLink,
  Eye,
  Check,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useBoot } from "@/lib/boot";
import { useSession } from "@/lib/auth";
import { getSupabaseBrowser } from "@/lib/supabase/browser-client";
import { chatHistoryUrl, apiGetJson, apiMutateJson } from "@/lib/api";

// Types
type Mode = "ai" | "human";
type AIModel = "gpt-4" | "gpt-4-turbo" | "claude-3-opus" | "claude-3-sonnet" | "gemini-pro";

interface Message {
  id: string;
  role: "user" | "assistant" | "contact";
  content: string;
  timestamp: string;
  author?: { name: string };
  status?: "sent" | "delivered" | "seen";
}

interface Chat {
  id: string;
  type: Mode;
  title: string;
  lastMessage?: string;
  timestamp: string;
  pinned?: boolean;
  unread?: number;
  online?: boolean;
  peerAvatarUrl?: string;
}

const MODELS: { id: AIModel; name: string; description: string }[] = [
  { id: "gpt-4", name: "GPT-4", description: "Most capable, slower" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Fast + capable" },
  { id: "claude-3-opus", name: "Claude 3 Opus", description: "Best reasoning" },
  { id: "claude-3-sonnet", name: "Claude 3 Sonnet", description: "Balanced" },
  { id: "gemini-pro", name: "Gemini Pro", description: "Long context" },
];

export default function UnifiedChat() {
  const router = useRouter();
  const { data: bootData, isLoading: bootLoading } = useBoot();
  const { session } = useSession();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("human");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [model, setModel] = useState<AIModel>("gpt-4");
  const [sending, setSending] = useState(false);
  const [activeChat, setActiveChat] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get threads from boot data
  const humanChats = useMemo(() => {
    return (bootData?.humanChats || []) as any[];
  }, [bootData?.humanChats]);

  // Mock AI chats for now
  const aiChats: Chat[] = useMemo(() => [
    { id: "ai-1", type: "ai", title: "Marketing plan Q2", lastMessage: "Here's a draft outline...", timestamp: "10:42", pinned: true },
    { id: "ai-2", type: "ai", title: "Build error fix", lastMessage: "Regenerate lockfile...", timestamp: "09:15" },
    { id: "ai-3", type: "ai", title: "Logo ideas", lastMessage: "Here are 5 concepts...", timestamp: "Yesterday" },
  ], []);

  const allChats = useMemo(() => {
    const humans: Chat[] = humanChats.map((h: any) => ({
      id: h.id,
      type: "human" as Mode,
      title: h.t || "Conversation",
      lastMessage: h.s,
      timestamp: h.lastMessageAt ? formatRelative(h.lastMessageAt) : "",
      unread: h.unread,
      peerAvatarUrl: h.peerAvatarUrl,
    }));
    return [...aiChats, ...humans];
  }, [humanChats, aiChats]);

  const filteredChats = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = allChats.filter((c) => c.title.toLowerCase().includes(q));
    return filtered.filter((c) => c.type === mode);
  }, [allChats, search, mode]);

  const active = allChats.find((c) => c.id === activeChatId);

  useEffect(() => {
    if (active) setMode(active.type);
  }, [activeChatId, active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeChat?.messages?.length]);

  const loadChat = useCallback(async (chatId: string) => {
    if (!session) return;
    try {
      const supabase = getSupabaseBrowser();
      let t: string | null = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        t = data.session?.access_token ?? null;
      }
      const path = chatHistoryUrl(chatId, { limit: 50 });
      const data = await apiGetJson<{ activeChat: any }>(path, t);
      setActiveChat(data.activeChat);
    } catch (e) {
      console.error("Failed to load chat", e);
    }
  }, [session]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChatId) return;
    setSending(true);
    
    if (mode === "ai") {
      // Mock AI response for now
      setTimeout(() => {
        setInput("");
        setSending(false);
      }, 700);
    } else {
      // Human chat
      try {
        const supabase = getSupabaseBrowser();
        let t: string | null = null;
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          t = data.session?.access_token ?? null;
        }
        await apiMutateJson(
          `/api/chat/${encodeURIComponent(activeChatId)}/messages`,
          "POST",
          { content: input.trim() },
          t
        );
        setInput("");
        await loadChat(activeChatId);
      } catch (e) {
        console.error("Failed to send", e);
      } finally {
        setSending(false);
      }
    }
  };

  const newChat = (m: Mode) => {
    const id = `${m}-${Date.now()}`;
    setActiveChatId(id);
    setMode(m);
  };

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

  return (
    <div className="h-[calc(100dvh-4rem)] w-full overflow-hidden bg-surface flex">
      {/* LEFT SIDEBAR */}
      <aside className="w-[280px] min-w-[280px] border-r border-outline-variant bg-surface-container flex flex-col hidden lg:flex">
        {/* Header with mode toggle */}
        <div className="p-3 border-b border-outline-variant">
          <div className="flex bg-surface rounded-lg p-1 mb-3">
            <button
              onClick={() => setMode("human")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                mode === "human" ? "bg-surface-container-high text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <User className="w-4 h-4" /> Human
            </button>
            <button
              onClick={() => setMode("ai")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                mode === "ai" ? "bg-surface-container-high text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Bot className="w-4 h-4" /> AI
            </button>
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={() => newChat(mode)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition"
          >
            <Plus className="w-4 h-4" /> New {mode === "ai" ? "AI Chat" : "Chat"}
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-outline-variant">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${mode} chats...`}
              className="w-full bg-surface border border-outline-variant rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-outline-variant"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto py-1">
          {bootLoading ? (
            <div className="p-4 text-center text-sm text-on-surface-variant">
              <div className="w-5 h-5 border-2 border-on-surface-variant/30 border-t-on-surface rounded-full animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center text-sm text-on-surface-variant">
              No {mode} chats found
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full flex items-start gap-3 px-3 py-3 transition text-left hover:bg-surface-container-high ${
                  chat.id === activeChatId ? "bg-surface-container border-l-2 border-primary" : "border-l-2 border-transparent"
                }`}
              >
                {chat.type === "ai" ? (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    {chat.pinned ? <Pin className="w-4 h-4 text-on-primary" /> : <Bot className="w-4 h-4 text-on-primary" />}
                  </div>
                ) : chat.peerAvatarUrl ? (
                  <img src={chat.peerAvatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-on-surface-variant/30 to-on-surface-variant/50 text-[12px] font-semibold text-on-inverse-surface">
                    {chat.title.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm truncate ${chat.id === activeChatId ? "font-semibold text-on-surface" : "text-on-surface"}`}>
                      {chat.title}
                    </span>
                    <span className="text-xs text-on-surface-variant ml-2">{chat.timestamp}</span>
                  </div>
                  {chat.lastMessage && <div className="text-xs text-on-surface-variant truncate">{chat.lastMessage}</div>}
                </div>
                {chat.unread ? (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center">
                    {chat.unread}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface">
        {activeChatId ? (
          <>
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container">
              <div className="flex items-center gap-3">
                {active?.type === "ai" ? (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-on-primary" />
                  </div>
                ) : active?.peerAvatarUrl ? (
                  <img src={active.peerAvatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-on-surface-variant/30 to-on-surface-variant/50 flex items-center justify-center text-sm font-semibold text-on-inverse-surface">
                    {active?.title.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-on-surface">{active?.title || "New Chat"}</div>
                  <div className="text-xs text-on-surface-variant">
                    {mode === "ai" ? model : active?.online ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
              
              {mode === "ai" && (
                <ModelPicker model={model} onChange={setModel} />
              )}
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <EmptyState mode={mode} onPrompt={setInput} />
            </div>

            {/* Input */}
            <div className="border-t border-outline-variant bg-surface-container px-4 py-3">
              <div className="rounded-2xl border border-outline-variant bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition">
                <div className="flex items-end gap-2 px-3 py-2">
                  <button className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-high">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  {mode === "human" && (
                    <>
                      <button className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-high">
                        <Smile className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-high">
                        <Mic className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={mode === "ai" ? "Ask anything..." : "Type a message..."}
                    rows={1}
                    className="flex-1 bg-transparent resize-none outline-none text-sm py-2 max-h-40 text-on-surface placeholder:text-on-surface-variant"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="p-2 rounded-lg bg-primary text-on-primary disabled:bg-surface-variant disabled:text-on-surface-variant hover:bg-primary/90 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {mode === "ai" && (
                <div className="flex gap-2 mt-2 text-xs text-on-surface-variant">
                  {["Summarize this", "Draft a reply", "Brainstorm ideas"].map((s) => (
                    <button key={s} onClick={() => setInput(s)} className="px-2 py-1 rounded-md hover:bg-surface-container-high transition">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-surface-container to-surface-container-high flex items-center justify-center">
              <MessageSquare size={32} className="text-on-surface-variant" />
            </div>
            <h2 className="text-xl font-semibold text-on-surface mb-2">Select a conversation</h2>
            <p className="text-on-surface-variant text-sm max-w-md mb-4">
              Choose a chat from the sidebar or start a new one
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => newChat("human")}
                className="px-4 py-2 bg-surface-container-high text-on-surface rounded-lg font-medium hover:bg-surface-container-high/80 transition flex items-center gap-2"
              >
                <User className="w-4 h-4" /> New Human Chat
              </button>
              <button
                onClick={() => newChat("ai")}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition flex items-center gap-2"
              >
                <Bot className="w-4 h-4" /> New AI Chat
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Model Picker Component
function ModelPicker({ model, onChange }: { model: AIModel; onChange: (m: AIModel) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = MODELS.find((m) => m.id === model)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-surface-container-high text-xs font-medium text-on-surface-variant transition"
      >
        <Zap className="w-3 h-3 text-primary" />
        {current.name}
        <ChevronDown className={`w-3 h-3 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-surface rounded-xl shadow-lg border border-outline-variant z-50 overflow-hidden">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant border-b border-outline-variant">
            Model
          </div>
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => { onChange(m.id); setOpen(false); }}
              className={`w-full flex items-start gap-2 px-3 py-2 hover:bg-surface-container-high transition text-left ${
                m.id === model ? "bg-primary/10" : ""
              }`}
            >
              <div className="flex-1">
                <div className={`text-sm ${m.id === model ? "font-medium text-on-surface" : "text-on-surface"}`}>{m.name}</div>
                <div className="text-xs text-on-surface-variant">{m.description}</div>
              </div>
              {m.id === model && <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Empty State Component
function EmptyState({ mode, onPrompt }: { mode: Mode; onPrompt: (p: string) => void }) {
  if (mode === "ai") {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-on-primary" />
        </div>
        <h2 className="text-xl font-semibold text-on-surface">How can I help today?</h2>
        <div className="grid grid-cols-2 gap-2 mt-6 max-w-md w-full">
          {["Draft a marketing email", "Summarize a document", "Brainstorm names", "Explain a concept"].map((p) => (
            <button
              key={p}
              onClick={() => onPrompt(p)}
              className="px-4 py-3 text-sm text-left border border-outline-variant rounded-xl hover:border-primary hover:bg-primary/5 transition text-on-surface"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-4">
        <User className="w-8 h-8 text-on-surface-variant" />
      </div>
      <h2 className="text-xl font-semibold text-on-surface">Start a conversation</h2>
      <p className="text-on-surface-variant mt-2">Select a chat from the sidebar to begin messaging</p>
    </div>
  );
}

// Utility function
function formatRelative(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
