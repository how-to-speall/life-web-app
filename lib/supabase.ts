import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Task = {
  id: string
  title: string
  description?: string
  deadline?: string
  completed: boolean
  created_at: string
  updated_at: string
}

export type Person = {
  id: string
  name: string
  howIKnowThem: string
  tags: string[]
  tagInput?: string
  description?: string
  birthday?: string
  giftIdeas?: string
  lastHangoutDate?: string
  created_at: string
  updated_at: string
}
