'use client'

import { useState } from 'react'
import type { DealContext, DealStage } from '@/types/deal'
import { 
  User, 
  Building2, 
  DollarSign, 
  Calendar, 
  Target,
  FileText,
  Download,
  Copy,
  Sparkles,
  Edit3,
  Check,
  ChevronDown,
  Paperclip
} from 'lucide-react'

interface DealValueRailProps {
  context: DealContext
}

const stageLabels: Record<DealStage, string> = {
  prospecting: 'Prospecting',
  discovery: 'Discovery',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost'
}

const stageColors: Record<DealStage, string> = {
  prospecting: 'bg-slate-500',
  discovery: 'bg-blue-500',
  proposal: 'bg-amber-500',
  negotiation: 'bg-purple-500',
  closed_won: 'bg-green-500',
  closed_lost: 'bg-red-500'
}

export function DealValueRail({ context }: DealValueRailProps) {
  const [isEditingNextAction, setIsEditingNextAction] = useState(false)
  const [nextActionInput, setNextActionInput] = useState(context.nextAction || '')
  const [showAllArtifacts, setShowAllArtifacts] = useState(false)
  
  const displayedArtifacts = showAllArtifacts 
    ? context.artifacts 
    : context.artifacts.slice(0, 3)
  
  return (
    <div className="w-80 border-l border-border bg-muted/20 flex flex-col overflow-y-auto hidden lg:flex">
      {/* Contact Section */}
      <div className="p-4 border-b border-border/50">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Contact
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{context.contactName}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {context.companyName}
            </p>
          </div>
        </div>
      </div>
      
      {/* Deal Section */}
      <div className="p-4 border-b border-border/50">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Deal
        </h3>
        
        {/* Deal Value */}
        {context.dealValue && (
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold">
              {context.currency} {context.dealValue.toLocaleString()}
            </span>
          </div>
        )}
        
        {/* Stage Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${stageColors[context.stage]}`}>
            {stageLabels[context.stage]}
          </span>
        </div>
        
        {/* Expected Close */}
        {context.expectedCloseDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Close by {context.expectedCloseDate.toLocaleDateString()}</span>
          </div>
        )}
      </div>
      
      {/* Next Action */}
      <div className="p-4 border-b border-border/50">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Next Action
        </h3>
        {isEditingNextAction ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nextActionInput}
              onChange={(e) => setNextActionInput(e.target.value)}
              className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded"
              autoFocus
            />
            <button
              onClick={() => setIsEditingNextAction(false)}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditingNextAction(true)}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <p className="text-sm flex-1">{context.nextAction || 'No next action set'}</p>
            <Edit3 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
      
      {/* AI Recap */}
      {context.aiRecap && (
        <div className="p-4 border-b border-border/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI Recap
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {context.aiRecap}
          </p>
        </div>
      )}
      
      {/* Artifacts */}
      {context.artifacts.length > 0 && (
        <div className="p-4 border-b border-border/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            Artifacts
          </h3>
          <div className="space-y-2">
            {displayedArtifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="p-2.5 bg-background rounded-lg border border-border/50 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{artifact.label}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {artifact.content}
                </p>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                  <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
          {context.artifacts.length > 3 && (
            <button
              onClick={() => setShowAllArtifacts(!showAllArtifacts)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2"
            >
              {showAllArtifacts ? 'Show less' : `Show ${context.artifacts.length - 3} more`}
              <ChevronDown className={`w-3 h-3 transition-transform ${showAllArtifacts ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      )}
      
      {/* Files placeholder */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
          <Paperclip className="w-3.5 h-3.5" />
          Files
        </h3>
        <p className="text-sm text-muted-foreground">
          No files attached yet
        </p>
      </div>
    </div>
  )
}
