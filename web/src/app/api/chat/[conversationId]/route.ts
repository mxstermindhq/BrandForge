import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { conversationId } = await params
  const { searchParams } = new URL(request.url)
  
  // Verify user has access to this conversation
  const { data: conversation, error: convError } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('id', conversationId)
    .single()
  
  if (convError || !conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }
  
  // Fetch messages for this conversation
  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  
  if (messagesError) {
    console.error('Failed to fetch messages:', messagesError)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
  
  // Apply pagination if requested
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
  const before = searchParams.get('before')
  
  let filteredMessages = messages || []
  if (before) {
    const beforeIndex = filteredMessages.findIndex(m => m.id === before)
    if (beforeIndex > -1) {
      filteredMessages = filteredMessages.slice(0, beforeIndex)
    }
  }
  
  if (limit && filteredMessages.length > limit) {
    filteredMessages = filteredMessages.slice(-limit)
  }

  return NextResponse.json({
    messages: filteredMessages,
    hasMoreOlder: false,
    oldestId: filteredMessages[0]?.id || null,
    newestId: filteredMessages[filteredMessages.length - 1]?.id || null,
    limit
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { conversationId } = await params
  const body = await request.json()
  
  // Verify user has access to this conversation
  const { data: conversation, error: convError } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('id', conversationId)
    .single()
  
  if (convError || !conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }
  
  // Create new message
  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: body.content,
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('Failed to create message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
  
  // Update conversation's updated_at timestamp
  await supabase
    .from('chat_threads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)
  
  return NextResponse.json(message)
}
