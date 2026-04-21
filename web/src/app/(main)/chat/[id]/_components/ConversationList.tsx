'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DealThread } from '@/types/deal'
import { 
  Plus,
  Search,
  MessageSquare,
  MoreHorizontal,
  Archive,
  Trash2,
  Pin
} from 'lucide-react'

interface ConversationListProps {
  conversations: DealThread[]
  currentId?: string
  isOpen: boolean
  onClose: () => void
  onNewThread: () => void
}

export function ConversationList({ 
  conversations, 
  currentId, 
  isOpen, 
  onClose,
  onNewThread 
}: ConversationListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (id: string) => {
    router.push(`/chat/${id}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="w-72 border-r border-border bg-muted/20 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Conversations</h3>
          <button
            onClick={onNewThread}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            title="New thread"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No conversations found
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                onMouseEnter={() => setHoveredId(conv.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentId === conv.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{conv.title}</p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.preview || `${conv.contactName} · ${conv.companyName}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        conv.stage === 'proposal' ? 'bg-amber-100 text-amber-700' :
                        conv.stage === 'negotiation' ? 'bg-purple-100 text-purple-700' :
                        conv.stage === 'closed_won' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {conv.stage.replace('_', ' ')}
                      </span>
                      {conv.dealValue && (
                        <span className="text-xs text-muted-foreground">
                          ${(conv.dealValue / 1000).toFixed(0)}k
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions on hover */}
                {hoveredId === conv.id && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-1 hover:bg-background rounded"
                      title="Pin"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button 
                      className="p-1 hover:bg-background rounded"
                      title="Archive"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <Archive className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50">
        <button
          onClick={onNewThread}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Thread
        </button>
      </div>
    </div>
  )
}
