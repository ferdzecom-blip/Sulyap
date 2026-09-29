'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, pub, SELECT } from '../../../lib/supabase'
export default function Photo() {
  const { id } = useParams(); const r = useRouter(); const once = useRef(false)
  const [p, setP] = useState(null); const [me, setMe] = useState(null); const [liked, setLiked] = useState(false)
  useEffect(() => { (async () => {
    const { data } = await supabase.from('photos').select(SELECT).eq('id', id).single(); if (!data) return
    if (!once.current) { once.current = true; supabase.rpc('increment_views', { pid: id }); data.views += 1 }
    setP(data)
    const { data: { user } } = await supabase.auth.getUser(); setMe(user)
    if (user) { const { data: l } = await supabase.from('likes').select('user_id').eq('photo_id', id).eq('user_id', user.id); setLiked(!!l?.length) }
  })() }, [id])
  if (!p) return <p className="mu">Loading…</p>
  const n = p.likes?.[0]?.count ?? 0
  async function like() {
    if (!me) return r.push('/login')
    const q = liked ? supabase.from('likes').delete().eq('photo_id', id).eq('user_id', me.id) : supabase.from('likes').insert({ photo_id: id, user_id: me.id })
    const { error } = await q; if (error) return
    setLiked(!liked); setP({ ...p, likes: [{ count: n + (liked ? -1 : 1) }] })
  }
  async function download() {
    supabase.rpc('increment_downloads', { pid: id }); setP({ ...p, downloads: p.downloads + 1 })
    try { const b = await (await fetch(pub(p.path))).blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = p.title.replace(/\W+/g, '_') + '.' + p.path.split('.').pop(); a.click() }
    catch { window.open(pub(p.path), '_blank') }
  }
  return (<div className="det"><img src={pub(p.path)} alt={p.title} /><div><h1 style={{ fontSize: 32 }}>{p.title}</h1>
    <p><Link href={`/u/${p.profiles.username}`}><b>{p.profiles.full_name}</b></Link> · <span className="mu">{p.category}</span></p>
    <div className="row"><div className="st"><b>{p.views}</b>Views</div><div className="st"><b>{n}</b>Likes</div><div className="st"><b>{p.downloads}</b>Downloads</div></div>
    <div className="row" style={{ marginTop: 16 }}><button className={`b ${liked ? 'p' : ''}`} onClick={like}>♥ {liked ? 'Liked' : 'Like'}</button><button className="b" onClick={download}>⬇ Download</button></div></div></div>)
}
