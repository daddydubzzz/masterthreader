import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Client-side Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null

// Server-side Supabase client
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Allowed email addresses for authentication
export const ALLOWED_EMAILS = [
  process.env.ALLOWED_EMAIL_1,
  process.env.ALLOWED_EMAIL_2,
].filter(Boolean) as string[]

// Check if email is allowed
export const isEmailAllowed = (email: string): boolean => {
  return ALLOWED_EMAILS.includes(email.toLowerCase())
}

// Authentication helper functions
export const signInWithMagicLink = async (email: string) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  if (!isEmailAllowed(email)) {
    throw new Error('Email not authorized for this application')
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error
  return { success: true }
}

export const signOut = async () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getSession = async () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
} 