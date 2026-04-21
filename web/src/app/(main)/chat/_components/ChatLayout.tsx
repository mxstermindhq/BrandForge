'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Menu, PanelLeftClose, PanelLeft } from 'lucide-react'

interface ChatLayoutContextType {
  leftSidebarOpen: boolean
  setLeftSidebarOpen: (open: boolean) => void
  toggleLeftSidebar: () => void
  rightRailOpen: boolean
  setRightRailOpen: (open: boolean) => void
  toggleRightRail: () => void
}

const ChatLayoutContext = createContext<ChatLayoutContextType | null>(null)

export function useChatLayout() {
  const context = useContext(ChatLayoutContext)
  if (!context) {
    throw new Error('useChatLayout must be used within ChatLayoutProvider')
  }
  return context
}

interface ChatLayoutProviderProps {
  children: React.ReactNode
  defaultLeftOpen?: boolean
  defaultRightOpen?: boolean
}

export function ChatLayoutProvider({ 
  children, 
  defaultLeftOpen = false,
  defaultRightOpen = true 
}: ChatLayoutProviderProps) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(defaultLeftOpen)
  const [rightRailOpen, setRightRailOpen] = useState(defaultRightOpen)

  const toggleLeftSidebar = () => setLeftSidebarOpen(!leftSidebarOpen)
  const toggleRightRail = () => setRightRailOpen(!rightRailOpen)

  return (
    <ChatLayoutContext.Provider value={{
      leftSidebarOpen,
      setLeftSidebarOpen,
      toggleLeftSidebar,
      rightRailOpen,
      setRightRailOpen,
      toggleRightRail
    }}>
      {children}
    </ChatLayoutContext.Provider>
  )
}

interface ChatSidebarToggleProps {
  className?: string
}

export function ChatSidebarToggle({ className = '' }: ChatSidebarToggleProps) {
  const { leftSidebarOpen, toggleLeftSidebar } = useChatLayout()
  
  return (
    <button
      onClick={toggleLeftSidebar}
      className={`p-2 rounded-lg hover:bg-muted transition-colors ${className}`}
      title={leftSidebarOpen ? 'Hide conversations' : 'Show conversations'}
    >
      {leftSidebarOpen ? (
        <PanelLeftClose className="w-5 h-5" />
      ) : (
        <PanelLeft className="w-5 h-5" />
      )}
    </button>
  )
}
