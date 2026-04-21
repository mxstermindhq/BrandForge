'use client'

import { MessageSquare, Bot } from 'lucide-react'

interface ChatModeSwitcherProps {
  mode: 'chat' | 'agentic'
  onChange: (mode: 'chat' | 'agentic') => void
}

export function ChatModeSwitcher({ mode, onChange }: ChatModeSwitcherProps) {
  return (
    <div className="flex items-center bg-muted rounded-lg p-1">
      <button
        onClick={() => onChange('chat')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          mode === 'chat'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <MessageSquare className="w-4 h-4" />
        Chat
      </button>
      <button
        onClick={() => onChange('agentic')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          mode === 'agentic'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Bot className="w-4 h-4" />
        Agentic
      </button>
    </div>
  )
}
