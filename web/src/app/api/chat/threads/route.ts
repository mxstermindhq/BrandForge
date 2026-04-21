import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: threads, error } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
  
  if (error) {
    console.error('Failed to fetch threads:', error)
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 })
  }
  
  return NextResponse.json({ threads: threads || [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  
  const { data: thread, error } = await supabase
    .from('chat_threads')
    .insert({
      user_id: user.id,
      title: body.title || 'New Thread',
      ...body
    })
    .select()
    .single()
  
  if (error) {
    console.error('Failed to create thread:', error)
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 })
  }
  
  return NextResponse.json({ thread })
}
