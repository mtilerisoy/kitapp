import { createClient } from '@supabase/supabase-js'

const supaURL : string = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supaAnonKey : string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supaURL, supaAnonKey) 