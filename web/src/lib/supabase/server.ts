import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  // Get all cookies and format them properly
  const allCookies = cookieStore.getAll()
  const cookieString = allCookies
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ')
  
  const supabase: SupabaseClient = createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        cookie: cookieString,
      },
    },
  })
  
  return supabase
}
