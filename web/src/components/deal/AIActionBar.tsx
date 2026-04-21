'use client'

import { useCallback } from 'react'
import { Sparkles, FileText, ListTodo, AlertTriangle, Send, FileOutput } from 'lucide-react'
import type { AIActionType } from '@/types/deal'

interface AIActionBarProps {
  onAction: (action: AIActionType) => void
  actionsRemaining: number
  disabled?: boolean
}

const actions: { type: AIActionType; label: string; icon: React.ReactNode }[] = [
  { type: 'summarize', label: 'Summarize', icon: <FileText className="w-4 h-4" /> },
  { type: 'draft_reply', label: 'Draft Reply', icon: <Send className="w-4 h-4" /> },
  { type: 'generate_proposal', label: 'Generate Proposal', icon: <FileOutput className="w-4 h-4" /> },
  { type: 'extract_action_items', label: 'Action Items', icon: <ListTodo className="w-4 h-4" /> },
  { type: 'find_red_flags', label: 'Find Red Flags', icon: <AlertTriangle className="w-4 h-4" /> },
  { type: 'create_follow_up', label: 'Follow-up', icon: <Send className="w-4 h-4" /> },
]

export function AIActionBar({ onAction, actionsRemaining, disabled }: AIActionBarProps) {
  const isExhausted = actionsRemaining === 0
  const isLow = actionsRemaining <= 10 && actionsRemaining > 0

  const handleAction = useCallback((action: AIActionType) => {
    if (isExhausted || disabled) return
    onAction(action)
  }, [isExhausted, disabled, onAction])

  return (
    <div className="border-t border-b border-border/50 bg-muted/30 py-2">
      <div className="flex items-center gap-2 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1.5 mr-2 shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
            AI Actions
          </span>
        </div>
        
        {actions.map((action) => {
          const isDisabled = isExhausted || disabled
          const variantClasses = isLow && !isExhausted
            ? 'text-amber-600 border-amber-200 hover:border-amber-300 hover:bg-amber-50'
            : isExhausted
              ? 'text-muted-foreground/50 border-border/50 cursor-not-allowed'
              : 'text-foreground border-border hover:border-primary/50 hover:bg-primary/5'

          return (
            <button
              key={action.type}
              onClick={() => handleAction(action.type)}
              disabled={isDisabled}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full
                border text-sm font-medium transition-colors shrink-0
                ${variantClasses}
              `}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
