import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = cookies()
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  const supabase: SupabaseClient = createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  })
  
  return supabase
}
