// Server-side Supabase client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only validate and create client if not in build time
let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  // Only log warning during development server, not during build
  console.warn('Supabase environment variables not set. Database operations will fail.')
}

export { supabase }


