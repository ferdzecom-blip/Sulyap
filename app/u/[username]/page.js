'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, SELECT } from '../../../lib/supabase'
import Card from '../../../components/Card'
const MS = [[1e3, '1K'], [1e4, '10K'], [1e5, '100K'], [1e6, '1M'], [1e7, '10M']]
export default function Profile() {
  const { username } = useParams(); const r = useRouter()
  const [pr, setPr] = useState(null); const [photos, setPhotos] = useState([]); const [me, setMe] = useState(null); const [fc, setFc] = useState(0); const [fol, setFol] = useState(false); const [miss, setMiss] = useState(false); const [err, setErr] = useState('')
  const load = useCallback(async () => {
    setErr('')
    const { data: p, error: pe } = await supabase.from('profiles').select('*').eq('username', username).single()
    if (pe) { console.error('profile fetch error:', pe); setErr(pe.message); return }
    if (!p) return setMiss(true)
    setPr(p)
    const { data, error: phe } = await supabase.from('photos').select(SELECT).eq('owner', p.id).order('views', { ascending: false })
    if (phe) { console.error('photos fetch error:', phe); setErr(phe.message) }
    setPhotos(data || [])
    const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following', p.id); setFc(count || 0)
    const { data: { user } } = await supabase.auth.getUser(); setMe(user)
    if (user) { const { data: f } = await supabase.from('follows').select('follower').eq('follower', user.id).eq('following', p.id); setFol(!!f?.length) }
  }, [username])
  useEffect(() => { load() }, [load])
  if (miss) return <p>Photographer not found.</p>
  if (err) return <div className="pn" style={{ borderColor: '#E5484D' }}><b style={{ color: '#ff8a7a' }}>Could not load this profile:</b> {err}</div>
  if (!pr) return <p className="mu">Loading…</p>
  const v = photos.reduce((s, x) => s + x.views, 0), l = photos.reduce((s, x) => s + (x.likes?.[0]?.count ?? 0), 0), d = photos.reduce((s, x) => s + x.downloads, 0)
  const own = me?.id === pr.id, next = MS.find(m => v < m[0])
  async function follow() {
    if (!me) return r.push('/login')
    await (fol ? supabase.from('follows').delete().eq('follower', me.id).eq('following', pr.id) : supabase.from('follows').insert({ follower: me.id, following: pr.id })); load()
  }
  async function del(p) { if (!confirm('Delete this photo?')) return; await supabase.storage.from('photos').remove([p.path]); await supabase.from('photos').delete().eq('id', p.id); load() }
  return (<><div className="row" style={{ alignItems: 'center' }}><div style={{ flex: 1 }}><h1 style={{ fontSize: 34 }}>{pr.full_name}</h1><div className="mu">@{pr.username}</div></div>
    {!own && <button className={`b ${fol ? '' : 'p'}`} onClick={follow}>{fol ? 'Following' : 'Follow'}</button>}</div>
    <div className="row" style={{ marginTop: 16 }}><div className="st"><b>{v.toLocaleString()}</b>Total views</div><div className="st"><b>{l}</b>Likes</div><div className="st"><b>{d}</b>Downloads</div><div className="st"><b>{fc}</b>Followers</div></div>
    <p className="mu">{MS.filter(m => v >= m[0]).map(m => `🏆 ${m[1]} views`).join('  ') || 'No milestones yet.'}{next ? `  ·  ${(next[0] - v).toLocaleString()} views to ${next[1]}` : ''}</p>
    <h2>Gallery ({photos.length})</h2><div className="mas">{photos.map(p => <Card key={p.id} p={p} onDelete={own ? del : null} />)}</div>
    {!photos.length && <p className="mu">No photos yet.</p>}</>)
}
