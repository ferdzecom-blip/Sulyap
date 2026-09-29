import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
export const pub = (path) => supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
export const CATS = ['Mountains','Cities','Busy Day','Beach','Nature','Street','Portrait','Wedding','Travel','Night']
export const SELECT = '*, profiles(username,full_name), likes(count)'
