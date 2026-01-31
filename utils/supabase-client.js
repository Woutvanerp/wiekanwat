// Client-side Supabase client with Auth
'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

// Create a single supabase client for client-side use with Auth
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Prevent automatic redirect on session expiry
    flowType: 'pkce',
    // Keep the session alive longer
    storageKey: 'sparke-keane-auth',
  },
  global: {
    headers: {
      'x-application-name': 'sparke-keane'
    }
  }
})

