'use client'

import { useState } from 'react'
import { 
  UserPlus, 
  Share2, 
  Archive, 
  MoreHorizontal,
  Copy,
  Download,
  Trash2,
  Settings
} from 'lucide-react'

interface ChatToolbarProps {
  onInvite?: () => void
  onShare?: () => void
  onArchive?: () => void
  onDelete?: () => void
  onExport?: () => void
  actionsRemaining?: number
}

export function ChatToolbar({ 
  onInvite,
  onShare,
  onArchive,
  onDelete,
  onExport,
  actionsRemaining
}: ChatToolbarProps) {
  const [showMore, setShowMore] = useState(false)

  return (
    <div className="flex items-center gap-1">
      {/* Invite */}
      <button
        onClick={onInvite}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        title="Invite teammates"
      >
        <UserPlus className="w-4 h-4" />
      </button>

      {/* Share */}
      <button
        onClick={onShare}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        title="Share thread"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {/* Archive */}
      <button
        onClick={onArchive}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        title="Archive thread"
      >
        <Archive className="w-4 h-4" />
      </button>

      {/* More options */}
      <div className="relative">
        <button
          onClick={() => setShowMore(!showMore)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMore && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={() => { onExport?.(); setShowMore(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" />
              Export conversation
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); setShowMore(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy link
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => { onDelete?.(); setShowMore(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete thread
            </button>
          </div>
        )}
      </div>

      {/* Usage indicator - compact */}
      {actionsRemaining !== undefined && actionsRemaining <= 20 && (
        <div className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
          actionsRemaining === 0 
            ? 'bg-red-100 text-red-700' 
            : 'bg-amber-100 text-amber-700'
        }`}>
          {actionsRemaining} left
        </div>
      )}
    </div>
  )
}
