import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Falls back to placeholder values so the build never crashes just because an
// env var is missing. If these are still placeholders at runtime, every
// Supabase call will fail with a clear network/auth error instead of a
// build-time crash — check Vercel > Settings > Environment Variables.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-anon-key'
)

export const pub = (path) => supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
export const CATS = ['Mountains','Cities','Busy Day','Beach','Nature','Street','Portrait','Wedding','Travel','Night']

// The !photos_owner_fkey hint tells PostgREST exactly which relationship to
// use for embedding profiles, since Supabase reported more than one
// relationship exists between photos and profiles (likely one added by hand
// in the Table Editor on top of the one from schema.sql).
export const SELECT = '*, profiles!photos_owner_fkey(username,full_name,paypal,kofi), likes(count)'
