'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, CATS } from '../../lib/supabase'
import { useAuthModal } from '../../context/AuthModalContext'
export default function Upload() {
  const r = useRouter(); const { openAuthModal } = useAuthModal()
  const [title, setTitle] = useState(''); const [category, setCat] = useState(CATS[0]); const [file, setFile] = useState(null); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  async function go(e) {
    e.preventDefault(); setMsg('')
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return openAuthModal()
    if (!file) return setMsg('Choose a photo.'); if (file.size > 5 * 1024 * 1024) return setMsg('Photo must be under 5 MB.')
    setBusy(true)
    try {
      const path = `${user.id}/${crypto.randomUUID()}.${file.name.split('.').pop().toLowerCase()}`
      const up = await supabase.storage.from('photos').upload(path, file, { contentType: file.type }); if (up.error) throw up.error
      const ins = await supabase.from('photos').insert({ owner: user.id, title, category, path }); if (ins.error) throw ins.error
      r.push('/')
    } catch (err) { setMsg(err.message) } finally { setBusy(false) }
  }
  return (<form className="box" onSubmit={go}><h2 style={{ margin: '0 0 14px' }}>Upload a photo</h2>
    <div className="f"><label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} required /></div>
    <div className="f"><label>Category</label><select value={category} onChange={e => setCat(e.target.value)}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
    <div className="f"><label>Photo (max 5 MB)</label><input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} /></div>
    {msg && <p style={{ color: '#ff8a7a' }}>{msg}</p>}<button className="b p" style={{ width: '100%' }} disabled={busy}>{busy ? 'Uploading…' : 'Post'}</button></form>)
}
