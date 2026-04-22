import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: threadId } = await params
  
  // TODO: Replace with actual Supabase query when tables exist
  // Mock thread data (no auth required for demo)
  const mockThread = {
    id: threadId,
    title: 'Acme Corp Proposal',
    user_id: 'demo-user',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    metadata: {
      contact_name: 'Sarah Chen',
      company_name: 'Acme Corp',
      deal_value: 18400,
      currency: 'USD',
      stage: 'proposal'
    }
  }
  
  // Mock messages for testing
  const mockMessages = [
    {
      id: 'msg-1',
      thread_id: threadId,
      user_id: 'demo-user',
      content: 'Hi Sarah, thanks for reaching out about the project. I\'ve reviewed the requirements and think we can definitely help with the web development and branding.',
      role: 'user',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'msg-2',
      thread_id: threadId,
      user_id: 'system',
      content: 'Thanks for the quick response! The timeline looks good. Can you provide a detailed breakdown of the costs? We\'d like to understand what\'s included in the $18,400 estimate.',
      role: 'assistant',
      created_at: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString()
    },
    {
      id: 'msg-3',
      thread_id: threadId,
      user_id: 'demo-user',
      content: 'Absolutely! Here\'s the breakdown:\n\n• UI/UX Design: $4,000\n• Frontend Development: $6,000\n• Backend Development: $5,000\n• Brand Guidelines: $2,000\n• Project Management: $1,400\n\nThis includes 3 rounds of revisions and 30 days of post-launch support.',
      role: 'user',
      created_at: new Date(Date.now() - 86400000 + 7200000).toISOString()
    },
    {
      id: 'msg-4',
      thread_id: threadId,
      user_id: 'system',
      content: 'Perfect! This looks comprehensive. Can we start with a kickoff meeting next week to discuss the project in more detail? I\'d like to review your portfolio and see some similar projects you\'ve worked on.',
      role: 'assistant',
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ]
  
  return NextResponse.json({ thread: mockThread, messages: mockMessages })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { id: threadId } = await params
  const body = await request.json()
  
  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      thread_id: threadId,
      user_id: user.id,
      content: body.content,
      role: body.role || 'user',
      ...body
    })
    .select()
    .single()
  
  if (error) {
    console.error('Failed to create message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
  
  return NextResponse.json({ message })
}
