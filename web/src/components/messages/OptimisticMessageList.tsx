"use client";

import { useState, useRef, useEffect } from "react";
import { Check, CheckCheck, Loader2, Bot, User as UserIcon, MoreHorizontal, Reply, Smile, Sparkles } from "lucide-react";
import { EnhancedChatInput } from "./EnhancedChatInput";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read" | "error";
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  agent?: {
    name: string;
    icon: string;
  };
}

interface OptimisticMessageListProps {
  initialMessages?: Message[];
  roomId: string;
  currentUserId: string;
}

export function OptimisticMessageList({
  initialMessages = [],
  roomId,
  currentUserId,
}: OptimisticMessageListProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    // Generate client-side ID
    const optimisticId = `temp-${Date.now()}`;
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: optimisticId,
      role: "user",
      content,
      timestamp: new Date(),
      status: "sending",
      sender: {
        id: currentUserId,
        name: "You",
      },
    };

    // Add to messages immediately (optimistic)
    setMessages((prev) => [...prev, optimisticMessage]);

    // Simulate API call (in real app, this would be the actual send)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update message to sent
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId ? { ...m, status: "sent" } : m
        )
      );

      // Simulate server response (agent reply)
      setTimeout(() => {
        const agentReply: Message = {
          id: `agent-${Date.now()}`,
          role: "assistant",
          content: generateAgentResponse(content),
          timestamp: new Date(),
          agent: {
            name: "ScopeGuard",
            icon: "🛡️",
          },
        };
        setMessages((prev) => [...prev, agentReply]);
      }, 1000);
    } catch (error) {
      // Update to error state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId ? { ...m, status: "error" } : m
        )
      );
    }
  };

  const generateAgentResponse = (userMessage: string): string => {
    // Simple response generation for demo
    if (userMessage.toLowerCase().includes("scope")) {
      return "I'll analyze this scope for potential risks. Let me check for common red flags...";
    }
    if (userMessage.toLowerCase().includes("@ScopeGuard")) {
      return "🛡️ **ScopeGuard Analysis**\n\nI've reviewed the scope. Key findings:\n\n✅ Clear deliverables defined\n⚠️ Timeline may be aggressive\n✅ Payment terms look standard\n\nRecommendation: Proceed with milestone-based payments.";
    }
    return "I understand. Let me help you with that. Could you provide more details about what you're looking for?";
  };

  const handleTyping = () => {
    // In real app, this would emit typing event via WebSocket
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "sending":
        return <Loader2 size={12} className="animate-spin text-zinc-500" />;
      case "sent":
        return <Check size={12} className="text-zinc-500" />;
      case "delivered":
        return <CheckCheck size={12} className="text-zinc-500" />;
      case "read":
        return <CheckCheck size={12} className="text-emerald-400" />;
      case "error":
        return <span className="text-rose-400 text-[10px]">Failed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Sparkles size={40} className="text-zinc-700 mb-3" />
            <p className="text-sm">Start a conversation</p>
            <p className="text-xs text-zinc-600 mt-1">Type @ to mention an agent</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === "user";
            const showAvatar = index === 0 || messages[index - 1].role !== message.role;

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} group`}
              >
                {/* Avatar */}
                {showAvatar ? (
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isUser ? "bg-amber-500" : "bg-zinc-800"
                    }`}
                  >
                    {message.agent ? (
                      <span className="text-lg">{message.agent.icon}</span>
                    ) : isUser ? (
                      <UserIcon size={16} className="text-black" />
                    ) : (
                      <Bot size={16} className="text-zinc-400" />
                    )}
                  </div>
                ) : (
                  <div className="w-8 shrink-0" />
                )}

                {/* Message Bubble */}
                <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                  {/* Sender Name */}
                  {showAvatar && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-zinc-500">
                        {message.agent?.name || message.sender?.name || "Unknown"}
                      </span>
                      {message.agent && (
                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded">
                          AI Agent
                        </span>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div
                    className={`relative rounded-2xl px-4 py-2.5 ${
                      isUser
                        ? "bg-amber-500 text-black rounded-br-sm"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                    {/* Status indicator for user messages */}
                    {isUser && (
                      <div className="absolute -bottom-4 right-0 flex items-center gap-1">
                        {getStatusIcon(message.status)}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] text-zinc-600 mt-1">
                    {formatRelativeTime(message.timestamp)}
                  </span>
                </div>

                {/* Hover Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                  <button className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded">
                    <Reply size={14} />
                  </button>
                  <button className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded">
                    <Smile size={14} />
                  </button>
                  <button className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <Bot size={16} className="text-zinc-400" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-500">{typingUsers[0]} is typing</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800">
        <EnhancedChatInput
          onSend={handleSend}
          onTyping={handleTyping}
          placeholder="Type a message or @mention an agent..."
          showAgentMention={true}
        />
        <p className="text-center text-[10px] text-zinc-600 mt-2">
          Messages are sent instantly · Agents respond in real-time
        </p>
      </div>
    </div>
  );
}
