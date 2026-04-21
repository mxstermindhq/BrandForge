'use client'

import { Sparkles } from 'lucide-react'

interface UsageMeterProps {
  actionsUsed: number
  actionsLimit?: number
  onUpgradeClick?: () => void
}

export function UsageMeter({ 
  actionsUsed, 
  actionsLimit = 100,
  onUpgradeClick 
}: UsageMeterProps) {
  const remaining = Math.max(0, actionsLimit - actionsUsed)
  const isLow = remaining <= 20 && remaining > 0
  const isExhausted = remaining === 0
  const percentage = Math.min(100, (actionsUsed / actionsLimit) * 100)

  const statusColor = isExhausted 
    ? 'text-red-600' 
    : isLow 
      ? 'text-amber-600' 
      : 'text-muted-foreground'

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50 bg-muted/20">
      <div className="flex items-center gap-1.5">
        <Sparkles className={`w-4 h-4 ${statusColor}`} />
        <span className={`text-sm font-medium ${statusColor}`}>
          {remaining}
        </span>
        <span className="text-sm text-muted-foreground">
          of {actionsLimit} free premium AI actions remaining
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
        <div 
          className={`h-full rounded-full transition-all ${
            isExhausted ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isExhausted && onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="text-sm font-medium text-primary hover:text-primary/80 underline"
        >
          Upgrade to continue
        </button>
      )}
    </div>
  )
}
