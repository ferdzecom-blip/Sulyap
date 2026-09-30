'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, SELECT } from '../../../lib/supabase'
import { useAuthModal } from '../../../context/AuthModalContext'
import Card from '../../../components/Card'
const MS = [[1e3, '1K'], [1e4, '10K'], [1e5, '100K'], [1e6, '1M'], [1e7, '10M']]
export default function Profile() {
  const { username } = useParams(); const r = useRouter(); const { openAuthModal } = useAuthModal()
  const [pr, setPr] = useState(null); const [photos, setPhotos] = useState([]); const [me, setMe] = useState(null); const [fc, setFc] = useState(0); const [fol, setFol] = useState(false); const [miss, setMiss] = useState(false); const [err, setErr] = useState('')
  const [pp, setPp] = useState(''); const [kf, setKf] = useState(''); const [saved, setSaved] = useState('')
  const [email, setEmail] = useState(''); const [authEmail, setAuthEmail] = useState(''); const [emailMsg, setEmailMsg] = useState('')
  const load = useCallback(async () => {
    setErr('')
    const { data: p, error: pe } = await supabase.from('profiles').select('*').eq('username', username).single()
    if (pe) { console.error('profile fetch error:', pe); setErr(pe.message); return }
    if (!p) return setMiss(true)
    setPr(p); setPp(p.paypal || ''); setKf(p.kofi || '')
    const { data, error: phe } = await supabase.from('photos').select(SELECT).eq('owner', p.id).order('views', { ascending: false })
    if (phe) { console.error('photos fetch error:', phe); setErr(phe.message) }
    setPhotos(data || [])
    const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following', p.id); setFc(count || 0)
    const { data: { user } } = await supabase.auth.getUser(); setMe(user); if (user) setAuthEmail(user.email || '')
    if (user) { const { data: f } = await supabase.from('follows').select('follower').eq('follower', user.id).eq('following', p.id); setFol(!!f?.length) }
  }, [username])
  useEffect(() => { load() }, [load])
  if (miss) return <p>Photographer not found.</p>
  if (err) return <div className="pn" style={{ borderColor: '#E5484D' }}><b style={{ color: '#ff8a7a' }}>Could not load this profile:</b> {err}</div>
  if (!pr) return <p className="mu">Loading…</p>
  const v = photos.reduce((s, x) => s + x.views, 0), l = photos.reduce((s, x) => s + (x.likes?.[0]?.count ?? 0), 0), d = photos.reduce((s, x) => s + x.downloads, 0)
  const own = me?.id === pr.id, next = MS.find(m => v < m[0])
  async function follow() {
    if (!me) return openAuthModal()
    await (fol ? supabase.from('follows').delete().eq('follower', me.id).eq('following', pr.id) : supabase.from('follows').insert({ follower: me.id, following: pr.id })); load()
  }
  async function saveEmail() {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setEmailMsg('Enter a valid email.')
    setEmailMsg('Saving…')
    const { error } = await supabase.auth.updateUser({ email })
    setEmailMsg(error ? error.message : 'Check your new email to confirm the change.')
  }
  async function del(p) { if (!confirm('Delete this photo?')) return; await supabase.storage.from('photos').remove([p.path]); await supabase.from('photos').delete().eq('id', p.id); load() }
  async function saveLinks() {
    setSaved('Saving…')
    const { error } = await supabase.from('profiles').update({ paypal: pp.trim(), kofi: kf.trim() }).eq('id', me.id)
    setSaved(error ? error.message : 'Saved!'); if (!error) load()
    setTimeout(() => setSaved(''), 2500)
  }
  return (<><div className="row" style={{ alignItems: 'center' }}><div style={{ flex: 1 }}><h1 style={{ fontSize: 34 }}>{pr.full_name}</h1><div className="mu">@{pr.username}</div></div>
    {!own && <button className={`b ${fol ? '' : 'p'}`} onClick={follow}>{fol ? 'Following' : 'Follow'}</button>}
    {!own && (pr.paypal || pr.kofi) && <>
      {pr.paypal && <a className="b" style={{ background: '#0070BA', borderColor: '#0070BA', color: '#fff' }} href={`https://www.paypal.com/paypalme/${encodeURIComponent(pr.paypal)}`} target="_blank" rel="noopener noreferrer">Donate via PayPal</a>}
      {pr.kofi && <a className="b" style={{ background: '#FF5E5B', borderColor: '#FF5E5B', color: '#fff' }} href={`https://ko-fi.com/${encodeURIComponent(pr.kofi)}`} target="_blank" rel="noopener noreferrer">☕ Support on Ko-fi</a>}
    </>}
    {!own && !pr.paypal && !pr.kofi && <span className="mu" style={{ alignSelf: 'center' }}>No donation links yet</span>}</div>
    <div className="row" style={{ marginTop: 16 }}><div className="st"><b>{v.toLocaleString()}</b>Total views</div><div className="st"><b>{l}</b>Likes</div><div className="st"><b>{d}</b>Downloads</div><div className="st"><b>{fc}</b>Followers</div></div>
    <p className="mu">{MS.filter(m => v >= m[0]).map(m => `🏆 ${m[1]} views`).join('  ') || 'No milestones yet.'}{next ? `  ·  ${(next[0] - v).toLocaleString()} views to ${next[1]}` : ''}</p>
    {own && <div className="pn"><h3 style={{ margin: '0 0 10px' }}>Donation links</h3>
      <p className="mu" style={{ fontSize: 13, marginTop: 0 }}>Add your PayPal.me and/or Ko-fi username so visitors can support you directly — the money goes straight to your own account.</p>
      <div className="row">
        <div className="f" style={{ flex: 1 }}><label>paypal.me/</label><input value={pp} onChange={e => setPp(e.target.value.replace(/[^\w.-]/g, ''))} placeholder="yourhandle" /></div>
        <div className="f" style={{ flex: 1 }}><label>ko-fi.com/</label><input value={kf} onChange={e => setKf(e.target.value.replace(/[^\w.-]/g, ''))} placeholder="yourhandle" /></div>
      </div>
      <button className="b p" onClick={saveLinks}>Save donation links</button>{saved && <span className="mu" style={{ marginLeft: 10 }}>{saved}</span>}</div>}
    {own && <div className="pn"><h3 style={{ margin: '0 0 10px' }}>Account email</h3>
      <p className="mu" style={{ fontSize: 13, marginTop: 0 }}>{authEmail && authEmail.endsWith('@sulyap.app') ? "You signed up before real emails were required, so you don't have a real email on file yet — add one below so you can reset your password if you forget it." : `Current email: ${authEmail}`}</p>
      <div className="f"><label>New email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
      <button className="b p" onClick={saveEmail}>Update email</button>{emailMsg && <span className="mu" style={{ marginLeft: 10 }}>{emailMsg}</span>}</div>}
    <h2>Gallery ({photos.length})</h2><div className="mas">{photos.map(p => <Card key={p.id} p={p} onDelete={own ? del : null} />)}</div>
    {!photos.length && <p className="mu">No photos yet.</p>}</>)
}
