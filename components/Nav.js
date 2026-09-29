'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
export default function Nav() {
  const [me, setMe] = useState(null)
  useEffect(() => {
    const load = async (u) => { if (!u) return setMe(null); const { data } = await supabase.from('profiles').select('username,is_admin').eq('id', u.id).single(); setMe(data) }
    supabase.auth.getUser().then(({ data }) => load(data.user))
    const { data: s } = supabase.auth.onAuthStateChange((_e, ses) => load(ses?.user))
    return () => s.subscription.unsubscribe()
  }, [])
  return (<header><Link href="/" className="br">SULYAP<small>by: Ferdie Cayanga</small></Link>
    <Link href="/upload" className="b p">⬆ Upload</Link><Link href="/" className="b">Explore</Link>
    {me ? <><Link href={`/u/${me.username}`} className="b">My profile</Link><button className="b" onClick={() => supabase.auth.signOut()}>Log out</button></> : <Link href="/login" className="b">Log in</Link>}</header>)
}
