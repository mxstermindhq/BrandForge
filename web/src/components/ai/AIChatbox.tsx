/**
 * @deprecated Use DealThreadClient from @/app/(main)/chat/[id]/_components/DealThreadClient
 * 
 * This component is deprecated in favor of the unified Deal Room experience.
 * The new DealThreadClient combines human and AI conversations in a single thread
 * with AI actions as buttons (not a separate mode) and a value rail showing
 * deal context, artifacts, and next actions.
 * 
 * Migration: Replace <AIChatbox /> with <DealThreadClient isNewThread />
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ChevronDown, ChevronUp, Sparkles, Bot, User, Loader2, Paperclip, Mic, Image as ImageIcon, Code, Wrench, Zap, FileText, Lightbulb } from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: React.ReactNode;
  category: "chat" | "image" | "code" | "voice";
}

const MODELS: AIModel[] = [
  { id: "claude-opus", name: "Claude Opus 4.7", provider: "Anthropic", description: "Most capable for complex tasks", icon: <Sparkles size={16} />, category: "chat" },
  { id: "claude-sonnet", name: "Claude Sonnet 4.6", provider: "Anthropic", description: "Balanced performance", icon: <Bot size={16} />, category: "chat" },
  { id: "claude-haiku", name: "Claude Haiku 4.5", provider: "Anthropic", description: "Fastest responses", icon: <Bot size={16} />, category: "chat" },
  { id: "gemini-pro", name: "Gemini 3.1 Pro v2", provider: "Google", description: "Google's most capable", icon: <Sparkles size={16} />, category: "chat" },
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI", description: "General purpose powerhouse", icon: <Bot size={16} />, category: "chat" },
  { id: "dalle", name: "DALL-E 3", provider: "OpenAI", description: "Image generation", icon: <ImageIcon size={16} />, category: "image" },
  { id: "copilot", name: "GitHub Copilot", provider: "GitHub", description: "Code assistant", icon: <Code size={16} />, category: "code" },
];

const AGENTS = [
  { id: "scopeguard", name: "ScopeGuard", role: "Contract Review", icon: "🛡️" },
  { id: "bidcrafter", name: "BidCrafter", role: "Proposal Writer", icon: "✍️" },
  { id: "matchmaker", name: "MatchMaker", role: "Deal Finder", icon: "🎯" },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: Date;
  streaming?: boolean;
}

export function AIChatbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>(MODELS[0]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate streaming response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      model: selectedModel.name,
      timestamp: new Date(),
      streaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Simulate streaming
    const response = `I'm ${selectedModel.name}, here to help you with your request. I can assist with a wide range of tasks including analysis, writing, coding, and more. What would you like to work on?`;
    
    for (let i = 0; i < response.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: response.slice(0, i + 1) }
            : m
        )
      );
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === assistantMessage.id ? { ...m, streaming: false } : m))
    );
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredModels = MODELS.filter((m) => m.category === "chat");

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition"
        >
          <span>Chat History</span>
          {showHistory ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
        </button>
      </div>

      {/* Chat History Panel */}
      {showHistory && (
        <div className="border-b border-zinc-800 bg-zinc-900/50 max-h-48 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="px-4 py-3 text-xs text-zinc-500 text-center">
              No chat history yet
            </div>
          ) : (
            <div className="px-2 py-2 space-y-1">
              {messages.map((msg, idx) => (
                <button
                  key={msg.id}
                  onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${msg.role === "user" ? "text-amber-400" : "text-purple-400"}`}>
                      {msg.role === "user" ? "You" : "AI"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {msg.timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {msg.content.slice(0, 60)}{msg.content.length > 60 ? "..." : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-purple-400" />
            </div>
            <p className="text-lg font-medium text-zinc-300 mb-1">How can I help you today?</p>
            <p className="text-sm text-zinc-500 mb-6">Ask me anything or mention an agent with @</p>
            
            {/* Suggested Follow-ups */}
            <div className="w-full max-w-[600px]">
              <p className="text-[11px] uppercase tracking-wider text-zinc-600 mb-3 text-center">Suggested follow-ups</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { icon: Sparkles, label: "Summarize this deal", color: "text-amber-400" },
                  { icon: FileText, label: "Draft a proposal", color: "text-sky-400" },
                  { icon: Zap, label: "Check for red flags", color: "text-rose-400" },
                  { icon: Lightbulb, label: "Suggest next steps", color: "text-emerald-400" },
                ].map((followup) => (
                  <button
                    key={followup.label}
                    onClick={() => {
                      setInput(followup.label);
                      inputRef.current?.focus();
                    }}
                    className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-left hover:bg-zinc-900 hover:border-zinc-700 transition group"
                  >
                    <followup.icon size={18} className={`${followup.color} shrink-0`} />
                    <span className="text-sm text-zinc-400 group-hover:text-zinc-300">{followup.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === "user" 
                    ? "bg-amber-500/20 text-amber-300 ring-2 ring-amber-500/30" 
                    : "bg-purple-500/20 text-purple-300 ring-2 ring-purple-500/30"
                }`}
              >
                {message.role === "user" ? (
                  <User size={18} />
                ) : (
                  <Bot size={18} />
                )}
              </div>
              <div className={`min-w-0 flex-1 ${message.role === "user" ? "items-end flex flex-col" : ""}`}>
                {message.role === "assistant" && message.model && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-purple-300">AI Assistant</span>
                    <span className="text-[10px] text-zinc-500">·</span>
                    <span className="text-[10px] text-zinc-500">{message.model}</span>
                    {message.streaming && (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <Loader2 size={10} className="animate-spin" />
                        typing...
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-amber-500 text-black rounded-br-md"
                      : "bg-purple-500/10 border border-purple-500/20 text-zinc-200 rounded-bl-md"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                <time className="text-[11px] text-zinc-600 mt-1">
                  {message.timestamp.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </time>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - flush to bottom */}
      <div className="p-3 border-t border-zinc-800 bg-[#0a0a0a]">
        {/* Model & Agents Selectors */}
        <div className="flex items-center gap-2 mb-2">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-800 transition"
            >
              <span className="text-amber-400">{selectedModel.icon}</span>
              <span>{selectedModel.name}</span>
              <ChevronDown size={14} className="text-zinc-500" />
            </button>

          {showModelPicker && (
            <div className="absolute bottom-full left-0 mb-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50">
              <div className="p-2">
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 uppercase tracking-wider">
                  <Bot size={12} />
                  <span>Chat Models</span>
                </div>
                {filteredModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      setShowModelPicker(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                      selectedModel.id === model.id
                        ? "bg-zinc-800 border border-zinc-700"
                        : "hover:bg-zinc-800/50"
                    }`}
                  >
                    <span className="text-amber-400">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{model.name}</span>
                        {model.provider === "Anthropic" && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded">
                            Think
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">{model.description}</span>
                    </div>
                    {selectedModel.id === model.id && (
                      <span className="text-amber-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>
          {/* Agents Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAgentPicker(!showAgentPicker)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-800 transition"
            >
              <Wrench size={14} className="text-purple-400" />
              <span>Agents</span>
              <ChevronDown size={14} className="text-zinc-500" />
            </button>

            {showAgentPicker && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-zinc-500 uppercase tracking-wider">
                    Your Agents
                  </div>
                  {AGENTS.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setInput((prev) => `${prev}@${agent.name} `.trim());
                        setShowAgentPicker(false);
                        inputRef.current?.focus();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-zinc-800/50 transition"
                    >
                      <span className="text-lg">{agent.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{agent.name}</span>
                        <span className="block text-xs text-zinc-500">{agent.role}</span>
                      </div>
                    </button>
                  ))}
                  <div className="mt-2 pt-2 border-t border-zinc-800">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-400 hover:bg-zinc-800/50 rounded-lg transition">
                      <Sparkles size={14} />
                      <span>Browse Agent Marketplace</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-end gap-2 p-3 bg-surface-container border border-outline-variant rounded-2xl shadow-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI or @mention an agent..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm py-1 max-h-32 text-on-surface placeholder:text-on-surface-variant"
          />
          <div className="flex items-center gap-1">
            <button className="p-2 text-on-surface-variant hover:text-on-surface transition">
              <ImageIcon size={18} />
            </button>
            <button className="p-2 text-on-surface-variant hover:text-on-surface transition" title="Voice input">
              <Mic size={18} />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-2 bg-amber-500 text-black rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
        {/* AI Disclaimer */}
        <p className="mt-2 text-center text-[10px] text-on-surface-variant">
          AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
}
