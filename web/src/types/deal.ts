/**
 * Deal Room Types - Unified AI Deal Thread
 * 
 * The product shift:
 * - Old: generic AI chat with separate human/AI modes
 * - New: one unified deal thread where AI is a layer, not a destination
 */

export type MessageRole = 'human' | 'ai' | 'system'

export type MessageType =
  | 'text'
  | 'ai_reply'
  | 'file'
  | 'deal_event'       // e.g. "Deal moved to negotiation"
  | 'artifact'         // proposal, contract, summary, etc.
  | 'action_result'    // result of an AI action button

export type ArtifactType =
  | 'proposal'
  | 'contract_draft'
  | 'summary'
  | 'follow_up_email'
  | 'action_items'
  | 'red_flags'
  | 'brief'

export interface Artifact {
  id: string
  type: ArtifactType
  label: string
  content: string
  createdAt: Date
  messageId?: string
}

export interface DealMessage {
  id: string
  role: MessageRole
  type: MessageType
  content: string
  timestamp: Date
  artifact?: Artifact
  fileName?: string
  fileUrl?: string
  isStreaming?: boolean
}

export type DealStage =
  | 'prospecting'
  | 'discovery'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'

export interface DealContext {
  contactName: string
  companyName: string
  dealValue?: number
  currency?: string
  expectedCloseDate?: Date
  stage: DealStage
  nextAction?: string
  aiRecap?: string
  artifacts: Artifact[]
  premiumActionsUsed: number
  premiumActionsLimit: number // 100 for free
}

// AI Action button types
export type AIActionType =
  | 'summarize'
  | 'draft_reply'
  | 'generate_proposal'
  | 'extract_action_items'
  | 'find_red_flags'
  | 'create_follow_up'

export interface AIActionButton {
  type: AIActionType
  label: string
  icon: string
  artifactType: ArtifactType
}

// Thread metadata
export interface DealThread {
  id: string
  title: string
  contactName: string
  companyName: string
  lastMessageAt: Date
  unreadCount: number
  stage: DealStage
  dealValue?: number
  currency?: string
  preview?: string
}
