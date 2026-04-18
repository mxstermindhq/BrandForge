"use client";

import { useState, useRef, useEffect } from "react";
import { apiMutateJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  actions?: AIAction[];
}

interface AIAction {
  type: "generate_contract" | "analyze_deal" | "suggest_counter" | "summarize" | "create_milestone";
  label: string;
  payload?: Record<string, unknown>;
}

interface AIAssistantPanelProps {
  chatId: string;
  dealContext?: {
    type: "service" | "request" | "bid";
    title: string;
    amount?: number;
    parties: { id: string; name: string; role: string }[];
    milestones?: { title: string; amount: number; dueDate?: string }[];
  };
  onAction?: (action: AIAction) => void;
}

export function AIAssistantPanel({ chatId, dealContext, onAction }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "I'm your Deal Room AI Assistant. I can help you generate contracts, analyze deals, suggest counters, or summarize the conversation. What would you like to do?",
      timestamp: new Date(),
      actions: [
        { type: "generate_contract", label: "Generate Contract" },
        { type: "analyze_deal", label: "Analyze Deal" },
        { type: "summarize", label: "Summarize Chat" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
  const { accessToken } = useAuth();
    const response = await apiMutateJson<{
        response: string;
        actions?: AIAction[];
      }>("/api/ai/deal-assistant", "POST", {
        chatId,
        message: input,
        dealContext,
        history: messages.slice(-10),
      }, accessToken);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        actions: response.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAction(action: AIAction) {
    onAction?.(action);
  }

  return (
    <div className="flex flex-col h-full bg-surface-container-low border-l border-outline-variant">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container-high">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">smart_toy</span>
          <span className="font-headline font-semibold text-on-surface">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-on-surface-variant">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-3 ${
                message.role === "user"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high border border-outline-variant"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAction(action)}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              <p
                className={`text-[10px] mt-1 ${
                  message.role === "user" ? "text-on-primary/60" : "text-on-surface-variant"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface-container-high border border-outline-variant rounded-xl p-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-outline-variant bg-surface-container-high">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything about this deal..."
            className="flex-1 px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="btn-primary px-3 py-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
        <p className="text-[10px] text-on-surface-variant/50 mt-2">
          AI suggestions are for guidance only. Review all generated content before sharing.
        </p>
      </div>
    </div>
  );
}
