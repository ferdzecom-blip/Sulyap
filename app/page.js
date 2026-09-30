'use client'
import { useEffect, useState } from 'react'
import { supabase, pub, CATS, SELECT } from '../lib/supabase'
import Card from '../components/Card'
export default function Home() {
  const [all, setAll] = useState([]); const [q, setQ] = useState(''); const [cat, setCat] = useState(''); const [err, setErr] = useState(''); const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.from('photos').select(SELECT).order('created_at', { ascending: false }).then(({ data, error }) => {
      setLoading(false)
      if (error) { console.error('photos fetch error:', error); return setErr(error.message) }
      setAll(data || [])
    })
  }, [])
  const f = q || cat, s = q.toLowerCase()
  const list = all.filter(p => (!cat || p.category === cat) && (!s || `${p.title} ${p.category} ${p.profiles?.full_name}`.toLowerCase().includes(s))).sort((a, b) => b.views - a.views)
  const feat = all.length ? all[Math.floor(Date.now() / 864e5) % all.length] : null
  return (<>
    <div className="bn">{feat && <img src={pub(feat.path)} alt="" />}<div className="bo" /><div className="bc">
      <h1>Every glimpse<br />has a story.</h1>
      <input className="sr" value={q} onChange={e => setQ(e.target.value)} placeholder="Search photos, categories, or photographers..." />
      <div className="chips"><button className={`ch ${cat ? '' : 'on'}`} onClick={() => setCat('')}>All</button>
        {CATS.map(c => <button key={c} className={`ch ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}</div></div></div>
    {err && <div className="pn" style={{ borderColor: '#E5484D', marginTop: 16 }}><b style={{ color: '#ff8a7a' }}>Could not load photos:</b> {err}</div>}
    {loading && !err && <p className="mu">Loading photos…</p>}
    {!f && !err && <><h2>Recently uploaded</h2><div className="mas">{all.slice(0, 8).map(p => <Card key={p.id} p={p} />)}</div></>}
    {!err && <><h2>{f ? (cat || 'Search results') : 'All photos'}</h2>
    <div className="mas">{list.map(p => <Card key={p.id} p={p} />)}</div>
    {!loading && !list.length && <p className="mu">No photos yet. Upload the first one.</p>}</>}</>)
}
