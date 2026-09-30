'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthModal } from '../context/AuthModalContext'
export default function Nav() {
  const [me, setMe] = useState(null)
  const { openAuthModal } = useAuthModal()
  useEffect(() => {
    const load = async (u) => { if (!u) return setMe(null); const { data } = await supabase.from('profiles').select('username,is_admin').eq('id', u.id).single(); setMe(data) }
    supabase.auth.getUser().then(({ data }) => load(data.user))
    const { data: s } = supabase.auth.onAuthStateChange((_e, ses) => load(ses?.user))
    return () => s.subscription.unsubscribe()
  }, [])
  return (<header><Link href="/" className="br">SULYAP<small>by: Ferdie Cayanga</small></Link>
    {me ? <Link href="/upload" className="b p">⬆ Upload</Link> : <button type="button" className="b p" onClick={openAuthModal}>⬆ Upload</button>}
    <Link href="/" className="b">Explore</Link>
    {me ? <><Link href={`/u/${me.username}`} className="b">My profile</Link><button className="b" onClick={() => supabase.auth.signOut()}>Log out</button></> : <button type="button" className="b" onClick={openAuthModal}>Log in</button>}</header>)
}
