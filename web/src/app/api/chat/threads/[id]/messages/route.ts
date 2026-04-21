import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { id: threadId } = await params
  
  // Verify user has access to this thread
  const { data: thread, error: threadError } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('id', threadId)
    .single()
  
  if (threadError || !thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  }
  
  // Fetch messages for this thread
  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
  
  if (messagesError) {
    console.error('Failed to fetch messages:', messagesError)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
  
  return NextResponse.json({ thread, messages: messages || [] })
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
