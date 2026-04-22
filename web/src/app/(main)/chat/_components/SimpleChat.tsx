"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Send,
  Sparkles,
  Bot,
  Paperclip,
} from "lucide-react";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { safeImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import { useAuth } from "@/providers/AuthProvider";

// Message types
export type MessageRole = "user" | "peer" | "system" | "ai" | "agent";

export type MessageEmbed = {
  type: "bid" | "contract" | "deal_phase" | "service_offer" | "counter_offer";
  data: Record<string, unknown>;
};

export type MessageRow = {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: string;
  senderId?: string | null;
  senderName?: string | null;
  senderAvatar?: string | null;
  embed?: MessageEmbed | null;
};

function relativeTime(value?: string | null) {
  if (!value) return "now";
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
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
    roleRaw === "user" || roleRaw === "peer" || roleRaw === "system" || roleRaw === "ai" || roleRaw === "agent"
      ? roleRaw
      : String(row.senderId || row.sender_id || "") ? "peer"
      : "system";
  const text = String(row.text || row.content || row.body || "").trim();
  const createdAt = String(row.createdAt || row.created_at || new Date().toISOString());
  const senderId = row.senderId || row.sender_id;
  const senderName = row.senderName || row.sender_name || (row.sender as Record<string, unknown> | undefined)?.fullName || (row.sender as Record<string, unknown> | undefined)?.username;
  const senderAvatar = row.senderAvatar || row.sender_avatar || (row.sender as Record<string, unknown> | undefined)?.avatarUrl;
  const embed = row.embed ? { type: String((row.embed as Record<string, unknown>).type || "deal_phase") as MessageEmbed["type"], data: row.embed as Record<string, unknown> } : null;
  return { id, role, text, createdAt, senderId: senderId ? String(senderId) : null, senderName: senderName ? String(senderName) : null, senderAvatar: senderAvatar ? String(senderAvatar) : null, embed };
}

// Embed Card Component
function EmbedCard({ embed, threadId, accessToken, onRefresh }: { embed: MessageEmbed; threadId?: string; accessToken?: string | null; onRefresh?: () => void }) {
  const data = embed.data;
  
  if (embed.type === "bid" || embed.type === "service_offer") {
    const price = data.price != null ? Number(data.price) : null;
    const title = String(data.requestTitle || data.serviceTitle || "Deal");
    const proposer = data.proposer as { username?: string; fullName?: string } | undefined;
    
    return (
      <div className="my-2 max-w-[400px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-amber-400">{embed.type === "bid" ? "Request Bid" : "Service Offer"}</span>
        </div>
        <p className="mt-1 text-sm font-medium text-on-surface">{title}</p>
        {price != null && (
          <p className="text-lg font-bold text-on-surface">${price.toLocaleString()}</p>
        )}
        {proposer && (
          <p className="mt-1 text-xs text-on-surface-variant">From {proposer.fullName || proposer.username}</p>
        )}
      </div>
    );
  }
  
  if (embed.type === "deal_phase") {
    const phase = String(data.phase || "update");
    const title = String(data.title || "Deal Update");
    
    return (
      <div className="my-2 max-w-[400px] overflow-hidden rounded-xl border border-outline-variant/70 bg-surface-container-high p-3">
        <p className="text-xs font-medium text-emerald-400">{phase.replace(/_/g, " ")}</p>
        <p className="mt-1 text-sm text-on-surface">{title}</p>
      </div>
    );
  }
  
  return null;
}

// Message Bubble
function MessageBubble({ 
  message, 
  isMine, 
  currentUserId,
  threadId,
  accessToken,
  onRefresh 
}: { 
  message: MessageRow; 
  isMine: boolean;
  currentUserId?: string | null;
  threadId?: string;
  accessToken?: string | null;
  onRefresh?: () => void;
}) {
  const isAI = message.role === "ai";
  const isAgent = message.role === "agent";
  const isSystem = message.role === "system";
  
  const avatar = safeImageSrc(message.senderAvatar || null);
  const name = message.senderName || (isAI ? "AI Assistant" : isAgent ? "Agent" : "User");
  
  return (
    <div className={cn("flex gap-3", isMine ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className="shrink-0">
        {isAI ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        ) : isAgent ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
            <Bot className="h-4 w-4 text-white" />
          </div>
        ) : avatar ? (
          <Image src={avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" unoptimized />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-xs font-medium text-on-surface">
            {initials(name)}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className={cn("max-w-[80%]", isMine ? "items-end" : "items-start")}>
        {/* Name and time */}
        <div className={cn("flex items-center gap-2 mb-1", isMine ? "flex-row-reverse" : "flex-row")}>
          <span className="text-xs font-medium text-on-surface-variant">{name}</span>
          <span className="text-[10px] text-on-surface-variant/70">{relativeTime(message.createdAt)}</span>
        </div>
        
        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isMine
              ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
              : isSystem
              ? "border border-outline-variant bg-surface-container-high text-on-surface-variant italic"
              : "border border-outline-variant bg-surface-container-low text-on-surface"
          )}
        >
          {message.text}
          
          {/* Embed */}
          {message.embed && (
            <EmbedCard embed={message.embed} threadId={threadId} accessToken={accessToken} onRefresh={onRefresh} />
          )}
        </div>
      </div>
    </div>
  );
}

// Empty State
function EmptyState() {
  const quickPrompts = [
    { icon: "🚀", title: "Draft a launch plan for my product", subtitle: "Strategy sprint" },
    { icon: "🎨", title: "Create a modern brand voice guide", subtitle: "Tone and messaging" },
    { icon: "📈", title: "Analyze this idea for market fit", subtitle: "Opportunity scan" },
    { icon: "🧩", title: "Break this goal into weekly tasks", subtitle: "Execution roadmap" },
    { icon: "🛠️", title: "Help me debug a failing API route", subtitle: "Hands-on troubleshooting" },
    { icon: "✍️", title: "Rewrite this copy to convert better", subtitle: "Marketing polish" },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-on-surface/30">BrandForge</h1>
        <p className="mt-4 text-sm text-on-surface-variant">Start with a prompt and shape your next deliverable.</p>
        
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-violet-300 bg-violet-50 px-4 py-2 dark:border-violet-500/30 dark:bg-violet-500/10">
          <Sparkles className="h-3 w-3 text-violet-500 dark:text-violet-300" />
          <span className="text-xs text-violet-700 dark:text-violet-200/80">Pro tip: include goal, audience, and format for better results.</span>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickPrompts.map((item, i) => (
            <button
              key={i}
              type="button"
              className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-3 text-left transition hover:border-outline hover:bg-surface-container-high"
            >
              <span className="text-lg">{item.icon}</span>
              <p className="mt-2 text-sm text-on-surface">{item.title}</p>
              <p className="mt-0.5 text-[10px] text-on-surface-variant">{item.subtitle}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SimpleChat({ threadId: initialThreadId }: { threadId?: string }) {
  const { accessToken, session } = useAuth();
  
  // State
  const activeThreadId = initialThreadId || "";
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Load messages when thread changes
  useEffect(() => {
    if (!activeThreadId || !accessToken) {
      setMessages([]);
      return;
    }
    
    let cancelled = false;
    setLoading(true);
    
    (async () => {
      try {
        const data = await apiGetJson<{
          activeChat?: { messages?: Array<Record<string, unknown>> };
          messages?: Array<Record<string, unknown>>;
        }>(`/api/chat/${encodeURIComponent(activeThreadId)}/messages?limit=80`, accessToken);
        
        if (cancelled) return;
        const raw = Array.isArray(data.activeChat?.messages) ? data.activeChat?.messages : data.messages;
        setMessages(Array.isArray(raw) ? raw.map(mapApiMessage) : []);
      } catch (error) {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    
    return () => { cancelled = true; };
  }, [activeThreadId, accessToken]);

  // Keep latest messages in view when stream updates
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [messages.length]);
  
  // Send message
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    
    // If no thread, handle AI chat
    if (!activeThreadId) {
      setInputText("");
      setSending(true);
      
      // Optimistic user message
      const userMsg: MessageRow = {
        id: `tmp-${Date.now()}`,
        role: "user",
        text,
        createdAt: new Date().toISOString(),
        senderId: session?.user?.id || null,
      };
      setMessages(prev => [...prev, userMsg]);
      
      try {
        const response = await apiMutateJson<{ reply?: string; message?: { content?: string } }>(
          "/api/ai/chat",
          "POST",
          { message: text },
          accessToken
        );
        
        const aiReply = response.reply || response.message?.content || "I'm thinking...";
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          role: "ai",
          text: aiReply,
          createdAt: new Date().toISOString(),
        }]);
      } catch (error) {
        // Error handled silently
      } finally {
        setSending(false);
      }
      return;
    }
    
    setInputText("");
    setSending(true);
    
    const optimistic: MessageRow = {
      id: `tmp-${Date.now()}`,
      role: "user",
      text,
      createdAt: new Date().toISOString(),
      senderId: session?.user?.id || null,
    };
    setMessages(prev => [...prev, optimistic]);
    
    try {
      await apiMutateJson(
        "/api/chat/messages",
        "POST",
        { conversationId: activeThreadId, text, role: "user" },
        accessToken
      );
      
      // Refresh messages
      const refreshed = await apiGetJson<{
        activeChat?: { messages?: Array<Record<string, unknown>> };
      }>(`/api/chat/${encodeURIComponent(activeThreadId)}/messages?limit=80`, accessToken);
      
      const raw = refreshed.activeChat?.messages || [];
      setMessages(Array.isArray(raw) ? raw.map(mapApiMessage) : []);
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setInputText(text);
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const currentUserId = session?.user?.id;
  const hasActiveThread = Boolean(activeThreadId);

  return (
    <div className="page-root text-on-surface flex min-h-0 flex-1">
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Message Stream */}
        <div
          ref={streamRef}
          className="flex-1 overflow-y-auto px-4 py-4"
        >
          {!hasActiveThread && messages.length === 0 ? (
            <EmptyState />
          ) : loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-on-surface-variant">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-on-surface-variant">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(message => {
                const isMine = message.role === "user" || String(message.senderId) === String(currentUserId);
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isMine={isMine}
                    currentUserId={currentUserId}
                    threadId={activeThreadId}
                    accessToken={accessToken}
                  />
                );
              })}
            </div>
          )}
        </div>
        
        {/* Sticky Input Footer */}
        <div className="border-t border-outline-variant bg-surface-container-low/30 px-4 py-4">
          <div className="mx-auto max-w-2xl">
            {/* Input */}
            <div className="flex items-end gap-2 rounded-2xl border border-outline-variant bg-surface-container shadow-lg p-2">
              <button
                type="button"
                className="shrink-0 p-2.5 text-on-surface-variant transition hover:text-on-surface"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={hasActiveThread ? "Reply in deal room..." : "Message AI..."}
                className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent px-2 py-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none"
                rows={1}
              />
              
              <button
                type="button"
                disabled={!inputText.trim() || sending}
                onClick={sendMessage}
                className={cn(
                  "shrink-0 flex h-11 w-11 items-center justify-center rounded-xl transition",
                  inputText.trim() && !sending
                    ? "bg-violet-500 text-white hover:bg-violet-400 shadow-lg shadow-violet-500/25"
                    : "cursor-not-allowed bg-surface-container-high text-on-surface-variant"
                )}
              >
                {sending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            
            {/* Helper text */}
            <p className="mt-3 text-center text-[10px] text-on-surface-variant">
              Enter to send · Shift+Enter for new line · {hasActiveThread ? "Visible to all participants" : "AI responses are generated fresh"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
