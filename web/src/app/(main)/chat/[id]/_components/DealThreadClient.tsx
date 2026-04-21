'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useBootstrap } from '@/hooks/useBootstrap'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { apiFetch } from '@/lib/api'
import { incrementActionsUsed, getActionsRemaining, hasActionsRemaining } from '@/lib/usage'
import type { DealMessage, DealContext, AIActionType, Artifact, DealThread } from '@/types/deal'
import { AIActionBar } from '@/components/deal/AIActionBar'
import { UpgradeModal } from '@/components/deal/UpgradeModal'
import { DealValueRail } from './DealValueRail'
import { ConversationList } from './ConversationList'
import { ChatModeSwitcher } from './ChatModeSwitcher'
import { ModelSelector } from './ModelSelector'
import { ChatToolbar } from './ChatToolbar'
import { 
  Send, 
  Paperclip, 
  Loader2,
  FileText,
  Download,
  Copy,
  CheckCircle2,
  PanelLeft,
  PanelLeftClose,
  Sparkles,
  Bot,
  MessageSquare
} from 'lucide-react'

interface DealThreadClientProps {
  threadId?: string
  isNewThread?: boolean
}

export function DealThreadClient({ threadId, isNewThread }: DealThreadClientProps) {
  const router = useRouter()
  const { session } = useAuth()
  const { data: bootData, loading: bootLoading } = useBootstrap()
  
  // Thread state
  const [messages, setMessages] = useState<DealMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [actionsRemaining, setActionsRemaining] = useState(100)
  
  // UI State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false) // Hidden by default
  const [rightRailOpen, setRightRailOpen] = useState(true)
  const [chatMode, setChatMode] = useState<'chat' | 'agentic'>('chat')
  const [aiEnabled, setAiEnabled] = useState(true)
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [showConversationList, setShowConversationList] = useState(false)
  
  // Conversations list
  const [conversations, setConversations] = useState<DealThread[]>([])
  const [currentThread, setCurrentThread] = useState<DealThread | null>(null)
  
  // Load conversations list
  const loadConversations = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      const response = await fetch('/api/chat/threads')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.threads || [])
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }, [session?.user?.id])
  
  // Load specific thread messages
  const loadThreadMessages = useCallback(async (id: string) => {
    if (!id) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chat/threads/${id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setCurrentThread(data.thread || null)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Initial load
  useEffect(() => {
    loadConversations()
  }, [loadConversations])
  
  // Load thread when threadId changes
  useEffect(() => {
    if (threadId && !isNewThread) {
      loadThreadMessages(threadId)
    }
  }, [threadId, isNewThread, loadThreadMessages])
  
  // Deal context (would come from API in real implementation)
  const [dealContext, setDealContext] = useState<DealContext>({
    contactName: 'Sarah Chen',
    companyName: 'Acme Corp',
    dealValue: 18400,
    currency: 'USD',
    stage: 'proposal',
    nextAction: 'Send revised proposal by Friday',
    aiRecap: 'Sarah wants to see a revised scope covering timeline, pricing, and integration support.',
    artifacts: [],
    premiumActionsUsed: 0,
    premiumActionsLimit: 100
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  // Update actions remaining
  useEffect(() => {
    setActionsRemaining(getActionsRemaining())
  }, [])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  
  // Handle AI action
  const handleAIAction = useCallback((action: AIActionType) => {
    if (!hasActionsRemaining()) {
      setShowUpgradeModal(true)
      return
    }
    
    // Simulate AI action generating an artifact
    const newActionsUsed = incrementActionsUsed()
    setActionsRemaining(getActionsRemaining())
    
    // Create artifact based on action type
    const artifact: Artifact = {
      id: `art-${Date.now()}`,
      type: action === 'generate_proposal' ? 'proposal' 
          : action === 'summarize' ? 'summary'
          : action === 'draft_reply' ? 'follow_up_email'
          : action === 'extract_action_items' ? 'action_items'
          : action === 'find_red_flags' ? 'red_flags'
          : 'brief',
      label: action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      content: `[Generated ${action.replace(/_/g, ' ')}]`,
      createdAt: new Date()
    }
    
    // Add AI message with artifact
    const aiMessage: DealMessage = {
      id: `msg-${Date.now()}`,
      role: 'ai',
      type: 'artifact',
      content: `I've generated a ${artifact.label.toLowerCase()} for your deal with ${dealContext.contactName}.`,
      timestamp: new Date(),
      artifact
    }
    
    setMessages(prev => [...prev, aiMessage])
    setDealContext(prev => ({
      ...prev,
      artifacts: [...prev.artifacts, artifact],
      premiumActionsUsed: newActionsUsed
    }))
  }, [dealContext.contactName])
  
  // Handle send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return
    
    const userMessage: DealMessage = {
      id: `msg-${Date.now()}`,
      role: 'human',
      type: 'text',
      content: input.trim(),
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)
    
    // Simulate AI response (in real implementation, this would call the API)
    setTimeout(() => {
      const aiResponse: DealMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'ai',
        type: 'ai_reply',
        content: 'Got it. I\'ll help you work through this deal. What would you like me to focus on next?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsStreaming(false)
    }, 1500)
  }, [input, isStreaming])
  
  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])
  
  // Handle file upload
  const handleFileUpload = useCallback(() => {
    // TODO: Implement file upload
    console.log('File upload clicked')
  }, [])
  
  // Empty state for new thread
  if (isNewThread || messages.length === 0) {
    return (
      <div className="flex h-full">
        {/* Left Sidebar - Conversation List */}
        <ConversationList
          conversations={conversations}
          isOpen={leftSidebarOpen}
          onClose={() => setLeftSidebarOpen(false)}
          onNewThread={() => router.push('/chat')}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Minimal Header Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title={leftSidebarOpen ? 'Hide conversations' : 'Show conversations'}
              >
                {leftSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
              </button>
              <span className="text-sm font-medium text-muted-foreground">New Thread</span>
            </div>
            
            <div className="flex items-center gap-3">
              <ChatModeSwitcher mode={chatMode} onChange={setChatMode} />
              <ModelSelector
                selectedModel={selectedModel}
                onSelect={setSelectedModel}
                aiEnabled={aiEnabled}
                onToggleAI={setAiEnabled}
              />
            </div>
          </div>
          
          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <h2 className="text-2xl font-semibold mb-3">
                Start a deal thread.
              </h2>
              <p className="text-muted-foreground mb-6">
                Paste a brief, add a contact, or just start typing.
                AI will help you close it.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => inputRef.current?.focus()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                >
                  New thread
                </button>
                <button
                  onClick={() => {
                    setDealContext({
                      contactName: 'Sarah Chen',
                      companyName: 'Acme Corp',
                      dealValue: 18400,
                      currency: 'USD',
                      stage: 'proposal',
                      nextAction: 'Send revised scope by Friday',
                      aiRecap: 'Following up on the Acme Corp proposal. They want to see a revised scope by Friday.',
                      artifacts: [],
                      premiumActionsUsed: 0,
                      premiumActionsLimit: 100
                    })
                    setMessages([
                      {
                        id: '1',
                        role: 'human',
                        type: 'text',
                        content: 'Hey, following up on the Acme Corp proposal. They want to see a revised scope by Friday.',
                        timestamp: new Date(Date.now() - 3600000)
                      }
                    ])
                  }}
                  className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted"
                >
                  See example deal
                </button>
              </div>
            </div>
          </div>
          
          {/* Composer + AI Actions */}
          <div className="border-t border-border">
            {/* Composer */}
            <div className="p-4">
              <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <button
                  onClick={handleFileUpload}
                  className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={chatMode === 'agentic' ? "Ask the agent to search, generate, plan, or execute..." : "Type your message..."}
                    rows={1}
                    className="w-full px-4 py-2.5 bg-muted rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStreaming ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* AI Actions - Below composer */}
            {aiEnabled && (
              <AIActionBar 
                onAction={handleAIAction}
                actionsRemaining={actionsRemaining}
                disabled={isStreaming}
              />
            )}
          </div>
          
          {/* Upgrade Modal */}
          <UpgradeModal 
            isOpen={showUpgradeModal} 
            onClose={() => setShowUpgradeModal(false)} 
          />
        </div>
        
        {/* Value Rail */}
        <DealValueRail context={dealContext} />
      </div>
    )
  }
  
  // Active thread view
  return (
    <div className="flex h-full">
      {/* Left Sidebar - Conversation List */}
      <ConversationList
        conversations={conversations}
        currentId={threadId}
        isOpen={leftSidebarOpen}
        onClose={() => setLeftSidebarOpen(false)}
        onNewThread={() => router.push('/chat')}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Minimal Header Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title={leftSidebarOpen ? 'Hide conversations' : 'Show conversations'}
            >
              {leftSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <span className="text-sm font-medium">{dealContext.contactName} · {dealContext.companyName}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <ChatModeSwitcher mode={chatMode} onChange={setChatMode} />
            <ModelSelector
              selectedModel={selectedModel}
              onSelect={setSelectedModel}
              aiEnabled={aiEnabled}
              onToggleAI={setAiEnabled}
            />
            <ChatToolbar 
              actionsRemaining={actionsRemaining}
              onInvite={() => console.log('Invite')}
              onShare={() => console.log('Share')}
              onArchive={() => console.log('Archive')}
            />
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'human' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'human'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                
                {/* Artifact Card */}
                {message.artifact && (
                  <div className="mt-3 p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{message.artifact.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {message.artifact.content}
                    </p>
                    <div className="flex gap-2">
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
                )}
                
                <span className="text-xs opacity-50 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isStreaming && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Composer + AI Actions */}
        <div className="border-t border-border">
          {/* Composer */}
          <div className="p-4">
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
              <button
                onClick={handleFileUpload}
                className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={chatMode === 'agentic' ? "Ask the agent to search, generate, plan, or execute..." : "Type your message..."}
                  rows={1}
                  className="w-full px-4 py-2.5 bg-muted rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* AI Actions - Below composer */}
          {aiEnabled && (
            <AIActionBar 
              onAction={handleAIAction}
              actionsRemaining={actionsRemaining}
              disabled={isStreaming}
            />
          )}
        </div>
        
        {/* Upgrade Modal */}
        <UpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)} 
        />
      </div>
      
      {/* Value Rail */}
      <DealValueRail context={dealContext} />
    </div>
  )
}
