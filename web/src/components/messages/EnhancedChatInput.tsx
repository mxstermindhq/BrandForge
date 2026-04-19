"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, Loader2, Sparkles, AtSign, Smile } from "lucide-react";

interface EnhancedChatInputProps {
  onSend: (message: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  showAgentMention?: boolean;
}

const AGENTS = [
  { id: "scopeguard", name: "ScopeGuard", role: "Contract Review", icon: "🛡️" },
  { id: "bidcrafter", name: "BidCrafter", role: "Proposal Writer", icon: "✍️" },
  { id: "matchmaker", name: "MatchMaker", role: "Deal Finder", icon: "🎯" },
];

export function EnhancedChatInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Type a message...",
  showAgentMention = true,
}: EnhancedChatInputProps) {
  const [input, setInput] = useState("");
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || disabled || isSending) return;

    const message = input.trim();
    setInput("");
    setIsSending(true);

    // Optimistic: send immediately
    onSend(message);

    // Simulate network delay (in real app, this would be the actual send)
    setTimeout(() => {
      setIsSending(false);
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setCursorPosition(e.target.selectionStart || 0);

    // Show agent picker when typing @
    const lastChar = value.slice(-1);
    const beforeCursor = value.slice(0, cursorPosition);
    const atIndex = beforeCursor.lastIndexOf("@");
    
    if (lastChar === "@" && showAgentMention) {
      setShowAgentPicker(true);
    } else if (atIndex === -1 || beforeCursor.slice(atIndex).includes(" ")) {
      setShowAgentPicker(false);
    }

    // Typing indicator
    if (onTyping) {
      if (typingTimeout) clearTimeout(typingTimeout);
      onTyping();
      const timeout = setTimeout(() => {}, 3000);
      setTypingTimeout(timeout);
    }
  };

  const insertAgent = (agent: typeof AGENTS[0]) => {
    const beforeCursor = input.slice(0, cursorPosition);
    const afterCursor = input.slice(cursorPosition);
    const atIndex = beforeCursor.lastIndexOf("@");
    
    if (atIndex !== -1) {
      const newInput = beforeCursor.slice(0, atIndex) + `@${agent.name} ` + afterCursor;
      setInput(newInput);
      setShowAgentPicker(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative">
      {/* Agent Mention Picker */}
      {showAgentPicker && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2">
            <div className="px-3 py-2 text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={12} />
              <span>Quick-invoke agents</span>
            </div>
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => insertAgent(agent)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-zinc-800 transition group"
              >
                <span className="text-lg">{agent.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm text-white group-hover:text-amber-400 transition">
                    {agent.name}
                  </span>
                  <span className="block text-xs text-zinc-500">{agent.role}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl focus-within:border-zinc-600 transition-all">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent px-4 py-3 pr-32 text-sm text-white placeholder-zinc-500 resize-none outline-none min-h-[56px] max-h-[200px]"
          rows={1}
        />
        
        {/* Action Buttons */}
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          {showAgentMention && (
            <button
              onClick={() => {
                setInput((prev) => prev + "@");
                setShowAgentPicker(true);
                inputRef.current?.focus();
              }}
              className="p-2 text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition"
              title="Mention agent"
            >
              <AtSign size={18} />
            </button>
          )}
          <button className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition">
            <Paperclip size={18} />
          </button>
          <button className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition">
            <Mic size={18} />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled || isSending}
            className="p-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center min-w-[36px]"
          >
            {isSending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Smart Compose Hint */}
      {input.length > 3 && !input.includes("@") && (
        <div className="absolute -top-6 right-0 flex items-center gap-1 text-[10px] text-zinc-500 animate-pulse">
          <span>Press Enter to send</span>
          <span className="text-zinc-600">·</span>
          <span className="text-amber-400">Shift+Enter for new line</span>
        </div>
      )}
    </div>
  );
}
